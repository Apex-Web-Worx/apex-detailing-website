// Notification fan-out: every booking event (create, reschedule, cancel,
// reminder) goes through here so the email + SMS code paths stay in
// lockstep and we have one place to add channels later.
//
// All sends are fire-and-forget: callers do NOT await this module's
// functions. Errors are logged inside each channel adapter and never
// propagate.

import {
  sendBookingEmails,
  sendCancellationEmails,
  sendRescheduleEmails,
  buildManageUrl,
  formatDateLong,
  formatTime12h,
  type BookingEmailData,
} from "./email";
import {
  sendSms,
  smsCustomerConfirm,
  smsCustomerCancel,
  smsCustomerReschedule,
  smsCustomerReminder,
  smsOwnerNew,
  smsOwnerReschedule,
  smsOwnerCancel,
} from "./sms";

// The owner's mobile for SMS notifications. Lives in env so we can
// move it without code changes; falls back to the published shop line.
const OWNER_SMS_TO = process.env["OWNER_SMS_PHONE"] ?? "+14175276165";

function customerTpl(b: BookingEmailData) {
  return {
    id: b.id,
    customerName: b.customerName,
    serviceName: b.serviceName,
    dateLong: formatDateLong(b.date),
    time12: formatTime12h(b.time),
    manageUrl: b.manageToken ? buildManageUrl(b.id, b.manageToken) : null,
  };
}

function ownerTpl(b: BookingEmailData) {
  return { ...customerTpl(b), customerPhone: b.phone, vehicle: b.vehicle };
}

/* ------------------------------------------------------------------ */
/* Public API — one function per booking event                          */
/* ------------------------------------------------------------------ */

// Customer-facing SMS is gated on this. Per the Twilio A2P 10DLC campaign
// description, when a customer leaves the optional consent box unchecked
// we promised to contact them only by email and phone — so every customer
// SMS path consults this helper. Owner SMS is sent unconditionally.
function maySmsCustomer(b: BookingEmailData, kind: string): boolean {
  if (b.smsConsent) return true;
  console.info(
    `[notify] skipping ${kind} #${b.id}: customer did not opt in to SMS`,
  );
  return false;
}

export function notifyBookingCreated(b: BookingEmailData): void {
  sendBookingEmails(b).catch((err) =>
    console.error("[notify] sendBookingEmails failed:", err),
  );
  if (maySmsCustomer(b, "customer-confirm")) {
    void sendSms({
      to: b.phone,
      body: smsCustomerConfirm(customerTpl(b)),
      context: `customer-confirm #${b.id}`,
    });
  }
  void sendSms({
    to: OWNER_SMS_TO,
    body: smsOwnerNew(ownerTpl(b)),
    context: `owner-new #${b.id}`,
  });
}

export function notifyBookingRescheduled(args: {
  oldDate: string;
  oldTime: string;
  booking: BookingEmailData;
}): void {
  sendRescheduleEmails(args).catch((err) =>
    console.error("[notify] sendRescheduleEmails failed:", err),
  );
  if (maySmsCustomer(args.booking, "customer-reschedule")) {
    void sendSms({
      to: args.booking.phone,
      body: smsCustomerReschedule(customerTpl(args.booking)),
      context: `customer-reschedule #${args.booking.id}`,
    });
  }
  void sendSms({
    to: OWNER_SMS_TO,
    body: smsOwnerReschedule(
      ownerTpl(args.booking),
      formatDateLong(args.oldDate),
      formatTime12h(args.oldTime),
    ),
    context: `owner-reschedule #${args.booking.id}`,
  });
}

export function notifyBookingCancelled(
  b: BookingEmailData,
  by: "customer" | "owner" | "admin",
): void {
  // The existing email module distinguishes "customer-initiated" from
  // "owner-initiated" cancellations to choose subject + copy. Admin and
  // owner both surface as "owner" to the customer.
  const emailBy: "customer" | "owner" = by === "customer" ? "customer" : "owner";
  sendCancellationEmails(b, emailBy).catch((err) =>
    console.error("[notify] sendCancellationEmails failed:", err),
  );
  if (maySmsCustomer(b, "customer-cancel")) {
    void sendSms({
      to: b.phone,
      body: smsCustomerCancel(customerTpl(b), emailBy),
      context: `customer-cancel #${b.id}`,
    });
  }
  void sendSms({
    to: OWNER_SMS_TO,
    body: smsOwnerCancel(ownerTpl(b), by),
    context: `owner-cancel #${b.id}`,
  });
}

/** Used by the reminders cron — customer-only, no email + no owner SMS. */
export function notifyReminder24h(b: BookingEmailData): Promise<void> {
  // Returned as a promise so the cron can await + only mark
  // reminder_sent_at after the SMS attempt resolves. sendSms itself
  // never throws.
  if (!maySmsCustomer(b, "customer-reminder")) {
    return Promise.resolve();
  }
  return sendSms({
    to: b.phone,
    body: smsCustomerReminder(customerTpl(b)),
    context: `customer-reminder #${b.id}`,
  });
}
