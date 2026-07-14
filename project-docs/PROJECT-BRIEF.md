# Apex Detailing — Project Brief

## Business Overview

| Field | Value |
|-------|-------|
| **Business Name** | Apex Detailing |
| **Owner** | Michail Gurov |
| **Location** | 1114 E Lakota St, Nixa, MO 65714 |
| **Phone** | (417) 527-6165 |
| **Email** | apexdetailing.net@gmail.com |
| **Website** | https://www.apexdetailing.net |
| **Instagram** | @apexdetailing_sf |
| **Values** | Christian faith-based business — integrity, excellence, care |

## Website Purpose

A premium auto detailing business platform that allows customers to:
1. Browse detailing services and pricing
2. Book appointments online
3. Purchase digital gift cards
4. Manage their own bookings (reschedule/cancel)

## Target Client

Vehicle owners in Nixa, Ozark, Springfield, and surrounding Greene & Christian County, Missouri communities. Clients value quality workmanship, attention to detail, and professional service.

## Design Style

- **Theme**: Dark luxury aesthetic (`#0a0a0a` background)
- **Brand Colors** (from hex logo):
  - Primary magenta: `#FF1AD8`
  - Primary cyan: `#00F0FF`
  - Accent gradient: `from-[#FF1AD8] to-[#00F0FF]`
- **Typography**: Bold, uppercase tracking, modern sans-serif
- **Visual Elements**: Hex mark logo, neon gradients, glass-morphism cards, subtle glow effects
- **Mobile-first**: Fully responsive with touch-friendly interactions

## Languages & Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Routing | Wouter (lightweight React router) |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL via Drizzle ORM |
| API Client | TanStack Query (React Query) + OpenAPI-generated client |
| SMS | Twilio (via Replit Connectors) |
| Email | Gmail/Google Mail (via Replit Connectors) |
| Calendar | Google Calendar (via Replit Connectors) |
| Payments | Square (gift cards) |

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, services, gallery, testimonials, FAQ, contact |
| `/book` | Booking | Multi-step booking flow (Service → Date/Time → Info → Confirm) |
| `/manage/:id` | Manage Booking | Customer self-service reschedule/cancel page |
| `/gift-cards` | Gift Cards | Digital gift card purchase via Square |
| `/admin` | Admin Dashboard | Password-protected owner dashboard |
| `/privacy` | Privacy Policy | Legal privacy information |
| `/terms` | Terms & Conditions | Legal terms |
| `*` | 404 | Not found page |

## Overall Client Goals

1. **Reduce phone booking volume** — customers can book online 24/7
2. **Prevent double-booking** — calendar rules enforce availability automatically
3. **Professional brand presence** — premium dark aesthetic reflects service quality
4. **Automated notifications** — emails + SMS keep customers informed
5. **Owner efficiency** — admin dashboard shows all appointments, blocks dates, manages rules
6. **Gift card revenue** — digital gift cards for holidays and special occasions
7. **Customer self-service** — clients manage their own bookings without calling
8. **Faith-forward branding** — Christian values are central to the business identity
