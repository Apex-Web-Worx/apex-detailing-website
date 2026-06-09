import { Router, type IRouter } from "express";
import {
  db,
  servicesTable,
  bookingsTable,
  blockedDatesTable,
} from "@workspace/db";
import { and, asc, eq, gte, lte, ne } from "drizzle-orm";
import {
  CreateBookingBody,
  GetAvailabilityQueryParams,
} from "@workspace/api-zod";
import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  buildScheduledAt,
  isClosedShopDate,
  isPastSlot,
  isTooSoon,
  isTooSoonForCeramic,
  parseDateString,
  shopLocalDateString,
  shopLocalTimeString,
  todayInShopLocal,
} from "../lib/availability";
import {
  getAllActiveRulesByDow,
  getRuleForServiceIdDay,
  getRuleForServiceSlugDay,
  isDayWholeDayLocked,
  hasOtherConfirmedBookingOnDate,
  wholeDayLockServiceIdsByDow,
  acquireDayLock,
  TransactionAbortError,
  type RuleWithSlots,
} from "../lib/availability-rules";
import { type BookingEmailData } from "../lib/email";
import { syncBookingCalendar } from "../lib/calendar";
import {
  notifyBookingCreated,
  notifyBookingCancelled,
  notifyBookingRescheduled,
} from "../lib/notify";

const router: IRouter = Router();

function generateManageToken(): string {
  return randomBytes(24).toString("base64url");
}

// Constant-time string comparison to prevent timing-based token enumeration.
function tokensMatch(a: string | null | undefined, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Walk the cause chain looking for a Postgres error code (e.g. 23505 unique
// violation).
function pgErrorCode(err: unknown): string | undefined {
  let cur: unknown = err;
  for (let i = 0; i < 5 && cur; i++) {
    if (typeof cur === "object" && cur !== null && "code" in cur) {
      const code = (cur as { code?: unknown }).code;
      if (typeof code === "string") return code;
    }
    cur =
      typeof cur === "object" && cur !== null && "cause" in cur
        ? (cur as { cause?: unknown }).cause
        : undefined;
  }
  return undefined;
}

function bookingToEmailData(
  b: typeof bookingsTable.$inferSelect,
  overrideDate?: string,
  overrideTime?: string,
): BookingEmailData {
  return {
    id: b.id,
    manageToken: b.manageToken,
    customerName: b.customerName,
    email: b.email,
    phone: b.phone,
    vehicle: b.vehicle,
    notes: b.notes ?? "",
    serviceName: b.serviceName,
    serviceDurationMinutes: b.serviceDurationMinutes,
    date: overrideDate ?? shopLocalDateString(b.scheduledAt),
    time: overrideTime ?? shopLocalTimeString(b.scheduledAt),
    smsConsent: b.smsConsent,
  };
}

router.get("/booking/services", async (_req, res) => {
  const rows = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.active, true))
    .orderBy(asc(servicesTable.sortOrder), asc(servicesTable.id));
  res.json(rows);
});

