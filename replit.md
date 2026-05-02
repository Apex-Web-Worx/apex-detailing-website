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
- **API codegen**: Orval (from OpenAPI spec)
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
- **Routing**: `wouter` Router with base from `import.meta.env.BASE_URL`. Routes: `/` (home), `/book` (booking wizard), `/admin` (bookings dashboard).
- **Booking wizard** (`src/pages/booking.tsx`): 4-step flow — Service → Date & Time → Your Info → Confirm → Success. Uses generated react-query hooks (`useListServices`, `useGetAvailability`, `useCreateBooking`).
- **Admin dashboard** (`src/pages/admin.tsx`): password-gated (token persisted in `localStorage` as `apex_admin_token`, sent as `x-admin-token` header). Lists Upcoming / Completed / Cancelled with cancel action. Includes a **Block off days** panel for marking dates as closed (vacations, personal days) — blocked dates appear greyed out in the customer date picker and are rejected at the API.
- **Social**: Instagram (@apexdetailing_sf), Facebook (/apexdetailingsf)
- **Entry**: `src/main.tsx` (wraps `<App>` in `QueryClientProvider`) → `src/App.tsx` (wouter router) → `src/pages/home.tsx`
- **Assets**: Logo and favicon in `public/images/`
- **Preview path**: `/`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health`
- **Booking routes** (`src/routes/booking.ts`): `GET /booking/services`, `GET /booking/availability?startDate&endDate`, `POST /booking/bookings`. Availability helper at `src/lib/availability.ts` — fixed slots 08:00/10:00/12:00/14:00 (shop time), Sun closed, 1 booking per slot.
- **Admin routes** (`src/routes/admin.ts`): `GET/DELETE /admin/bookings[/:id]` for bookings, `GET/POST /admin/blocked-dates` and `DELETE /admin/blocked-dates/:date` for managing closed days. Auth via `x-admin-token` header against `ADMIN_TOKEN` env var (returns 500 if env var missing). `blocked_dates` table has unique index on `date`; duplicate block attempts return 409, past dates return 400. Booking creation and availability both consult the blocked-dates table.
- **Seed**: `pnpm --filter @workspace/api-server run seed` populates 6 services.

### Booking system env vars
- `ADMIN_TOKEN` (shared) — password used to access `/admin`. Currently set to placeholder `apex-admin-2026` for dev. **User should change this** via the Secrets pane before going live.

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
