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
import {
  TIME_SLOTS,
  buildScheduledAt,
  isClosedShopDate,
  parseDateString,
  shopLocalDateString,
  shopLocalTimeString,
  todayInShopLocal,
} from "../lib/availability";
import { sendBookingEmails } from "../lib/email";

const router: IRouter = Router();

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
    const isPast = dateStr < today;
    const closed =
      isClosedShopDate(dateStr) || isPast || blockedSet.has(dateStr);
    const slots = TIME_SLOTS.map((time) => ({
      time,
      available: !closed && !taken.has(`${dateStr} ${time}`),
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

  if (!TIME_SLOTS.includes(body.time as (typeof TIME_SLOTS)[number])) {
    res.status(400).json({ message: "Invalid time slot" });
    return;
  }

  const dateObj = parseDateString(body.date);
  if (!dateObj) {
    res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    return;
  }
  if (isClosedShopDate(body.date)) {
    res.status(400).json({ message: "Shop is closed on this day" });
    return;
  }
  if (body.date < todayInShopLocal()) {
    res.status(400).json({ message: "Cannot book a date in the past" });
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
      })
      .returning();

    res.status(201).json(created);

    // Fire-and-forget: send confirmation emails after responding so a slow
    // or failing email provider never blocks the booking response.
    sendBookingEmails({
      customerName: body.customerName,
      email: body.email,
      phone: body.phone,
      vehicle: body.vehicle,
      notes: body.notes ?? "",
      serviceName: service.name,
      servicePriceCents: service.priceCents,
      serviceDurationMinutes: service.durationMinutes,
      date: body.date,
      time: body.time,
    }).catch((err) => {
      console.error("[email] sendBookingEmails failed:", err);
    });
    return;
  } catch (err) {
    // Walk the cause chain looking for a Postgres unique-violation (23505)
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
      res.status(409).json({
        message: "Sorry — that time slot was just taken. Please pick another.",
      });
      return;
    }
    throw err;
  }
});

export default router;
