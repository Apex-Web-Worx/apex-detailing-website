/**
 * Google Calendar integration for the booking system.
 *
 * Public API: a single function `syncBookingCalendar(bookingId)`. Callers
 * fire it AFTER the DB write that changed the booking's state — they don't
 * pass any state in. The sync function then:
 *
 *   1. Serializes per-booking via an in-memory queue (one sync at a time
 *      for any given booking id).
 *   2. Loads the current row from the DB.
 *   3. Reconciles the calendar to match the row:
 *        confirmed + no event id  -> create + store id
 *        confirmed + event id     -> patch (recreate if vanished)
 *        cancelled + event id     -> delete + clear id
 *        cancelled + no event id  -> defense-in-depth orphan sweep by tag
 *
 * Why this design:
 *   - Two near-simultaneous events on the same booking (e.g. customer books
 *     then immediately reschedules; or owner deletes a booking right as the
 *     create event call is in flight) used to race. The first design did
 *     `create / update / delete` blindly based on a snapshot passed in by
 *     the caller, so a stale snapshot could create a duplicate or leak an
 *     orphan event. State-based reconciliation against fresh DB state plus
 *     per-booking serialization eliminates both classes of bug.
 *   - All work is fire-and-forget (returned promise unawaited at call
 *     sites). A calendar outage logs and never blocks the user response.
 *
 * Single-process assumption: the in-memory queue is correct for one Node
 * instance, which is what the deployment uses. If we ever horizontally
 * scale, swap the queue for a row-level lock or a dedicated worker.
 */
import { ReplitConnectors } from "@replit/connectors-sdk";
import { db, bookingsTable } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { getSiteUrl } from "./site-url";

const connectors = new ReplitConnectors();

const CALENDAR_ID = "primary";
const SHOP_TZ = "America/Chicago";
const BOOKING_ID_TAG = "apexBookingId";

/**
 * Email addresses that should also see every booking on their own Google
 * Calendar (e.g. the owner's spouse). The owner's primary calendar is
 * shared with these addresses as a one-time, idempotent ACL rule on first
 * sync — once shared, every event automatically appears under the
 * recipient's "Other calendars" list.
 *
 * Opt-in only: must be set explicitly via the `OWNER_CALENDAR_VIEWER_EMAILS`
 * env var (comma-separated). When unset, no sharing is performed. Booking
 * events contain customer PII so we deliberately do not bake any address
 * into source.
 */
const VIEWER_EMAILS = (process.env["OWNER_CALENDAR_VIEWER_EMAILS"] ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Per-booking serialization                                           */
/* ------------------------------------------------------------------ */

const inflight = new Map<number, Promise<void>>();

/**
 * Reconcile a single booking's calendar event with current DB state.
 * Safe to call multiple times concurrently — calls for the same booking
 * id are serialized; calls for different ids run in parallel.
 */
export function syncBookingCalendar(bookingId: number): Promise<void> {
  const prev = inflight.get(bookingId) ?? Promise.resolve();
  // .catch swallowing is intentional: one sync's failure shouldn't poison
  // the chain for the next. doSync logs internally.
  const next = prev.catch(() => undefined).then(() => doSync(bookingId));
  inflight.set(bookingId, next);
  // Cleanup so the map doesn't grow unbounded.
  next.finally(() => {
    if (inflight.get(bookingId) === next) inflight.delete(bookingId);
  });
  return next;
}

/* ------------------------------------------------------------------ */
/* Reconciliation logic                                                */
/* ------------------------------------------------------------------ */

type BookingRow = typeof bookingsTable.$inferSelect;

async function doSync(bookingId: number): Promise<void> {
  // First-call-wins: ensure the calendar is shared with the configured
  // viewer emails (e.g. owner's spouse) once per process. Idempotent —
  // Google's POST /acl returns the same rule id when called repeatedly
  // for the same scope+role.
  await ensureCalendarShared();

  let row: BookingRow | undefined;
  try {
    [row] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, bookingId));
  } catch (err) {
    console.error(`[calendar] sync(${bookingId}) DB read failed:`, err);
    return;
  }
  if (!row) return;

  if (row.status === "confirmed") {
    await reconcileConfirmed(row);
  } else {
    await reconcileNonConfirmed(row);
  }
}

/* ------------------------------------------------------------------ */
/* Calendar sharing (one-time per process)                             */
/* ------------------------------------------------------------------ */

