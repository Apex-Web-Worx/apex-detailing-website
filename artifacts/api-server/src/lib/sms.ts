// SMS sending via the Replit-managed Twilio connector.
//
// The connector returns: account_sid, api_key, api_key_secret, phone_number.
// We use API-key auth (not auth-token) so credentials can be rotated
// without affecting the master account secret.
//
// All sends are best-effort: callers fire-and-forget, and individual send
// failures (invalid number, recipient opted out, Twilio outage) are logged
// and swallowed so they never break the booking flow.

import twilio, { type Twilio } from "twilio";
import { SHOP_ADDRESS, SHOP_WEBSITE } from "./email";

interface TwilioCreds {
  accountSid: string;
  apiKey: string;
  apiKeySecret: string;
  phoneNumber: string;
}

let cachedCreds: TwilioCreds | null = null;
let cachedAt = 0;
// Twilio API-key creds are long-lived; refetch every 10 minutes to pick
// up rotations without paying the connector RTT on every send.
const CREDS_TTL_MS = 10 * 60 * 1000;

async function getCreds(): Promise<TwilioCreds> {
  if (cachedCreds && Date.now() - cachedAt < CREDS_TTL_MS) return cachedCreds;

  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
      ? "depl " + process.env["WEB_REPL_RENEWAL"]
      : null;

  if (!hostname || !xReplitToken) {
    throw new Error(
      "Twilio connector unavailable: REPLIT_CONNECTORS_HOSTNAME / REPL_IDENTITY missing",
    );
  }

  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=twilio`,
    {
      headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
    },
  );
  const data = (await resp.json()) as {
    items?: Array<{
      settings?: {
        account_sid?: string;
        api_key?: string;
        api_key_secret?: string;
        phone_number?: string;
      };
    }>;
  };
  const settings = data.items?.[0]?.settings;
  if (
    !settings?.account_sid ||
    !settings.api_key ||
    !settings.api_key_secret ||
    !settings.phone_number
  ) {
    throw new Error("Twilio not connected (missing settings)");
  }
  cachedCreds = {
    accountSid: settings.account_sid,
    apiKey: settings.api_key,
    apiKeySecret: settings.api_key_secret,
    phoneNumber: settings.phone_number,
  };
  cachedAt = Date.now();
  return cachedCreds;
}

async function getClient(): Promise<{ client: Twilio; from: string }> {
  const c = await getCreds();
  return {
    client: twilio(c.apiKey, c.apiKeySecret, { accountSid: c.accountSid }),
    from: c.phoneNumber,
  };
}

/**
 * Normalize US phone input to E.164. Strict: returns null if the input
 * contains anything other than digits, the standard separators, an
 * optional leading +, and a leading "1" country code. This rejects
 * extension markers ("x123", " ext 4"), letters, and other artifacts
 * that would otherwise silently corrupt the destination number.
 *
 *   "(417) 555-1234"     -> "+14175551234"
 *   "417.555.1234"       -> "+14175551234"
 *   "1-417-555-1234"     -> "+14175551234"
 *   "+1 (417) 555-1234"  -> "+14175551234"
 *   "555-1234"           -> null (too short)
 *   "417-555-1234 x12"   -> null (extension)
 *   "1-800-CALL-NOW"     -> null (letters)
 *   "+44 20 7946 0958"   -> "+442079460958" (E.164 international)
 */
export function normalizeUsPhone(raw: string): string | null {
  const trimmed = raw.trim();
  // Allowed: optional leading +, then digits and separators only.
  // Rejects letters, "x", "ext", parens with text, etc.
  if (!/^\+?[\d\s().\-]+$/.test(trimmed)) return null;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (hasPlus) {
    // E.164: 8-15 digits after the +. Pass through any country code.
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }
  // No leading +: must be a US number — exactly 10 digits, or 11 with
  // a leading "1" country code.
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

interface SendSmsArgs {
  to: string; // raw or E.164 — we'll normalize
  body: string; // <=1600 chars; longer is split into segments
  context: string; // e.g. "customer-confirm #123" — only used in logs
}

/**
 * Fire-and-forget SMS send. Never throws — logs and swallows everything.
 * Twilio error 21610 (recipient opted out / STOP) is logged at info, not
 * error, since it's an expected and benign outcome.
 */
export async function sendSms(args: SendSmsArgs): Promise<void> {
  const to = normalizeUsPhone(args.to);
  if (!to) {
    console.warn(`[sms] ${args.context}: invalid phone — skipped`);
    return;
  }
  let client: Twilio;
  let from: string;
  try {
    ({ client, from } = await getClient());
  } catch (err) {
    console.error(`[sms] ${args.context}: client init failed:`, err);
    return;
  }
  try {
    const msg = await client.messages.create({ to, from, body: args.body });
    console.log(`[sms] ${args.context}: sent sid=${msg.sid} to=${to}`);
  } catch (err) {
    const e = err as { code?: number; status?: number; message?: string };
    if (e.code === 21610) {
      console.log(
        `[sms] ${args.context}: recipient opted out (STOP) to=${to} — skipped`,
      );
      return;
    }
    console.error(
      `[sms] ${args.context}: send failed to=${to} code=${e.code} status=${e.status}:`,
      e.message ?? err,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */
//
// All customer-facing templates end in "Reply STOP to opt out." per A2P
// 10DLC requirements. Owner templates skip that since the owner's number
// is configured by us, not collected via consent.

interface TemplateBooking {
  id: number;
  customerName: string;
  serviceName: string;
  dateLong: string; // already-formatted "Mon, May 11, 2026"
  time12: string;  // already-formatted "7:30 AM"
  manageUrl: string | null;
}

const STOP = "Reply STOP to opt out.";

export function smsCustomerConfirm(b: TemplateBooking): string {
  const manage = b.manageUrl ? ` Manage: ${b.manageUrl}` : "";
  return `Apex Detailing: Your ${b.serviceName} is confirmed for ${b.dateLong} at ${b.time12}. Drop-off: ${SHOP_ADDRESS}.${manage} ${STOP}`;
}

export function smsCustomerReminder(b: TemplateBooking): string {
  return `Apex Detailing reminder: You're booked tomorrow ${b.dateLong} at ${b.time12} for ${b.serviceName}. Drop-off: ${SHOP_ADDRESS}. See you soon! ${STOP}`;
}

