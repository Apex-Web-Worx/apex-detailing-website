import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id").notNull(),
    serviceName: text("service_name").notNull(),
    servicePriceCents: integer("service_price_cents").notNull(),
    serviceDurationMinutes: integer("service_duration_minutes").notNull(),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    vehicle: text("vehicle").notNull(),
    notes: text("notes").notNull().default(""),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("confirmed"),
    // Per-booking secret used in the customer's self-manage link
    // (/manage/:id?token=...). Nullable for backwards-compat with rows
    // created before this column existed; new rows always receive one.
    manageToken: text("manage_token"),
    // Google Calendar event id on the owner's primary calendar. Nullable
    // because:
    //   - rows created before this column existed have no event,
    //   - calendar event creation is fire-and-forget after the HTTP
    //     response, so a transient outage simply leaves this NULL,
    //   - cancellations clear it back to NULL after deleting the event.
    googleEventId: text("google_event_id"),
    // When the 24-hour reminder SMS was sent for this booking. Nullable
    // because most rows haven't reached the reminder window yet (or were
    // booked less than 24h out and skip the reminder entirely). The
    // reminders cron uses this to guarantee at-most-once delivery.
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    // Whether the customer ticked the optional SMS consent checkbox on
    // the booking form. When false, customer-facing SMS (confirmation,
    // 24h reminder, reschedule, cancellation) MUST be skipped — Twilio's
    // A2P 10DLC campaign description promises consent is not a condition
    // of booking and that we will only contact non-opted-in customers by
    // email and phone. Owner-facing SMS is unaffected.
    smsConsent: boolean("sms_consent").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("bookings_confirmed_slot_unique")
      .on(table.scheduledAt)
      .where(sql`${table.status} = 'confirmed'`),
  ],
);

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