// Tracks per-viewer share state so we don't hammer Google ACL on every
// sync but DO retry any address whose previous attempt failed (e.g.
// transient network or quota error). A cached `true` means a prior call
// already returned 2xx (or 409 already-exists) and Google upserts make
// re-trying a no-op anyway. Anything else falls through to retry on the
// next sync.
const aclSharedOk = new Map<string, boolean>();
let aclInflight: Promise<void> | null = null;

function ensureCalendarShared(): Promise<void> {
  // Coalesce concurrent calls in the same tick, but never cache the
  // promise across ticks — otherwise a single failure would freeze the
  // share forever (architect issue #2, prior review).
  if (aclInflight) return aclInflight;
  aclInflight = (async () => {
    try {
      for (const email of VIEWER_EMAILS) {
        if (aclSharedOk.get(email)) continue;
        try {
          const res = await callCalendar(
            `/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/acl`,
            {
              method: "POST",
              body: {
                role: "reader",
                scope: { type: "user", value: email },
              },
            },
          );
          // 200/201 = created, 409 = ACL rule already exists. Both are
          // terminal-success states — mark and move on.
          if (res.ok || res.status === 409) {
            aclSharedOk.set(email, true);
            if (res.ok) {
              console.log(`[calendar] Shared calendar with ${email}`);
            }
          } else {
            const txt = await res.text().catch(() => "");
            console.warn(
              `[calendar] ACL share for ${email}: HTTP ${res.status} ${txt} (will retry on next sync)`,
            );
          }
        } catch (err) {
          console.error(
            `[calendar] ACL share for ${email} threw (will retry on next sync):`,
            err,
          );
        }
      }
    } finally {
      aclInflight = null;
    }
  })();
  return aclInflight;
}

async function reconcileConfirmed(row: BookingRow): Promise<void> {
  if (row.googleEventId) {
    // Try to patch in place. If the event was deleted by hand in Google
    // Calendar, fall through to a fresh create so the calendar self-heals.
    const patched = await patchEvent(row.googleEventId, row);
    if (patched === "ok") return;
    if (patched === "gone") {
      // Clear the dead pointer first (predicate-guarded so we don't trample
      // a concurrent writer that already replaced it).
      await db
        .update(bookingsTable)
        .set({ googleEventId: null })
        .where(
          and(
            eq(bookingsTable.id, row.id),
            eq(bookingsTable.googleEventId, row.googleEventId),
          ),
        );
      // fall through to create
    } else {
      return; // network/other error, already logged; leave id in place
    }
  }

  // No (live) event id. Before creating, look for an existing event tagged
  // with this booking id — defends against a duplicate from a previous
  // failed sync where create succeeded but the DB write didn't.
  const existing = await findEventByBookingId(row.id);
  if (existing) {
    await adoptEventId(row.id, existing.id);
    // Bring the adopted event in line with current state (slot may have
    // changed between when the orphan was created and now).
    await patchEvent(existing.id, row);
    return;
  }

  const created = await createEvent(row);
  if (created) {
    await adoptEventId(row.id, created);
  }
}

async function reconcileNonConfirmed(row: BookingRow): Promise<void> {
  // Cancelled (or any other non-confirmed terminal state). Make sure no
  // event for this booking is left behind on the calendar.
  if (row.googleEventId) {
    const result = await deleteEvent(row.googleEventId);
    if (result === "ok" || result === "gone") {
      await db
        .update(bookingsTable)
        .set({ googleEventId: null })
        .where(
          and(
            eq(bookingsTable.id, row.id),
            eq(bookingsTable.googleEventId, row.googleEventId),
          ),
        );
    }
  }

  // Defense in depth: sweep up any orphan event tagged with this booking
  // id (e.g. a create that finished after we began cancelling). This is
  // also where we clean up a duplicate created by a buggy older version.
  // Loop in case more than one orphan exists.
  for (let i = 0; i < 5; i++) {
    const orphan = await findEventByBookingId(row.id);
    if (!orphan) break;
    const r = await deleteEvent(orphan.id);
    if (r !== "ok" && r !== "gone") break;
  }
}

/**
 * Conditionally store a freshly-created/adopted event id onto the row, but
 * only if no other event id is already there. If another sync raced and won,
 * we delete OUR event so we don't leak a duplicate.
 */
