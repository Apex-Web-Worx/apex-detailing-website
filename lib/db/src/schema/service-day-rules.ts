import {
  pgTable,
  text,
  integer,
  boolean,
  serial,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { servicesTable } from "./services";

/**
 * Per-service availability rules: "service S is bookable on day-of-week D"
 * with an optional whole-day exclusivity lock. A row missing for a given
 * (service, day-of-week) means that service is NOT bookable that day.
 *
 * day_of_week is 0..6 with 0=Sunday, matching JS Date.getUTCDay() and our
 * existing shop-local helpers.
 *
 * whole_day_lock=true means: once any booking exists for this service on
 * a given calendar date, the entire day is locked for ALL services
 * (used for long services like Full Detail, Paint Correction, Ceramic
 * Coating). When false, multiple bookings can coexist across this rule's
 * configured time slots (used for short services like Express Interior,
 * Headlight Restoration).
 */
export const serviceDayRulesTable = pgTable(
  "service_day_rules",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => servicesTable.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0=Sun..6=Sat
    wholeDayLock: boolean("whole_day_lock").notNull().default(false),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    serviceDayUnique: uniqueIndex("service_day_rules_service_day_uq").on(
      t.serviceId,
      t.dayOfWeek,
    ),
  }),
);

/**
 * Time slots attached to a service-day rule. Stored as "HH:MM" 24-hour
 * strings interpreted in shop-local time (America/Chicago). One slot
 * per row so they can be added/removed individually from the admin UI.
 */
export const serviceDaySlotsTable = pgTable(
  "service_day_slots",
  {
    id: serial("id").primaryKey(),
    ruleId: integer("rule_id")
      .notNull()
      .references(() => serviceDayRulesTable.id, { onDelete: "cascade" }),
    time: text("time").notNull(), // "HH:MM"
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    ruleTimeUnique: uniqueIndex("service_day_slots_rule_time_uq").on(
      t.ruleId,
      t.time,
    ),
  }),
);

export const insertServiceDayRuleSchema = createInsertSchema(
  serviceDayRulesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertServiceDayRule = z.infer<typeof insertServiceDayRuleSchema>;
export type ServiceDayRule = typeof serviceDayRulesTable.$inferSelect;

export const insertServiceDaySlotSchema = createInsertSchema(
  serviceDaySlotsTable,
).omit({ id: true, createdAt: true });
export type InsertServiceDaySlot = z.infer<typeof insertServiceDaySlotSchema>;
export type ServiceDaySlot = typeof serviceDaySlotsTable.$inferSelect;
