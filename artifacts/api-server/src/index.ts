import app from "./app";
import { startReminderCron } from "./lib/reminders";
import { ensureBlockedDatesContactColumns } from "./lib/ensure-schema";
import { runSeed } from "./seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Bring schema up to date before serving traffic. Missing columns on
// blocked_dates caused HTTP 500 when admin tried to save contact fields.
ensureBlockedDatesContactColumns()
  .then(() => console.log("[schema] blocked_dates contact columns ready"))
  .catch((err) => console.error("[schema] ensure failed (continuing):", err));

// Auto-seed on startup. The seed is idempotent (upsert by slug + deactivate
// missing), so re-running on every boot costs ~14 small queries and ensures
// a fresh production database — Replit Publish creates the schema but never
// inserts data — has the service catalog before the first request arrives.
// Failures are logged but never block startup; better to serve a degraded
// /booking page than to refuse all traffic on a transient DB hiccup.
runSeed()
  .then(() => console.log("[seed] catalog up-to-date"))
  .catch((err) => console.error("[seed] failed (continuing):", err));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  startReminderCron();
});
