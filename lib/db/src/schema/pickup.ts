import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { bookingsTable } from "./bookings";

/** Shop-wide settings. Single row (id = 1). Review link is never invented. */
export const shopSettingsTable = pgTable("shop_settings", {
  id: integer("id").primaryKey().default(1),
  businessName: text("business_name").notNull().default("Apex Detailing"),
  businessPhone: text("business_phone").notNull().default("(417) 527-6165"),
  reviewLink: text("review_link").notNull().default("https://g.page/r/CQphdJbRExhREAE/review"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notificationTemplatesTable = pgTable("notification_templates", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  smsBody: text("sms_body").notNull(),
  emailSubject: text("email_subject").notNull(),
  emailBody: text("email_body").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const communicationsTable = pgTable(
  "communications",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => bookingsTable.id, { onDelete: "cascade" }),
    customerEmail: text("customer_email").notNull().default(""),
    messageType: text("message_type").notNull(),
    channel: text("channel").notNull(),
    direction: text("direction").notNull().default("outbound"),
    body: text("body").notNull().default(""),
    status: text("status").notNull().default("pending"),
    providerMessageId: text("provider_message_id"),
    error: text("error"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("communications_booking_id_idx").on(table.bookingId),
    index("communications_scheduled_idx").on(table.status, table.scheduledAt),
  ],
);

export const appointmentEventsTable = pgTable(
  "appointment_events",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => bookingsTable.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    channel: text("channel"),
    status: text("status"),
    detail: text("detail").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("appointment_events_booking_id_idx").on(table.bookingId)],
);

export type Communication = typeof communicationsTable.$inferSelect;
export type AppointmentEvent = typeof appointmentEventsTable.$inferSelect;
export type NotificationTemplate = typeof notificationTemplatesTable.$inferSelect;
export type ShopSettings = typeof shopSettingsTable.$inferSelect;