async function computeAvailability(
  startDateStr: string,
  endDateStr: string,
  serviceSlug?: string,
): Promise<Array<{
  date: string;
  closed: boolean;
  slots: { time: string; available: boolean }[];
}>> {
  const startDate = parseDateString(startDateStr);
  const endDate = parseDateString(endDateStr);
  if (!startDate || !endDate) return [];
  if (endDate < startDate) return [];

  const rangeStartUtc = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
  const rangeEndUtc = new Date(endDate.getTime() + 48 * 60 * 60 * 1000);

  const [bookings, blocked] = await Promise.all([
    db
      .select({
        scheduledAt: bookingsTable.scheduledAt,
        serviceId: bookingsTable.serviceId,
      })
      .from(bookingsTable)
      .where(
        and(
          gte(bookingsTable.scheduledAt, rangeStartUtc),
          lte(bookingsTable.scheduledAt, rangeEndUtc),
          eq(bookingsTable.status, "confirmed"),
        ),
      ),
    db
      .select({ date: blockedDatesTable.date })
      .from(blockedDatesTable)
      .where(
        and(
          gte(blockedDatesTable.date, startDateStr),
          lte(blockedDatesTable.date, endDateStr),
        ),
      ),
  ]);

  const rulesByDow = await getAllActiveRulesByDow();
  const lockingServiceIdsByDow = wholeDayLockServiceIdsByDow(rulesByDow);

  const serviceRulesByDow = new Map<number, RuleWithSlots>();
  if (serviceSlug) {
    for (const [dow, rules] of rulesByDow) {
      const r = rules.find((rr) => rr.serviceSlug === serviceSlug);
      if (r) serviceRulesByDow.set(dow, r);
    }
  }

  const taken = new Set<string>();
  const fullyBookedDates = new Set<string>();
  const anyBookingDates = new Set<string>();
  for (const b of bookings) {
    const dateStr = shopLocalDateString(b.scheduledAt);
    const timeStr = shopLocalTimeString(b.scheduledAt);
    taken.add(`${dateStr} ${timeStr}`);
    anyBookingDates.add(dateStr);
    const dParsed = parseDateString(dateStr);
    if (dParsed) {
      const dow = dParsed.getUTCDay();
      const lockingIds = lockingServiceIdsByDow.get(dow);
      if (lockingIds && lockingIds.has(b.serviceId)) {
        fullyBookedDates.add(dateStr);
      }
    }
  }

  const blockedSet = new Set(blocked.map((r) => r.date));
  const today = todayInShopLocal();

  const out: Array<{
    date: string;
    closed: boolean;
    slots: { time: string; available: boolean }[];
  }> = [];

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const dow = d.getUTCDay();
    const isPastDay = dateStr < today;
    const dayClosed =
      isClosedShopDate(dateStr) || isPastDay || blockedSet.has(dateStr);

    let slotsForDay: string[] = [];
    if (serviceSlug) {
      const r = serviceRulesByDow.get(dow);
      slotsForDay = r ? [...r.slots] : [];
    } else {
      const rules = rulesByDow.get(dow) ?? [];
      const seen = new Set<string>();
      for (const r of rules) {
        for (const t of r.slots) {
          if (!seen.has(t)) {
            seen.add(t);
            slotsForDay.push(t);
          }
        }
      }
      slotsForDay.sort();
    }

    const closed = dayClosed || slotsForDay.length === 0;
    const dayFullyBooked = fullyBookedDates.has(dateStr);

    const selectedRuleLocksThisDay =
      serviceSlug !== undefined &&
      serviceRulesByDow.get(dow)?.wholeDayLock === true &&
      anyBookingDates.has(dateStr);

    const isCeramicTooSoon =
      serviceSlug === "apex-ceramic-coating" && isTooSoonForCeramic(dateStr);

    const slots = slotsForDay.map((time) => ({
      time,
      available:
        !closed &&
        !dayFullyBooked &&
        !selectedRuleLocksThisDay &&
        !isCeramicTooSoon &&
        !taken.has(`${dateStr} ${time}`) &&
        !isPastSlot(dateStr, time) &&
        !isTooSoon(dateStr, time),
    }));
    out.push({ date: dateStr, closed, slots });
  }

  return out;
}

router.get("/booking/availability", async (req, res) => {
  const parsed = GetAvailabilityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query parameters" });
    return;
  }

  const startDate = parseDateString(parsed.data.startDate);
  const endDate = parseDateString(parsed.data.endDate);
  if (!startDate || !endDate) {
    res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    return;
  }
  if (endDate < startDate) {
    res.status(400).json({ message: "endDate must be >= startDate" });
    return;
  }

  let serviceSlug: string | undefined;
  let unresolvableService = false;
  if (parsed.data.serviceId !== undefined) {
    const sid = Number(parsed.data.serviceId);
    if (Number.isFinite(sid) && sid > 0) {
      const [svc] = await db
        .select({ slug: servicesTable.slug })
        .from(servicesTable)
        .where(and(eq(servicesTable.id, sid), eq(servicesTable.active, true)));
      if (svc) serviceSlug = svc.slug;
      else unresolvableService = true;
    } else {
      unresolvableService = true;
    }
  }

  if (unresolvableService) {
    res.status(400).json({ message: "Service not found" });
    return;
  }

  const out = await computeAvailability(
    parsed.data.startDate,
    parsed.data.endDate,
    serviceSlug,
  );
  res.json(out);
});

