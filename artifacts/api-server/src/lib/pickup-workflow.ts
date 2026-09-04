import {
  db,
  bookingsTable,
  communicationsTable,
  appointmentEventsTable,
  notificationTemplatesTable,
  shopSettingsTable,
} from "@workspace/db";
import { and, asc, desc, eq, inArray, lte, gte, lt } from "drizzle-orm";
import {
  formatDateLong,
  formatTime12h,
  sendCustomerNotice,
  SHOP_PHONE,
  FROM_NAME,
} from "./email";
import { sendSmsWithResult } from "./sms";
import { bookingAllowsCustomerSms, isHoldBookingEmail } from "./customer-sms";
import {
  shopLocalDateString,
  shopLocalTimeString,
} from "./availability";
import {
  customerFirstName,
  interpolateTemplate,
  DEFAULT_VEHICLE_READY_SMS,
  DEFAULT_VEHICLE_READY_EMAIL,
  DEFAULT_REVIEW_SMS,
  DEFAULT_REVIEW_EMAIL,
  DEFAULT_REVIEW_LINK,
  type TemplateVars,
} from "./message-templates";

const STOP = "Reply STOP to opt out.";

function withStopLine(body: string): string {
  const trimmed = body.trim().slice(0, 1600);
  if (!trimmed) return STOP;
  if (/reply stop/i.test(trimmed)) return trimmed;
  return `${trimmed}\n\n${STOP}`.slice(0, 1600);
}

type BookingRow = typeof bookingsTable.$inferSelect;

export async function seedNotificationDefaults(): Promise<void> {
  await db
    .insert(shopSettingsTable)
    .values({ id: 1, businessName: FROM_NAME, businessPhone: SHOP_PHONE, reviewLink: DEFAULT_REVIEW_LINK })
    .onConflictDoNothing();

  await db
    .update(shopSettingsTable)
    .set({ reviewLink: DEFAULT_REVIEW_LINK })
    .where(and(eq(shopSettingsTable.id, 1), eq(shopSettingsTable.reviewLink, "")));

  await db
    .insert(notificationTemplatesTable)
    .values([
      {
        key: "vehicle_ready",
        name: "Vehicle Ready",
        smsBody: DEFAULT_VEHICLE_READY_SMS,
        emailSubject: "Your vehicle is ready for pickup",
        emailBody: DEFAULT_VEHICLE_READY_EMAIL,
      },
      {
        key: "review_request",
        name: "Review Request",
        smsBody: DEFAULT_REVIEW_SMS,
        emailSubject: "How was your Apex Detailing service?",
        emailBody: DEFAULT_REVIEW_EMAIL,
      },
    ])
    .onConflictDoNothing();
}

export async function getShopSettings() {
  const [row] = await db.select().from(shopSettingsTable).where(eq(shopSettingsTable.id, 1));
  if (row) return row;
  await seedNotificationDefaults();
  const [created] = await db.select().from(shopSettingsTable).where(eq(shopSettingsTable.id, 1));
  return created!;
}

export async function getTemplates() {
  await seedNotificationDefaults();
  return db.select().from(notificationTemplatesTable);
}

function templateByKey(
  rows: Array<typeof notificationTemplatesTable.$inferSelect>,
  key: string,
) {
  return rows.find((r) => r.key === key);
}

export function bookingTemplateVars(
  booking: BookingRow,
  pickupAt: Date | null,
  settings: { businessName: string; businessPhone: string; reviewLink: string },
): TemplateVars {
  const pickup = pickupAt ?? booking.pickupAt;
  const date = pickup ? shopLocalDateString(pickup) : shopLocalDateString(booking.scheduledAt);
  const time = pickup ? shopLocalTimeString(pickup) : shopLocalTimeString(booking.scheduledAt);
  return {
    customer_first_name: customerFirstName(booking.customerName),
    vehicle: booking.vehicle,
    vehicle_year: "",
    vehicle_make: "",
    vehicle_model: "",
    service_name: booking.serviceName,
    pickup_date: formatDateLong(date),
    pickup_time: formatTime12h(time),
    business_name: settings.businessName || FROM_NAME,
    business_phone: settings.businessPhone || SHOP_PHONE,
    review_link: settings.reviewLink.trim(),
  };
}

