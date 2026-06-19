/**
 * Resolve the public-facing site URL for outbound links (manage URLs in
 * confirmation emails, calendar event sources, etc).
 *
 * Resolution order:
 *   1. Explicit `SITE_URL` env var (overrides everything; trailing "/" stripped).
 *   2. In production (NODE_ENV=production) → the live custom domain.
 *   3. In dev, when `REPLIT_DEV_DOMAIN` is set → the workspace preview URL,
 *      so manage links opened from emails sent during dev testing actually
 *      hit the dev server (and therefore the dev DB) where the booking lives.
 *   4. Final fallback → live custom domain.
 *
 * Note: this is computed lazily (per call) rather than at module load, so
 * tests and one-off scripts can override `SITE_URL` after import.
 */
export function getSiteUrl(): string {
  const explicit = process.env["SITE_URL"]?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  if (process.env["NODE_ENV"] === "production") {
    return "https://www.apexdetailing.net";
  }
  const devDomain = process.env["REPLIT_DEV_DOMAIN"]?.trim();
  if (devDomain) {
    return `https://${devDomain.replace(/\/+$/, "")}`;
  }
  return "https://www.apexdetailing.net";
}
