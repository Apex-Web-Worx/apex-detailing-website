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
      ADD COLUMN IF NOT EXISTS phone text,
      ADD COLUMN IF NOT EXISTS vehicle text
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

export async function ensurePickupWorkflow(): Promise<void> {
  await pool.query(`
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS in_progress_at timestamptz,
      ADD COLUMN IF NOT EXISTS ready_at timestamptz,
      ADD COLUMN IF NOT EXISTS pickup_at timestamptz,
      ADD COLUMN IF NOT EXISTS completed_at timestamptz
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shop_settings (
      id integer PRIMARY KEY DEFAULT 1,
      business_name text NOT NULL DEFAULT 'Apex Detailing',
      business_phone text NOT NULL DEFAULT '(417) 527-6165',
      review_link text NOT NULL DEFAULT '',
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    INSERT INTO shop_settings (id)
    VALUES (1)
    ON CONFLICT (id) DO NOTHING
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_templates (
      key text PRIMARY KEY,
      name text NOT NULL,
      sms_body text NOT NULL,
      email_subject text NOT NULL,
      email_body text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS communications (
      id serial PRIMARY KEY,
      booking_id integer NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      customer_email text NOT NULL DEFAULT '',
      message_type text NOT NULL,
      channel text NOT NULL,
      direction text NOT NULL DEFAULT 'outbound',
      body text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'pending',
      provider_message_id text,
      error text,
      scheduled_at timestamptz,
      sent_at timestamptz,
      delivered_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS communications_booking_id_idx
      ON communications (booking_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS communications_scheduled_idx
      ON communications (status, scheduled_at)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointment_events (
      id serial PRIMARY KEY,
      booking_id integer NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      occurred_at timestamptz NOT NULL DEFAULT now(),
      actor text NOT NULL,
      action text NOT NULL,
      channel text,
      status text,
      detail text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS appointment_events_booking_id_idx
      ON appointment_events (booking_id)
  `);
}