router.get("/booking/services/:slug/availability", async (req, res) => {
  const slug = req.params.slug;
  const startDate = req.query["startDate"];
  const endDate = req.query["endDate"];
  if (typeof startDate !== "string" || typeof endDate !== "string") {
    res.status(400).json({ message: "startDate and endDate are required" });
    return;
  }
  const startDateObj = parseDateString(startDate);
  const endDateObj = parseDateString(endDate);
  if (!startDateObj || !endDateObj) {
    res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    return;
  }
  if (endDateObj < startDateObj) {
    res.status(400).json({ message: "endDate must be >= startDate" });
    return;
  }

  const [svc] = await db
    .select({ slug: servicesTable.slug })
    .from(servicesTable)
    .where(and(eq(servicesTable.slug, slug), eq(servicesTable.active, true)));
  if (!svc) {
    res.status(404).json({ message: "Service not found" });
    return;
  }

  const out = await computeAvailability(startDate, endDate, svc.slug);
  res.json(out);
});

router.post("/booking/bookings", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    });
    return;
  }

  const body = parsed.data;

  const dateObj = parseDateString(body.date);
  if (!dateObj) {
    res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    return;
  }
  if (body.date < todayInShopLocal()) {
    res.status(400).json({ message: "Cannot book a date in the past" });
    return;
  }
  if (isClosedShopDate(body.date)) {
    res.status(400).json({ message: "Shop is closed on this day" });
    return;
  }

  const [blockedRow] = await db
    .select({ id: blockedDatesTable.id })
    .from(blockedDatesTable)
    .where(eq(blockedDatesTable.date, body.date));
  if (blockedRow) {
    res.status(400).json({ message: "Shop is closed on this day" });
    return;
  }

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(
      and(eq(servicesTable.id, body.serviceId), eq(servicesTable.active, true)),
    );

  if (!service) {
    res.status(400).json({ message: "Selected service is not available" });
    return;
  }

  // Look up the day-of-week rule for this service. No rule = service
  // isn't bookable that day. Wrong slot = not in the configured times.
  const rule = await getRuleForServiceIdDay(service.id, dateObj.getUTCDay());
  if (!rule || !rule.slots.includes(body.time)) {
    res
      .status(400)
      .json({ message: "That time slot is not available for this service." });
    return;
  }
  if (isPastSlot(body.date, body.time)) {
    res
      .status(400)
      .json({ message: "That time has already passed. Please pick a later slot." });
    return;
  }
  if (isTooSoon(body.date, body.time)) {
    res.status(400).json({
      message: "That appointment is too soon. Please pick a slot at least 10 hours from now.",
    });
    return;
  }

  // Ceramic Coating requires 3-day advance notice (so you can order materials).
  if (service.slug === "apex-ceramic-coating" && isTooSoonForCeramic(body.date)) {
    res.status(400).json({
      message: "Ceramic Coating requires at least 3 days advance notice. Please choose a later date.",
    });
    return;
  }

  const scheduledAt = buildScheduledAt(body.date, body.time);
  if (!scheduledAt) {
    res.status(400).json({ message: "Invalid date or time" });
    return;
  }

  // Run insert inside a transaction with a per-day advisory lock to
  // eliminate the whole-day-lock race condition: two concurrent requests
  // can both pass the pre-insert check, but the lock forces them to
  // serialize around the insert so only one wins.
  try {
    const [created] = await db.transaction(async (tx) => {
      await acquireDayLock(tx, body.date);

      // Re-check whole-day-lock inside the transaction so the lock is
      // holding when we read.  This is the authoritative check.
      if (rule.wholeDayLock) {
        if (await hasOtherConfirmedBookingOnDate(body.date, undefined, tx)) {
          throw new TransactionAbortError(
            409,
            "That day is fully booked. Please choose another day.",
          );
        }
      } else if (await isDayWholeDayLocked(body.date, undefined, tx)) {
        throw new TransactionAbortError(
          409,
          "That day is fully booked. Please choose another day.",
        );
      }

      const [row] = await tx
        .insert(bookingsTable)
        .values({
          serviceId: service.id,
          serviceName: service.name,
          servicePriceCents: service.priceCents,
          serviceDurationMinutes: service.durationMinutes,
          customerName: body.customerName,
          email: body.email,
          phone: body.phone,
          vehicle: body.vehicle,
          notes: body.notes ?? "",
          scheduledAt,
          status: "confirmed",
          manageToken: generateManageToken(),
          smsConsent: body.smsConsent ?? false,
        })
        .returning();
      return [row];
    });

    res.status(201).json(created);

    // Fire-and-forget: send confirmation emails AND create the owner's
    // Google Calendar event after responding, so a slow or failing third
    // party never blocks the booking response.
    notifyBookingCreated(bookingToEmailData(created, body.date, body.time));
    void syncBookingCalendar(created.id);
    return;
  } catch (err) {
    if (err instanceof TransactionAbortError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    if (pgErrorCode(err) === "23505") {
      res.status(409).json({
        message: "Sorry — that time slot was just taken. Please pick another.",
      });
      return;
    }
    throw err;
  }
});