export function renderVehicleReadyPreview(args: {
  booking: BookingRow;
  pickupAt: Date;
  settings: { businessName: string; businessPhone: string; reviewLink: string };
  smsBody: string;
  emailSubject: string;
  emailBody: string;
}) {
  const vars = bookingTemplateVars(args.booking, args.pickupAt, args.settings);
  const sms = `${interpolateTemplate(args.smsBody, vars)}\n\n${STOP}`;
  return {
    sms,
    emailSubject: interpolateTemplate(args.emailSubject, vars),
    emailBody: interpolateTemplate(args.emailBody, vars),
    vars,
  };
}

async function logEvent(args: {
  bookingId: number;
  actor: string;
  action: string;
  channel?: string | null;
  status?: string | null;
  detail?: string;
  occurredAt?: Date;
}) {
  await db.insert(appointmentEventsTable).values({
    bookingId: args.bookingId,
    actor: args.actor,
    action: args.action,
    channel: args.channel ?? null,
    status: args.status ?? null,
    detail: args.detail ?? "",
    occurredAt: args.occurredAt ?? new Date(),
  });
}

async function sendChannel(args: {
  booking: BookingRow;
  messageType: "vehicle_ready" | "review_request";
  channel: "sms" | "email";
  body: string;
  emailSubject?: string;
  scheduled?: boolean;
  scheduledAt?: Date | null;
}) {
  const now = new Date();
  const [row] = await db
    .insert(communicationsTable)
    .values({
      bookingId: args.booking.id,
      customerEmail: args.booking.email.trim().toLowerCase(),
      messageType: args.messageType,
      channel: args.channel,
      direction: "outbound",
      body: args.body,
      status: args.scheduled ? "scheduled" : "pending",
      scheduledAt: args.scheduledAt ?? null,
    })
    .returning();
  if (!row) return null;
  if (args.scheduled) return row;

  if (args.channel === "sms") {
    const result = await sendSmsWithResult({
      to: args.booking.phone,
      body: args.body,
      context: `${args.messageType}-sms #${args.booking.id}`,
    });
    const status = result.ok ? "sent" : "failed";
    const [updated] = await db
      .update(communicationsTable)
      .set({
        status,
        providerMessageId: result.sid ?? null,
        error: result.ok ? null : result.error ?? "SMS send failed",
        sentAt: result.ok ? now : null,
        updatedAt: now,
      })
      .where(eq(communicationsTable.id, row.id))
      .returning();
    await logEvent({
      bookingId: args.booking.id,
      actor: "system",
      action: args.messageType === "vehicle_ready" ? "pickup_notification" : "review_request",
      channel: "sms",
      status,
      detail: result.ok ? "SMS sent" : result.error ?? "SMS failed",
    });
    return updated ?? row;
  }

  const result = await sendCustomerNotice({
    to: args.booking.email,
    subject: args.emailSubject || "Apex Detailing",
    text: args.body,
  });
  const status = result.ok ? "sent" : "failed";
  const [updated] = await db
    .update(communicationsTable)
    .set({
      status,
      providerMessageId: result.id ?? null,
      error: result.ok ? null : result.error ?? "Email send failed",
      sentAt: result.ok ? now : null,
      updatedAt: now,
    })
    .where(eq(communicationsTable.id, row.id))
    .returning();
  await logEvent({
    bookingId: args.booking.id,
    actor: "system",
    action: args.messageType === "vehicle_ready" ? "pickup_notification" : "review_request",
    channel: "email",
    status,
    detail: result.ok ? "Email sent" : result.error ?? "Email failed",
  });
  return updated ?? row;
}

export async function listBookingTimeline(bookingId: number) {
  return db
    .select()
    .from(appointmentEventsTable)
    .where(eq(appointmentEventsTable.bookingId, bookingId))
    .orderBy(asc(appointmentEventsTable.occurredAt), asc(appointmentEventsTable.id));
}

