# Reusable Template Guide

## Overview

This project is designed as a **reusable booking platform template** that can be adapted for any service-based business. By changing configuration, content, and branding, you can create a new booking website without rebuilding the core system.

## What Stays the Same (Core System)

| Component | Description |
|-----------|-------------|
| **Booking engine** | Multi-step flow, date/time picker, availability calculation |
| **Admin dashboard** | Password-protected, CRUD for bookings, blocked dates, service rules |
| **Customer self-service** | Manage/reschedule/cancel via token-gated links |
| **Notification system** | Email + SMS templates, 24h reminder cron |
| **Calendar sync** | Google Calendar integration for booking events |
| **Availability rules** | Service-day rules, whole-day lock, blocked dates |
| **Database schema** | Services, bookings, blocked dates, service rules |
| **API layer** | REST endpoints for all operations |

## What Changes Per Client

### 1. Branding

**Files to change:**
- `artifacts/apex-detailing/public/images/logo.png` — Business logo
- `artifacts/apex-detailing/public/images/hero-*.jpg` — Hero background images
- `artifacts/apex-detailing/public/images/favicon.ico` — Favicon
- `artifacts/apex-detailing/index.html` — Site title, meta tags, SEO
- `artifacts/apex-detailing/src/pages/home.tsx` — Business name, owner name, story, values text

**Search & replace:**
- "Apex Detailing" → New business name
- "Michail" / "Mikhail" → New owner name
- Christian values text → New business values (or remove)
- Instagram handle → New social handle

### 2. Services & Menu

**Files to change:**
- `artifacts/api-server/src/seed.ts` — Service catalog (name, description, duration, price)
- `artifacts/apex-detailing/src/pages/home.tsx` — Frontend service cards (features, pricing tiers)
- `artifacts/apex-detailing/src/pages/booking.tsx` — Service icons and badges

**Database update (`lib/db`):**
- Services are seeded on first run. To update existing services, modify the seed array in `artifacts/api-server/src/seed.ts` and the system will deactivate old slugs and add new ones.

### 3. Pricing

**Files to change:**
- `artifacts/api-server/src/seed.ts` — `priceCents` field for each service
- `artifacts/apex-detailing/src/pages/home.tsx` — `pricingDetails` array for tiered pricing display

**Note:** `priceCents === 0` shows "Call for quote" on the frontend.

### 4. Photos & Gallery

**Files to change:**
- `artifacts/apex-detailing/public/images/` — All service photos, gallery images, before/after pairs
- `artifacts/apex-detailing/public/videos/` — Demo videos
- `artifacts/apex-detailing/src/pages/home.tsx` — Gallery array (update image paths and counts)

**Gallery structure:**
```javascript
{ id: 1, title: "Service Name", beforeAfter: false, images: [...] }
```
- `beforeAfter: true` — Images alternate Before/After with labels
- `beforeAfter: false` — Simple image carousel

### 5. Domain

**Files to change:**
- `artifacts/apex-detailing/index.html` — Redirect script (if migrating from old domain)
- `artifacts/api-server/src/lib/site-url.ts` — Production domain
- `artifacts/api-server/src/lib/email.ts` — `SHOP_WEBSITE` constant
- SEO meta tags on all pages
- Sitemap.xml
- Robots.txt

### 6. Language & Text

**Files to change:**
- `artifacts/apex-detailing/src/pages/home.tsx` — All homepage copy
- `artifacts/apex-detailing/src/pages/booking.tsx` — Booking form labels, placeholders
- `artifacts/apex-detailing/src/pages/gift-cards.tsx` — Gift card descriptions
- `artifacts/apex-detailing/src/pages/privacy.tsx` — Privacy policy text
- `artifacts/apex-detailing/src/pages/terms.tsx` — Terms text
- `artifacts/api-server/src/lib/email.ts` — Email template copy
- `artifacts/api-server/src/lib/sms.ts` — SMS template copy

### 7. Design Style

**Files to change:**
- `artifacts/apex-detailing/src/pages/*.tsx` — Tailwind color classes
- `artifacts/apex-detailing/index.html` — Google Fonts import

**Current brand colors:**
```css
Primary Magenta: #FF1AD8
Brand Purple: #9D00FF
Primary Cyan: #00E5FF
Background: #0a0a0a
Card bg: white/[0.02] or white/[0.04]
```