/* ------------------------------------------------------------------ */
/* Customer self-manage endpoints (token-gated, no admin auth)        */
/* ------------------------------------------------------------------ */

// Loads a booking by id and verifies the manage token in constant time.
// Treats both "no such id" and "wrong/missing token" as 404 — never reveal
// whether an id exists to a holder of an invalid token.
async function loadBookingByToken(
  idParam: unknown,
  tokenParam: unknown,
): Promise<typeof bookingsTable.$inferSelect | "not_found"> {
  const id = Number(idParam);
  if (!Number.isFinite(id) || id <= 0) return "not_found";
  if (typeof tokenParam !== "string" || tokenParam.length === 0)
    return "not_found";

  const [row] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id));

  if (!row) return "not_found";
  if (!tokensMatch(row.manageToken, tokenParam)) return "not_found";
  // Manage links expire 24 hours after the appointment's scheduled time.
  // Past that, the dashboard is treated as gone — same response as an
  // unknown booking so the customer-facing page shows the friendly
  // "your booking link has expired" message.
  const MANAGE_LINK_TTL_MS = 24 * 60 * 60 * 1000;
  if (row.scheduledAt.getTime() + MANAGE_LINK_TTL_MS < Date.now()) {
    return "not_found";
  }
  return row;
}

router.get("/booking/manage/:id", async (req, res) => {
  const result = await loadBookingByToken(req.params.id, req.query["token"]);
  if (result === "not_found") {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  res.json(result);
});

router.post("/booking/manage/:id/cancel", async (req, res) => {
  const result = await loadBookingByToken(req.params.id, req.query["token"]);
  if (result === "not_found") {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  const booking = result;

  // Pre-flight checks against the snapshot. These can race with another
  // writer, so they are advisory only — the authoritative decision happens
  // in the predicate UPDATE below, which is atomic.
  if (booking.status !== "confirmed") {
    res.status(400).json({ message: "This booking is already cancelled." });
    return;
  }
  if (booking.scheduledAt < new Date()) {
    res
      .status(400)
      .json({ message: "This appointment has already passed and cannot be cancelled online." });
    return;
  }

  // Atomic transition: only cancel if the row is still confirmed AND still on
  // the slot we just read. Anything else means another writer beat us and we
  // bail without sending an email.
  const updatedRows = await db
    .update(bookingsTable)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(bookingsTable.id, booking.id),
        eq(bookingsTable.status, "confirmed"),
        eq(bookingsTable.scheduledAt, booking.scheduledAt),
      ),
    )
    .returning();

  if (updatedRows.length === 0) {
    // Lost the race — somebody else (admin cancel, customer reschedule,
    // duplicate click) modified this booking between our read and write.
    res.status(409).json({
      message:
        "This booking was just changed in another window. Refresh and try again.",
    });
    return;
  }

  res.status(204).send();

  const cancelled = updatedRows[0]!;
  notifyBookingCancelled(bookingToEmailData(cancelled), "customer");
  void syncBookingCalendar(cancelled.id);
});