export async function listBookingCommunications(bookingId: number) {
  return db
    .select()
    .from(communicationsTable)
    .where(eq(communicationsTable.bookingId, bookingId))
    .orderBy(desc(communicationsTable.createdAt));
}

export async function listCustomerCommunications(email: string) {
  return db
    .select()
    .from(communicationsTable)
    .where(eq(communicationsTable.customerEmail, email.trim().toLowerCase()))
    .orderBy(desc(communicationsTable.createdAt));
}

export type ReviewQueueStatus = "none" | "scheduled" | "sent" | "failed" | "skipped";

function summarizeReviewStatus(rows: Array<{ status: string }>): ReviewQueueStatus {
  if (rows.some((row) => row.status === "skipped")) return "skipped";
  if (rows.some((row) => ["sent", "delivered", "pending"].includes(row.status))) return "sent";
  if (rows.some((row) => row.status === "failed")) return "failed";
  return "none";
}

export async function listReviewQueue() {
  await sendDueReviewRequests();
  const settings = await getShopSettings();
  const jobs = await db
    .select()
    .from(bookingsTable)
    .where(inArray(bookingsTable.status, ["in_progress", "ready_for_pickup", "completed"]));
  const comms = await db
    .select()
    .from(communicationsTable)
    .where(eq(communicationsTable.messageType, "review_request"))
    .orderBy(desc(communicationsTable.createdAt));

  const byBooking = new Map<number, typeof comms>();
  for (const row of comms) {
    const list = byBooking.get(row.bookingId) ?? [];
    list.push(row);
    byBooking.set(row.bookingId, list);
  }

  const jobIds = new Set(jobs.map((job) => job.id));
  const extraIds = [...byBooking.keys()].filter((id) => !jobIds.has(id));
  const extra =
    extraIds.length > 0
      ? await db.select().from(bookingsTable).where(inArray(bookingsTable.id, extraIds))
      : [];
  const allJobs = [...jobs, ...extra.filter((job) => job.status !== "cancelled")];

  const items = allJobs.map((booking) => {
    const rows = byBooking.get(booking.id) ?? [];
    const reviewStatus = summarizeReviewStatus(rows);
    const featured =
      rows.find((row) => row.status === "skipped") ??
      rows.find((row) => ["sent", "delivered", "pending"].includes(row.status)) ??
      rows.find((row) => row.status === "failed") ??
      rows.find((row) => row.status === "scheduled") ??
      rows[0] ??
      null;
    return {
      bookingId: booking.id,
      customerName: booking.customerName,
      phone: booking.phone,
      email: booking.email,
      vehicle: booking.vehicle,
      serviceName: booking.serviceName,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      readyAt: booking.readyAt,
      completedAt: booking.completedAt,
      reviewStatus,
      reviewChannel: featured?.channel ?? null,
      reviewScheduledAt: featured?.scheduledAt ?? null,
      reviewSentAt: featured?.sentAt ?? null,
      reviewError: featured?.error ?? null,
    };
  });

  items.sort((a, b) => {
    const rank = (status: ReviewQueueStatus) =>
      ({ failed: 0, none: 1, scheduled: 2, skipped: 3, sent: 4 })[status];
    const diff = rank(a.reviewStatus) - rank(b.reviewStatus);
    if (diff !== 0) return diff;
    const aAt = (a.readyAt ?? a.scheduledAt).getTime();
    const bAt = (b.readyAt ?? b.scheduledAt).getTime();
    return bAt - aAt;
  });

  return { reviewLink: settings.reviewLink, items };
}

export async function markInProgress(bookingId: number) {
  const now = new Date();
  const [updated] = await db
    .update(bookingsTable)
    .set({ status: "in_progress", inProgressAt: now })
    .where(
      and(eq(bookingsTable.id, bookingId), eq(bookingsTable.status, "confirmed")),
    )
    .returning();
  if (!updated) {
    const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
    return existing ?? null;
  }
  await logEvent({
    bookingId,
    actor: "admin",
    action: "status_in_progress",
    status: "in_progress",
    detail: "Job started — detailing timer running",
    occurredAt: now,
  });
  return updated;
}

