/**
 * DB-backed service availability rules.
 *
 * Replaces the previous hardcoded FRIDAY_SLOTS / REGULAR_SLOTS /
 * FRIDAY_ONLY_SERVICE_SLUGS constants with rows in service_day_rules
 * and service_day_slots so the owner can edit them from the admin UI.
 *
 * Concept:
 *   service_day_rules row (service_id, day_of_week) describes whether
 *   a service is bookable that day, with `whole_day_lock` controlling
 *   whether one booking that day consumes the whole day for ALL services
 *   (true, e.g. Apex Full Detail) or only that exact slot (false,
 *   e.g. Apex Express Interior on Fridays).
 *
 *   service_day_slots rows attach the actual "HH:MM" slot list to a rule.
 *
 * Pure date / timezone helpers stay in `./availability.ts`.
 */

import {
  db,
  serviceDayRulesTable,
  serviceDaySlotsTable,
  servicesTable,
  bookingsTable,
} from "@workspace/db";
import { and, asc, eq, gte, lte, inArray, sql } from "drizzle-orm";
import { parseDateString, shopLocalDateString } from "./availability";

export interface RuleWithSlots {
  ruleId: number;
  serviceId: number;
  serviceSlug: string;
  serviceName: string;
  dayOfWeek: number;
  wholeDayLock: boolean;
  active: boolean;
  slots: string[]; // sorted "HH:MM"
}

/* ------------------------------------------------------------------ */
/* Lookup helpers                                                      */
/* ------------------------------------------------------------------ */

/**
 * Returns the rule + slot list for (serviceSlug, dayOfWeek) or null if
 * the service isn't configured for that day or the rule is inactive.
 */
