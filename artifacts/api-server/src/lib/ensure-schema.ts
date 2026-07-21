import { pool } from "@workspace/db";

/**
 * Ensure blocked_dates has optional contact columns.
 * Replit Publish / older deploys can miss drizzle push, which then 500s
 * admin block-date creates that write name/surname/phone.
 * Idempotent — safe on every boot.
 */
export async function ensureBlockedDatesContactColumns(): Promise<void> {
  await pool.query(`
    ALTER TABLE blocked_dates
      ADD COLUMN IF NOT EXISTS name text,
      ADD COLUMN IF NOT EXISTS surname text,
      ADD COLUMN IF NOT EXISTS phone text
  `);
}
