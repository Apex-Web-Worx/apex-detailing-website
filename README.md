# Apex Detailing Website

A premium auto detailing business platform with online booking, gift cards, customer self-service, and an admin dashboard.

**Live Site:** [https://www.apexdetailing.net](https://www.apexdetailing.net)

---

## What This Project Does

This is a full-stack web application for **Apex Detailing**, an auto detailing business in Nixa, Missouri. It lets customers:

- Browse 8 detailing services with pricing
- Book appointments online with real-time availability
- Purchase digital gift cards
- Reschedule or cancel their own bookings

And it lets the business owner:

- View all appointments in a dashboard
- Block dates (holidays, vacation)
- Configure which services run on which days
- Receive email + SMS notifications for every booking

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| API | OpenAPI + TanStack Query |
| SMS | Twilio (Replit Connectors) |
| Email | Gmail (Replit Connectors) |
| Calendar | Google Calendar (Replit Connectors) |
| Payments | Square (gift cards) |

---

## Project Structure

```
workspace/
├── artifacts/apex-detailing/    # Frontend website
│   ├── src/pages/              # Page components (home, booking, admin, etc.)
│   └── public/images/         # Photos, logos, gallery images
├── artifacts/api-server/        # Backend API
│   ├── src/routes/            # API endpoints (booking, admin)
│   ├── src/lib/               # Business logic (email, SMS, calendar, availability)
│   └── src/seed.ts            # Service catalog seed data
├── lib/api-client-react/        # Auto-generated API client
├── lib/api-spec/                # OpenAPI specification
├── lib/api-zod/                 # Shared validation schemas
└── lib/db/                      # Database schema & connection
```

---

## Key Features

### Booking System
- Multi-step flow: Service → Date/Time → Info → Confirm
- Real-time availability based on service rules, existing bookings, and blocked dates
- Auto-formatting phone numbers: `(417) 527-6165`
- SMS consent checkbox (checked by default)

### Admin Dashboard (`/admin`)
- View upcoming and completed appointments
- Edit customer details
- Reschedule or cancel any booking
- Block specific dates
- Configure service-day rules and time slots

### Notifications
- **Email:** Branded HTML confirmations, cancellations, reschedules
- **SMS:** Confirmation, 24-hour reminder, cancellation alerts
- **Calendar:** Google Calendar events auto-created for every booking

### Gallery
- Paint Correction, Ceramic Coating, Interior, Exterior, Headlight galleries
- Before/after comparisons with labels
- Auto-rotating preview images on homepage cards
- Full-screen lightbox with touch/swipe support

### Gift Cards
- $100 / $200 / $300 digital gift card tiers
- Square integration for purchase

---

## How to Understand the Code

### For a New Developer

1. **Start with the booking flow:**
   - Frontend: `artifacts/apex-detailing/src/pages/booking.tsx`
   - Backend: `artifacts/api-server/src/routes/booking.ts`
   - This shows how a booking is created from form to database

2. **Check the availability engine:**
   - `artifacts/api-server/src/lib/availability.ts` — Date/time helpers
   - `artifacts/api-server/src/lib/availability-rules.ts` — Rule-based slot calculation
   - `artifacts/api-server/src/seed.ts` — Default rules (which days/times for each service)

3. **Look at notifications:**
   - `artifacts/api-server/src/lib/notify.ts` — Fan-out logic (email + SMS)
   - `artifacts/api-server/src/lib/email.ts` — HTML email templates
   - `artifacts/api-server/src/lib/sms.ts` — SMS templates + Twilio sending

4. **Explore the admin dashboard:**
   - Frontend: `artifacts/apex-detailing/src/pages/admin.tsx`
   - Backend: `artifacts/api-server/src/routes/admin.ts`

5. **Database schema:**
   - `lib/db/src/schema.ts` — All table definitions

### For Replit AI

If you're working with this project via Replit AI:
- All business logic lives in `artifacts/api-server/src/lib/`
- All page components live in `artifacts/apex-detailing/src/pages/`
- The database schema is the source of truth — check `lib/db/src/schema.ts` before adding new fields
- Environment variables control secrets — never hardcode API keys
- The monorepo uses pnpm workspaces — install packages with `pnpm add` from the workspace root

---

## Documentation

All project documentation is in `/project-docs/`:

| File | Description |
|------|-------------|
| `PROJECT-BRIEF.md` | Business overview, goals, design style |
| `FEATURES.md` | Complete feature list |
| `PRICING-RULES.md` | Service pricing tiers |
| `SERVICES-DATA.md` | Service catalog with descriptions |
| `CLIENT-RULES.md` | Booking policies and business rules |
| `ADMIN-DASHBOARD.md` | Admin capabilities |
| `EMAILS.md` | All email/SMS templates |
| `REUSABLE-TEMPLATE.md` | How to rebrand for another business |

---

## Environment Variables

Create these in Replit Secrets (never commit them):

| Variable | Description |
|----------|-------------|
| `ADMIN_TOKEN` | Password for admin dashboard |
| `DATABASE_URL` | PostgreSQL connection string |
| `OWNER_SMS_PHONE` | Owner's mobile for SMS alerts |
| `OWNER_CALENDAR_VIEWER_EMAILS` | Extra emails for calendar sharing |

Replit Connectors handle:
- Google Mail (for sending emails)
- Twilio (for SMS)
- Google Calendar (for event sync)

---

## Reusable Template

This project can be adapted for any service-based business. See `project-docs/REUSABLE-TEMPLATE.md` for a complete rebrand checklist.

---

**Designed and developed by APEX WEB WORX** — [https://www.apexwebworx.com](https://www.apexwebworx.com)
