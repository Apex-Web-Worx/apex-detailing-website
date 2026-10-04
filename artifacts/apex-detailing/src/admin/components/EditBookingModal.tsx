import { useEffect, useState, type ReactNode } from "react";
import {
  adminUpdateBooking,
  adminRescheduleBooking,
  type Booking,
} from "@workspace/api-client-react";
import { Check, Loader2, X as XIcon } from "lucide-react";
import {
  formatDateLong,
  formatDateTimeLong,
  formatTime12h,
  todayDateString,
} from "@/lib/format";
import { scheduledAtToShopDate, scheduledAtToShopTime } from "../utils";
import { fieldClass, PrimaryButton } from "./ui";
import AdminDatePicker from "./AdminDatePicker";
import AdminTimePicker, { snapTimeToFiveMinutes } from "./AdminTimePicker";

export default function EditBookingModal({
  booking,
  token,
  onClose,
  onSaved,
}: {
  booking: Booking;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = useState<"details" | "reschedule">("details");

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

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#0B0B0B] border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[92dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
      >
        <div className="sticky top-0 z-10 bg-[#0B0B0B] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-lg font-bold truncate">
              Edit booking #{String(booking.id).padStart(5, "0")}
            </h2>
            <p className="text-xs text-[#9CA3AF] truncate">
              {booking.customerName} · {booking.serviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-4 flex gap-2 border-b border-white/10">
          <TabButton active={tab === "details"} onClick={() => setTab("details")}>
            Details
          </TabButton>
          <TabButton active={tab === "reschedule"} onClick={() => setTab("reschedule")}>
            Reschedule
          </TabButton>
        </div>

        <div className="p-5">
          {tab === "details" ? (
            <DetailsTab
              booking={booking}
              token={token}
              onSaved={() => {
                onSaved();
                onClose();
              }}
            />
          ) : (
            <RescheduleTab
              booking={booking}
              token={token}
              onSaved={() => {
                onSaved();
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition ${
        active
          ? "text-white border-[#FF2AD4]"
          : "text-[#9CA3AF] border-transparent hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function DetailsTab({
  booking,
  token,
  onSaved,
}: {
  booking: Booking;
  token: string;
  onSaved: () => void;
}) {
  const [customerName, setCustomerName] = useState(booking.customerName);
  const [email, setEmail] = useState(booking.email);
  const [phone, setPhone] = useState(booking.phone);
  const [vehicle, setVehicle] = useState(booking.vehicle);
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const dirty =
    customerName !== booking.customerName ||
    email !== booking.email ||
    phone !== booking.phone ||
    vehicle !== booking.vehicle ||
    notes !== (booking.notes ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminUpdateBooking(
        booking.id,
        { customerName, email, phone, vehicle, notes },
        { headers: { "x-admin-token": token } },
      );
      setSuccess(true);
      setTimeout(() => onSaved(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="py-10 text-center" data-testid="details-saved">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Booking details updated</h3>
        <p className="text-sm text-[#9CA3AF]">
          Calendar event re-synced. No notification was sent to the customer.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Customer name">
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className={fieldClass} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={fieldClass} />
        </Field>
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} />
        </Field>
      </div>
      <Field label="Vehicle">
        <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} required className={fieldClass} />
      </Field>
      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      </Field>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
      )}
      <p className="text-xs text-[#9CA3AF]">
        Saving updates the booking record and re-syncs the Google Calendar event. The customer is not emailed.
      </p>
      <div className="flex justify-end gap-3 pt-2">
        <PrimaryButton type="submit" disabled={!dirty || submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>Save changes</span>
        </PrimaryButton>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function RescheduleTab({
  booking,
  token,
  onSaved,
}: {
  booking: Booking;
  token: string;
  onSaved: () => void;
}) {
  const scheduledIso =
    typeof booking.scheduledAt === "string"
      ? booking.scheduledAt
      : new Date(booking.scheduledAt as unknown as string).toISOString();
  const currentDate = scheduledAtToShopDate(scheduledIso);
  const currentTime = scheduledAtToShopTime(scheduledIso);
  const today = todayDateString();
  const [pickedDate, setPickedDate] = useState(currentDate < today ? today : currentDate);
  const [pickedTime, setPickedTime] = useState(snapTimeToFiveMinutes(currentTime || "07:30"));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    setError(null);
  }, [pickedDate, pickedTime]);

  const isCurrentSlot = pickedDate === currentDate && pickedTime === currentTime;

  const submit = async () => {
    if (!pickedDate || !pickedTime) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminRescheduleBooking(
        booking.id,
        { date: pickedDate, time: snapTimeToFiveMinutes(pickedTime) },
        { headers: { "x-admin-token": token } },
      );
      setSuccess({ date: pickedDate, time: snapTimeToFiveMinutes(pickedTime) });
      setTimeout(() => onSaved(), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reschedule.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="py-10 text-center" data-testid="reschedule-saved">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
          <Check className="w-7 h-7 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Appointment rescheduled</h3>
        <p className="text-sm text-gray-300 mb-3">
          New time:{" "}
          <span className="text-white font-semibold">
            {formatDateLong(success.date)} at {formatTime12h(success.time)}
          </span>
        </p>
        <p className="text-sm text-[#9CA3AF]">
          Confirmation sent to {booking.customerName} via email and SMS.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#9CA3AF]">
        Current: <span className="text-white font-semibold">{formatDateTimeLong(scheduledIso)}</span>
      </p>
      <p className="text-xs text-[#9CA3AF] rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
        Admin can move this booking to any day and time. Customer lead-time rules (Ceramic 3-day notice, early-slot limits, Sunday / service-day blocks) do not apply here.
      </p>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">New date</p>
        <AdminDatePicker value={pickedDate} onChange={setPickedDate} minDate={today} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">New time</p>
        <AdminTimePicker value={pickedTime} onChange={setPickedTime} />
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
      )}
      <p className="text-xs text-[#9CA3AF]">
        Confirming sends the customer the standard reschedule email and moves the Google Calendar event.
      </p>
      <div className="flex justify-end gap-3">
        <PrimaryButton onClick={submit} disabled={!pickedDate || !pickedTime || isCurrentSlot || submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isCurrentSlot ? "Pick a different time" : "Confirm new time"}</span>
        </PrimaryButton>
      </div>
    </div>
  );
}
