import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import {
  db,
  bookingsTable,
  blockedDatesTable,
  servicesTable,
  serviceDayRulesTable,
  serviceDaySlotsTable,
} from "@workspace/db";
import { and, asc, eq, gte, inArray, lte, ne } from "drizzle-orm";
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
  getRuleForServiceIdDay,
  isDayWholeDayLocked,
  hasOtherConfirmedBookingOnDate,
  acquireDayLock,
  TransactionAbortError,
} from "../lib/availability-rules";
import { type BookingEmailData } from "../lib/email";
import {
  syncBookingCalendar,
  createBlockedDateEvent,
  deleteBlockedDateEvent,
} from "../lib/calendar";
import { notifyBookingCancelled, notifyBookingRescheduled } from "../lib/notify";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env["ADMIN_TOKEN"];
  if (!expected) {
    res.status(500).json({
      message: "Server is missing ADMIN_TOKEN. Set it in environment variables.",
    });
    return;
  }
  const provided = req.header("x-admin-token");
  if (provided !== expected) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}

function bookingToEmailData(
  b: typeof bookingsTable.$inferSelect,
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
    date: shopLocalDateString(b.scheduledAt),
    time: shopLocalTimeString(b.scheduledAt),
    smsConsent: b.smsConsent,
  };
}

router.get("/admin/bookings", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(bookingsTable)
    .orderBy(asc(bookingsTable.scheduledAt));
  res.json(rows);
});

router.delete("/admin/bookings/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  // Atomic confirmed→cancelled transition. RETURNING gives us the row the
  // customer email should describe (its scheduled_at could have just changed
  // via /booking/manage/:id/reschedule, so we can't trust a pre-read). If 0
  // rows are returned, either the id doesn't exist or the row was already
  // cancelled — in both cases we don't email.
  const cancelledRows = await db
    .update(bookingsTable)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(bookingsTable.id, id),
        eq(bookingsTable.status, "confirmed"),
      ),
    )
    .returning();

  res.status(204).send();

  const cancelled = cancelledRows[0];
  if (cancelled) {
    notifyBookingCancelled(bookingToEmailData(cancelled), "admin");
    void syncBookingCalendar(cancelled.id);
  }
});

// Walk the cause chain looking for a Postgres error code (e.g. 23505).
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

router.patch("/admin/bookings/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const body = (req.body ?? {}) as {
    customerName?: unknown;
    email?: unknown;
    phone?: unknown;
    vehicle?: unknown;
    notes?: unknown;
  };

  const update: Partial<typeof bookingsTable.$inferInsert> = {};

  if (body.customerName !== undefined) {
    if (typeof body.customerName !== "string" || body.customerName.trim().length === 0) {
      res.status(400).json({ message: "customerName must be a non-empty string" });
      return;
    }
    update.customerName = body.customerName.trim();
  }
  if (body.email !== undefined) {
    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      res.status(400).json({ message: "email must be a valid email address" });
      return;
    }
    update.email = body.email.trim();
  }
  if (body.phone !== undefined) {
    if (typeof body.phone !== "string" || body.phone.trim().length < 7) {
      res.status(400).json({ message: "phone must be at least 7 characters" });
      return;
    }
    update.phone = body.phone.trim();
  }
  if (body.vehicle !== undefined) {
    if (typeof body.vehicle !== "string" || body.vehicle.trim().length === 0) {
      res.status(400).json({ message: "vehicle must be a non-empty string" });
      return;
    }
    update.vehicle = body.vehicle.trim();
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") {
      res.status(400).json({ message: "notes must be a string" });
      return;
    }
    update.notes = body.notes;
  }

  if (Object.keys(update).length === 0) {
    res.status(400).json({ message: "No fields to update" });
    return;
  }

  const [existing] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id));
  if (!existing) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  // Mirror the UI rule (Edit only shown for upcoming bookings) on the API
  // surface so a stale tab / direct curl can't revive a cancelled or past
  // booking by editing it.
  if (existing.status !== "confirmed") {
    res.status(400).json({ message: "Cannot edit a cancelled booking." });
    return;
  }
  if (existing.scheduledAt < new Date()) {
    res.status(400).json({ message: "Cannot edit a past booking." });
    return;
  }

  // Compare-and-swap on the snapshot we just read. If the row was changed
  // (cancelled, rescheduled, or another admin edit) between read and write,
  // we lose the race and surface a 409 so the admin can refresh and retry.
  const updatedRows = await db
    .update(bookingsTable)
    .set(update)
    .where(
      and(
        eq(bookingsTable.id, id),
        eq(bookingsTable.status, "confirmed"),
        eq(bookingsTable.scheduledAt, existing.scheduledAt),
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

  // Re-sync the Google Calendar event so it reflects the new customer info.
  void syncBookingCalendar(updated.id);
});