/** Auto-start only if scheduled time is within this window (not ancient jobs). */
const AUTO_START_WINDOW_MS = 2 * 60 * 60 * 1000;

/**
 * Undo mass auto-starts of old confirmed bookings (timers showing hundreds
 * of hours). Auto-start sets inProgressAt === scheduledAt; manual Start uses
 * wall-clock time, so we only revert the auto-start fingerprint when the
 * scheduled time is outside the live window.
 */
export async function revertStaleAutoStarts(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - AUTO_START_WINDOW_MS);
  const candidates = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.status, "in_progress"),
        lt(bookingsTable.scheduledAt, cutoff),
      ),
    );

  let reverted = 0;
  for (const booking of candidates) {
    const startedAt = booking.inProgressAt?.getTime();
    const scheduledAt = booking.scheduledAt.getTime();
    if (startedAt == null || Math.abs(startedAt - scheduledAt) > 1000) continue;

    const [updated] = await db
      .update(bookingsTable)
      .set({ status: "confirmed", inProgressAt: null })
      .where(
        and(
          eq(bookingsTable.id, booking.id),
          eq(bookingsTable.status, "in_progress"),
        ),
      )
      .returning();
    if (!updated) continue;

    await logEvent({
      bookingId: booking.id,
      actor: "system",
      action: "timer_stopped",
      status: "confirmed",
      detail: "Reverted stale auto-start (scheduled time too old)",
      occurredAt: now,
    });
    reverted += 1;
  }
  return reverted;
}

/**
 * Auto-start confirmed jobs whose scheduled time has arrived — but only
 * within a short window, so deploy/cron never mass-starts months-old rows.
 * Skips jobs the admin already stopped via Stop timer.
 */
export async function autoStartDueJobs(now = new Date()): Promise<number> {
  const windowStart = new Date(now.getTime() - AUTO_START_WINDOW_MS);
  const due = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.status, "confirmed"),
        lte(bookingsTable.scheduledAt, now),
        gte(bookingsTable.scheduledAt, windowStart),
      ),
    );

  let started = 0;
  for (const booking of due) {
    const [stopped] = await db
      .select({ id: appointmentEventsTable.id })
      .from(appointmentEventsTable)
      .where(
        and(
          eq(appointmentEventsTable.bookingId, booking.id),
          eq(appointmentEventsTable.action, "timer_stopped"),
        ),
      )
      .limit(1);
    if (stopped) continue;

    const startedAt = booking.scheduledAt;
    const [updated] = await db
      .update(bookingsTable)
      .set({ status: "in_progress", inProgressAt: startedAt })
      .where(
        and(eq(bookingsTable.id, booking.id), eq(bookingsTable.status, "confirmed")),
      )
      .returning();
    if (!updated) continue;
    await logEvent({
      bookingId: booking.id,
      actor: "system",
      action: "status_in_progress",
      status: "in_progress",
      detail: "Auto-started at scheduled time — detailing timer running",
      occurredAt: startedAt,
    });
    started += 1;
  }
  return started;
}

/** Stop the live detailing timer and return the job to confirmed. */
export async function stopDetailingTimer(bookingId: number) {
  const now = new Date();
  const [updated] = await db
    .update(bookingsTable)
    .set({ status: "confirmed", inProgressAt: null })
    .where(
      and(eq(bookingsTable.id, bookingId), eq(bookingsTable.status, "in_progress")),
    )
    .returning();
  if (!updated) return null;
  await logEvent({
    bookingId,
    actor: "admin",
    action: "timer_stopped",
    status: "confirmed",
    detail: "Detailing timer stopped — job returned to confirmed",
    occurredAt: now,
  });
  return updated;
}

