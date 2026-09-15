import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  adminUpdateBooking,
  adminRescheduleBooking,
  useGetAvailability,
  type Booking,
} from "@workspace/api-client-react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  X as XIcon,
} from "lucide-react";
import {
  addDaysToDateString,
  formatDateLong,
  formatDateShort,
  formatDateTimeLong,
  formatTime12h,
  todayDateString,
} from "@/lib/format";
import { parseScheduledAt, scheduledAtToShopDate, scheduledAtToShopTime } from "../utils";
import { fieldClass, PrimaryButton } from "./ui";

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
            className="w-11 h-11 flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5 touch-manipulation"
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
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <PrimaryButton type="submit" disabled={!dirty || submitting} className="w-full sm:w-auto min-h-12">
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
  const scheduledDate = parseScheduledAt(
    booking.scheduledAt as unknown as string | Date | number | null,
  );
  const scheduledIso = scheduledDate?.toISOString() ?? "";
  const currentDate = scheduledAtToShopDate(scheduledIso);
  const currentTime = scheduledAtToShopTime(scheduledIso);
  const today = todayDateString();
  const [windowStart, setWindowStart] = useState(today);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ date: string; time: string } | null>(null);
  const endDate = useMemo(() => addDaysToDateString(windowStart, 13), [windowStart]);
  const { data, isLoading } = useGetAvailability({
    startDate: windowStart,
    endDate,
    serviceId: booking.serviceId,
  });
  const days = data ?? [];
  const selectedDay = days.find((d) => d.date === pickedDate);
  const goPrev = () => {
    const prev = addDaysToDateString(windowStart, -14);
    setWindowStart(prev < today ? today : prev);
  };
  const goNext = () => setWindowStart(addDaysToDateString(windowStart, 14));

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
        { date: pickedDate, time: pickedTime },
        { headers: { "x-admin-token": token } },
      );
      setSuccess({ date: pickedDate, time: pickedTime });
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
    <div>
      <p className="text-sm text-[#9CA3AF] mb-5">
        Current: <span className="text-white font-semibold">{formatDateTimeLong(scheduledIso)}</span>
      </p>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
            Select a day
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={windowStart === today}
              className="w-11 h-11 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="w-11 h-11 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center touch-manipulation"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-3 text-[#9CA3AF] py-8 justify-center text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking availability…
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {days.map((d) => {
              const allFull = d.slots.every((s) => !s.available);
              const dayHasOurCurrent = d.date === currentDate;
              const isPast = d.date < today;
              const disabled = isPast || d.closed || (allFull && !dayHasOurCurrent);
              const isPicked = pickedDate === d.date;
              return (
                <button
                  key={d.date}
                  onClick={() => {
                    setPickedDate(d.date);
                    setPickedTime(null);
                  }}
                  disabled={disabled}
                  className={`p-3 rounded-xl text-center transition ${
                    isPicked
                      ? "bg-[#FF2AD4] text-white"
                      : disabled
                        ? "bg-white/[0.02] text-gray-600 cursor-not-allowed opacity-50"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-white"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {formatDateShort(d.date).split(",")[0]}
                  </div>
                  <div className="text-lg font-bold leading-tight mt-1">{Number(d.date.split("-")[2])}</div>
                  <div className="text-[10px] mt-1 opacity-70">
                    {isPast ? "Past" : d.closed ? "Closed" : allFull && !dayHasOurCurrent ? "Full" : "Open"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {selectedDay && !selectedDay.closed && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-5">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-3">
            <Clock className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
            {formatDateLong(selectedDay.date)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {selectedDay.slots.map((slot) => {
              const isOwnCurrent = selectedDay.date === currentDate && slot.time === currentTime;
              const available = slot.available || isOwnCurrent;
              const isPicked = pickedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  onClick={() => setPickedTime(slot.time)}
                  disabled={!available}
                  className={`py-3 rounded-xl font-bold transition text-sm ${
                    isPicked
                      ? "bg-[#FF2AD4] text-white"
                      : available
                        ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                        : "bg-white/[0.02] text-gray-600 cursor-not-allowed line-through"
                  }`}
                >
                  {formatTime12h(slot.time)}
                  {isOwnCurrent && <div className="text-[10px] font-normal opacity-70 mt-0.5">(current)</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>
      )}
      <p className="text-xs text-[#9CA3AF] mb-4">
        Confirming sends the customer the standard reschedule email and moves the Google Calendar event.
      </p>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <PrimaryButton
          onClick={submit}
          disabled={!pickedDate || !pickedTime || isCurrentSlot || submitting}
          className="w-full sm:w-auto min-h-12"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isCurrentSlot ? "Pick a different time" : "Confirm new time"}</span>
        </PrimaryButton>
      </div>
    </div>
  );
}
