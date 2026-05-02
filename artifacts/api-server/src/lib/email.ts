import { ReplitConnectors } from "@replit/connectors-sdk";
import { randomBytes } from "node:crypto";

const connectors = new ReplitConnectors();

export const OWNER_EMAIL = "apexdetailingsf@gmail.com";
export const FROM_NAME = "Apex Detailing";
const SHOP_PHONE = "(417) 527-6165";
const SHOP_ADDRESS = "1114 E Lakota St, Nixa, MO 65714";
const SHOP_WEBSITE = "https://www.apexdetailingsf.com";

const SHOP_TZ = "America/Chicago";

function formatDateLong(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: SHOP_TZ,
  }).format(dt);
}

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function encodeMimeWord(s: string): string {
  if (/^[\x20-\x7E]*$/.test(s) && !/[=?]/.test(s)) return s;
  return `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;
}

function toBase64Url(s: string): string {
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Strip CRLF + NUL from header values to defend against header injection
// (defense in depth on top of zod email validation).
function sanitizeHeaderValue(s: string): string {
  return s.replace(/[\r\n\0]+/g, " ").trim();
}

// Wrap base64 body to 76-char lines per RFC 2045.
function chunk76(s: string): string {
  return s.match(/.{1,76}/g)?.join("\r\n") ?? s;
}

function buildRawMessage(args: {
  fromName: string;
  fromEmail: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): string {
  // Per-message random boundary so user content can never accidentally or
  // maliciously match the boundary token.
  const boundary = `apex_${randomBytes(12).toString("hex")}`;

  const headers = [
    `From: "${encodeMimeWord(args.fromName)}" <${sanitizeHeaderValue(args.fromEmail)}>`,
    `To: ${sanitizeHeaderValue(args.to)}`,
    args.replyTo ? `Reply-To: ${sanitizeHeaderValue(args.replyTo)}` : null,
    `Subject: ${encodeMimeWord(args.subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ]
    .filter(Boolean)
    .join("\r\n");

  // Both bodies are base64-encoded: this is valid 7bit transport for arbitrary
  // UTF-8 content AND it neutralizes any CRLF/boundary injection from
  // customer-controlled fields, since base64 contains no boundary sequences.
  const textB64 = chunk76(Buffer.from(args.text, "utf8").toString("base64"));
  const htmlB64 = chunk76(Buffer.from(args.html, "utf8").toString("base64"));

  const body = [
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    textB64,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    htmlB64,
    ``,
    `--${boundary}--`,
    ``,
  ].join("\r\n");

  return `${headers}\r\n${body}`;
}

async function sendViaGmail(args: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const raw = buildRawMessage({
    fromName: FROM_NAME,
    fromEmail: OWNER_EMAIL,
    to: args.to,
    replyTo: args.replyTo,
    subject: args.subject,
    html: args.html,
    text: args.text,
  });

  const response = await connectors.proxy(
    "google-mail",
    "/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: toBase64Url(raw) }),
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Gmail send failed: HTTP ${response.status} ${response.statusText} ${text}`,
    );
  }
}

export interface BookingEmailData {
  customerName: string;
  email: string;
  phone: string;
  vehicle: string;
  notes: string;
  serviceName: string;
  servicePriceCents: number;
  serviceDurationMinutes: number;
  date: string;
  time: string;
}

function customerHtml(b: BookingEmailData): string {
  const dateLong = formatDateLong(b.date);
  const time12 = formatTime12h(b.time);
  const price = formatPrice(b.servicePriceCents);
  const duration = `${b.serviceDurationMinutes} min`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#ffffff;font-family:'Mulish',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#A886CD 0%,#3496FF 100%);padding:28px 32px;text-align:center;">
          <div style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.5px;">APEX DETAILING</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">Booking Confirmed</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px 0;font-size:16px;color:#ffffff;">Hi ${escapeHtml(b.customerName)},</p>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#cccccc;">Thanks for booking with Apex Detailing! Your appointment is confirmed. Here are the details:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Service</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(b.serviceName)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Date</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(dateLong)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Time</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(time12)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Duration</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(duration)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Price</td><td style="padding:8px 0;color:#3496FF;font-size:16px;font-weight:700;text-align:right;">${escapeHtml(price)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Vehicle</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(b.vehicle)}</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(52,150,255,0.08);border:1px solid rgba(52,150,255,0.25);border-radius:12px;padding:18px;margin-bottom:24px;">
            <tr><td>
              <div style="color:#3496FF;font-weight:700;font-size:14px;margin-bottom:6px;">Drop-Off Location</div>
              <div style="color:#ffffff;font-size:14px;line-height:1.5;">${escapeHtml(SHOP_ADDRESS)}</div>
              <div style="color:#cccccc;font-size:13px;margin-top:8px;">Please arrive a few minutes early for check-in.</div>
            </td></tr>
          </table>
          <p style="margin:0 0 8px 0;color:#cccccc;font-size:14px;line-height:1.6;">Need to reschedule or have questions? Reply to this email or call us at <a href="tel:+14175276165" style="color:#3496FF;text-decoration:none;font-weight:600;">${SHOP_PHONE}</a>.</p>
          <p style="margin:24px 0 0 0;color:#999999;font-size:13px;">See you soon,<br/><strong style="color:#ffffff;">The Apex Detailing Team</strong></p>
        </td></tr>
        <tr><td style="background:#0a0a0a;padding:20px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
          <a href="${SHOP_WEBSITE}" style="color:#3496FF;text-decoration:none;font-size:13px;">apexdetailingsf.com</a>
          <div style="color:#666666;font-size:12px;margin-top:6px;">${escapeHtml(SHOP_ADDRESS)} · ${SHOP_PHONE}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function customerText(b: BookingEmailData): string {
  return [
    `Hi ${b.customerName},`,
    ``,
    `Your booking with Apex Detailing is confirmed!`,
    ``,
    `Service: ${b.serviceName}`,
    `Date: ${formatDateLong(b.date)}`,
    `Time: ${formatTime12h(b.time)}`,
    `Duration: ${b.serviceDurationMinutes} min`,
    `Price: ${formatPrice(b.servicePriceCents)}`,
    `Vehicle: ${b.vehicle}`,
    ``,
    `Drop-off: ${SHOP_ADDRESS}`,
    ``,
    `Questions? Reply to this email or call ${SHOP_PHONE}.`,
    ``,
    `— Apex Detailing`,
    SHOP_WEBSITE,
  ].join("\n");
}

function ownerHtml(b: BookingEmailData): string {
  const dateLong = formatDateLong(b.date);
  const time12 = formatTime12h(b.time);
  const price = formatPrice(b.servicePriceCents);
  const duration = `${b.serviceDurationMinutes} min`;
  const notesRow = b.notes
    ? `<tr><td style="padding:8px 0;color:#999999;font-size:13px;vertical-align:top;">Notes</td><td style="padding:8px 0;color:#ffffff;font-size:14px;text-align:right;white-space:pre-wrap;">${escapeHtml(b.notes)}</td></tr>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#ffffff;font-family:'Mulish',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#3496FF 0%,#A886CD 100%);padding:24px 32px;">
          <div style="font-size:13px;color:rgba(255,255,255,0.9);letter-spacing:1.5px;font-weight:700;">NEW BOOKING</div>
          <div style="font-size:22px;font-weight:900;color:#ffffff;margin-top:4px;">${escapeHtml(b.serviceName)}</div>
          <div style="font-size:14px;color:rgba(255,255,255,0.95);margin-top:6px;">${escapeHtml(dateLong)} · ${escapeHtml(time12)}</div>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Customer</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(b.customerName)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;text-align:right;"><a href="mailto:${escapeHtml(b.email)}" style="color:#3496FF;text-decoration:none;">${escapeHtml(b.email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Phone</td><td style="padding:8px 0;font-size:14px;text-align:right;"><a href="tel:${escapeHtml(b.phone)}" style="color:#3496FF;text-decoration:none;">${escapeHtml(b.phone)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Vehicle</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(b.vehicle)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Duration</td><td style="padding:8px 0;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(duration)}</td></tr>
            <tr><td style="padding:8px 0;color:#999999;font-size:13px;">Price</td><td style="padding:8px 0;color:#3496FF;font-size:16px;font-weight:700;text-align:right;">${escapeHtml(price)}</td></tr>
            ${notesRow}
          </table>
          <a href="${SHOP_WEBSITE}/admin" style="display:inline-block;padding:12px 24px;border-radius:9999px;background:linear-gradient(90deg,#A886CD,#3496FF);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">View in Dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function ownerText(b: BookingEmailData): string {
  return [
    `NEW BOOKING — ${b.serviceName}`,
    `${formatDateLong(b.date)} at ${formatTime12h(b.time)}`,
    ``,
    `Customer: ${b.customerName}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone}`,
    `Vehicle: ${b.vehicle}`,
    `Duration: ${b.serviceDurationMinutes} min`,
    `Price: ${formatPrice(b.servicePriceCents)}`,
    b.notes ? `Notes: ${b.notes}` : null,
    ``,
    `Dashboard: ${SHOP_WEBSITE}/admin`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendBookingEmails(b: BookingEmailData): Promise<void> {
  const customerSubject = `Your Apex Detailing booking is confirmed — ${formatDateLong(b.date)}`;
  const ownerSubject = `New booking: ${b.serviceName} — ${formatDateLong(b.date)} ${formatTime12h(b.time)}`;

  const tasks: Promise<unknown>[] = [
    sendViaGmail({
      to: b.email,
      replyTo: OWNER_EMAIL,
      subject: customerSubject,
      html: customerHtml(b),
      text: customerText(b),
    }).catch((err) => {
      console.error("[email] customer confirmation failed:", err);
    }),
    sendViaGmail({
      to: OWNER_EMAIL,
      replyTo: b.email,
      subject: ownerSubject,
      html: ownerHtml(b),
      text: ownerText(b),
    }).catch((err) => {
      console.error("[email] owner notification failed:", err);
    }),
  ];

  await Promise.all(tasks);
}
