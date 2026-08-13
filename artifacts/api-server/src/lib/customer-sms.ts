export function holdBookingEmail(holdId: number): string {
  return `hold-${holdId}@apexdetailing.net`;
}

export function hasSmsPhone(phone: string | null | undefined): boolean {
  return (phone ?? "").replace(/\D/g, "").length >= 7;
}

export function isHoldBookingEmail(email: string | null | undefined): boolean {
  return /^hold-\d+@apexdetailing\.net$/i.test((email ?? "").trim());
}

export function bookingAllowsCustomerSms(row: {
  smsConsent?: boolean | null;
  email?: string | null;
  phone?: string | null;
}): boolean {
  if (row.smsConsent) return true;
  return isHoldBookingEmail(row.email) && hasSmsPhone(row.phone);
}
