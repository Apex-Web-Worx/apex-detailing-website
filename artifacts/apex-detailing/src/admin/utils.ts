import type { Booking, BlockedDate } from "@workspace/api-client-react";
import { formatPrice, todayDateString } from "@/lib/format";
import type { AdminSection } from "./constants";

export function bookingIso(booking: Booking): string {
  return typeof booking.scheduledAt === "string"
    ? booking.scheduledAt
    : new Date(booking.scheduledAt as unknown as string).toISOString();
}

export function scheduledAtToShopDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function scheduledAtToShopTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function bookingShopDate(booking: Booking): string {
  return scheduledAtToShopDate(bookingIso(booking));
}

export function bookingShopTime(booking: Booking): string {
  return scheduledAtToShopTime(bookingIso(booking));
}

export type DisplayStatus =
  | "confirmed"
  | "in_progress"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export function displayStatus(booking: Booking, _now = new Date()): DisplayStatus {
  const stored = booking.status;
  if (stored === "cancelled") return "cancelled";
  if (stored === "completed") return "completed";
  if (stored === "ready_for_pickup") return "ready_for_pickup";
  if (stored === "in_progress") return "in_progress";
  return "confirmed";
}

export function canStartJob(booking: Booking): boolean {
  return displayStatus(booking) === "confirmed" && bookingShopDate(booking) >= todayDateString();
}

export function canStartHold(row: BlockedDate): boolean {
  return isClientHold(row) && row.date >= todayDateString() && holdDisplayStatus(row) === "confirmed";
}

export function canMarkReady(booking: Booking): boolean {
  return booking.status === "in_progress";
}

export function canMarkCompleted(booking: Booking): boolean {
  return booking.status === "ready_for_pickup";
}

export function customerFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function interpolateTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  const vehicle = (vars.vehicle ?? "").trim();
  let out = template.replace(
    /\{\{\s*vehicle_year\s*\}\}(\s*)\{\{\s*vehicle_make\s*\}\}(\s*)\{\{\s*vehicle_model\s*\}\}/g,
    vehicle,
  );
  out = out.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key: string) => {
    const k = key.toLowerCase();
    if (k === "vehicle_year" || k === "vehicle_make" || k === "vehicle_model") return vehicle;
    return vars[k] ?? "";
  });
  return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function shopNowPlusMinutes(minutes: number): { date: string; time: string } {
  const d = new Date(Date.now() + minutes * 60 * 1000);
  const iso = d.toISOString();
  return { date: scheduledAtToShopDate(iso), time: scheduledAtToShopTime(iso) };
}

export function formatElapsedClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatElapsedLong(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (totalMin === 0) return "less than a minute";
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h === 1 ? "" : "s"}`;
  return `${h} hr${h === 1 ? "" : "s"} ${m} min`;
}

export function bookingDetailElapsedMs(
  booking: Pick<Booking, "inProgressAt" | "readyAt" | "detailDurationMinutes">,
  now = Date.now(),
): number | null {
  if (booking.inProgressAt) {
    const start = new Date(booking.inProgressAt).getTime();
    const end = booking.readyAt ? new Date(booking.readyAt).getTime() : now;
    return Math.max(0, end - start);
  }
  if (booking.detailDurationMinutes != null) return booking.detailDurationMinutes * 60_000;
  return null;
}

/** Finished detailing time only — not the live in-progress clock. */
export function bookingStoredDetailMs(
  booking: Pick<Booking, "inProgressAt" | "readyAt" | "detailDurationMinutes">,
): number | null {
  if (booking.detailDurationMinutes != null) return booking.detailDurationMinutes * 60_000;
  if (booking.inProgressAt && booking.readyAt) {
    return Math.max(
      0,
      new Date(booking.readyAt).getTime() - new Date(booking.inProgressAt).getTime(),
    );
  }
  return null;
}

export function vehicleDurationStats(bookings: Booking[]): {
  lastMs: number | null;
  averageMs: number | null;
  timedCount: number;
} {
  const times = bookings
    .map(bookingStoredDetailMs)
    .filter((ms): ms is number => ms != null);
  if (times.length === 0) {
    return { lastMs: null, averageMs: null, timedCount: 0 };
  }
  const lastMs = times[0];
  const averageMs = Math.round(times.reduce((sum, ms) => sum + ms, 0) / times.length);
  return { lastMs, averageMs, timedCount: times.length };
}

export function notesPreview(notes: string | null | undefined, max = 72): string {
  const text = (notes ?? "").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function customerKey(email: string): string {
  return email.trim().toLowerCase();
}

export function vehicleKey(vehicle: string): string {
  return vehicle.trim().toLowerCase();
}

export function greetingForNow(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      hour12: false,
    }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatShopDateLong(now = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);
}

export function addMonths(yyyyMm: string, delta: number): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function startOfWeekSunday(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function endOfWeekSaturday(yyyyMmDd: string): string {
  const [y, m, d] = startOfWeekSunday(yyyyMmDd).split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + 6);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function daysInMonth(yyyyMm: string): number {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function parseAdminLocation(path: string): {
  section: AdminSection;
  id?: string;
} {
  const raw = path.replace(/^\/admin\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  const section = (parts[0] || "dashboard") as AdminSection;
  const id = parts[1] ? decodeURIComponent(parts[1]) : undefined;
  return { section, id };
}

export function matchesSearch(booking: Booking, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const id = String(booking.id);
  const padded = id.padStart(5, "0");
  return (
    booking.customerName.toLowerCase().includes(q) ||
    booking.email.toLowerCase().includes(q) ||
    booking.phone.toLowerCase().includes(q) ||
    booking.vehicle.toLowerCase().includes(q) ||
    booking.serviceName.toLowerCase().includes(q) ||
    id.includes(q) ||
    padded.includes(q) ||
    `#${id}`.includes(q)
  );
}