export async function markCompleted(bookingId: number) {
  const now = new Date();
  const [updated] = await db
    .update(bookingsTable)
    .set({ status: "completed", completedAt: now })
    .where(
      and(
        eq(bookingsTable.id, bookingId),
        inArray(bookingsTable.status, ["ready_for_pickup", "in_progress"]),
      ),
    )
    .returning();
  if (!updated) {
    const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
    return existing ?? null;
  }
  await logEvent({
    bookingId,
    actor: "admin",
    action: "customer_picked_up",
    status: "completed",
    detail: "Customer picked up — marked COMPLETED",
    occurredAt: now,
  });
  return updated;
}

export async function cancelScheduledReviews(bookingId: number, reason: string) {
  const now = new Date();
  const updated = await db
    .update(communicationsTable)
    .set({ status: "cancelled", error: reason, updatedAt: now })
    .where(
      and(
        eq(communicationsTable.bookingId, bookingId),
        eq(communicationsTable.messageType, "review_request"),
        eq(communicationsTable.status, "scheduled"),
      ),
    )
    .returning();
  if (updated.length > 0) {
    await logEvent({
      bookingId,
      actor: "system",
      action: "review_request",
      status: "cancelled",
      detail: reason,
    });
  }
  return updated;
}

export async function markReadyAndNotify(args: {
  bookingId: number;
  pickupAt: Date;
  sendSms: boolean;
  sendEmail: boolean;
  resend: boolean;
  smsBody?: string | null;
  emailSubject?: string | null;
  emailBody?: string | null;
}) {
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, args.bookingId));
  if (!booking) return { error: "not_found" as const };

  if (booking.status === "cancelled") {
    return { error: "cancelled" as const, booking };
  }

  const alreadyReady =
    booking.status === "ready_for_pickup" || booking.status === "completed";

  if (alreadyReady && !args.resend) {
    const communications = await listBookingCommunications(booking.id);
    const events = await listBookingTimeline(booking.id);
    return { booking, communications, events, alreadyReady: true as const };
  }

  const now = new Date();
  let current = booking;
  if (!alreadyReady) {
    const startedAt = booking.inProgressAt ?? now;
    const durationMinutes = Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 60000));
    const [updated] = await db
      .update(bookingsTable)
      .set({
        status: "ready_for_pickup",
        pickupAt: args.pickupAt,
        readyAt: now,
        inProgressAt: booking.inProgressAt ?? now,
        detailDurationMinutes: durationMinutes,
      })
      .where(
        and(
          eq(bookingsTable.id, booking.id),
          inArray(bookingsTable.status, ["confirmed", "in_progress"]),
        ),
      )
      .returning();
    if (!updated) {
      const [again] = await db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.id, booking.id));
      if (again && (again.status === "ready_for_pickup" || again.status === "completed") && !args.resend) {
        const communications = await listBookingCommunications(again.id);
        const events = await listBookingTimeline(again.id);
        return { booking: again, communications, events, alreadyReady: true as const };
      }
      return { error: "conflict" as const, booking: again ?? booking };
    }
    current = updated;
    const hours = Math.floor((current.detailDurationMinutes ?? durationMinutes) / 60);
    const mins = (current.detailDurationMinutes ?? durationMinutes) % 60;
    const durationLabel =
      hours > 0 ? `${hours} hr${hours === 1 ? "" : "s"} ${mins} min` : `${mins} min`;
    await logEvent({
      bookingId: current.id,
      actor: "admin",
      action: "status_ready_for_pickup",
      status: "ready_for_pickup",
      detail: `Vehicle marked READY FOR PICKUP · detailed ${durationLabel}`,
      occurredAt: now,
    });
  } else if (args.resend) {
    await db
      .update(bookingsTable)
      .set({ pickupAt: args.pickupAt })
      .where(eq(bookingsTable.id, booking.id));
    current = { ...booking, pickupAt: args.pickupAt };
  }

  const settings = await getShopSettings();
  const templates = await getTemplates();
  const readyTpl = templateByKey(templates, "vehicle_ready");
  const preview = renderVehicleReadyPreview({
    booking: current,
    pickupAt: args.pickupAt,
    settings,
    smsBody: readyTpl?.smsBody ?? DEFAULT_VEHICLE_READY_SMS,
    emailSubject: readyTpl?.emailSubject ?? "Your vehicle is ready for pickup",
    emailBody: readyTpl?.emailBody ?? DEFAULT_VEHICLE_READY_EMAIL,
  });

  const wantSms = args.sendSms && bookingAllowsCustomerSms(current);
  const wantEmail = args.sendEmail;
  const smsOut = args.smsBody?.trim() ? withStopLine(args.smsBody) : preview.sms;
  const emailSubjectOut = args.emailSubject?.trim() || preview.emailSubject;
  const emailBodyOut = args.emailBody?.trim() || preview.emailBody;

  if (wantSms) {
    await sendChannel({
      booking: current,
      messageType: "vehicle_ready",
      channel: "sms",
      body: smsOut,
    });
  }
  if (wantEmail) {
    await sendChannel({
      booking: current,
      messageType: "vehicle_ready",
      channel: "email",
      body: emailBodyOut,
      emailSubject: emailSubjectOut,
    });
  }

  const communications = await listBookingCommunications(current.id);
  const events = await listBookingTimeline(current.id);
  return { booking: current, communications, events, alreadyReady: false as const };
}

