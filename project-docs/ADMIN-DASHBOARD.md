# Apex Detailing — Admin Dashboard Documentation

## Access

- **URL:** `/admin`
- **Authentication:** Password-protected via `x-admin-token` header
- **Password source:** `ADMIN_TOKEN` environment variable

## Dashboard Sections

### 1. Appointments Overview

**Header Stats:**
- `X upcoming` — Confirmed bookings scheduled for today or later
- `Y completed` — Confirmed bookings from before today

**Note:** Cancelled bookings are hidden from the dashboard view.

### 2. Upcoming Bookings

Shows all confirmed future appointments sorted by date.

**Each booking card displays:**
- Service name (with visual icon)
- Date and time
- Customer name
- Vehicle (Year/Make/Model)
- Phone number
- Email address
- Notes (if any)
- Booking ID

**Actions per booking:**
- **Edit** — Opens inline edit form for customer details
- **Cancel** — Marks booking as cancelled, triggers notifications
- **Reschedule** — Opens date/time picker for new slot

**Filters:**
- Filter by date (pick a specific date)
- Filter by service type (dropdown of active services)

### 3. Completed Bookings

Shows past confirmed appointments (same card format as upcoming).
- Displayed muted/grayed out
- Read-only (no edit/cancel/reschedule actions)

### 4. Blocked Dates Panel

**Purpose:** Mark days the shop is closed (holidays, vacation, personal days).

**Features:**
- Add a blocked date with optional reason note
- View list of upcoming blocked dates
- Remove/re-open a blocked date
- Blocked dates sync to Google Calendar

**Default blocked dates:**
- Sundays (automatic, not configurable)
- Any dates manually added by owner

### 5. Service Rules Panel

**Purpose:** Configure which services run on which days and at what times.

**Features:**
- View all service-day combinations
- Toggle active/inactive for any rule
- Set `wholeDayLock` (true = one booking consumes the day)
- Configure time slots per rule (e.g., "07:30", "08:00")
- Add new rules
- Delete rules

**Important:** Changes affect the booking calendar immediately. Existing bookings are not affected by rule changes.

---

## Admin Actions & Their Effects

| Action | Customer Notified? | Owner Notified? | Calendar Updated? |
|--------|-------------------|-----------------|-------------------|
| Cancel booking | Yes (email + SMS) | Yes (email + SMS) | Event deleted |
| Reschedule booking | Yes (email + SMS) | Yes (email + SMS) | Event moved |
| Edit customer info | No | No | No |
| Block a date | No | No | All-day event created |
| Change service rules | No | No | No (affects future bookings only) |

---

## Edit Booking Form

When clicking "Edit" on a booking:

**Editable fields:**
- Customer Name
- Email
- Phone
- Vehicle (Year/Make/Model)
- Notes

**Read-only fields:**
- Service (cannot change service type)
- Date/Time (use Reschedule instead)
- Booking ID

**Save behavior:**
- Updates the database immediately
- No notifications sent (minor info changes only)
- Google Calendar event is patched with new details

---

## Reschedule Flow

1. Admin clicks "Reschedule" on a booking
2. System opens a date/time picker
3. Admin picks new date and time
4. System validates:
   - Date is not blocked
   - Date is not Sunday
   - Slot is available (no whole-day lock conflict)
5. Admin clicks "Confirm new time"
6. System updates the booking
7. Customer receives reschedule email + SMS
8. Owner receives reschedule notification
9. Google Calendar event is moved

---

## Technical Details

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/bookings` | GET | List all bookings |
| `/api/admin/bookings/:id` | PATCH | Edit customer details |
| `/api/admin/bookings/:id` | DELETE | Cancel a booking |
| `/api/admin/bookings/:id/reschedule` | POST | Reschedule a booking |
| `/api/admin/blocked-dates` | GET/POST/DELETE | Manage blocked dates |
| `/api/admin/service-rules` | GET/POST/PATCH/DELETE | Manage service rules |

### Authentication

Every admin request must include:
```
Header: x-admin-token: <ADMIN_TOKEN>
```

Token is validated server-side against the `ADMIN_TOKEN` environment variable.
