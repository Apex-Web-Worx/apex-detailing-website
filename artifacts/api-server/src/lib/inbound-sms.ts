// Inbound Twilio SMS: forward customer replies to the owner phone and
// attach them to the matching booking when we can resolve the number.

import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  bookingsTable,
  communicationsTable,
  appointmentEventsTable,
} from "@workspace/db";
import { normalizeUsPhone, sendSmsWithResult } from "./sms";

const OWNER_SMS_TO = process.env["OWNER_SMS_PHONE"] ?? "+14175276165";

function last10Digits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.slice(-10);
}

function ownerDigits(): string | null {
  return last10Digits(OWNER_SMS_TO);
}

/** Prefer an active job; otherwise the most recent booking for that phone. */
async function findBookingForPhone(fromE164: string) {
  const digits = last10Digits(fromE164);
  if (!digits) return null;

  const rows = await db
    .select()
    .from(bookingsTable)
    .where(
      sql`right(regexp_replace(${bookingsTable.phone}, '\\D', '', 'g'), 10) = ${digits}`,
    )
    .orderBy(desc(bookingsTable.scheduledAt))
    .limit(25);

  if (rows.length === 0) return null;

  const active = new Set(["confirmed", "in_progress", "ready_for_pickup"]);
  return rows.find((r) => active.has(r.status)) ?? rows[0] ?? null;
}

export type InboundSmsPayload = {
  from: string;
  to: string;
  body: string;
  messageSid?: string;
};

/**
 * Handle a customer reply to the Twilio business number.
 * Always best-effort: never throws to the webhook caller.
 */
export async function handleInboundSms(payload: InboundSmsPayload): Promise<{
  forwarded: boolean;
  bookingId: number | null;
  skipped?: string;
}> {
  const from = normalizeUsPhone(payload.from);
  if (!from) {
    console.warn("[inbound-sms] invalid From — skipped");
    return { forwarded: false, bookingId: null, skipped: "invalid_from" };
  }

  const fromDigits = last10Digits(from);
  if (fromDigits && fromDigits === ownerDigits()) {
    // Owner texted the Twilio number (e.g. replied to a forward). Do not
    // echo that back as a "customer" message — avoids SMS loops.
    console.info("[inbound-sms] from owner phone — skipped");
    return { forwarded: false, bookingId: null, skipped: "from_owner" };
  }

  const body = (payload.body ?? "").trim();
  if (!body) {
    return { forwarded: false, bookingId: null, skipped: "empty_body" };
  }

  if (payload.messageSid) {
    const [existing] = await db
      .select({ id: communicationsTable.id })
      .from(communicationsTable)
      .where(eq(communicationsTable.providerMessageId, payload.messageSid))
      .limit(1);
    if (existing) {
      return { forwarded: false, bookingId: null, skipped: "duplicate" };
    }
  }

  const booking = await findBookingForPhone(from);
  const now = new Date();

  if (booking) {
    await db.insert(communicationsTable).values({
      bookingId: booking.id,
      customerEmail: booking.email.trim().toLowerCase(),
      messageType: "customer_reply",
      channel: "sms",
      direction: "inbound",
      body,
      status: "received",
      providerMessageId: payload.messageSid ?? null,
      sentAt: now,
      deliveredAt: now,
    });
    await db.insert(appointmentEventsTable).values({
      bookingId: booking.id,
      actor: "customer",
      action: "sms_inbound",
      channel: "sms",
      status: "received",
      detail: `Customer SMS: ${body}`,
      occurredAt: now,
    });
  }

  const who = booking
    ? `${booking.customerName} (booking #${booking.id})`
    : "unknown customer";
  const vehicle = booking ? ` · ${booking.vehicle}` : "";
  const forwardBody =
    `Apex SMS reply from ${who}${vehicle}\n` +
    `${from}:\n` +
    `${body}\n\n` +
    `To answer them, text or call ${from} (replying here stays on the Twilio line).`;

  const forward = await sendSmsWithResult({
    to: OWNER_SMS_TO,
    body: forwardBody.slice(0, 1500),
    context: booking
      ? `inbound-forward #${booking.id}`
      : `inbound-forward unmatched ${from}`,
  });
  if (!forward.ok) {
    return {
      forwarded: false,
      bookingId: booking?.id ?? null,
      skipped: "forward_failed",
    };
  }
  return { forwarded: true, bookingId: booking?.id ?? null };
}

export async function listRecentInboundSms(limit = 40) {
  const rows = await db
    .select({
      id: communicationsTable.id,
      bookingId: communicationsTable.bookingId,
      body: communicationsTable.body,
      status: communicationsTable.status,
      createdAt: communicationsTable.createdAt,
      customerName: bookingsTable.customerName,
      phone: bookingsTable.phone,
      vehicle: bookingsTable.vehicle,
      serviceName: bookingsTable.serviceName,
    })
    .from(communicationsTable)
    .innerJoin(bookingsTable, eq(communicationsTable.bookingId, bookingsTable.id))
    .where(
      and(
        eq(communicationsTable.messageType, "customer_reply"),
        eq(communicationsTable.direction, "inbound"),
      ),
    )
    .orderBy(desc(communicationsTable.createdAt))
    .limit(limit);
  return rows;
}
