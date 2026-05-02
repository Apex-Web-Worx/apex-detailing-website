import { ReplitConnectors } from "@replit/connectors-sdk";
import { randomBytes } from "node:crypto";

const connectors = new ReplitConnectors();

export const OWNER_EMAIL = "apexdetailingsf@gmail.com";
export const FROM_NAME = "Apex Detailing";
const SHOP_PHONE = "(417) 527-6165";
const SHOP_ADDRESS = "1114 E Lakota St, Nixa, MO 65714";
const SITE_URL = process.env["SITE_URL"] || "https://www.apexdetailingsf.com";
const SHOP_WEBSITE = SITE_URL;

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildManageUrl(bookingId: number, token: string): string {
  return `${SITE_URL}/manage/${bookingId}?token=${encodeURIComponent(token)}`;
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

/* ------------------------------------------------------------------ */
/* Shared HTML helpers                                                */
/* ------------------------------------------------------------------ */

function emailShell(args: {
  preheader: string;
  headerGradient: string;
  eyebrow: string;
  headline: string;
  subhead?: string;
  bodyHtml: string;
}): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#ffffff;font-family:'Mulish',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0a0a0a;">${escapeHtml(args.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="background:${args.headerGradient};padding:28px 32px;">
          <div style="font-size:13px;color:rgba(255,255,255,0.9);letter-spacing:1.5px;font-weight:700;">${escapeHtml(args.eyebrow)}</div>
          <div style="font-size:22px;font-weight:900;color:#ffffff;margin-top:6px;">${escapeHtml(args.headline)}</div>
          ${args.subhead ? `<div style="font-size:14px;color:rgba(255,255,255,0.95);margin-top:6px;">${escapeHtml(args.subhead)}</div>` : ""}
        </td></tr>
        <tr><td style="padding:28px 32px;">${args.bodyHtml}</td></tr>
        <tr><td style="background:#0a0a0a;padding:18px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
          <a href="${SHOP_WEBSITE}" style="color:#3496FF;text-decoration:none;font-size:13px;">apexdetailingsf.com</a>
          <div style="color:#666666;font-size:12px;margin-top:6px;">${escapeHtml(SHOP_ADDRESS)} &middot; ${SHOP_PHONE}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailsTable(rows: { label: string; value: string; highlight?: boolean }[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">${rows
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;color:#999999;font-size:13px;">${escapeHtml(r.label)}</td><td style="padding:8px 0;color:${r.highlight ? "#3496FF" : "#ffffff"};font-size:${r.highlight ? "16px" : "14px"};font-weight:${r.highlight ? "700" : "600"};text-align:right;">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("")}</table>`;
}

function ctaButton(href: string, label: string, gradient = "linear-gradient(90deg,#A886CD,#3496FF)"): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;border-radius:9999px;background:${gradient};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(label)}</a>`;
}

/* ------------------------------------------------------------------ */
/* Booking confirmation (existing)                                    */
/* ------------------------------------------------------------------ */

export interface BookingEmailData {
  id: number;
  manageToken: string | null;
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

function detailRows(b: BookingEmailData): { label: string; value: string; highlight?: boolean }[] {
  return [
    { label: "Service", value: b.serviceName },
    { label: "Date", value: formatDateLong(b.date), highlight: true },
    { label: "Time", value: formatTime12h(b.time), highlight: true },
    { label: "Duration", value: `${b.serviceDurationMinutes} min` },
    { label: "Vehicle", value: b.vehicle },
  ];
}

function customerHtml(b: BookingEmailData): string {
  const manageBlock = b.manageToken
    ? `<div style="text-align:center;margin-bottom:24px;">
         ${ctaButton(buildManageUrl(b.id, b.manageToken), "Manage Your Booking")}
         <div style="color:#999999;font-size:12px;margin-top:10px;">Need to reschedule or cancel? Tap above.</div>
       </div>`
    : "";

  const body = `
    <p style="margin:0 0 16px 0;font-size:16px;color:#ffffff;">Hi ${escapeHtml(b.customerName)},</p>
    <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#cccccc;">Thanks for booking with Apex Detailing! Your appointment is confirmed.</p>
    ${detailsTable(detailRows(b))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(52,150,255,0.08);border:1px solid rgba(52,150,255,0.25);border-radius:12px;padding:18px;margin-bottom:24px;">
      <tr><td>
        <div style="color:#3496FF;font-weight:700;font-size:14px;margin-bottom:6px;">Drop-Off Location</div>
        <div style="color:#ffffff;font-size:14px;line-height:1.5;">${escapeHtml(SHOP_ADDRESS)}</div>
        <div style="color:#cccccc;font-size:13px;margin-top:8px;">Please arrive a few minutes early for check-in.</div>
      </td></tr>
    </table>
    ${manageBlock}
    <p style="margin:0 0 8px 0;color:#cccccc;font-size:14px;line-height:1.6;">Prefer to talk to a human? Reply to this email or call us at <a href="tel:+14175276165" style="color:#3496FF;text-decoration:none;font-weight:600;">${SHOP_PHONE}</a>.</p>
    <p style="margin:24px 0 0 0;color:#999999;font-size:13px;">See you soon,<br/><strong style="color:#ffffff;">The Apex Detailing Team</strong></p>
  `;

  return emailShell({
    preheader: `Your ${b.serviceName} appointment is confirmed for ${formatDateLong(b.date)} at ${formatTime12h(b.time)}.`,
    headerGradient: "linear-gradient(135deg,#A886CD 0%,#3496FF 100%)",
    eyebrow: "BOOKING CONFIRMED",
    headline: "APEX DETAILING",
    bodyHtml: body,
  });
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
    `Vehicle: ${b.vehicle}`,
    ``,
    `Drop-off: ${SHOP_ADDRESS}`,
    ``,
    b.manageToken
      ? `Need to reschedule or cancel? Manage your booking: ${buildManageUrl(b.id, b.manageToken)}`
      : ``,
    `Or reply to this email or call ${SHOP_PHONE}.`,
    ``,
    `— Apex Detailing`,
    SHOP_WEBSITE,
  ]
    .filter(Boolean)
    .join("\n");
}

function ownerHtml(b: BookingEmailData): string {
  const dateLong = formatDateLong(b.date);
  const time12 = formatTime12h(b.time);
  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Customer", value: b.customerName },
    { label: "Email", value: b.email },
    { label: "Phone", value: b.phone },
    { label: "Vehicle", value: b.vehicle },
    { label: "Duration", value: `${b.serviceDurationMinutes} min` },
  ];
  if (b.notes) rows.push({ label: "Notes", value: b.notes });

  const body = `
    ${detailsTable(rows)}
    ${ctaButton(`${SHOP_WEBSITE}/admin`, "View in Dashboard")}
  `;

  return emailShell({
    preheader: `New ${b.serviceName} booking — ${dateLong} ${time12}`,
    headerGradient: "linear-gradient(135deg,#3496FF 0%,#A886CD 100%)",
    eyebrow: "NEW BOOKING",
    headline: b.serviceName,
    subhead: `${dateLong} · ${time12}`,
    bodyHtml: body,
  });
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

  await Promise.all([
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
  ]);
}

/* ------------------------------------------------------------------ */
/* Cancellation                                                       */
/* ------------------------------------------------------------------ */

export type CancelledBy = "customer" | "owner";

function customerCancelHtml(b: BookingEmailData, by: CancelledBy): string {
  const body = `
    <p style="margin:0 0 16px 0;font-size:16px;color:#ffffff;">Hi ${escapeHtml(b.customerName)},</p>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#cccccc;">${
      by === "customer"
        ? "Your booking has been cancelled as requested."
        : "Your booking has been cancelled. If you weren't expecting this, please get in touch — we'll get you back on the calendar."
    }</p>
    ${detailsTable(detailRows(b))}
    <div style="text-align:center;margin-bottom:8px;">
      ${ctaButton(`${SHOP_WEBSITE}/book`, "Book Again")}
    </div>
    <p style="margin:18px 0 0 0;color:#cccccc;font-size:14px;line-height:1.6;text-align:center;">Questions? Reply here or call <a href="tel:+14175276165" style="color:#3496FF;text-decoration:none;font-weight:600;">${SHOP_PHONE}</a>.</p>
  `;
  return emailShell({
    preheader: `Your ${b.serviceName} on ${formatDateLong(b.date)} has been cancelled.`,
    headerGradient: "linear-gradient(135deg,#5a4a6e 0%,#3a4a5e 100%)",
    eyebrow: "BOOKING CANCELLED",
    headline: "We're sorry to see you go",
    subhead: `${formatDateLong(b.date)} · ${formatTime12h(b.time)}`,
    bodyHtml: body,
  });
}

function customerCancelText(b: BookingEmailData, by: CancelledBy): string {
  return [
    `Hi ${b.customerName},`,
    ``,
    by === "customer"
      ? "Your booking has been cancelled as requested."
      : "Your booking has been cancelled by Apex Detailing. If you weren't expecting this, please get in touch.",
    ``,
    `Cancelled appointment:`,
    `${b.serviceName} — ${formatDateLong(b.date)} at ${formatTime12h(b.time)}`,
    `Vehicle: ${b.vehicle}`,
    ``,
    `Want to rebook? ${SHOP_WEBSITE}/book`,
    `Or call ${SHOP_PHONE}.`,
    ``,
    `— Apex Detailing`,
  ].join("\n");
}

function ownerCancelHtml(b: BookingEmailData, by: CancelledBy): string {
  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Customer", value: b.customerName },
    { label: "Email", value: b.email },
    { label: "Phone", value: b.phone },
    { label: "Vehicle", value: b.vehicle },
    { label: "Service", value: b.serviceName },
    { label: "Cancelled by", value: by === "customer" ? "Customer (via link)" : "You (admin)" },
  ];
  const body = `
    ${detailsTable(rows)}
    ${ctaButton(`${SHOP_WEBSITE}/admin`, "Open Dashboard")}
  `;
  return emailShell({
    preheader: `${b.customerName} — ${b.serviceName} on ${formatDateLong(b.date)} cancelled.`,
    headerGradient: "linear-gradient(135deg,#5a4a6e 0%,#3a4a5e 100%)",
    eyebrow: "BOOKING CANCELLED",
    headline: `${b.serviceName} cancelled`,
    subhead: `${formatDateLong(b.date)} · ${formatTime12h(b.time)}`,
    bodyHtml: body,
  });
}

function ownerCancelText(b: BookingEmailData, by: CancelledBy): string {
  return [
    `BOOKING CANCELLED — ${b.serviceName}`,
    `${formatDateLong(b.date)} at ${formatTime12h(b.time)}`,
    ``,
    `Customer: ${b.customerName}`,
    `Email: ${b.email}`,
    `Phone: ${b.phone}`,
    `Vehicle: ${b.vehicle}`,
    `Cancelled by: ${by === "customer" ? "Customer (via link)" : "You (admin)"}`,
    ``,
    `Dashboard: ${SHOP_WEBSITE}/admin`,
  ].join("\n");
}

export async function sendCancellationEmails(
  b: BookingEmailData,
  by: CancelledBy,
): Promise<void> {
  const dateLong = formatDateLong(b.date);
  await Promise.all([
    sendViaGmail({
      to: b.email,
      replyTo: OWNER_EMAIL,
      subject: `Your Apex Detailing booking has been cancelled — ${dateLong}`,
      html: customerCancelHtml(b, by),
      text: customerCancelText(b, by),
    }).catch((err) => {
      console.error("[email] customer cancellation failed:", err);
    }),
    sendViaGmail({
      to: OWNER_EMAIL,
      replyTo: b.email,
      subject: `Cancelled (${by}): ${b.serviceName} — ${dateLong} ${formatTime12h(b.time)}`,
      html: ownerCancelHtml(b, by),
      text: ownerCancelText(b, by),
    }).catch((err) => {
      console.error("[email] owner cancellation notification failed:", err);
    }),
  ]);
}

/* ------------------------------------------------------------------ */
/* Reschedule                                                         */
/* ------------------------------------------------------------------ */

export interface RescheduleEmailData {
  oldDate: string;
  oldTime: string;
  booking: BookingEmailData; // booking with date/time already updated to the new slot
}

function customerRescheduleHtml(d: RescheduleEmailData): string {
  const b = d.booking;
  const oldStr = `${formatDateLong(d.oldDate)} at ${formatTime12h(d.oldTime)}`;
  const newStr = `${formatDateLong(b.date)} at ${formatTime12h(b.time)}`;
  const manageBlock = b.manageToken
    ? `<div style="text-align:center;margin-bottom:8px;">${ctaButton(buildManageUrl(b.id, b.manageToken), "Manage Your Booking")}</div>`
    : "";

  const body = `
    <p style="margin:0 0 16px 0;font-size:16px;color:#ffffff;">Hi ${escapeHtml(b.customerName)},</p>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#cccccc;">Your appointment has been rescheduled. Here are your new details:</p>
    ${detailsTable(detailRows(b))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(168,134,205,0.08);border:1px solid rgba(168,134,205,0.25);border-radius:12px;padding:14px;margin-bottom:20px;">
      <tr><td style="color:#cccccc;font-size:13px;">Previously: <span style="color:#ffffff;font-weight:600;">${escapeHtml(oldStr)}</span></td></tr>
    </table>
    ${manageBlock}
    <p style="margin:18px 0 0 0;color:#cccccc;font-size:14px;line-height:1.6;text-align:center;">See you on ${escapeHtml(newStr)}!<br/>Questions? Reply here or call <a href="tel:+14175276165" style="color:#3496FF;text-decoration:none;font-weight:600;">${SHOP_PHONE}</a>.</p>
  `;

  return emailShell({
    preheader: `New appointment time: ${newStr}`,
    headerGradient: "linear-gradient(135deg,#A886CD 0%,#3496FF 100%)",
    eyebrow: "BOOKING RESCHEDULED",
    headline: "Updated appointment",
    subhead: newStr,
    bodyHtml: body,
  });
}

function customerRescheduleText(d: RescheduleEmailData): string {
  const b = d.booking;
  return [
    `Hi ${b.customerName},`,
    ``,
    `Your Apex Detailing appointment has been rescheduled.`,
    ``,
    `Previously: ${formatDateLong(d.oldDate)} at ${formatTime12h(d.oldTime)}`,
    `New time: ${formatDateLong(b.date)} at ${formatTime12h(b.time)}`,
    ``,
    `Service: ${b.serviceName}`,
    `Vehicle: ${b.vehicle}`,
    `Drop-off: ${SHOP_ADDRESS}`,
    ``,
    b.manageToken ? `Manage: ${buildManageUrl(b.id, b.manageToken)}` : ``,
    `Or call ${SHOP_PHONE}.`,
    ``,
    `— Apex Detailing`,
  ]
    .filter(Boolean)
    .join("\n");
}

function ownerRescheduleHtml(d: RescheduleEmailData): string {
  const b = d.booking;
  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Customer", value: b.customerName },
    { label: "Email", value: b.email },
    { label: "Phone", value: b.phone },
    { label: "Vehicle", value: b.vehicle },
    { label: "Service", value: b.serviceName },
    { label: "Was", value: `${formatDateLong(d.oldDate)} ${formatTime12h(d.oldTime)}` },
    { label: "Now", value: `${formatDateLong(b.date)} ${formatTime12h(b.time)}`, highlight: true },
  ];
  const body = `
    ${detailsTable(rows)}
    ${ctaButton(`${SHOP_WEBSITE}/admin`, "Open Dashboard")}
  `;
  return emailShell({
    preheader: `${b.customerName} moved to ${formatDateLong(b.date)} ${formatTime12h(b.time)}`,
    headerGradient: "linear-gradient(135deg,#3496FF 0%,#A886CD 100%)",
    eyebrow: "BOOKING RESCHEDULED",
    headline: `${b.serviceName} moved`,
    subhead: `${formatDateLong(b.date)} · ${formatTime12h(b.time)}`,
    bodyHtml: body,
  });
}

function ownerRescheduleText(d: RescheduleEmailData): string {
  const b = d.booking;
  return [
    `BOOKING RESCHEDULED — ${b.serviceName}`,
    ``,
    `Customer: ${b.customerName} (${b.email}, ${b.phone})`,
    `Vehicle: ${b.vehicle}`,
    ``,
    `Was: ${formatDateLong(d.oldDate)} at ${formatTime12h(d.oldTime)}`,
    `Now: ${formatDateLong(b.date)} at ${formatTime12h(b.time)}`,
    ``,
    `Dashboard: ${SHOP_WEBSITE}/admin`,
  ].join("\n");
}

export async function sendRescheduleEmails(d: RescheduleEmailData): Promise<void> {
  const b = d.booking;
  const newDateLong = formatDateLong(b.date);
  await Promise.all([
    sendViaGmail({
      to: b.email,
      replyTo: OWNER_EMAIL,
      subject: `Your Apex Detailing appointment has been rescheduled — ${newDateLong}`,
      html: customerRescheduleHtml(d),
      text: customerRescheduleText(d),
    }).catch((err) => {
      console.error("[email] customer reschedule failed:", err);
    }),
    sendViaGmail({
      to: OWNER_EMAIL,
      replyTo: b.email,
      subject: `Rescheduled: ${b.customerName} — ${newDateLong} ${formatTime12h(b.time)}`,
      html: ownerRescheduleHtml(d),
      text: ownerRescheduleText(d),
    }).catch((err) => {
      console.error("[email] owner reschedule notification failed:", err);
    }),
  ]);
}
