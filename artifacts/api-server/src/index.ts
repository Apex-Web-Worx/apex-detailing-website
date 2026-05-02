import app from "./app";
import { startReminderCron } from "./lib/reminders";
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
