import { pool } from "@workspace/db";

/**
 * Replit Publish / older deploys can miss drizzle push. These helpers
 * are idempotent and run on every boot so missing columns/tables do
 * not 500 live traffic.
 */
export async function ensureBlockedDatesContactColumns(): Promise<void> {
  await pool.query(`
    ALTER TABLE blocked_dates
      ADD COLUMN IF NOT EXISTS name text,
      ADD COLUMN IF NOT EXISTS surname text,
      ADD COLUMN IF NOT EXISTS phone text
  `);
}

export async function ensureBookingPhotosTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_photos (
      id serial PRIMARY KEY,
      booking_id integer NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      mime text NOT NULL,
      data bytea NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS booking_photos_booking_id_idx
      ON booking_photos (booking_id)
  `);
}