export async function retryReviewRequest(bookingId: number) {
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) return { error: "not_found" as const };
  if (booking.status === "cancelled") return { error: "cancelled" as const };

  const [failed] = await db
    .select()
    .from(communicationsTable)
    .where(
      and(
        eq(communicationsTable.bookingId, bookingId),
        eq(communicationsTable.messageType, "review_request"),
        eq(communicationsTable.status, "failed"),
      ),
    )
    .orderBy(desc(communicationsTable.createdAt))
    .limit(1);
  if (!failed) return { error: "none_failed" as const, booking };

  const settings = await getShopSettings();
  const templates = await getTemplates();
  const tpl = templateByKey(templates, "review_request");
  const vars = bookingTemplateVars(booking, booking.pickupAt, settings);
  const smsBody = `${interpolateTemplate(tpl?.smsBody ?? DEFAULT_REVIEW_SMS, vars)}\n\n${STOP}`;
  const emailBody = interpolateTemplate(tpl?.emailBody ?? DEFAULT_REVIEW_EMAIL, vars);
  const emailSubject = interpolateTemplate(
    tpl?.emailSubject ?? "How was your Apex Detailing service?",
    vars,
  );

  if (failed.channel === "sms") {
    if (!bookingAllowsCustomerSms(booking)) return { error: "sms_opt_out" as const, booking };
    await sendChannel({ booking, messageType: "review_request", channel: "sms", body: smsBody });
  } else {
    await sendChannel({
      booking,
      messageType: "review_request",
      channel: "email",
      body: emailBody,
      emailSubject,
    });
  }
  const communications = await listBookingCommunications(bookingId);
  return { booking, communications };
}

export async function sendDueReviewRequests(): Promise<number> {
  const now = new Date();
  const cancelled = await db
    .update(communicationsTable)
    .set({
      status: "cancelled",
      error: "Automatic review send is off — send from admin",
      updatedAt: now,
    })
    .where(
      and(
        eq(communicationsTable.messageType, "review_request"),
        eq(communicationsTable.status, "scheduled"),
      ),
    )
    .returning({ id: communicationsTable.id });
  return cancelled.length;
}


const REVIEW_DONE = ["sent", "delivered", "pending"] as const;