async function adoptEventId(bookingId: number, eventId: string): Promise<void> {
  const updated = await db
    .update(bookingsTable)
    .set({ googleEventId: eventId })
    .where(
      and(eq(bookingsTable.id, bookingId), isNull(bookingsTable.googleEventId)),
    )
    .returning({ id: bookingsTable.id });

  if (updated.length === 0) {
    // Someone else already wrote a different event id. To avoid leaving
    // our event orphaned on the calendar, delete it. The competing sync
    // (or this same sync's next iteration) owns the surviving event.
    await deleteEvent(eventId);
  }
}

/* ------------------------------------------------------------------ */
/* Calendar API helpers                                                */
/* ------------------------------------------------------------------ */

function endTime(start: Date, durationMinutes: number): Date {
  return new Date(start.getTime() + durationMinutes * 60_000);
}

function buildSummary(b: BookingRow): string {
  return `${b.serviceName} — ${b.customerName} (${b.vehicle})`;
}

function buildDescription(b: BookingRow): string {
  const lines = [
    `Customer: ${b.customerName}`,
    `Phone: ${b.phone}`,
    `Email: ${b.email}`,
    `Vehicle: ${b.vehicle}`,
    `Service: ${b.serviceName} (${b.serviceDurationMinutes} min)`,
  ];
  if (b.notes && b.notes.trim().length > 0) {
    lines.push("", `Notes: ${b.notes}`);
  }
  lines.push("", `Manage in admin: ${getSiteUrl()}/admin`);
  return lines.join("\n");
}

function fullEventBody(b: BookingRow) {
  const start = b.scheduledAt;
  const end = endTime(start, b.serviceDurationMinutes);
  return {
    summary: buildSummary(b),
    description: buildDescription(b),
    start: { dateTime: start.toISOString(), timeZone: SHOP_TZ },
    end: { dateTime: end.toISOString(), timeZone: SHOP_TZ },
    source: { title: "Apex Detailing booking", url: `${getSiteUrl()}/admin` },
    extendedProperties: {
      private: { [BOOKING_ID_TAG]: String(b.id) },
    },
  };
}

async function callCalendar(
  path: string,
  init: { method: string; body?: unknown },
): Promise<Response> {
  const headers: Record<string, string> = {};
  let body: string | undefined;
  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }
  return connectors.proxy("google-calendar", path, {
    method: init.method,
    headers,
    body,
  });
}

async function createEvent(b: BookingRow): Promise<string | null> {
  try {
    const res = await callCalendar(
      `/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID,
      )}/events?sendUpdates=none`,
      { method: "POST", body: fullEventBody(b) },
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(
        `[calendar] create failed: HTTP ${res.status} ${res.statusText} ${txt}`,
      );
      return null;
    }
    const json = (await res.json()) as { id?: string };
    return json.id ?? null;
  } catch (err) {
    console.error("[calendar] create threw:", err);
    return null;
  }
}

type WriteResult = "ok" | "gone" | "error";

async function patchEvent(
  eventId: string,
  b: BookingRow,
): Promise<WriteResult> {
  try {
    const res = await callCalendar(
      `/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID,
      )}/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
      { method: "PATCH", body: fullEventBody(b) },
    );
    if (res.ok) return "ok";
    if (res.status === 404 || res.status === 410) return "gone";
    const txt = await res.text().catch(() => "");
    console.error(
      `[calendar] patch failed: HTTP ${res.status} ${res.statusText} ${txt}`,
    );
    return "error";
  } catch (err) {
    console.error("[calendar] patch threw:", err);
    return "error";
  }
}

async function deleteEvent(eventId: string): Promise<WriteResult> {
  try {
    const res = await callCalendar(
      `/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID,
      )}/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
      { method: "DELETE" },
    );
    if (res.ok) return "ok";
    if (res.status === 404 || res.status === 410) return "gone";
    const txt = await res.text().catch(() => "");
    console.error(
      `[calendar] delete failed: HTTP ${res.status} ${res.statusText} ${txt}`,
    );
    return "error";
  } catch (err) {
    console.error("[calendar] delete threw:", err);
    return "error";
  }
}

/* ------------------------------------------------------------------ */
/* Blocked-date all-day events (admin-controlled)                      */
/* ------------------------------------------------------------------ */

/**
 * Add one day to a YYYY-MM-DD string. Google Calendar's all-day event
 * `end.date` is exclusive, so a single-day all-day event needs end =
 * start + 1 day.
 */
