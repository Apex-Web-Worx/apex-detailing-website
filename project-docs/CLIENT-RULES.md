# Apex Detailing — Business Rules & Client Policies

## Booking Rules

### 1. Advance Booking Requirement
- **Early-slot notice:** 07:30 and 08:00 slots require 10-hour advance booking; other slots are available until their start time
- **Ceramic Coating special:** Requires 3+ days advance notice
- System enforces this via `isTooSoon()` (10h for early slots) and `isTooSoonForCeramic()` checks

### 2. Sunday Closure
- The shop is closed on Sundays
- No services can be booked on Sundays (hardcoded rule)
- Admin cannot override Sunday closures

### 3. Service-Specific Days
- **Express Interior + Headlight Restoration:** Friday only
- **All other services:** Monday–Thursday + Saturday
- These rules are configurable by the owner via the admin dashboard

### 4. Whole-Day Lock Services
The following services consume the entire day when booked:
- Apex Full Detailing
- Apex Interior Detailing
- Apex Exterior Detailing
- Apex Wash, Clay & Wax
- Apex Ceramic Coating
- Apex Paint Correction

**Effect:** No other bookings can coexist on the same day for ANY service.

### 5. Multi-Booking Services
The following services allow multiple bookings per day:
- Apex Express Interior Detailing
- Apex Headlight Restoration

**Effect:** These share Friday slots (07:00, 11:00, 15:00) and can coexist.

### 6. Blocked Dates
- The owner can block specific dates (holidays, vacation, etc.)
- Blocked dates appear in the calendar but cannot be selected
- Each block can include an optional reason note
- Blocked dates sync to Google Calendar

---

## Client Dashboard Rules (Self-Service)

### What Clients CAN Do
1. **View** their booking details anytime via the manage link
2. **Reschedule** to a new available date/time
3. **Cancel** their appointment

### Reschedule Restrictions
- Cannot reschedule to a blocked date
- Cannot reschedule to a Sunday
- Cannot move to a past or already-passed slot
- Same 10-hour early-slot notice and ceramic 3-day rules apply as new bookings
- Cannot reschedule to a date with whole-day lock if another booking exists
- Rescheduling triggers a new confirmation email + SMS

### Cancellation Rules
- Clients can cancel via the manage link (past appointments cannot be cancelled)
- Cancellation is immediate and permanent
- Owner receives cancellation notification via email + SMS
- Client receives cancellation confirmation
- Google Calendar event is removed

---

## Admin-Only Operations

The following actions require the admin dashboard:

1. **Cancel any booking** — Admin can cancel any client's booking
2. **Reschedule any booking** — Admin can move any booking to a new slot
3. **Edit customer details** — Name, email, phone, vehicle, notes
4. **Block dates** — Add/remove shop closure days
5. **Configure service rules** — Change which days/times each service runs
6. **View all bookings** — Complete booking history

---

## SMS Consent Policy

- SMS consent checkbox is **checked by default** on the booking form
- If unchecked, customer receives email notifications only
- If checked, customer receives both email AND SMS
- All customer SMS include "Reply STOP to opt out" per Twilio A2P requirements
- Owner SMS are sent unconditionally (does not require customer consent)

---

## Data Retention

- All bookings (including cancelled) are retained in the database
- Admin dashboard only shows upcoming and completed bookings
- Cancelled bookings are hidden from the dashboard view
- `manageToken` is required for customer self-service access

---

## Payment Policy

- Gift cards are the only online payment option (via Square)
- Service payments are handled in person at drop-off
- No online deposit or prepayment system exists
- Final pricing confirmed upon vehicle inspection
