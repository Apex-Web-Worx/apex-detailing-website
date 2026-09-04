// 24-hour reminder cron.
//
// Runs in-process. Every REMINDER_TICK_MS, queries for confirmed bookings
// whose scheduled_at falls in the next-day window and that haven't yet
// been reminded, sends a customer SMS, and records reminder_sent_at so
// the next tick won't re-send.
//
// Window math: we look at any booking scheduled between (now + 23h) and
// (now + 25h). The 2-hour width means a missed/late tick (server slept,
// crashed, restarted) will still catch reminders the next time it runs,
// as long as the gap is < 1h. Combined with the at-most-once guarantee
// from reminder_sent_at, that gives us "best-effort, never duplicate".
//
// Single-process assumption: same as the calendar sync. If we ever scale
// horizontally, this needs a row-level claim (e.g. SELECT ... FOR UPDATE
// SKIP LOCKED) instead of plain SELECT then UPDATE.

import { db, bookingsTable, servicesTable } from "@workspace/db";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { shopLocalDateString, shopLocalTimeString } from "./availability";
import type { BookingEmailData } from "./email";
import { notifyReminder24h } from "./notify";
import { sendDueReviewRequests, autoStartDueJobs } from "./pickup-workflow";
import { purgeExpiredBookingPhotos } from "./booking-photos";

const REMINDER_TICK_MS = 5 * 60 * 1000; // every 5 minutes
const AUTO_START_TICK_MS = 30 * 1000; // every 30 seconds — catch forgotten Start presses
const WINDOW_LOWER_MS = 23 * 60 * 60 * 1000;
const WINDOW_UPPER_MS = 25 * 60 * 60 * 1000;

let timer: NodeJS.Timeout | null = null;
let autoStartTimer: NodeJS.Timeout | null = null;

async function runOnce(): Promise<void> {
  const now = Date.now();
  const lower = new Date(now + WINDOW_LOWER_MS);
  const upper = new Date(now + WINDOW_UPPER_MS);

  let due: Array<{
    booking: typeof bookingsTable.$inferSelect;
  }>;
  try {
    due = await db
      .select({ booking: bookingsTable })
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.status, "confirmed"),
          isNull(bookingsTable.reminderSentAt),
          gte(bookingsTable.scheduledAt, lower),
          lte(bookingsTable.scheduledAt, upper),
        ),
      );
  } catch (err) {
    console.error("[reminders] query failed:", err);
    return;
  }

  if (due.length === 0) return;
  console.log(`[reminders] tick: ${due.length} due`);

  for (const { booking } of due) {
    // Mark FIRST so a slow/failed SMS still counts as "we tried" and
    // we never double-send. Customer SMS is best-effort by design.
    //
    // The claim WHERE re-checks every condition the SELECT used —
    // status, reminderSentAt IS NULL, AND the scheduled_at window —
    // so a booking that was cancelled or rescheduled between the
    // SELECT and the UPDATE is correctly skipped. Without these
    // re-checks we'd text customers about appointments they no
    // longer have.
    const claimed = await db
      .update(bookingsTable)
      .set({ reminderSentAt: new Date() })
      .where(
        and(
          eq(bookingsTable.id, booking.id),
          eq(bookingsTable.status, "confirmed"),
          isNull(bookingsTable.reminderSentAt),
          gte(bookingsTable.scheduledAt, lower),
          lte(bookingsTable.scheduledAt, upper),
        ),
      )
      .returning({ id: bookingsTable.id });
    if (claimed.length === 0) continue; // raced — cancelled/rescheduled/already-sent

    const data: BookingEmailData = {
      id: booking.id,
      manageToken: booking.manageToken,
      customerName: booking.customerName,
      email: booking.email,
      phone: booking.phone,
      vehicle: booking.vehicle,
      notes: booking.notes ?? "",
      serviceName: booking.serviceName,
      serviceDurationMinutes: booking.serviceDurationMinutes,
      date: shopLocalDateString(booking.scheduledAt),
      time: shopLocalTimeString(booking.scheduledAt),
      smsConsent: booking.smsConsent,
    };
    await notifyReminder24h(data);
  }

  try {
    const started = await autoStartDueJobs();
    if (started > 0) {
      console.log(`[reminders] auto-started ${started} job(s) at scheduled time`);
    }
  } catch (err) {
    console.error("[reminders] auto-start failed:", err);
  }

  try {
    const cancelled = await sendDueReviewRequests();
    if (cancelled > 0) {
      console.log(`[reminders] cancelled ${cancelled} automatic review request(s)`);
    }
  } catch (err) {
    console.error("[reminders] review cancel failed:", err);
  }

  try {
    const purged = await purgeExpiredBookingPhotos();
    if (purged > 0) {
      console.log(`[reminders] purged ${purged} expired booking photo(s)`);
    }
  } catch (err) {
    console.error("[reminders] photo purge failed:", err);
  }

  // Touch the unused servicesTable import so tree-shaking doesn't drop it.
  void servicesTable;
}

export function startReminderCron(): void {
  if (timer) return; // already running
  // Fire once shortly after startup so a freshly restarted server catches
  // anything that became due while it was down, then settle into the
  // regular interval.
  setTimeout(() => {
    runOnce().catch((err) => console.error("[reminders] first run failed:", err));
  }, 30 * 1000);
  timer = setInterval(() => {
    runOnce().catch((err) => console.error("[reminders] tick failed:", err));
  }, REMINDER_TICK_MS);
  console.log(`[reminders] cron started (every ${REMINDER_TICK_MS / 1000}s)`);

  // Faster loop just for auto-start so forgotten Start presses kick in near on time.
  const runAutoStart = () =>
    autoStartDueJobs()
      .then((started) => {
        if (started > 0) {
          console.log(`[auto-start] started ${started} job(s)`);
        }
      })
      .catch((err) => console.error("[auto-start] tick failed:", err));
  setTimeout(runAutoStart, 5 * 1000);
  autoStartTimer = setInterval(runAutoStart, AUTO_START_TICK_MS);
  console.log(`[auto-start] cron started (every ${AUTO_START_TICK_MS / 1000}s)`);
}
