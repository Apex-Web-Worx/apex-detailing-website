import { Router, type IRouter } from "express";
import {
  db,
  servicesTable,
  bookingsTable,
  blockedDatesTable,
} from "@workspace/db";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import {
  CreateBookingBody,
  GetAvailabilityQueryParams,
} from "@workspace/api-zod";
import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  buildScheduledAt,
  getSlotsForDate,
  isClosedShopDate,
  isPastSlot,
  isSlotAllowedForService,
  parseDateString,
  shopLocalDateString,
  shopLocalTimeString,
  todayInShopLocal,
} from "../lib/availability";
import {
  sendBookingEmails,
  sendCancellationEmails,
  sendRescheduleEmails,
  type BookingEmailData,
} from "../lib/email";
import { syncBookingCalendar } from "../lib/calendar";

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
    servicePriceCents: b.servicePriceCents,
    serviceDurationMinutes: b.serviceDurationMinutes,
    date: overrideDate ?? shopLocalDateString(b.scheduledAt),
    time: overrideTime ?? shopLocalTimeString(b.scheduledAt),
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

  // Date strings cover the full window in local time. Pad the SQL window
  // generously so we don't miss any bookings due to TZ offset.
  const rangeStartUtc = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
  const rangeEndUtc = new Date(endDate.getTime() + 48 * 60 * 60 * 1000);

  const [bookings, blocked] = await Promise.all([
    db
      .select({
        scheduledAt: bookingsTable.scheduledAt,
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
          gte(blockedDatesTable.date, parsed.data.startDate),
          lte(blockedDatesTable.date, parsed.data.endDate),
        ),
      ),
  ]);

  // Build a Set of "YYYY-MM-DD HH:MM" taken slots in shop-local time.
  const taken = new Set<string>();
  for (const b of bookings) {
    taken.add(`${shopLocalDateString(b.scheduledAt)} ${shopLocalTimeString(b.scheduledAt)}`);
  }

  const blockedSet = new Set(blocked.map((r) => r.date));

  const today = todayInShopLocal();

  // If the caller passed serviceId, resolve the slug now (one query) so
  // we can filter day-by-day with the slug-based allow-list. An invalid
  // / unresolvable id short-circuits the entire response to closed (the
  // service simply isn't bookable). Without this short-circuit, an
  // invalid id would still return normal slots Mon-Thu/Sat because the
  // slug allow-list only gates Fridays.
  let serviceSlug: string | null = null;
  let unresolvableService = false;
  if (parsed.data.serviceId !== undefined) {
    const id = Number(parsed.data.serviceId);
    if (Number.isFinite(id) && id > 0) {
      const [svc] = await db
        .select({ slug: servicesTable.slug })
        .from(servicesTable)
        .where(
          and(eq(servicesTable.id, id), eq(servicesTable.active, true)),
        );
      if (svc) {
        serviceSlug = svc.slug;
      } else {
        unresolvableService = true;
      }
    } else {
      unresolvableService = true;
    }
  }

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
    const isPastDay = dateStr < today;
    const dayClosed =
      isClosedShopDate(dateStr) || isPastDay || blockedSet.has(dateStr);

    // Slot list for the day. If the user already picked a service and the
    // service isn't bookable on this day (e.g. Friday + a non-allowlisted
    // service), the resulting list is empty and the day shows as closed.
    // If the supplied serviceId was unresolvable, every day collapses to
    // empty/closed regardless of weekday.
    let slotsForDay: readonly string[] = unresolvableService
      ? []
      : getSlotsForDate(dateStr);
    if (serviceSlug !== null) {
      const slug = serviceSlug;
      slotsForDay = slotsForDay.filter((t) =>
        isSlotAllowedForService(dateStr, t, slug),
      );
    }

    const closed = dayClosed || slotsForDay.length === 0;

    const slots = slotsForDay.map((time) => ({
      time,
      available:
        !closed &&
        !taken.has(`${dateStr} ${time}`) &&
        !isPastSlot(dateStr, time),
    }));
    out.push({ date: dateStr, closed, slots });
  }

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

  // Combined: rejects bad time strings, Sundays, and (Friday + a service
  // that isn't on the Friday allow-list).
  if (!isSlotAllowedForService(body.date, body.time, service.slug)) {
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

  const scheduledAt = buildScheduledAt(body.date, body.time);
  if (!scheduledAt) {
    res.status(400).json({ message: "Invalid date or time" });
    return;
  }

  // Race-safe insert: rely on the partial unique index
  // bookings_confirmed_slot_unique on (scheduled_at) WHERE status='confirmed'.
  // A double-booking attempt produces a Postgres unique-violation (23505)
  // which we surface as a 409 Conflict.
  try {
    const [created] = await db
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
      })
      .returning();

    res.status(201).json(created);

    // Fire-and-forget: send confirmation emails AND create the owner's
    // Google Calendar event after responding, so a slow or failing third
    // party never blocks the booking response.
    sendBookingEmails(bookingToEmailData(created, body.date, body.time)).catch(
      (err) => {
        console.error("[email] sendBookingEmails failed:", err);
      },
    );
    void syncBookingCalendar(created.id);
    return;
  } catch (err) {
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
  sendCancellationEmails(bookingToEmailData(cancelled), "customer").catch(
    (err) => {
      console.error("[email] sendCancellationEmails (customer) failed:", err);
    },
  );
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

  // Combined: rejects bad time strings, Sundays, and (Friday + a service
  // not on the Friday allow-list) for the booking's existing service.
  // We need the service slug for the Friday check, so look it up from the
  // serviceId snapshot stored on the booking row.
  const [bookingService] = await db
    .select({ slug: servicesTable.slug })
    .from(servicesTable)
    .where(eq(servicesTable.id, booking.serviceId));
  if (!bookingService) {
    res.status(500).json({ message: "Service for this booking not found." });
    return;
  }
  if (!isSlotAllowedForService(newDate, newTime, bookingService.slug)) {
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

  const newScheduledAt = buildScheduledAt(newDate, newTime);
  if (!newScheduledAt) {
    res.status(400).json({ message: "Invalid date or time" });
    return;
  }

  const oldDate = shopLocalDateString(booking.scheduledAt);
  const oldTime = shopLocalTimeString(booking.scheduledAt);
  const isSameSlot =
    newScheduledAt.getTime() === booking.scheduledAt.getTime();

  // Atomic update: require the row to still be confirmed AND still on the
  // slot we just read. This protects us from:
  //   - racing with admin delete (status would have changed)
  //   - racing with another reschedule (scheduled_at would have changed)
  //   - duplicate clicks (second click finds a different scheduled_at)
  // The partial unique index protects us from racing with a fresh booking
  // grabbing the new slot (Postgres surfaces 23505 → mapped to 409 below).
  try {
    const updatedRows = await db
      .update(bookingsTable)
      .set({ scheduledAt: newScheduledAt })
      .where(
        and(
          eq(bookingsTable.id, booking.id),
          eq(bookingsTable.status, "confirmed"),
          eq(bookingsTable.scheduledAt, booking.scheduledAt),
        ),
      )
      .returning();

    if (updatedRows.length === 0) {
      res.status(409).json({
        message:
          "This booking was just changed in another window. Refresh and try again.",
      });
      return;
    }

    const updated = updatedRows[0]!;
    res.json(updated);

    // Don't email or move the calendar entry for a no-op (customer picked
    // the same slot they already had). The UPDATE still succeeded — just
    // no semantic change.
    if (!isSameSlot) {
      sendRescheduleEmails({
        oldDate,
        oldTime,
        booking: bookingToEmailData(updated, newDate, newTime),
      }).catch((err) => {
        console.error("[email] sendRescheduleEmails failed:", err);
      });
      void syncBookingCalendar(updated.id);
    }
    return;
  } catch (err) {
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