export async function getRuleForServiceSlugDay(
  serviceSlug: string,
  dayOfWeek: number,
): Promise<RuleWithSlots | null> {
  const [row] = await db
    .select({
      ruleId: serviceDayRulesTable.id,
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
    .where(
      and(
        eq(servicesTable.slug, serviceSlug),
        eq(serviceDayRulesTable.dayOfWeek, dayOfWeek),
        eq(serviceDayRulesTable.active, true),
        eq(servicesTable.active, true),
      ),
    );
  if (!row) return null;
  const slotRows = await db
    .select({ time: serviceDaySlotsTable.time })
    .from(serviceDaySlotsTable)
    .where(eq(serviceDaySlotsTable.ruleId, row.ruleId))
    .orderBy(asc(serviceDaySlotsTable.time));
  return { ...row, slots: slotRows.map((r) => r.time) };
}

/**
 * Returns the rule + slot list for (serviceId, dayOfWeek). Used by booking
 * paths that already loaded the service row.
 */
export async function getRuleForServiceIdDay(
  serviceId: number,
  dayOfWeek: number,
  tx: Omit<typeof db, "$client"> = db,
): Promise<RuleWithSlots | null> {
  const [row] = await tx
    .select({
      ruleId: serviceDayRulesTable.id,
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
    .where(
      and(
        eq(serviceDayRulesTable.serviceId, serviceId),
        eq(serviceDayRulesTable.dayOfWeek, dayOfWeek),
        eq(serviceDayRulesTable.active, true),
      ),
    );
  if (!row) return null;
  const slotRows = await tx
    .select({ time: serviceDaySlotsTable.time })
    .from(serviceDaySlotsTable)
    .where(eq(serviceDaySlotsTable.ruleId, row.ruleId))
    .orderBy(asc(serviceDaySlotsTable.time));
  return { ...row, slots: slotRows.map((r) => r.time) };
}

/**
 * All active rules grouped by day-of-week (0..6). Used by the public
 * /booking/availability range endpoint when no service is selected,
 * and to compute the union of all configured slots per day.
 */
export async function getAllActiveRulesByDow(): Promise<
  Map<number, RuleWithSlots[]>
> {
  const ruleRows = await db
    .select({
      ruleId: serviceDayRulesTable.id,
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
    .where(
      and(
        eq(serviceDayRulesTable.active, true),
        eq(servicesTable.active, true),
      ),
    );
  if (ruleRows.length === 0) return new Map();
  const ruleIds = ruleRows.map((r) => r.ruleId);
  const slotRows = await db
    .select({
      ruleId: serviceDaySlotsTable.ruleId,
      time: serviceDaySlotsTable.time,
    })
    .from(serviceDaySlotsTable)
    .where(inArray(serviceDaySlotsTable.ruleId, ruleIds))
    .orderBy(asc(serviceDaySlotsTable.time));
  const slotsByRule = new Map<number, string[]>();
  for (const s of slotRows) {
    const arr = slotsByRule.get(s.ruleId) ?? [];
    arr.push(s.time);
    slotsByRule.set(s.ruleId, arr);
  }
  const out = new Map<number, RuleWithSlots[]>();
  for (const r of ruleRows) {
    const list = out.get(r.dayOfWeek) ?? [];
    list.push({ ...r, slots: slotsByRule.get(r.ruleId) ?? [] });
    out.set(r.dayOfWeek, list);
  }
  return out;
}

/**
 * Set of service IDs that have whole_day_lock=true on a given day-of-week.
 * Used during availability calc to know which existing bookings cause a
 * whole-day lock for the date they occupy.
 */
export function wholeDayLockServiceIdsByDow(
  rulesByDow: Map<number, RuleWithSlots[]>,
): Map<number, Set<number>> {
  const out = new Map<number, Set<number>>();
  for (const [dow, rules] of rulesByDow) {
    const ids = new Set<number>();
    for (const r of rules) {
      if (r.wholeDayLock) ids.add(r.serviceId);
    }
    out.set(dow, ids);
  }
  return out;
}

/**
 * True if {date, time} is bookable for the given service slug, based on
 * the configured day-of-week rule. Async replacement for the old sync
 * isSlotAllowedForService.
 */
export async function isSlotAllowedForServiceDb(
  yyyyMmDd: string,
  time: string,
  serviceSlug: string,
): Promise<boolean> {
  const d = parseDateString(yyyyMmDd);
  if (!d) return false;
  const rule = await getRuleForServiceSlugDay(serviceSlug, d.getUTCDay());
  if (!rule) return false;
  return rule.slots.includes(time);
}

/**
 * Thrown inside a db.transaction() callback when a pre-insert validation
 * check fails (e.g. whole-day-lock conflict). The transaction is rolled
 * back automatically, and the caller catches this and surfaces the stored
 * HTTP status code.
 */
export class TransactionAbortError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "TransactionAbortError";
  }
}

/**
 * Acquire a transaction-scoped advisory lock keyed by the date string.
 * This serializes all booking operations (create/reschedule) on the same
 * day, eliminating the whole-day-lock race condition where two concurrent
 * requests could both pass the pre-insert check and then both insert.
 */
export async function acquireDayLock(
  tx: Omit<typeof db, "$client">,
  yyyyMmDd: string,
): Promise<void> {
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  const key = (year * 10000 + month * 100 + day) % 2147483647;
  await tx.execute(sql`SELECT pg_advisory_xact_lock(42, ${key})`);
}

/**
 * Day-level lock check: returns true if a confirmed booking exists on
 * yyyyMmDd whose service has whole_day_lock=true for that day-of-week.
 * Optionally excludes a specific booking id (used by reschedule paths
 * so a booking moving within its own day doesn't block itself).
 */
/**
 * Returns true if any confirmed booking exists on the given shop-local
 * date (regardless of which service). Optionally excludes a single
 * booking id (used by reschedule paths so a booking moving within its
 * own day doesn't block itself). Used by whole-day-lock create/reschedule
 * checks: if the new rule whole-day-locks, no other booking may exist
 * that day.
 *
 * Uses a padded scheduled_at window then filters precisely by
 * shop-local date string — DST-safe, and won't pick up bookings that
 * happen to fall on the next/previous calendar day in UTC.
 */
export async function hasOtherConfirmedBookingOnDate(
  yyyyMmDd: string,
  excludeBookingId?: number,
  tx: Omit<typeof db, "$client"> = db,
): Promise<boolean> {
  const d = parseDateString(yyyyMmDd);
  if (!d) return false;
  const dayStart = new Date(d.getTime() - 24 * 60 * 60 * 1000);
  const dayEnd = new Date(d.getTime() + 48 * 60 * 60 * 1000);
  const candidates = await tx
    .select({ id: bookingsTable.id, scheduledAt: bookingsTable.scheduledAt })
    .from(bookingsTable)
    .where(
      and(
        gte(bookingsTable.scheduledAt, dayStart),
        lte(bookingsTable.scheduledAt, dayEnd),
        eq(bookingsTable.status, "confirmed"),
      ),
    );
  return candidates.some(
    (b) =>
      shopLocalDateString(b.scheduledAt) === yyyyMmDd &&
      b.id !== excludeBookingId,
  );
}

export async function isDayWholeDayLocked(
  yyyyMmDd: string,
  excludeBookingId?: number,
  tx: Omit<typeof db, "$client"> = db,
): Promise<boolean> {
  const d = parseDateString(yyyyMmDd);
  if (!d) return false;
  const dow = d.getUTCDay();

  // Find services that whole-day-lock this day-of-week.
  const lockingRules = await tx
    .select({ serviceId: serviceDayRulesTable.serviceId })
    .from(serviceDayRulesTable)
    .where(
      and(
        eq(serviceDayRulesTable.dayOfWeek, dow),
        eq(serviceDayRulesTable.wholeDayLock, true),
        eq(serviceDayRulesTable.active, true),
      ),
    );
  if (lockingRules.length === 0) return false;
  const lockingServiceIds = lockingRules.map((r) => r.serviceId);

  // Window covers the calendar date in shop-local time. Pad ±24h for
  // timezone safety, then filter precisely by shop-local date string.
  const dayStart = new Date(d.getTime() - 24 * 60 * 60 * 1000);
  const dayEnd = new Date(d.getTime() + 48 * 60 * 60 * 1000);
  const candidates = await tx
    .select({ id: bookingsTable.id, scheduledAt: bookingsTable.scheduledAt })
    .from(bookingsTable)
    .where(
      and(
        gte(bookingsTable.scheduledAt, dayStart),
        lte(bookingsTable.scheduledAt, dayEnd),
        eq(bookingsTable.status, "confirmed"),
        inArray(bookingsTable.serviceId, lockingServiceIds),
      ),
    );
  return candidates.some(
    (b) =>
      shopLocalDateString(b.scheduledAt) === yyyyMmDd &&
      b.id !== excludeBookingId,
  );
}
