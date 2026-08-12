import {
  customType,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { bookingsTable } from "./bookings";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const bookingPhotosTable = pgTable(
  "booking_photos",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => bookingsTable.id, { onDelete: "cascade" }),
    mime: text("mime").notNull(),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("booking_photos_booking_id_idx").on(table.bookingId)],
);

export type BookingPhoto = typeof bookingPhotosTable.$inferSelect;
