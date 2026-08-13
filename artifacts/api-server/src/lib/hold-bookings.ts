import { randomBytes } from "node:crypto";
import {
  db,
  bookingsTable,
  blockedDatesTable,
  servicesTable,
} from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import { buildScheduledAt } from "./availability";
import { OCCUPYING_STATUS_LIST } from "./occupying-statuses";
import { markInProgress } from "./pickup-workflow";

export type HoldRow = typeof blockedDatesTable.$inferSelect;
export type BookingRow = typeof bookingsTable.$inferSelect;

export function holdBookingEmail(holdId: number): string {
  return `hold-${holdId}@apexdetailing.net`;
}

export function isClientHold(row: {
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
  vehicle?: string | null;
}): boolean {
  return Boolean(
    row.name?.trim() ||
      row.surname?.trim() ||
      row.phone?.trim() ||
      row.vehicle?.trim(),
  );
}

export async function findLiveHoldBooking(holdId: number): Promise<BookingRow | null> {
  const email = holdBookingEmail(holdId);
  const rows = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.email, email));
  return rows.find((row) => OCCUPYING_STATUS_LIST.includes(row.status)) ?? null;
}

async function pickService(reason: string) {
  const services = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.active, true))
    .orderBy(asc(servicesTable.sortOrder));
  const trimmed = reason.trim();
  return (
    services.find((row) => row.name.toLowerCase() === trimmed.toLowerCase()) ??
    services[0] ??
    null
  );
}

export async function ensureHoldBooking(hold: HoldRow): Promise<BookingRow | null> {
  if (!isClientHold(hold)) return null;
  const existing = await findLiveHoldBooking(hold.id);
  if (existing) {
    const customerName =
      [hold.name, hold.surname].filter(Boolean).join(" ").trim() || existing.customerName;
    const phone = (hold.phone ?? "").trim() || existing.phone;
    const vehicle = (hold.vehicle ?? "").trim() || existing.vehicle;
    const scheduledAt = buildScheduledAt(hold.date, "08:00");
    const serviceName = (hold.reason ?? "").trim() || existing.serviceName;
    const patch: {
      customerName?: string;
      phone?: string;
      vehicle?: string;
      serviceName?: string;
      scheduledAt?: Date;
    } = {};
    if (customerName !== existing.customerName) patch.customerName = customerName;
    if (phone !== existing.phone) patch.phone = phone;
    if (vehicle !== existing.vehicle) patch.vehicle = vehicle;
    if (serviceName !== existing.serviceName) patch.serviceName = serviceName;
    if (scheduledAt && existing.status === "confirmed") {
      const nextIso = scheduledAt.toISOString();
      const prevIso = existing.scheduledAt.toISOString();
      if (nextIso !== prevIso) patch.scheduledAt = scheduledAt;
    }
    if (Object.keys(patch).length === 0) return existing;
    const [updated] = await db
      .update(bookingsTable)
      .set(patch)
      .where(eq(bookingsTable.id, existing.id))
      .returning();
    return updated ?? existing;
  }

  const service = await pickService(hold.reason ?? "");
  if (!service) return null;
  const customerName =
    [hold.name, hold.surname].filter(Boolean).join(" ").trim() || "Customer";
  const phone = (hold.phone ?? "").trim() || "—";
  const vehicle = (hold.vehicle ?? "").trim() || "Vehicle";
  const reason = (hold.reason ?? "").trim();
  const times = ["08:00", "08:15", "08:30", "09:00", "12:00"];
  for (const time of times) {
    const scheduledAt = buildScheduledAt(hold.date, time);
    if (!scheduledAt) continue;
    try {
      const [created] = await db
        .insert(bookingsTable)
        .values({
          serviceId: service.id,
          serviceName: reason || service.name,
          servicePriceCents: service.priceCents,
          serviceDurationMinutes: service.durationMinutes,
          customerName,
          email: holdBookingEmail(hold.id),
          phone,
          vehicle,
          notes: "",
          scheduledAt,
          status: "confirmed",
          manageToken: randomBytes(24).toString("base64url"),
          smsConsent: false,
        })
        .returning();
      if (created) return created;
    } catch (err) {
      console.error("[admin] ensureHoldBooking insert failed:", time, err);
    }
  }
  return findLiveHoldBooking(hold.id);
}

export async function ensureClientHoldBookings(): Promise<void> {
  const holds = await db.select().from(blockedDatesTable);
  for (const hold of holds) {
    if (!isClientHold(hold)) continue;
    try {
      await ensureHoldBooking(hold);
    } catch (err) {
      console.error("[admin] ensureClientHoldBookings failed:", hold.id, err);
    }
  }
}

export async function startHoldBooking(hold: HoldRow): Promise<BookingRow | null> {
  const booking = await ensureHoldBooking(hold);
  if (!booking) return null;
  if (booking.status === "in_progress") return booking;
  if (booking.status !== "confirmed") return booking;
  return markInProgress(booking.id);
}

export async function cancelIdleHoldBooking(holdId: number): Promise<void> {
  const email = holdBookingEmail(holdId);
  await db
    .update(bookingsTable)
    .set({ status: "cancelled" })
    .where(and(eq(bookingsTable.email, email), eq(bookingsTable.status, "confirmed")));
}

export async function syncHoldBookingFromRow(hold: HoldRow): Promise<void> {
  if (!isClientHold(hold)) {
    await cancelIdleHoldBooking(hold.id);
    return;
  }
  await ensureHoldBooking(hold);
}