export function smsCustomerReschedule(b: TemplateBooking): string {
  const manage = b.manageUrl ? ` Manage: ${b.manageUrl}` : "";
  return `Apex Detailing: Your appointment has been rescheduled to ${b.dateLong} at ${b.time12}.${manage} ${STOP}`;
}

export function smsCustomerCancel(b: TemplateBooking, by: "customer" | "owner"): string {
  const tail =
    by === "owner"
      ? `If you didn't request this, please call us. To rebook visit ${SHOP_WEBSITE}/book.`
      : `Sorry to see you go. To rebook visit ${SHOP_WEBSITE}/book.`;
  return `Apex Detailing: Your appointment for ${b.dateLong} at ${b.time12} has been cancelled. ${tail} ${STOP}`;
}

interface OwnerTemplateBooking extends TemplateBooking {
  customerPhone: string;
  vehicle: string;
}

export function smsOwnerNew(b: OwnerTemplateBooking): string {
  return `Apex booking #${b.id} NEW: ${b.serviceName} for ${b.customerName} (${b.vehicle}) on ${b.dateLong} ${b.time12}. ${b.customerPhone}`;
}

export function smsOwnerReschedule(
  b: OwnerTemplateBooking,
  oldDateLong: string,
  oldTime12: string,
): string {
  return `Apex booking #${b.id} RESCHEDULED: ${b.customerName} moved to ${b.dateLong} ${b.time12} (was ${oldDateLong} ${oldTime12}). ${b.customerPhone}`;
}

export function smsOwnerCancel(
  b: OwnerTemplateBooking,
  by: "customer" | "owner" | "admin",
): string {
  return `Apex booking #${b.id} CANCELLED by ${by}: ${b.customerName} ${b.dateLong} ${b.time12} (${b.serviceName}). ${b.customerPhone}`;
}