async function hasReviewInStatuses(bookingId: number, statuses: readonly string[]) {
  const rows = await db
    .select({ id: communicationsTable.id, status: communicationsTable.status })
    .from(communicationsTable)
    .where(
      and(
        eq(communicationsTable.bookingId, bookingId),
        eq(communicationsTable.messageType, "review_request"),
        inArray(communicationsTable.status, [...statuses]),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function sendReviewRequestNow(bookingId: number) {
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) return { error: "not_found" as const };
  if (booking.status === "cancelled") return { error: "cancelled" as const };

  const skipped = await hasReviewInStatuses(bookingId, ["skipped"]);
  if (skipped) {
    const communications = await listBookingCommunications(bookingId);
    return { error: "skipped" as const, booking, communications };
  }

  const already = await hasReviewInStatuses(bookingId, REVIEW_DONE);
  if (already) {
    const communications = await listBookingCommunications(bookingId);
    return { booking, communications, alreadySent: true as const };
  }

  await cancelScheduledReviews(bookingId, "Sent immediately from admin");

  const settings = await getShopSettings();
  const templates = await getTemplates();
  const tpl = templateByKey(templates, "review_request");
  const vars = bookingTemplateVars(booking, booking.pickupAt, settings);
  const smsBody = `${interpolateTemplate(tpl?.smsBody ?? DEFAULT_REVIEW_SMS, vars)}\n\n${STOP}`;
  const emailBody = interpolateTemplate(tpl?.emailBody ?? DEFAULT_REVIEW_EMAIL, vars);
  const emailSubject = interpolateTemplate(
    tpl?.emailSubject ?? "How was your Apex Detailing service?",
    vars,
  );

  const wantSms = bookingAllowsCustomerSms(booking);
  const wantEmail = !isHoldBookingEmail(booking.email);
  if (!wantSms && !wantEmail) return { error: "no_channel" as const, booking };

  if (wantSms) {
    await sendChannel({ booking, messageType: "review_request", channel: "sms", body: smsBody });
  }
  if (wantEmail) {
    await sendChannel({
      booking,
      messageType: "review_request",
      channel: "email",
      body: emailBody,
      emailSubject,
    });
  }

  const communications = await listBookingCommunications(bookingId);
  return { booking, communications, alreadySent: false as const };
}

export async function skipReviewRequest(bookingId: number) {
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) return { error: "not_found" as const };
  if (booking.status === "cancelled") return { error: "cancelled" as const };

  const alreadySent = await hasReviewInStatuses(bookingId, REVIEW_DONE);
  if (alreadySent) {
    const communications = await listBookingCommunications(bookingId);
    return { error: "already_sent" as const, booking, communications };
  }

  const alreadySkipped = await hasReviewInStatuses(bookingId, ["skipped"]);
  if (alreadySkipped) {
    const communications = await listBookingCommunications(bookingId);
    return { booking, communications, alreadySkipped: true as const };
  }

  await cancelScheduledReviews(bookingId, "Review skipped for this client");

  const now = new Date();
  await db.insert(communicationsTable).values({
    bookingId,
    customerEmail: booking.email.trim().toLowerCase(),
    messageType: "review_request",
    channel: "internal",
    direction: "outbound",
    body: "Review request skipped for this client",
    status: "skipped",
    scheduledAt: now,
    error: "skipped_by_admin",
  });

  await logEvent({
    bookingId,
    actor: "admin",
    action: "review_skipped",
    status: "skipped",
    detail: "Review will not be sent to this client",
  });

  const communications = await listBookingCommunications(bookingId);
  return { booking, communications, alreadySkipped: false as const };
}

export async function unskipReviewRequest(bookingId: number) {
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) return { error: "not_found" as const };

  const skipped = await db
    .select()
    .from(communicationsTable)
    .where(
      and(
        eq(communicationsTable.bookingId, bookingId),
        eq(communicationsTable.messageType, "review_request"),
        eq(communicationsTable.status, "skipped"),
      ),
    );
  if (skipped.length === 0) {
    const communications = await listBookingCommunications(bookingId);
    return { booking, communications, alreadyUnskipped: true as const };
  }

  await db
    .delete(communicationsTable)
    .where(
      and(
        eq(communicationsTable.bookingId, bookingId),
        eq(communicationsTable.messageType, "review_request"),
        eq(communicationsTable.status, "skipped"),
      ),
    );

  await logEvent({
    bookingId,
    actor: "admin",
    action: "review_unskipped",
    status: "none",
    detail: "Review request re-enabled for this client — send manually from admin",
  });

  const communications = await listBookingCommunications(bookingId);
  return { booking, communications, alreadyUnskipped: false as const };
}

export async function ensureForgottenReviewRequests(): Promise<number> {
  return 0;
}