Change these Tailwind classes throughout the codebase to retheme.

### 8. Contact Information

**Files to change:**
- `artifacts/api-server/src/lib/email.ts`:
  - `OWNER_EMAIL`
  - `OWNER_CC_EMAILS`
  - `SHOP_PHONE`
  - `SHOP_ADDRESS`
  - `SHOP_WEBSITE`
- `artifacts/apex-detailing/src/pages/home.tsx` — Phone, address, maps link
- `artifacts/apex-detailing/src/pages/booking.tsx` — Phone link in header

### 9. Business Rules

**Files to change:**
- `artifacts/api-server/src/lib/availability.ts` — Sunday closure rule, timezone
- `artifacts/api-server/src/seed.ts` — Default service-day rules and time slots
- `artifacts/api-server/src/routes/booking.ts` — Minimum notice rules (10h early-slot, 3-day for ceramic)

### 10. Gift Cards

**Files to change:**
- `artifacts/apex-detailing/src/pages/gift-cards.tsx` — Package names, amounts, descriptions
- `SQUARE_GIFT_URL` — Square gift card purchase link

### 11. Integrations

**Re-setup required for new project:**
- Google Mail (email sending)
- Twilio (SMS)
- Google Calendar (event sync)
- Square (gift cards — optional)

All integrations use Replit Connectors and must be re-authorized for a new Replit project.

### 12. APEX WEB WORX Attribution

**To remove or change:**
- Search for `apex-webworx-logo.png` references across all pages
- Update the footer component or remove entirely

---

## Quick Rebrand Checklist

| Step | Action | Files |
|------|--------|-------|
| 1 | Replace logo & images | `public/images/` |
| 2 | Update business name | `home.tsx`, `email.ts`, `index.html` |
| 3 | Update contact info | `email.ts`, `home.tsx` |
| 4 | Update services | `seed.ts`, `home.tsx`, `booking.tsx` |
| 5 | Update pricing | `seed.ts`, `home.tsx` |
| 6 | Update gallery | `home.tsx`, `public/images/` |
| 7 | Update testimonials | `home.tsx` |
| 8 | Update FAQ | `home.tsx` |
| 9 | Update domain | `site-url.ts`, `email.ts`, `index.html` |
| 10 | Re-theme colors | All `.tsx` files (search/replace hex codes) |
| 11 | Update gift cards | `gift-cards.tsx` |
| 12 | Reconfigure integrations | Replit Connectors panel |
| 13 | Update admin password | `ADMIN_TOKEN` env var |
| 14 | Update SEO | All page meta tags |

---

## Architecture Notes for Developers

### Frontend (`artifacts/apex-detailing/`)
- **Router:** Wouter (file-based routing via `src/pages/*.tsx`)
- **State:** React hooks + TanStack Query for server state
- **Styling:** Tailwind CSS with custom color tokens
- **API Client:** Auto-generated from OpenAPI spec
- **Icons:** Lucide React

### Backend (`artifacts/api-server/`)
- **Framework:** Express 5 with TypeScript
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** Simple token-based (`x-admin-token` header)
- **Validation:** Zod schemas shared between frontend and backend
- **Cron:** In-process Node.js timers (reminders)

### Database (`artifacts/api-server/src/db/`)
- **ORM:** Drizzle ORM with type-safe queries
- **Tables:** `services`, `bookings`, `blocked_dates`, `service_day_rules`, `service_day_slots`
- **Migrations:** Handled by Drizzle Kit

### Monorepo Structure
```
workspace/
├── artifacts/apex-detailing/    # Frontend (Vite + React)
├── artifacts/api-server/        # Backend (Express)
├── artifacts/mockup-sandbox/    # Component preview server
├── lib/api-client-react/        # Auto-generated API client
├── lib/api-spec/              # OpenAPI specification
├── lib/api-zod/               # Shared validation schemas
└── lib/db/                    # Database schema & connection
```

### Key Environment Variables

| Variable | Description | Required? |
|----------|-------------|-----------|
| `ADMIN_TOKEN` | Admin dashboard password | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OWNER_SMS_PHONE` | Owner's mobile for SMS | No (falls back to default) |
| `OWNER_CALENDAR_VIEWER_EMAILS` | Extra calendar viewers | No |
| `PORT` | Server port (assigned by Replit) | Yes |
