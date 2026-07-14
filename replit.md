# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec) — after spec changes, run `pnpm --filter @workspace/api-spec run codegen` then `cd lib/api-client-react && npx tsc` to refresh the composite project's `.d.ts` files (otherwise `apex-detailing` typecheck won't see new exports)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── apex-detailing/     # Apex Detailing marketing website (React + Vite)
│   ├── api-server/         # Express API server
│   └── mockup-sandbox/     # Design mockup sandbox
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Artifacts

### `artifacts/apex-detailing` (`@workspace/apex-detailing`)

Premium car detailing marketing website for Apex Detailing (Springfield, Nixa & Ozark, Missouri). Static frontend-only React + Vite app.

- **Design**: Bold & Energetic variant — dark theme (#0a0a0a), purple (#A886CD) and blue (#3496FF) gradient accents, Mulish font
- **Sections**: Hero, Services (5 cards), About, Gallery, Testimonials, CTA, Footer
- **Services**: Ceramic Coating, Paint Correction, Exterior Detailing, Interior Detailing, Headlight Restoration
- **Gallery**: 5 sections with before/after image pairs + video
  - Interior Restoration: 12 images (6 before/after pairs)
  - Exterior Detail: 4 images (2 before/after pairs)
  - Paint Correction: 2 images
  - Ceramic Coating: Video demo
  - Headlights Restoration: 4 images (2 before/after pairs)
  - Layout: Responsive grid (1 col mobile, 2 col tablet, 3 col desktop) with image preloading for instant switching
- **Booking**: Built-in custom booking flow at `/book` (replaces Calendly). Square link still used for Express Interior only.
- **Routing**: `wouter` Router with base from `import.meta.env.BASE_URL`. Routes: `/` (home), `/book` (booking wizard), `/manage/:id` (customer self-serve cancel/reschedule, requires `?token=` query), `/admin` (bookings dashboard).
- **Booking wizard** (`src/pages/booking.tsx`): 4-step flow — Service → Date & Time → Your Info → Confirm → Success. Uses generated react-query hooks (`useListServices`, `useGetAvailability`, `useCreateBooking`).
- **Admin dashboard** (`src/pages/admin.tsx`): password-gated (token persisted in `localStorage` as `apex_admin_token`, sent as `x-admin-token` header). Lists Upcoming / Completed / Cancelled with cancel action. Includes a **Block off days** panel for marking dates as closed (vacations, personal days) and a **Booking schedule** panel (`ServiceRulesPanel`) for editing service-day rules — owner can add/remove rules, toggle whole-day lock, pause/activate, and add/remove time slots inline.
- **PWA install support**: `public/manifest.webmanifest` + apple-touch-icon and `apple-mobile-web-app-*` meta tags in `index.html`. Owner can "Add to Home Screen" on iPhone Safari and the admin opens as a standalone app (no Safari chrome).
- **Social**: Instagram (@apexdetailing_sf), Facebook (/apexdetailingsf)
- **Entry**: `src/main.tsx` (wraps `<App>` in `QueryClientProvider`) → `src/App.tsx` (wouter router) → `src/pages/home.tsx`
- **Assets**: Logo and favicon in `public/images/`
- **Preview path**: `/`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health`
- **Booking routes** (`src/routes/booking.ts`): `GET /booking/services`, `GET /booking/availability?startDate&endDate&serviceId?`, `POST /booking/bookings`. Availability is split between pure date helpers (`src/lib/availability.ts`) and DB-backed rule lookups (`src/lib/availability-rules.ts`).
  - **Schedule is admin-editable** (no longer hardcoded). Per-`(service, day-of-week)` rule rows in `service_day_rules` (with a `whole_day_lock` flag) and per-rule slot rows in `service_day_slots` ("HH:MM" each). Sundays stay closed at the code level; everything else comes from the DB. Owner edits rules from `/admin` → "Booking schedule" panel.
  - **Default rules** seeded on a fresh DB (only when zero rules exist, never overwrites): Express Interior + Headlight Restoration → Friday `07:00/11:00/15:00` `whole_day_lock=false`; all other Apex services → Mon-Thu+Sat `07:30/08:00` `whole_day_lock=true`. Reproduces the previously-hardcoded behavior.
  - **Whole-day lock semantics**: when `whole_day_lock=true`, ANY confirmed booking that day blocks all further bookings on that day for ALL services. When `false`, multiple bookings can coexist across the rule's slots — but a separate whole-day-locked booking on the same day still blocks everyone else (`isDayWholeDayLocked` checks for that).
  - 1 booking per slot. Race-safety via partial unique index `bookings_confirmed_slot_unique on (scheduled_at) WHERE status='confirmed'` — double-book attempts surface as 409.
  - `getRuleForServiceIdDay(serviceId, dow)` is the canonical async check used by `POST /bookings`, `POST /manage/:id/reschedule`, and `POST /admin/bookings/:id/reschedule` — returns `{slots, wholeDayLock, ...}` or null. `isPastSlot(date, time)` rejects today's already-passed slots; the availability response marks past slots `available: false`.
  - `GET /availability` accepts an optional `serviceId`. With it set, slot lists come from that service's rule for the day-of-week; without it, they're the union of every active service's slots that day. Existing whole-day-locked bookings mark their date as `dayFullyBooked` for everyone.
- **Service-day rule CRUD** (`src/routes/admin.ts`): `GET /admin/service-rules` (rules + slots joined), `POST /admin/service-rules` (with optional initial slots), `PATCH /admin/service-rules/:id` (toggle `wholeDayLock` / `active`), `DELETE /admin/service-rules/:id` (cascades to slots), `POST /admin/service-rules/:id/slots` (add `HH:MM`), `DELETE /admin/service-rules/:id/slots/:slotId`. Backed by the admin UI panel `ServiceRulesPanel` in `src/pages/admin.tsx`.
- **Customer self-manage** (`src/routes/booking.ts`): each booking gets a 24-byte base64url `manageToken` returned in the create response. Token-gated endpoints (no admin auth):
  - `GET /booking/manage/:id?token=…` — fetch booking
  - `POST /booking/manage/:id/cancel?token=…` — customer-initiated cancellation
  - `POST /booking/manage/:id/reschedule?token=…` body `{date, time}` — move slot, validated against shop hours / blocked-dates / past-date / unique-slot constraints. Token compared with `crypto.timingSafeEqual`. Past appointments are rejected (400). Bookings created before this column existed have `manage_token = NULL` and cannot be self-managed (call to manage instead).
- **Admin routes** (`src/routes/admin.ts`): `GET/DELETE /admin/bookings[/:id]` for bookings, `GET/POST /admin/blocked-dates` and `DELETE /admin/blocked-dates/:date` for managing closed days. Auth via `x-admin-token` header against `ADMIN_TOKEN` env var (returns 500 if env var missing). `blocked_dates` table has unique index on `date`; duplicate block attempts return 409, past dates return 400. Booking creation and availability both consult the blocked-dates table. Admin DELETE sends a customer cancellation email when the row was previously confirmed.
- **SMS** (`src/lib/sms.ts` + `src/lib/notify.ts` + `src/lib/reminders.ts`): Twilio-via-Replit-connector. Connector returns `{account_sid, api_key, api_key_secret, phone_number}`; client built with API-key auth and cached for 10 minutes. **`sendSms()` never throws** — all errors (invalid number, opt-out 21610, Twilio outage) are logged and swallowed so a failed text never blocks a booking. **`normalizeUsPhone()`** coerces "(417) 555-1234" / "417.555.1234" / "+14175551234" to E.164; non-coercible numbers skip the send.
  - **`notify.ts` is the fan-out layer** — every booking event (created / rescheduled / cancelled / 24h-reminder) goes through `notifyBookingCreated/Rescheduled/Cancelled/Reminder24h` so email + SMS stay in lockstep. Replaces direct `sendBookingEmails / sendCancellationEmails / sendRescheduleEmails` calls in routes. All routes are fire-and-forget (no `await`).
  - **Recipients & channels per event** (current spec):
    - Booking **created**: customer email + (customer SMS *iff* `smsConsent`) + owner email + owner SMS
    - Booking **rescheduled**: customer email + (customer SMS *iff* `smsConsent`) + owner email + owner SMS
    - Booking **cancelled** (any actor): customer email + (customer SMS *iff* `smsConsent`) + owner email + owner SMS
    - **24h reminder**: customer SMS only (no email, no owner notification) — also gated on `smsConsent`
  - **Owner SMS destination**: `OWNER_SMS_PHONE` env var (E.164), defaults to `+14175276165`. Only consumed by `notify.ts`. **Owner SMS is sent unconditionally** — never gated on customer consent.
  - **A2P 10DLC compliance**: every customer-facing template ends in "Reply STOP to opt out." Booking form (`pages/booking.tsx`) has an SMS consent checkbox that is **checked by default** (opt-out design). Customers can leave it unchecked to receive only email and phone contact. The Twilio campaign description promises "consent is not a condition of booking", so `notify.ts` enforces this via a single `maySmsCustomer()` helper that gates every customer-facing `sendSms`. The `BookingEmailData` interface carries `smsConsent` so the reminder cron + reschedule/cancel paths see it too. Twilio handles STOP/HELP auto-responses; opted-out recipients return error code 21610 which we log+swallow.
  - **24h reminder cron** (`reminders.ts`): in-process `setInterval` every 5 minutes. Selects confirmed bookings with `scheduled_at` between `now+23h` and `now+25h` AND `reminder_sent_at IS NULL`, then **claims each row before sending** with an UPDATE whose WHERE re-checks every SELECT predicate (`id`, `status='confirmed'`, `reminder_sent_at IS NULL`, AND the same scheduled-at window). The re-check matters: between SELECT and claim a customer may have cancelled or rescheduled, and we must NOT text them about an appointment that no longer exists. The claim sets `reminder_sent_at = now()` BEFORE sending the SMS (at-most-once guarantee — a slow/failed SMS still counts as "we tried"). Started from `index.ts` after `app.listen`. The 2-hour window means missed/late ticks (server restart) still catch reminders next tick. **Single-process assumption** — same as calendar sync; if we scale horizontally, replace the SELECT-then-UPDATE with `SELECT ... FOR UPDATE SKIP LOCKED` or a job queue.
  - **Reschedule resets the reminder claim**: when the customer reschedule endpoint moves a booking to a different slot, the same UPDATE that changes `scheduled_at` also sets `reminder_sent_at = NULL` so the new slot will get its own 24h reminder. Same-slot "reschedules" (customer picked the slot they already had) intentionally do NOT reset, because we'd otherwise re-text someone we already reminded.
- **Email** (`src/lib/email.ts`): Gmail-via-Replit-connector; per-message random MIME boundary + base64-encoded bodies (defends against header/MIME injection from customer-controlled fields). Three flows: `sendBookingEmails` (confirmation), `sendCancellationEmails(b, "customer"|"owner")`, `sendRescheduleEmails({oldDate, oldTime, booking})`. Customer confirmation + reschedule emails embed a "Manage your booking" CTA → `${SITE_URL}/manage/:id?token=…`. `SITE_URL` env var defaults to `https://www.apexdetailingsf.com`.
- **Google Calendar** (`src/lib/calendar.ts`): owner's primary calendar via the Replit `google-calendar` connector. Single public function `syncBookingCalendar(bookingId)` — call sites (POST /booking/bookings, /manage/:id/reschedule, /manage/:id/cancel, admin DELETE) just fire it after the DB write that changed the booking. The function is a state-based reconciler: serializes per-booking via an in-memory queue, reloads the row, then ensures the calendar matches: confirmed+no-event → create + adopt id (compare-and-set on `google_event_id`); confirmed+event → patch in place (recreate if 404/410); cancelled → delete event + clear id + sweep up any orphans tagged `extendedProperties.private.apexBookingId`. This design is robust to create/reschedule/cancel arriving in quick succession (no duplicate or orphan events). All calls are fire-and-forget after the HTTP response. Event payload puts customer name + vehicle in the title, contact info + notes in the description; time zone `America/Chicago`. Single-process assumption — if we scale horizontally, replace the in-memory queue with a row lock or worker.
  - **Calendar sharing for spouse / additional viewers**: on the first sync of each process, `ensureCalendarShared()` POSTs an ACL rule (role `reader`, scope user) for each address in `OWNER_CALENDAR_VIEWER_EMAILS` (env var, comma-separated). Idempotent — Google upserts on the same scope so re-runs on every server start are safe. After this one-time share, every booking event automatically appears on the viewer's own Google Calendar under "Other calendars". **Opt-in only — no hardcoded fallback** because event payloads contain customer PII (name, phone, email, vehicle, notes); if the env var is unset, no sharing happens.
- **Seed (auto on boot)**: `runSeed()` is exported from `src/seed.ts` and called from `src/index.ts` on every server start. **This is what populates a fresh production database** — Replit Publish provisions the schema but never inserts data, so without auto-seed `/booking` shows an empty service list (we hit this once after the first publish). The seed is idempotent: upsert-by-slug + deactivate any slug not in the new list, costs ~14 small queries per boot. Failures are caught and logged so a transient DB hiccup never blocks server startup. CLI fallback (`cd artifacts/api-server && npx tsx ./src/seed.ts`) still works for one-off re-seeds. The 8-service "Apex" elite catalog (apex-full-detailing, apex-interior-detailing, apex-express-interior-detailing, apex-exterior-detailing, apex-wash-clay-wax, apex-headlight-restoration, apex-ceramic-coating, apex-paint-correction). Idempotent: upserts by slug and **deactivates** any rows whose slug isn't in the new list (preserves FK on existing bookings; deactivated rows just disappear from `/booking/services`). All `priceCents` are `0` because the website no longer shows prices to customers — column is kept in the schema in case pricing is reintroduced later.

### Booking system env vars
- `ADMIN_TOKEN` (shared) — password used to access `/admin`.
- `SITE_URL` (optional) — base URL used to build the customer manage link inside emails. Defaults to `https://www.apexdetailingsf.com`.
- `OWNER_SMS_PHONE` (optional) — E.164 phone number that receives owner notification texts on booking create / reschedule / cancel. Defaults to `+14175276165`.
- `OWNER_EMAIL` / `FROM_NAME` are constants in `email.ts` (`apexdetailingsf@gmail.com` / `Apex Detailing`).
- `OWNER_CALENDAR_VIEWER_EMAILS` (comma-separated) — Google accounts that the owner's calendar is auto-shared with so they see every booking on their own calendar (e.g. owner's spouse). Configured via Replit environment / Secrets — value is intentionally not committed because event payloads contain customer PII (name, phone, email, vehicle, notes). Unset = sharing disabled.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files; JS bundling handled by esbuild/tsx/vite
- **Project references** — when package A depends on B, A's tsconfig must list B in references

## Root Scripts

- `pnpm run build` — typecheck then recursive build
- `pnpm run typecheck` — `tsc --build --emitDeclarationOnly`

## Packages

### `lib/db` (`@workspace/db`)
Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI 3.1 spec and Orval codegen config. Run: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)
Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)
Generated React Query hooks and fetch client.

### `scripts` (`@workspace/scripts`)
Utility scripts. Run via `pnpm --filter @workspace/scripts run <script>`.
