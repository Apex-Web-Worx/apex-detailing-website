import { useEffect, useRef, useState } from "react";
import type { Booking } from "@workspace/api-client-react";
import { Check, Loader2, X } from "lucide-react";
import { formatDateTimeLong } from "@/lib/format";
import { useAdmin } from "../context";
import { bookingIso, bookingAllowsCustomerSms, shopNowPlusMinutes } from "../utils";
import { GhostButton, PrimaryButton, fieldClass } from "./ui";
import AdminDatePicker from "./AdminDatePicker";
import AdminTimePicker, { snapTimeToFiveMinutes } from "./AdminTimePicker";

type Preview = {
  sms: string;
  emailSubject: string;
  emailBody: string;
  smsConsent: boolean;
};

export default function ReadyForPickupModal({
  booking,
  resend = false,
  onClose,
}: {
  booking: Booking;
  resend?: boolean;
  onClose: () => void;
}) {
  const { token, refetch, setDetail, bookings, blockedDates } = useAdmin();
  const defaults = shopNowPlusMinutes(30);
  const canSms = bookingAllowsCustomerSms(booking);
  const [pickupDate, setPickupDate] = useState(defaults.date);
  const [pickupTime, setPickupTime] = useState(() => snapTimeToFiveMinutes(defaults.time));
  const [sendSms, setSendSms] = useState(canSms);
  const [sendEmail, setSendEmail] = useState(true);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [smsBody, setSmsBody] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [smsDirty, setSmsDirty] = useState(false);
  const [emailDirty, setEmailDirty] = useState(false);
  const smsDirtyRef = useRef(false);
  const emailDirtyRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnBothOff, setWarnBothOff] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const url = `/api/admin/bookings/${booking.id}/ready-preview?pickupDate=${encodeURIComponent(pickupDate)}&pickupTime=${encodeURIComponent(pickupTime)}`;
        const res = await fetch(url, { headers: { "x-admin-token": token } });
        if (!res.ok) return;
        const json = (await res.json()) as Preview;
        if (cancelled) return;
        setPreview(json);
        if (!smsDirtyRef.current) setSmsBody(json.sms);
        if (!emailDirtyRef.current) {
          setEmailSubject(json.emailSubject);
          setEmailBody(json.emailBody);
        }
      } catch {
        /* preview is best-effort */
      }
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [booking.id, pickupDate, pickupTime, token]);

  const bothOff = !sendSms && !sendEmail;

  const submit = async () => {
    if (bothOff && !warnBothOff) {
      setWarnBothOff(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/ready-for-pickup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          pickupDate,
          pickupTime,
          sendSms,
          sendEmail,
          resend,
          smsBody,
          emailSubject,
          emailBody,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `${res.status}`);
      }
      const json = await res.json();
      refetch();
      if (json.booking) setDetail(json.booking);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark ready");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-[#0B0B0B] border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Vehicle Ready for Pickup</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111111] p-4 mb-4">
          <p className="font-semibold text-white">{booking.customerName}</p>
          <p className="text-sm text-[#9CA3AF] mt-1">{booking.vehicle}</p>
          <p className="text-sm text-white mt-2">{booking.serviceName}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{formatDateTimeLong(bookingIso(booking))}</p>
        </div>

        <div className="mb-4 space-y-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
              Pickup date
            </span>
            <AdminDatePicker
              value={pickupDate}
              onChange={setPickupDate}
              minDate={defaults.date}
              bookings={bookings}
              blockedDates={blockedDates}
              required
            />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
              Pickup time
            </span>
            <AdminTimePicker value={pickupTime} onChange={setPickupTime} />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
            Send customer notification
          </p>
          <label className="flex items-center gap-3 min-h-11 text-sm text-white">
            <input
              type="checkbox"
              checked={sendSms}
              disabled={!canSms}
              onChange={(e) => setSendSms(e.target.checked)}
              className="accent-[#FF2AD4]"
            />
            SMS
            {!canSms
              ? booking.phone.replace(/\D/g, "").length < 7
                ? " (no phone number)"
                : " (customer opted out)"
              : ""}
          </label>
          <label className="flex items-center gap-3 min-h-11 text-sm text-white">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="accent-[#FF2AD4]"
            />
            Email
          </label>
        </div>

        {(sendSms || sendEmail) && (
          <div className="mb-4 space-y-3">
            {sendSms ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                  SMS message
                </span>
                <textarea
                  value={smsBody}
                  onChange={(e) => {
                    smsDirtyRef.current = true;
                    setSmsDirty(true);
                    setSmsBody(e.target.value);
                  }}
                  rows={7}
                  className={`${fieldClass} resize-y min-h-32`}
                />
              </label>
            ) : null}
            {sendEmail ? (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                    Email subject
                  </span>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => {
                      emailDirtyRef.current = true;
                      setEmailDirty(true);
                      setEmailSubject(e.target.value);
                    }}
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">
                    Email message
                  </span>
                  <textarea
                    value={emailBody}
                    onChange={(e) => {
                      emailDirtyRef.current = true;
                      setEmailDirty(true);
                      setEmailBody(e.target.value);
                    }}
                    rows={7}
                    className={`${fieldClass} resize-y min-h-32`}
                  />
                </label>
              </div>
            ) : null}
            {(smsDirty || emailDirty) && preview ? (
              <button
                type="button"
                className="text-xs font-semibold text-[#9CA3AF] hover:text-white"
                onClick={() => {
                  smsDirtyRef.current = false;
                  emailDirtyRef.current = false;
                  setSmsDirty(false);
                  setEmailDirty(false);
                  setSmsBody(preview.sms);
                  setEmailSubject(preview.emailSubject);
                  setEmailBody(preview.emailBody);
                }}
              >
                Reset to template
              </button>
            ) : null}
          </div>
        )}

        {bothOff && (
          <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
            {warnBothOff
              ? "No notification will be sent. Click again to mark ready anyway."
              : "SMS and email are both off. The customer will not be notified."}
          </div>
        )}
        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <GhostButton type="button" onClick={onClose}>
            Cancel
          </GhostButton>
          <PrimaryButton type="button" disabled={submitting} onClick={submit} className="min-h-12">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {resend ? "Resend notification" : "Mark ready & send"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