export type CustomerRecord = {
  key: string;
  name: string;
  email: string;
  phone: string;
  vehicles: string[];
  bookings: Booking[];
  appointmentCount: number;
  lifetimeCents: number;
  lastAppointment: Booking | null;
};

export function groupCustomers(bookings: Booking[]): CustomerRecord[] {
  const map = new Map<string, CustomerRecord>();
  for (const booking of bookings) {
    const key = customerKey(booking.email);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        name: booking.customerName,
        email: booking.email,
        phone: booking.phone,
        vehicles: booking.vehicle ? [booking.vehicle] : [],
        bookings: [booking],
        appointmentCount: 1,
        lifetimeCents: 0,
        lastAppointment: booking,
      });
      continue;
    }
    existing.bookings.push(booking);
    existing.appointmentCount += 1;
    if (booking.vehicle && !existing.vehicles.some((v) => vehicleKey(v) === vehicleKey(booking.vehicle))) {
      existing.vehicles.push(booking.vehicle);
    }
    if (new Date(bookingIso(booking)) > new Date(bookingIso(existing.lastAppointment ?? booking))) {
      existing.lastAppointment = booking;
      existing.name = booking.customerName;
      existing.phone = booking.phone;
    }
  }
  for (const customer of map.values()) {
    customer.lifetimeCents = customer.bookings
      .filter((b) => displayStatus(b) === "completed")
      .reduce((sum, b) => sum + b.servicePriceCents, 0);
    customer.bookings.sort((a, b) => +new Date(bookingIso(b)) - +new Date(bookingIso(a)));
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export type VehicleRecord = {
  key: string;
  vehicle: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  bookings: Booking[];
  lastDetailMs: number | null;
  averageDetailMs: number | null;
  timedVisitCount: number;
};

export function groupVehicles(bookings: Booking[]): VehicleRecord[] {
  const map = new Map<string, VehicleRecord>();
  for (const booking of bookings) {
    const key = `${customerKey(booking.email)}||${vehicleKey(booking.vehicle)}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        vehicle: booking.vehicle,
        ownerName: booking.customerName,
        ownerEmail: booking.email,
        ownerPhone: booking.phone,
        bookings: [booking],
        lastDetailMs: null,
        averageDetailMs: null,
        timedVisitCount: 0,
      });
      continue;
    }
    existing.bookings.push(booking);
    if (new Date(bookingIso(booking)) > new Date(bookingIso(existing.bookings[0]))) {
      existing.ownerName = booking.customerName;
    }
  }
  for (const vehicle of map.values()) {
    vehicle.bookings.sort((a, b) => +new Date(bookingIso(b)) - +new Date(bookingIso(a)));
    const stats = vehicleDurationStats(vehicle.bookings);
    vehicle.lastDetailMs = stats.lastMs;
    vehicle.averageDetailMs = stats.averageMs;
    vehicle.timedVisitCount = stats.timedCount;
  }
  return Array.from(map.values()).sort((a, b) => a.vehicle.localeCompare(b.vehicle));
}

export type DashboardKpis = {
  todayCount: number;
  weekCount: number;
  monthCollectedCents: number;
  upcomingQuotedCount: number;
};

export function isClientHold(row: BlockedDate): boolean {
  return Boolean(
    row.name?.trim() ||
    row.surname?.trim() ||
    row.phone?.trim() ||
    row.vehicle?.trim(),
  );
}

export function heldCustomerName(row: BlockedDate): string {
  return [row.name, row.surname].filter(Boolean).join(" ").trim() || "Held day";
}

export function holdServiceLabel(row: BlockedDate): string {
  return row.reason?.trim() || "Held appointment";
}

export function holdDisplayStatus(row: BlockedDate): "confirmed" | "completed" {
  return row.date < todayDateString() ? "completed" : "confirmed";
}

export function matchesHold(row: BlockedDate, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    row.date,
    row.reason,
    row.name,
    row.surname,
    row.phone,
    row.vehicle,
    heldCustomerName(row),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export function computeKpis(
  bookings: Booking[],
  blockedDates: BlockedDate[] = [],
  now = new Date(),
): DashboardKpis {
  const today = todayDateString();
  const weekStart = startOfWeekSunday(today);
  const weekEnd = endOfWeekSaturday(today);
  const month = today.slice(0, 7);
  let todayCount = 0;
  let weekCount = 0;
  let monthCollectedCents = 0;
  let upcomingQuotedCount = 0;
  for (const booking of bookings) {
    if (booking.status === "cancelled") continue;
    const date = bookingShopDate(booking);
    const status = displayStatus(booking, now);
    if (date === today) todayCount += 1;
    if (date >= weekStart && date <= weekEnd) weekCount += 1;
    if (status === "completed" && date.startsWith(month)) {
      monthCollectedCents += booking.servicePriceCents;
    }
    if (status === "confirmed" && date >= today) upcomingQuotedCount += 1;
  }
  for (const hold of blockedDates.filter(isClientHold)) {
    if (hold.date === today) todayCount += 1;
    if (hold.date >= weekStart && hold.date <= weekEnd) weekCount += 1;
    if (hold.date >= today) upcomingQuotedCount += 1;
  }
  return { todayCount, weekCount, monthCollectedCents, upcomingQuotedCount };
}

export function monthRevenue(bookings: Booking[], yyyyMm: string, now = new Date()): number {
  return bookings
    .filter((b) => displayStatus(b, now) === "completed" && bookingShopDate(b).startsWith(yyyyMm))
    .reduce((sum, b) => sum + b.servicePriceCents, 0);
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function formatSignedPercent(value: number | null): string {
  if (value === null) return "—";
  const abs = Math.abs(value).toFixed(1);
  if (value > 0) return `+${abs}%`;
  if (value < 0) return `−${abs}%`;
  return "0%";
}

export function monthlySeries(bookings: Booking[], months = 6, now = new Date()): { month: string; cents: number }[] {
  const current = todayDateString().slice(0, 7);
  const out: { month: string; cents: number }[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const month = addMonths(current, -i);
    out.push({ month, cents: monthRevenue(bookings, month, now) });
  }
  return out;
}

export function formatMoney(cents: number): string {
  return formatPrice(cents);
}

export type DerivedTask = {
  id: string;
  title: string;
  detail: string;
  href: string;
};

export function deriveTasks(bookings: Booking[]): DerivedTask[] {
  const today = todayDateString();
  const tasks: DerivedTask[] = [];
  const upcomingToday = bookings
    .filter((b) => displayStatus(b) === "confirmed" && bookingShopDate(b) === today)
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
  if (upcomingToday.length > 0) {
    tasks.push({
      id: "today-appts",
      title: "Upcoming appointment",
      detail: `${upcomingToday.length} confirmed today · next is ${upcomingToday[0].customerName}`,
      href: "/admin/appointments",
    });
  }
  const soon = bookings
    .filter((b) => {
      const date = bookingShopDate(b);
      return displayStatus(b) === "confirmed" && date > today;
    })
    .sort((a, b) => bookingIso(a).localeCompare(bookingIso(b)));
  if (soon[0]) {
    tasks.push({
      id: "next-appt",
      title: "Customer follow-up",
      detail: `${soon[0].customerName} · ${soon[0].serviceName}`,
      href: `/admin/appointments/${soon[0].id}`,
    });
  }
  return tasks;
}
