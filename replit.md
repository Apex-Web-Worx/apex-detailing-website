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
- **Booking**: Links to Calendly (https://calendly.com/apexdetailingsf/detailing-appointment)
- **Social**: Instagram (@apexdetailing_sf), Facebook (/apexdetailingsf)
- **Entry**: `src/App.tsx` → `src/pages/home.tsx` (single-page, no routing needed)
- **Assets**: Logo and favicon in `public/images/`
- **Preview path**: `/`

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health`

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