router.post("/booking/manage/:id/reschedule", async (req, res) => {
  const result = await loadBookingByToken(req.params.id, req.query["token"]);
  if (result === "not_found") {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  const booking = result;

  const body = (req.body ?? {}) as { date?: unknown; time?: unknown };
  if (typeof body.date !== "string" || typeof body.time !== "string") {
    res.status(400).json({ message: "date and time are required" });
    return;
  }
  const newDate = body.date;
  const newTime = body.time;

  // Snapshot pre-flight — final source of truth is the predicate UPDATE.
  if (booking.status !== "confirmed") {
    res.status(400).json({ message: "This booking is cancelled and cannot be rescheduled." });
    return;
  }
  if (booking.scheduledAt < new Date()) {
    res
      .status(400)
      .json({ message: "This appointment has already passed and cannot be rescheduled online." });
    return;
  }
  if (!parseDateString(newDate)) {
    res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    return;
  }
  if (newDate < todayInShopLocal()) {
    res.status(400).json({ message: "Cannot reschedule to a date in the past" });
    return;
  }
  if (isClosedShopDate(newDate)) {
    res.status(400).json({ message: "Shop is closed on this day" });
    return;
  }

  const [blockedRow] = await db
    .select({ id: blockedDatesTable.id })
    .from(blockedDatesTable)
    .where(eq(blockedDatesTable.date, newDate));
  if (blockedRow) {
    res.status(400).json({ message: "Shop is closed on this day" });
    return;
  }

  const newDateObj = parseDateString(newDate);
  if (!newDateObj) {
    res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    return;
  }
  // DB-backed rule lookup for the booking's existing service.
  const newRule = await getRuleForServiceIdDay(
    booking.serviceId,
    newDateObj.getUTCDay(),
  );
  if (!newRule || !newRule.slots.includes(newTime)) {
    res.status(400).json({
      message: "That time slot is not available for this service.",
    });
    return;
  }
  if (isPastSlot(newDate, newTime)) {
    res
      .status(400)
      .json({ message: "That time has already passed. Please pick a later slot." });
    return;
  }
  if (isTooSoon(newDate, newTime)) {
    res.status(400).json({
      message: "That appointment is too soon. Please pick a slot at least 10 hours from now.",
    });
    return;
  }

  // Ceramic Coating requires 3-day advance notice.
  const bookingService = await db
    .select({ slug: servicesTable.slug })
    .from(servicesTable)
    .where(eq(servicesTable.id, booking.serviceId))
    .then((r) => r[0]);
  if (
    bookingService?.slug === "apex-ceramic-coating" &&
    isTooSoonForCeramic(newDate)
  ) {
    res.status(400).json({
      message: "Ceramic Coating requires at least 3 days advance notice. Please choose a later date.",
    });
    return;
  }

  const newScheduledAt = buildScheduledAt(newDate, newTime);
  if (!newScheduledAt) {
    res.status(400).json({ message: "Invalid date or time" });
    return;
  }

  const oldDate = shopLocalDateString(booking.scheduledAt);
  const oldTime = shopLocalTimeString(booking.scheduledAt);
  const isSameSlot =
    newScheduledAt.getTime() === booking.scheduledAt.getTime();

  try {
    const updated = await db.transaction(async (tx) => {
      await acquireDayLock(tx, newDate);

      // Re-check whole-day-lock inside the transaction.
      if (newRule.wholeDayLock) {
        if (await hasOtherConfirmedBookingOnDate(newDate, booking.id, tx)) {
          throw new TransactionAbortError(
            409,
            "That day is fully booked. Please choose another day.",
          );
        }
      } else if (await isDayWholeDayLocked(newDate, booking.id, tx)) {
        throw new TransactionAbortError(
          409,
          "That day is fully booked. Please choose another day.",
        );
      }

      // When the slot actually moves, also clear reminder_sent_at so the
      // 24h reminder cron will fire again for the new appointment time.
      // (Same-slot reschedules — a no-op the customer didn't realize was
      // a no-op — must NOT clear it, or we'd re-text someone we already
      // reminded.)
      const updatedRows = await tx
        .update(bookingsTable)
        .set(
          isSameSlot
            ? { scheduledAt: newScheduledAt }
            : { scheduledAt: newScheduledAt, reminderSentAt: null },
        )
        .where(
          and(
            eq(bookingsTable.id, booking.id),
            eq(bookingsTable.status, "confirmed"),
            eq(bookingsTable.scheduledAt, booking.scheduledAt),
          ),
        )
        .returning();

      if (updatedRows.length === 0) {
        throw new TransactionAbortError(
          409,
          "This booking was just changed in another window. Refresh and try again.",
        );
      }

      return updatedRows[0]!;
    });

    res.json(updated);

    // Don't email or move the calendar entry for a no-op (customer picked
    // the same slot they already had). The UPDATE still succeeded — just
    // no semantic change.
    if (!isSameSlot) {
      notifyBookingRescheduled({
        oldDate,
        oldTime,
        booking: bookingToEmailData(updated, newDate, newTime),
      });
      void syncBookingCalendar(updated.id);
    }
    return;
  } catch (err) {
    if (err instanceof TransactionAbortError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    if (pgErrorCode(err) === "23505") {
      res.status(409).json({
        message: "Sorry — that time slot was just taken. Please pick another.",
      });
      return;
    }
    throw err;
  }
});

export default router;