router.post("/admin/bookings/:id/reschedule", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const body = (req.body ?? {}) as { date?: unknown; time?: unknown };
  if (typeof body.date !== "string" || typeof body.time !== "string") {
    res.status(400).json({ message: "date and time are required" });
    return;
  }
  const newDate = body.date;
  const newTime = body.time;

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  if (booking.status !== "confirmed") {
    res.status(400).json({ message: "This booking is cancelled and cannot be rescheduled." });
    return;
  }
  if (booking.scheduledAt < new Date()) {
    res
      .status(400)
      .json({ message: "This appointment has already passed and cannot be rescheduled." });
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
  const adminBookingService = await db
    .select({ slug: servicesTable.slug })
    .from(servicesTable)
    .where(eq(servicesTable.id, booking.serviceId))
    .then((r) => r[0]);
  if (
    adminBookingService?.slug === "apex-ceramic-coating" &&
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

    if (!isSameSlot) {
      notifyBookingRescheduled({
        oldDate,
        oldTime,
        booking: bookingToEmailData(updated),
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

router.get("/admin/blocked-dates", requireAdmin, async (_req, res) => {
  const rows = await db
    .select()
    .from(blockedDatesTable)
    .orderBy(asc(blockedDatesTable.date));
  res.json(rows);
});

router.post("/admin/blocked-dates", requireAdmin, async (req, res) => {
  const { date, reason } = (req.body ?? {}) as {
    date?: unknown;
    reason?: unknown;
  };
  if (typeof date !== "string" || !parseDateString(date)) {
    res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD." });
    return;
  }
  if (date < todayInShopLocal()) {
    res.status(400).json({ message: "Cannot block a date in the past." });
    return;
  }
  const reasonStr =
    typeof reason === "string" ? reason.slice(0, 200) : "";
  try {
    const [created] = await db
      .insert(blockedDatesTable)
      .values({ date, reason: reasonStr })
      .returning();
    // Fire-and-forget calendar sync so admin response stays fast even if
    // Google is slow. On success we persist the event id back to the row
    // so the matching DELETE can clean it up later.
    void createBlockedDateEvent(date, reasonStr).then(async (eventId) => {
      if (eventId) {
        await db
          .update(blockedDatesTable)
          .set({ googleEventId: eventId })
          .where(eq(blockedDatesTable.id, created.id));
      }
    });
    res.status(201).json(created);
  } catch (err) {
    let cur: unknown = err;
    let pgCode: unknown;
    for (let i = 0; i < 5 && cur; i++) {
      if (typeof cur === "object" && cur !== null && "code" in cur) {
        pgCode = (cur as { code?: unknown }).code;
        if (pgCode) break;
      }
      cur =
        typeof cur === "object" && cur !== null && "cause" in cur
          ? (cur as { cause?: unknown }).cause
          : undefined;
    }
    if (pgCode === "23505") {
      res.status(409).json({ message: "That date is already blocked." });
      return;
    }
    throw err;
  }
});

router.delete("/admin/blocked-dates/:date", requireAdmin, async (req, res) => {
  const raw = req.params.date;
  const date = typeof raw === "string" ? raw : "";
  if (!date || !parseDateString(date)) {
    res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD." });
    return;
  }
  // Read first so we can clean up the calendar event after the row is gone.
  const [existing] = await db
    .select({ googleEventId: blockedDatesTable.googleEventId })
    .from(blockedDatesTable)
    .where(eq(blockedDatesTable.date, date));
  await db.delete(blockedDatesTable).where(eq(blockedDatesTable.date, date));
  if (existing?.googleEventId) {
    void deleteBlockedDateEvent(existing.googleEventId);
  }
  res.status(204).send();
});

/* -------------------------------------------------------------------- */
/* Service-day rule CRUD (admin-editable booking schedule)              */
/* -------------------------------------------------------------------- */

const TIME_RE = /^\d{2}:\d{2}$/;

function isValidTimeStr(t: unknown): t is string {
  if (typeof t !== "string" || !TIME_RE.test(t)) return false;
  const [h, m] = t.split(":").map(Number);
  return h !== undefined && m !== undefined && h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

router.get("/admin/service-rules", requireAdmin, async (_req, res) => {
  const ruleRows = await db
    .select({
      id: serviceDayRulesTable.id,
      serviceId: serviceDayRulesTable.serviceId,
      serviceSlug: servicesTable.slug,
      serviceName: servicesTable.name,
      dayOfWeek: serviceDayRulesTable.dayOfWeek,
      wholeDayLock: serviceDayRulesTable.wholeDayLock,
      active: serviceDayRulesTable.active,
    })
    .from(serviceDayRulesTable)
    .innerJoin(
      servicesTable,
      eq(serviceDayRulesTable.serviceId, servicesTable.id),
    )
    .orderBy(
      asc(servicesTable.sortOrder),
      asc(servicesTable.id),
      asc(serviceDayRulesTable.dayOfWeek),
    );

  const ruleIds = ruleRows.map((r) => r.id);
  const slotRows = ruleIds.length
    ? await db
        .select({
          id: serviceDaySlotsTable.id,
          ruleId: serviceDaySlotsTable.ruleId,
          time: serviceDaySlotsTable.time,
        })
        .from(serviceDaySlotsTable)
        .where(inArray(serviceDaySlotsTable.ruleId, ruleIds))
        .orderBy(asc(serviceDaySlotsTable.time))
    : [];
  const slotsByRule = new Map<number, { id: number; time: string }[]>();
  for (const s of slotRows) {
    const arr = slotsByRule.get(s.ruleId) ?? [];
    arr.push({ id: s.id, time: s.time });
    slotsByRule.set(s.ruleId, arr);
  }
  res.json(
    ruleRows.map((r) => ({ ...r, slots: slotsByRule.get(r.id) ?? [] })),
  );
});

router.post("/admin/service-rules", requireAdmin, async (req, res) => {
  const body = (req.body ?? {}) as {
    serviceId?: unknown;
    dayOfWeek?: unknown;
    wholeDayLock?: unknown;
    slots?: unknown;
  };
  const serviceId = Number(body.serviceId);
  const dayOfWeek = Number(body.dayOfWeek);
  const wholeDayLock = body.wholeDayLock === true;
  if (!Number.isFinite(serviceId) || serviceId <= 0) {
    res.status(400).json({ message: "serviceId is required" });
    return;
  }
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    res.status(400).json({ message: "dayOfWeek must be 0..6" });
    return;
  }
  const initialSlots: string[] = [];
  if (Array.isArray(body.slots)) {
    for (const t of body.slots) {
      if (!isValidTimeStr(t)) {
        res.status(400).json({ message: `Invalid slot time: ${String(t)}` });
        return;
      }
      if (!initialSlots.includes(t)) initialSlots.push(t);
    }
  }
  const [svc] = await db
    .select({ id: servicesTable.id })
    .from(servicesTable)
    .where(eq(servicesTable.id, serviceId));
  if (!svc) {
    res.status(400).json({ message: "Unknown serviceId" });
    return;
  }
  try {
    const [rule] = await db
      .insert(serviceDayRulesTable)
      .values({ serviceId, dayOfWeek, wholeDayLock, active: true })
      .returning();
    if (initialSlots.length > 0) {
      await db
        .insert(serviceDaySlotsTable)
        .values(initialSlots.map((time) => ({ ruleId: rule.id, time })));
    }
    const slotRows = await db
      .select({ id: serviceDaySlotsTable.id, time: serviceDaySlotsTable.time })
      .from(serviceDaySlotsTable)
      .where(eq(serviceDaySlotsTable.ruleId, rule.id))
      .orderBy(asc(serviceDaySlotsTable.time));
    const [withSvc] = await db
      .select({
        slug: servicesTable.slug,
        name: servicesTable.name,
      })
      .from(servicesTable)
      .where(eq(servicesTable.id, serviceId));
    res.status(201).json({
      id: rule.id,
      serviceId: rule.serviceId,
      serviceSlug: withSvc?.slug ?? "",
      serviceName: withSvc?.name ?? "",
      dayOfWeek: rule.dayOfWeek,
      wholeDayLock: rule.wholeDayLock,
      active: rule.active,
      slots: slotRows,
    });
  } catch (err) {
    if (pgErrorCode(err) === "23505") {
      res.status(409).json({
        message: "A rule for that service and day already exists.",
      });
      return;
    }
    throw err;
  }
});

router.patch("/admin/service-rules/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const body = (req.body ?? {}) as {
    wholeDayLock?: unknown;
    active?: unknown;
  };
  const patch: { wholeDayLock?: boolean; active?: boolean; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (typeof body.wholeDayLock === "boolean") patch.wholeDayLock = body.wholeDayLock;
  if (typeof body.active === "boolean") patch.active = body.active;
  if (Object.keys(patch).length === 1) {
    res.status(400).json({ message: "At least one field is required" });
    return;
  }
  const [updated] = await db
    .update(serviceDayRulesTable)
    .set(patch)
    .where(eq(serviceDayRulesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ message: "Rule not found" });
    return;
  }
  const [svc] = await db
    .select({ slug: servicesTable.slug, name: servicesTable.name })
    .from(servicesTable)
    .where(eq(servicesTable.id, updated.serviceId));
  const slotRows = await db
    .select({ id: serviceDaySlotsTable.id, time: serviceDaySlotsTable.time })
    .from(serviceDaySlotsTable)
    .where(eq(serviceDaySlotsTable.ruleId, updated.id))
    .orderBy(asc(serviceDaySlotsTable.time));
  res.json({
    id: updated.id,
    serviceId: updated.serviceId,
    serviceSlug: svc?.slug ?? "",
    serviceName: svc?.name ?? "",
    dayOfWeek: updated.dayOfWeek,
    wholeDayLock: updated.wholeDayLock,
    active: updated.active,
    slots: slotRows,
  });
});

router.delete("/admin/service-rules/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  await db.delete(serviceDayRulesTable).where(eq(serviceDayRulesTable.id, id));
  res.status(204).send();
});

router.post(
  "/admin/service-rules/:id/slots",
  requireAdmin,
  async (req, res) => {
    const ruleId = Number(req.params.id);
    if (!Number.isFinite(ruleId)) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }
    const body = (req.body ?? {}) as { time?: unknown };
    if (!isValidTimeStr(body.time)) {
      res.status(400).json({ message: "time must be HH:MM (24-hour)" });
      return;
    }
    const [rule] = await db
      .select({ id: serviceDayRulesTable.id })
      .from(serviceDayRulesTable)
      .where(eq(serviceDayRulesTable.id, ruleId));
    if (!rule) {
      res.status(404).json({ message: "Rule not found" });
      return;
    }
    try {
      const [slot] = await db
        .insert(serviceDaySlotsTable)
        .values({ ruleId, time: body.time })
        .returning({
          id: serviceDaySlotsTable.id,
          time: serviceDaySlotsTable.time,
        });
      res.status(201).json(slot);
    } catch (err) {
      if (pgErrorCode(err) === "23505") {
        res.status(409).json({ message: "That slot already exists." });
        return;
      }
      throw err;
    }
  },
);

router.delete(
  "/admin/service-rules/:id/slots/:slotId",
  requireAdmin,
  async (req, res) => {
    const ruleId = Number(req.params.id);
    const slotId = Number(req.params.slotId);
    if (!Number.isFinite(ruleId) || !Number.isFinite(slotId)) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }
    await db
      .delete(serviceDaySlotsTable)
      .where(
        and(
          eq(serviceDaySlotsTable.id, slotId),
          eq(serviceDaySlotsTable.ruleId, ruleId),
        ),
      );
    res.status(204).send();
  },
);

export default router;
