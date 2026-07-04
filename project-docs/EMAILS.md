# Apex Detailing — Email & SMS Templates

## Email System Overview

- **Provider:** Gmail / Google Mail (via Replit Connectors)
- **From:** apexdetailing.net@gmail.com
- **Reply-To:** Customer email (for owner notifications) or owner email (for customer emails)
- **CC:** gurova.krista@gmail.com (owner-facing emails only)
- **Format:** HTML with plain-text fallback
- **Design:** Dark theme matching the website aesthetic

---

## Email Templates

### 1. Booking Confirmation — Customer

**Trigger:** Customer completes a booking

**Subject:** `Your Apex Detailing booking is confirmed — [Date]`

**Content:**
- Branded header with Apex Detailing logo
- "BOOKING CONFIRMED" eyebrow
- Service name, date, time, vehicle details
- Drop-off location with Apple Maps link
- "Manage Your Booking" CTA button
- Contact info (reply to email or call)

**Plain text version includes:**
- All details in readable format
- Manage booking URL

---

### 2. Booking Confirmation — Owner

**Trigger:** Same as customer confirmation (simultaneous)

**Subject:** `New booking: [Service] — [Date] [Time]`

**Content:**
- "NEW BOOKING" header
- Customer name, email, phone
- Vehicle, duration
- Notes (if any)
- "View in Dashboard" CTA button

---

### 3. Booking Cancellation — Customer

**Trigger:** Customer or admin cancels a booking

**Subject:** `Your Apex Detailing appointment has been cancelled`

**Content:**
- Cancellation confirmation
- Service, date, time that was cancelled
- Rebooking link: `/book`
- Phone number for questions
- Different copy if cancelled by owner vs. customer:
  - Owner-cancelled: "If you didn't request this, please call us."
  - Customer-cancelled: "Sorry to see you go."

---

### 4. Booking Cancellation — Owner

**Trigger:** Same as customer cancellation

**Subject:** `Booking cancelled: [Service] — [Date]`

**Content:**
- Who cancelled (customer or admin)
- Customer name, date, time, service
- "Open Dashboard" CTA button

---

### 5. Reschedule Notification — Customer

**Trigger:** Customer or admin reschedules a booking

**Subject:** `Your Apex Detailing appointment has been rescheduled`

**Content:**
- New date and time (highlighted)
- Old date and time (for reference)
- "Manage Your Booking" CTA button

---

### 6. Reschedule Notification — Owner

**Trigger:** Same as customer reschedule

**Subject:** `Booking rescheduled: [Service] — [Date] [Time]`

**Content:**
- Customer name
- New date/time
- Old date/time
- "Open Dashboard" CTA button

---

### 7. Reminder Email

**Note:** The reminder system sends SMS only, not email. See SMS section below.

---

## SMS Templates

### Customer SMS (requires opt-in)

All customer SMS include: **"Reply STOP to opt out."**

#### Booking Confirmation SMS
```
Apex Detailing: Your [Service] is confirmed for [Date] at [Time]. 
Drop-off: 1114 E Lakota St, Nixa, MO 65714. 
Manage: [manageUrl]
Reply STOP to opt out.
```

#### 24-Hour Reminder SMS
```
Apex Detailing reminder: You're booked tomorrow [Date] at [Time] 
for [Service]. Drop-off: 1114 E Lakota St, Nixa, MO 65714. 
See you soon!
Reply STOP to opt out.
```

#### Reschedule SMS
```
Apex Detailing: Your appointment has been rescheduled to 
[Date] at [Time].
Manage: [manageUrl]
Reply STOP to opt out.
```

#### Cancellation SMS (by customer)
```
Apex Detailing: Your appointment for [Date] at [Time] has been 
cancelled. Sorry to see you go. To rebook visit 
https://www.apexdetailing.net/book.
Reply STOP to opt out.
```

#### Cancellation SMS (by owner)
```
Apex Detailing: Your appointment for [Date] at [Time] has been
cancelled. If you didn't request this, please call us.
To rebook visit https://www.apexdetailing.net/book.
Reply STOP to opt out.
```

### Owner SMS (always sent, no opt-in required)

#### New Booking Alert
```
Apex booking #[ID] NEW: [Service] for [Customer] ([Vehicle]) 
on [Date] [Time]. [Phone]
```

#### Reschedule Alert
```
Apex booking #[ID] RESCHEDULED: [Customer] moved to 
[Date] [Time] (was [OldDate] [OldTime]). [Phone]
```

#### Cancellation Alert
```
Apex booking #[ID] CANCELLED by [who]: [Customer] 
[Date] [Time] ([Service]). [Phone]
```

---

## Notification Matrix

| Event | Customer Email | Customer SMS | Owner Email | Owner SMS |
|-------|---------------|------------|-------------|-----------|
| New booking | ✅ | ✅* | ✅ | ✅ |
| Reschedule | ✅ | ✅* | ✅ | ✅ |
| Cancel (customer) | ✅ | ✅* | ✅ | ✅ |
| Cancel (owner) | ✅ | ✅* | ✅ | ✅ |
| 24h reminder | ❌ | ✅* | ❌ | ❌ |

*Only if customer checked "SMS Consent" during booking

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `OWNER_SMS_PHONE` | Owner's mobile for SMS notifications |
| `OWNER_CALENDAR_VIEWER_EMAILS` | Additional emails that see calendar events |

These are configured via Replit environment secrets, not hardcoded.