function addOneDay(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

type BlockedDateContact = {
  name?: string | null;
  surname?: string | null;
  phone?: string | null;
};

function blockedDateEventBody(
  date: string,
  reason: string,
  contact?: BlockedDateContact,
) {
  const summary = reason.trim().length > 0
    ? `Shop Closed — ${reason.trim()}`
    : "Shop Closed";
  const contactParts: string[] = [];
  const fullName = [contact?.name?.trim(), contact?.surname?.trim()]
    .filter(Boolean)
    .join(" ");
  if (fullName) contactParts.push(`Contact: ${fullName}`);
  if (contact?.phone?.trim()) contactParts.push(`Phone: ${contact.phone.trim()}`);
  const description = [
    "Day blocked in the Apex Detailing admin — no bookings will be accepted.",
    ...contactParts,
  ].join("\n");
  return {
    summary,
    description,
    start: { date },
    end: { date: addOneDay(date) },
    transparency: "opaque",
    source: { title: "Apex Detailing block", url: `${getSiteUrl()}/admin` },
  };
}

/**
 * Create an all-day "Shop Closed" event on the owner's calendar for an
 * admin-blocked date. Returns the new event id, or null if the call
 * failed (logged; never throws to the caller).
 */
export async function createBlockedDateEvent(
  date: string,
  reason: string,
  contact?: BlockedDateContact,
): Promise<string | null> {
  await ensureCalendarShared();
  const body = blockedDateEventBody(date, reason, contact);
  try {
    const res = await callCalendar(
      `/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID,
      )}/events?sendUpdates=none`,
      { method: "POST", body },
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(
        `[calendar] block create failed: HTTP ${res.status} ${res.statusText} ${txt}`,
      );
      return null;
    }
    const json = (await res.json()) as { id?: string };
    return json.id ?? null;
  } catch (err) {
    console.error("[calendar] block create threw:", err);
    return null;
  }
}

/**
 * Patch an existing blocked-date calendar event (date, reason, contact).
 * Returns "gone" when the event vanished so the caller can recreate it.
 * Never throws.
 */
export async function updateBlockedDateEvent(
  eventId: string,
  date: string,
  reason: string,
  contact?: BlockedDateContact,
): Promise<"ok" | "gone" | "error"> {
  try {
    const res = await callCalendar(
      `/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID,
      )}/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
      { method: "PATCH", body: blockedDateEventBody(date, reason, contact) },
    );
    if (res.ok) return "ok";
    if (res.status === 404 || res.status === 410) return "gone";
    const txt = await res.text().catch(() => "");
    console.error(
      `[calendar] block patch failed: HTTP ${res.status} ${res.statusText} ${txt}`,
    );
    return "error";
  } catch (err) {
    console.error("[calendar] block patch threw:", err);
    return "error";
  }
}

/**
 * Delete a previously-created blocked-date event. Treats 404/410 as
 * success (already gone). Logs and swallows any error so admin-route
 * callers never fail because of a calendar outage.
 */
export async function deleteBlockedDateEvent(
  eventId: string,
): Promise<void> {
  const result = await deleteEvent(eventId);
  if (result === "error") {
    // Already logged inside deleteEvent.
  }
}

/**
 * Admin-only visual overlay. Lists events from the owner's Gmail calendar
 * so they can see personal items next to bookings. This is NEVER consulted
 * by availability, booking, or customer-facing flows.
 */
export type VisualCalendarEvent = {
  id: string;
  title: string;
  allDay: boolean;
  /** HH:MM shop-local, empty when all-day */
  startTime: string;
  dates: string[];
  calendar: string;
};

type GoogleEvent = {
  id?: string;
  status?: string;
  summary?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  source?: { title?: string };
  extendedProperties?: { private?: Record<string, string> };
};

const VISUAL_CALENDAR_IDS = [
  ...(process.env["OWNER_VISUAL_CALENDAR_IDS"] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  "mgurovas@gmail.com",
  "michail.gurov@interactio.io",
  CALENDAR_ID,
];

export async function listVisualCalendarEvents(
  startDate: string,
  endDate: string,
): Promise<VisualCalendarEvent[]> {
  const seen = new Set<string>();
  const out: VisualCalendarEvent[] = [];
  for (const calendarId of VISUAL_CALENDAR_IDS) {
    if (seen.has(`cal:${calendarId}`)) continue;
    seen.add(`cal:${calendarId}`);
    const items = await listEventsOnCalendar(calendarId, startDate, endDate);
    for (const item of items) {
      if (!item.id || item.status === "cancelled") continue;
      if (isApexManagedEvent(item)) continue;
      const mapped = toVisualEvent(item, calendarId);
      if (!mapped || seen.has(mapped.id)) continue;
      seen.add(mapped.id);
      out.push(mapped);
    }
  }
  return out;
}

function isApexManagedEvent(event: GoogleEvent): boolean {
  if (event.extendedProperties?.private?.[BOOKING_ID_TAG]) return true;
  const source = event.source?.title ?? "";
  if (source.startsWith("Apex Detailing")) return true;
  const summary = event.summary ?? "";
  return summary.startsWith("Shop Closed");
}

async function listEventsOnCalendar(
  calendarId: string,
  startDate: string,
  endDate: string,
): Promise<GoogleEvent[]> {
  const items: GoogleEvent[] = [];
  let pageToken: string | undefined;
  try {
    do {
      const params = new URLSearchParams({
        timeMin: `${startDate}T00:00:00-06:00`,
        timeMax: `${endDate}T23:59:59-05:00`,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
        showDeleted: "false",
      });
      if (pageToken) params.set("pageToken", pageToken);
      const res = await callCalendar(
        `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
        { method: "GET" },
      );
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error(
          `[calendar] visual list ${calendarId} failed: HTTP ${res.status} ${txt}`,
        );
        return items;
      }
      const json = (await res.json()) as {
        items?: GoogleEvent[];
        nextPageToken?: string;
      };
      items.push(...(json.items ?? []));
      pageToken = json.nextPageToken;
    } while (pageToken);
  } catch (err) {
    console.error(`[calendar] visual list ${calendarId} threw:`, err);
  }
  return items;
}

