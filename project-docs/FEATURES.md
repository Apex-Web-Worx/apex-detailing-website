# Apex Detailing — Features Documentation

## 1. Booking System

### Multi-Step Booking Flow
The booking process guides customers through 4 steps:

1. **Select Service** — Customer picks from 8 detailing packages. Each shows name, description, duration, starting price, and a visual badge (e.g., "Most Booked", "3-Day Notice").

2. **Pick Date & Time** — Calendar shows available days. Backend calculates slots based on:
   - Service-specific day rules (which days each service is offered)
   - Service-specific time slots
   - Existing bookings (whole-day lock prevents overbooking)
   - Blocked dates (holidays, owner time off)
   - Minimum notice rules (e.g., Ceramic Coating requires 3-day advance notice)

3. **Enter Information** — Customer provides:
   - Name (required)
   - Email (required, validated)
   - Phone (required, auto-formats to `(XXX) XXX-XXXX`)
   - Vehicle Year/Make/Model (required)
   - Notes (optional)
   - SMS Consent checkbox (checked by default)

4. **Review & Confirm** — Summary page shows all details. Customer clicks "Confirm Booking" to finalize.

### Post-Booking
- Booking is saved as `status: "confirmed"` in the database
- A unique `manageToken` is generated for customer self-service
- Google Calendar event is created/updated
- Notifications fire (see EMAILS.md)

### Manage Booking Link
Sent in the confirmation email as `/manage/:id?token=...` — allows customers to view, reschedule, or cancel their booking.

## 2. Service Catalog & Pricing Display

The homepage and booking page display all 8 services with:
- Service name and description
- Starting price (e.g., "$300", "$200", "Call for quote")
- Vehicle-size pricing tiers where applicable
- Estimated duration
- Visual icon and color coding
- Badges for popular/value/express services

## 3. Gallery System

### Home Page Gallery Cards
- 5 interactive gallery categories: Paint Correction, Ceramic Coating, Interior Restoration, Exterior Detail, Headlight Restoration
- Each card shows a rotating preview image
- Cards display result count (e.g., "10 results")
- Clicking opens a full-screen lightbox

### Lightbox Features
- Full-screen image viewer with dark overlay
- Navigation arrows (previous/next)
- Touch/swipe support on mobile
- Image counter (e.g., "3 / 10")
- Before/After labels for comparison galleries
- Auto-rotation: images cycle every 3.5 seconds
- Paint Correction card auto-cycles 10 images on the homepage

## 4. Testimonials System

- 5 client testimonials displayed on homepage
- Business client: Sight & Sound Theater (Branson, MO)
- Individual clients from Nixa, Ozark, Springfield
- Each shows: quote, client name, location
- 5-star rating display
- Link to Google Reviews

## 5. FAQ System

- Two categories: "General" and "Paint Correction"
- Accordion-style expand/collapse
- Covers: pricing, duration, pet hair, location, paint correction levels, ceramic coating durability
- Category toggle buttons at top

## 6. Client Dashboard (Self-Service)

Accessible via `/manage/:id?token=...` link sent in confirmation email.

### What Clients Can Do
- **View** their booking details (service, date, time, vehicle)
- **Reschedule** — pick a new date/time from available slots
- **Cancel** — cancel their appointment
- All changes trigger automatic notifications

### Restrictions
- Cannot reschedule to a blocked date
- Cannot reschedule to a Sunday
- Cannot move to a past or already-passed slot
- Cancellation is immediate and permanent

## 7. Admin Dashboard

Protected by password. Accessible at `/admin`.

### Appointment Management
- View all upcoming and completed bookings
- Filter by date or service type
- Edit customer info (name, email, phone, vehicle, notes)
- Reschedule any booking
- Cancel any booking
- Refresh button to reload data

### Schedule Control
- **Blocked Dates Panel**: Block specific days (holidays, vacation). Each block can have a reason note.
- **Service Rules Panel**: Configure which services run on which days, their time slots, and whether they lock the whole day.

### Statistics
- Header shows count: "X upcoming · Y completed"

## 8. Calendar Integration

### Google Calendar Sync
- Every booking creates/updates a Google Calendar event
- Events include: customer name, service, vehicle, phone, notes
- Cancelled bookings remove their calendar event
- Rescheduled bookings update the event time
- Blocked dates create all-day events
- Calendar is shared with optional viewer emails

## 9. Email Notifications

See `EMAILS.md` for full template details.

### Trigger Events
| Event | Customer Email | Owner Email |
|-------|---------------|-------------|
| New booking | Confirmation | New booking alert |
| Reschedule | Reschedule notice | Reschedule alert |
| Cancellation | Cancellation notice | Cancellation alert |
| 24h reminder | SMS only | — |

### Email Features
- Branded HTML with Apex Detailing logo and gradient headers
- Mobile-responsive design
- "Manage Your Booking" CTA button
- Maps link to drop-off location
- Plain-text fallback

## 10. SMS Notifications

### Customer SMS (requires opt-in)
- **Confirmation**: Service, date, time, drop-off address, manage link
- **24h Reminder**: "You're booked tomorrow..." with service and time
- **Reschedule**: New date/time confirmation
- **Cancellation**: Cancellation confirmation with rebook link

### Owner SMS (always sent)
- **New Booking**: ID, service, customer, vehicle, date, time, phone
- **Reschedule**: ID, customer, new time, old time, phone
- **Cancellation**: ID, who cancelled, customer, date, time, service, phone

All customer SMS include "Reply STOP to opt out" per Twilio A2P requirements.

## 11. Gift Cards

### Gift Card Page (`/gift-cards`)
- 3 gift card tiers: $100 (Express), $200 (Detailer), $300 (Showroom)
- Each shows what it covers, who it's best for, and includes list
- Digital gift card visual preview
- Links to Square for purchase

## 12. Availability Rules Engine

### How It Works
The system uses database-driven rules to calculate available slots:

1. **Service-Day Rules** (`service_day_rules` table): Links each service to allowed days of the week
2. **Time Slots** (`service_day_slots` table): Specific "HH:MM" times for each service-day combination
3. **Whole-Day Lock**: When true, one booking on that day blocks all other slots (for long services like Full Detail)
4. **Blocked Dates**: Manual date overrides (holidays, etc.)
5. **Existing Bookings**: Already-booked slots are excluded
6. **Minimum Notice**: Some services require X days advance booking

### Default Rules (Seeded)
- Express Interior + Headlight Restoration: Fridays only, 07:00/11:00/15:00, no whole-day lock
- All other services: Mon-Thu + Sat, 07:30/08:00, whole-day locked

## 13. Domain & SEO

- Primary domain: `apexdetailing.net`
- Old domain `apexdetailingsf.com` redirects to new domain
- SEO metadata on every page (title, description, Open Graph)
- Sitemap.xml for search engines
- Robots.txt configuration

## 14. APEX WEB WORX Attribution

- APEX WEB WORX logo and "Designed and developed by APEX WEB WORX" footer on every page
- Links to https://www.apexwebworx.com

## 15. Reminder System

- 24-hour reminder cron runs every 5 minutes
- Sends SMS to customers with confirmed bookings in the 23-25 hour window
- Marks `reminderSentAt` to prevent duplicates
- Only sends if customer opted in to SMS
