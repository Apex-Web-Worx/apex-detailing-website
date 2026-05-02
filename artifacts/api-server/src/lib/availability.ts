/**
 * Booking time slots vary by day of week:
 *   Sun        — closed
 *   Mon..Thu   — 07:30 and 08:00 (only services NOT in
 *                FRIDAY_ONLY_SERVICE_SLUGS)
 *   Fri        — 07:00, 11:00 and 15:00 (only services in
 *                FRIDAY_ONLY_SERVICE_SLUGS)
 *   Sat        — 07:30 and 08:00 (only services NOT in
 *                FRIDAY_ONLY_SERVICE_SLUGS)
 */
const REGULAR_SLOTS = ["07:30", "08:00"] as const;
const FRIDAY_SLOTS = ["07:00", "11:00", "15:00"] as const;

/** Union of every slot value that exists on any day. */
export const ALL_TIME_SLOTS = [
  "07:00",
  "07:30",
  "08:00",
  "11:00",
  "15:00",
] as const;
export type TimeSlot = (typeof ALL_TIME_SLOTS)[number];

/**
 * Service slugs that are bookable ONLY on Fridays (and conversely, the only
 * services bookable on Fridays). Slug-based (not id-based) so the rule
 * survives reseeds / id renumbering.
 */
export const FRIDAY_ONLY_SERVICE_SLUGS = new Set<string>([
  "apex-express-interior-detailing",
  "apex-exterior-detailing",
  "apex-headlight-restoration",
]);

export const SHOP_TIMEZONE = "America/Chicago";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/**
 * Strict YYYY-MM-DD parser. Returns null for invalid or non-canonical inputs
 * (e.g. "2026-13-40", "2026-2-29" for non-leap years).
 *
 * The returned Date is the midnight-UTC representation of that calendar date,
 * which is convenient for date-only comparisons.
 */
export function parseDateString(yyyyMmDd: string): Date | null {
  if (!DATE_RE.test(yyyyMmDd)) return null;
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  // Round-trip check: catches things like 2026-02-30 (which would become Mar 2).
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

export function formatDateStringUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* --- shop-local timezone helpers (DST-safe via Intl) --- */

interface ShopLocalParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  weekday: number; // 0=Sun..6=Sat
}

const localFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: SHOP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  weekday: "short",
  hour12: false,
});

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function getShopLocalParts(d: Date): ShopLocalParts {
  const parts = localFormatter.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0; // Intl returns "24" for midnight in some envs
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
    minute: Number(get("minute")),
    weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
  };
}

export function shopLocalDateString(d: Date): string {
  const p = getShopLocalParts(d);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function shopLocalTimeString(d: Date): string {
  const p = getShopLocalParts(d);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

export function isClosedShopDate(yyyyMmDd: string): boolean {
  // Closed Sundays. Use UTC math on the date string itself — calendar
  // weekday doesn't shift with timezone for a date-only value.
  const d = parseDateString(yyyyMmDd);
  if (!d) return true;
  return d.getUTCDay() === 0;
}

/**
 * The bookable time slots for a given calendar date, taking the day of week
 * into account. Returns an empty list for days the shop is closed.
 */
export function getSlotsForDate(yyyyMmDd: string): readonly string[] {
  const d = parseDateString(yyyyMmDd);
  if (!d) return [];
  const dow = d.getUTCDay();
  if (dow === 0) return []; // Sun closed
  if (dow === 5) return FRIDAY_SLOTS; // Fri express only
  return REGULAR_SLOTS;
}

/**
 * True if {date, time} is a real bookable slot AND the given service is
 * allowed in that slot. Encapsulates:
 *   - Sunday closed
 *   - Friday-only services (apex-express-interior, apex-exterior,
 *     apex-headlight-restoration) are bookable on Fridays ONLY
 *   - All other services are bookable Mon-Thu and Sat ONLY (NOT Friday)
 */
export function isSlotAllowedForService(
  yyyyMmDd: string,
  time: string,
  serviceSlug: string,
): boolean {
  if (!getSlotsForDate(yyyyMmDd).includes(time)) return false;
  const d = parseDateString(yyyyMmDd);
  if (!d) return false;
  const isFriday = d.getUTCDay() === 5;
  const isFridayOnlyService = FRIDAY_ONLY_SERVICE_SLUGS.has(serviceSlug);
  // Friday-only services on a non-Friday → not allowed
  if (!isFriday && isFridayOnlyService) return false;
  // Non-Friday-only services on a Friday → not allowed
  if (isFriday && !isFridayOnlyService) return false;
  return true;
}

/**
 * Build a UTC Date corresponding to {date, time} interpreted in the shop's
 * local timezone. DST-safe: we probe both standard- and DST-offset candidates
 * and pick the one whose Intl-formatted local parts match the requested
 * date/time exactly.
 */
export function buildScheduledAt(date: string, time: string): Date | null {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  // America/Chicago: CST=-6, CDT=-5. Try both, pick the one that round-trips.
  for (const offsetHours of [-6, -5]) {
    const guess = new Date(Date.UTC(y, m - 1, d, hh - offsetHours, mm));
    const local = getShopLocalParts(guess);
    if (
      local.year === y &&
      local.month === m &&
      local.day === d &&
      local.hour === hh &&
      local.minute === mm
    ) {
      return guess;
    }
  }
  // Fallback (very rare DST spring-forward gap)
  return new Date(Date.UTC(y, m - 1, d, hh + 6, mm));
}

/** Returns today's date in shop-local time as YYYY-MM-DD. */
export function todayInShopLocal(): string {
  return shopLocalDateString(new Date());
}

/** True if the {date, time} slot starts at-or-before "now". */
export function isPastSlot(yyyyMmDd: string, time: string): boolean {
  const slot = buildScheduledAt(yyyyMmDd, time);
  if (!slot) return true;
  return slot.getTime() <= Date.now();
}