function calendarLabel(calendarId: string): string {
  const id = calendarId.toLowerCase();
  if (id.includes("interactio")) return "Interactio";
  if (id.includes("gmail")) return "Gmail";
  if (id === "primary") return "Gmail";
  return "Calendar";
}

function toVisualEvent(
  event: GoogleEvent,
  calendarId: string,
): VisualCalendarEvent | null {
  if (!event.id) return null;
  const title = (event.summary ?? "(No title)").trim() || "(No title)";
  const calendar = calendarLabel(calendarId);
  const id = `${calendarId}:${event.id}`;
  if (event.start?.date) {
    const start = event.start.date;
    const endExclusive = event.end?.date ?? addOneDay(start);
    return {
      id,
      title,
      allDay: true,
      startTime: "",
      dates: enumerateDates(start, endExclusive),
      calendar,
    };
  }
  if (!event.start?.dateTime) return null;
  const start = new Date(event.start.dateTime);
  const end = event.end?.dateTime ? new Date(event.end.dateTime) : start;
  const startDate = shopDateFromInstant(start);
  const endDate = shopDateFromInstant(new Date(Math.max(end.getTime() - 1, start.getTime())));
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(start);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return {
    id,
    title,
    allDay: false,
    startTime: `${hour}:${minute}`,
    dates: enumerateDates(startDate, addOneDay(endDate)),
    calendar,
  };
}

function shopDateFromInstant(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function enumerateDates(startInclusive: string, endExclusive: string): string[] {
  const dates: string[] = [];
  let cursor = startInclusive;
  let guard = 0;
  while (cursor < endExclusive && guard < 60) {
    dates.push(cursor);
    cursor = addOneDay(cursor);
    guard += 1;
  }
  return dates.length > 0 ? dates : [startInclusive];
}

/**
 * Look up an event by our booking-id tag. Used to find duplicates /
 * orphans created by a previous failed sync. Excludes events that Google
 * has marked cancelled.
 */
async function findEventByBookingId(
  bookingId: number,
): Promise<{ id: string } | null> {
  try {
    const params = new URLSearchParams({
      [`privateExtendedProperty`]: `${BOOKING_ID_TAG}=${bookingId}`,
      maxResults: "5",
      showDeleted: "false",
      singleEvents: "true",
    });
    const res = await callCalendar(
      `/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID,
      )}/events?${params.toString()}`,
      { method: "GET" },
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(
        `[calendar] list-by-tag failed: HTTP ${res.status} ${res.statusText} ${txt}`,
      );
      return null;
    }
    const json = (await res.json()) as { items?: Array<{ id?: string; status?: string }> };
    const item = (json.items ?? []).find(
      (e) => e.id && e.status !== "cancelled",
    );
    return item?.id ? { id: item.id } : null;
  } catch (err) {
    console.error("[calendar] list-by-tag threw:", err);
    return null;
  }
}
