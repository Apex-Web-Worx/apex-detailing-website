import { useEffect, useMemo, useState } from "react";
import { useRoute, Link } from "wouter";
import {
  useGetManagedBooking,
  useCancelManagedBooking,
  useRescheduleManagedBooking,
  useGetAvailability,
  type Booking,
} from "@workspace/api-client-react";
import {
  formatDateLong,
  formatDateShort,
  formatDateTimeLong,
  formatDuration,
  formatTime12h,
  todayDateString,
  addDaysToDateString,
} from "@/lib/format";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Phone,
  X,
} from "lucide-react";

type Mode = "view" | "cancel" | "reschedule";

function getTokenFromLocation(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("token") ?? "";
}

function scheduledAtToShopDate(iso: string): string {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

function scheduledAtToShopTime(iso: string): string {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return fmt.format(d);
}

export default function ManagePage() {
  const [, params] = useRoute<{ id: string }>("/manage/:id");
  const id = Number(params?.id);
  const token = useMemo(getTokenFromLocation, []);

  const validId = Number.isFinite(id) && id > 0;
  const validToken = token.length > 0;

  // Orval's generated `UseQueryOptions` insists on a `queryKey`, but the
  // wrapper builds the queryKey itself from (id, params). The partial we
  // pass is enough at runtime — cast through `unknown` to satisfy TS.
  const queryOptions = {
    enabled: validId && validToken,
    retry: false,
  } as unknown as Parameters<typeof useGetManagedBooking<Booking, Error>>[2] &
    object;
  const query = useGetManagedBooking(
    validId ? id : 0,
    { token },
    { query: queryOptions as never },
  );

  if (!validId || !validToken) {
    return <ManageShell><InvalidLink /></ManageShell>;
  }

  if (query.isLoading) {
    return (
      <ManageShell>
        <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading your booking…
        </div>
      </ManageShell>
    );
  }

  if (query.error || !query.data) {
    return <ManageShell><InvalidLink /></ManageShell>;
  }

  return (
    <ManageShell>
      <ManageBody booking={query.data} token={token} onRefresh={() => query.refetch()} />
    </ManageShell>
  );
}

/* ---------- Shell ---------- */
function ManageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Apex Detailing</span>
          </Link>
          <div className="text-sm font-bold tracking-widest text-white/80">
            MANAGE BOOKING
          </div>
          <a
            href="tel:417-527-6165"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-[#3496FF] transition"
          >
            <Phone className="w-4 h-4" />
            417-527-6165
          </a>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">{children}</main>
    </div>
  );
}

function InvalidLink() {
  return (
    <section className="text-center max-w-xl mx-auto pt-12">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
        <X className="w-8 h-8 text-red-400" />
      </div>
      <h1 className="text-3xl font-black mb-3">This link is invalid</h1>
      <p className="text-gray-400 mb-8">
        Your booking link has expired or is incorrect. Give us a call and we'll
        sort it out.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="tel:417-527-6165"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" /> Call 417-527-6165
        </a>
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

/* ---------- Body ---------- */
function ManageBody({
  booking,
  token,
  onRefresh,
}: {
  booking: Booking;
  token: string;
  onRefresh: () => void;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [success, setSuccess] = useState<"cancelled" | "rescheduled" | null>(null);

  const scheduledIso =
    typeof booking.scheduledAt === "string"
      ? booking.scheduledAt
      : new Date(booking.scheduledAt as unknown as string).toISOString();

  const isCancelled = booking.status === "cancelled";
  const isPast = new Date(scheduledIso).getTime() < Date.now();
  const locked = isCancelled || isPast;

  if (success === "cancelled") {
    return <CancelledView booking={booking} />;
  }
  if (success === "rescheduled") {
    return <RescheduledView booking={booking} />;
  }

  return (
    <section>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3496FF]/10 border border-[#3496FF]/30 text-[#3496FF] text-xs font-bold uppercase tracking-wider mb-4">
          {isCancelled ? (
            <>
              <X className="w-3 h-3" /> Cancelled
            </>
          ) : isPast ? (
            <>
              <Clock className="w-3 h-3" /> Past appointment
            </>
          ) : (
            <>
              <Check className="w-3 h-3" /> Confirmed
            </>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-2">
          Hi {booking.customerName.split(" ")[0]}
        </h1>
        <p className="text-gray-400">
          Here are the details of your booking. You can reschedule or cancel
          below.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 mb-6">
        <Row label="Confirmation" value={`#${String(booking.id).padStart(5, "0")}`} />
        <Row label="Service" value={booking.serviceName} />
        <Row label="When" value={formatDateTimeLong(scheduledIso)} highlight />
        <Row label="Duration" value={formatDuration(booking.serviceDurationMinutes)} />
        <Row label="Vehicle" value={booking.vehicle} />
      </div>

      <div className="p-4 rounded-xl bg-[#3496FF]/5 border border-[#3496FF]/20 text-sm text-gray-300 flex gap-3 mb-8">
        <MapPin className="w-5 h-5 text-[#3496FF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-1">Drop-off address</p>
          <p>1114 E Lakota St, Nixa, MO 65714</p>
        </div>
      </div>

      {locked ? (
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 text-center text-gray-400">
          {isCancelled
            ? "This booking has been cancelled. Want to come back? Book another time anytime."
            : "This appointment has already passed."}
          <div className="mt-4">
            <Link
              href="/book"
              className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold hover:shadow-lg hover:shadow-[#3496FF]/30 transition"
            >
              Book again
            </Link>
          </div>
        </div>
      ) : mode === "view" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setMode("reschedule")}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Reschedule
          </button>
          <button
            onClick={() => setMode("cancel")}
            className="px-6 py-4 rounded-xl border border-red-500/30 text-red-300 font-bold hover:bg-red-500/10 transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel booking
          </button>
        </div>
      ) : mode === "cancel" ? (
        <CancelPanel
          bookingId={booking.id}
          token={token}
          onBack={() => setMode("view")}
          onCancelled={() => {
            setSuccess("cancelled");
            onRefresh();
          }}
        />
      ) : (
        <ReschedulePanel
          booking={booking}
          token={token}
          onBack={() => setMode("view")}
          onRescheduled={() => {
            setSuccess("rescheduled");
            onRefresh();
          }}
        />
      )}
    </section>
  );
}

/* ---------- Cancel ---------- */
function CancelPanel({
  bookingId,
  token,
  onBack,
  onCancelled,
}: {
  bookingId: number;
  token: string;
  onBack: () => void;
  onCancelled: () => void;
}) {
  const mutation = useCancelManagedBooking();
  const errorMsg =
    mutation.error instanceof Error ? mutation.error.message : null;

  const submit = async () => {
    try {
      await mutation.mutateAsync({ id: bookingId, params: { token } });
      onCancelled();
    } catch {
      // displayed below
    }
  };

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
      <h2 className="text-xl font-bold mb-2">Cancel this booking?</h2>
      <p className="text-gray-300 text-sm mb-6">
        This will free up your time slot and send you a confirmation email.
        You can rebook anytime.
      </p>
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={onBack}
          disabled={mutation.isPending}
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition disabled:opacity-50"
        >
          Keep my booking
        </button>
        <button
          onClick={submit}
          disabled={mutation.isPending}
          className="px-6 py-3 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Cancelling…
            </>
          ) : (
            <>
              <X className="w-4 h-4" /> Yes, cancel
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function CancelledView({ booking }: { booking: Booking }) {
  return (
    <section className="text-center max-w-xl mx-auto pt-8">
      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#5a4a6e] to-[#3a4a5e] flex items-center justify-center mb-6">
        <Check className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-black mb-3">Booking cancelled</h1>
      <p className="text-gray-400 mb-8">
        We've cancelled <strong className="text-white">{booking.serviceName}</strong>{" "}
        for {booking.customerName.split(" ")[0]}. A confirmation email is on its
        way.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/book"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold hover:shadow-lg hover:shadow-[#3496FF]/30 transition"
        >
          Book another time
        </Link>
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

/* ---------- Reschedule ---------- */
function ReschedulePanel({
  booking,
  token,
  onBack,
  onRescheduled,
}: {
  booking: Booking;
  token: string;
  onBack: () => void;
  onRescheduled: () => void;
}) {
  const scheduledIso =
    typeof booking.scheduledAt === "string"
      ? booking.scheduledAt
      : new Date(booking.scheduledAt as unknown as string).toISOString();
  const currentDate = scheduledAtToShopDate(scheduledIso);
  const currentTime = scheduledAtToShopTime(scheduledIso);

  const today = todayDateString();
  const [windowStart, setWindowStart] = useState(today);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);

  const endDate = useMemo(
    () => addDaysToDateString(windowStart, 13),
    [windowStart],
  );

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

  const mutation = useRescheduleManagedBooking();
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => {
    setConflict(null);
  }, [pickedDate, pickedTime]);

  const submit = async () => {
    if (!pickedDate || !pickedTime) return;
    setConflict(null);
    try {
      await mutation.mutateAsync({
        id: booking.id,
        params: { token },
        data: { date: pickedDate, time: pickedTime },
      });
      onRescheduled();
    } catch (err) {
      setConflict(err instanceof Error ? err.message : "Could not reschedule.");
    }
  };

  const isCurrentSlot =
    pickedDate === currentDate && pickedTime === currentTime;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Pick a new date & time</h2>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-5">
        Current: <span className="text-white font-semibold">{formatDateTimeLong(scheduledIso)}</span>
      </p>

      {/* Date picker */}
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
              className="w-8 h-8 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-lg border border-white/10 hover:bg-white/5 flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-400 py-8 justify-center text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking availability…
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {days.map((d) => {
              const allFull = d.slots.every((s) => !s.available);
              // Treat the customer's *current* slot as available so they can
              // pick the same day (just a different time).
              const dayHasOurCurrent = d.date === currentDate;
              const isPast = d.date < today;
              const disabled =
                isPast || d.closed || (allFull && !dayHasOurCurrent);
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
                      ? "bg-gradient-to-br from-[#A886CD] to-[#3496FF] text-white"
                      : disabled
                        ? "bg-white/[0.02] text-gray-600 cursor-not-allowed opacity-50"
                        : "bg-white/[0.04] hover:bg-white/[0.08] text-white"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {formatDateShort(d.date).split(",")[0]}
                  </div>
                  <div className="text-lg font-bold leading-tight mt-1">
                    {Number(d.date.split("-")[2])}
                  </div>
                  <div className="text-[10px] mt-1 opacity-70">
                    {isPast
                      ? "Past"
                      : d.closed
                        ? "Closed"
                        : allFull && !dayHasOurCurrent
                          ? "Full"
                          : "Open"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Time slots */}
      {selectedDay && !selectedDay.closed && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-5">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-3">
            <Clock className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
            {formatDateLong(selectedDay.date)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {selectedDay.slots.map((slot) => {
              // Customer's own slot looks available even though the server
              // marks it taken.
              const isOwnCurrent =
                selectedDay.date === currentDate && slot.time === currentTime;
              const available = slot.available || isOwnCurrent;
              const isPicked = pickedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  onClick={() => setPickedTime(slot.time)}
                  disabled={!available}
                  className={`py-3 rounded-xl font-bold transition text-sm ${
                    isPicked
                      ? "bg-gradient-to-br from-[#A886CD] to-[#3496FF] text-white"
                      : available
                        ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                        : "bg-white/[0.02] text-gray-600 cursor-not-allowed line-through"
                  }`}
                >
                  {formatTime12h(slot.time)}
                  {isOwnCurrent && (
                    <div className="text-[10px] font-normal opacity-70 mt-0.5">
                      (your current)
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {conflict && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {conflict}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={onBack}
          disabled={mutation.isPending}
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={submit}
          disabled={
            !pickedDate || !pickedTime || isCurrentSlot || mutation.isPending
          }
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Updating…
            </>
          ) : (
            <>
              {isCurrentSlot ? "Pick a different time" : "Confirm new time"}
              <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function RescheduledView({ booking }: { booking: Booking }) {
  const scheduledIso =
    typeof booking.scheduledAt === "string"
      ? booking.scheduledAt
      : new Date(booking.scheduledAt as unknown as string).toISOString();
  return (
    <section className="text-center max-w-xl mx-auto pt-8">
      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#A886CD] to-[#3496FF] flex items-center justify-center mb-6 shadow-2xl shadow-[#3496FF]/30">
        <Check className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-black mb-3">You're rescheduled!</h1>
      <p className="text-gray-400 mb-8">
        Your new appointment is locked in. We'll send you a confirmation
        email.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left mb-6">
        <Row label="Service" value={booking.serviceName} />
        <Row label="New time" value={formatDateTimeLong(scheduledIso)} highlight />
        <Row label="Vehicle" value={booking.vehicle} />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}

/* ---------- Row ---------- */
function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <span className="text-sm text-gray-400 font-medium">{label}</span>
      <span
        className={`text-right font-semibold ${
          highlight
            ? "text-lg bg-gradient-to-r from-[#A886CD] to-[#3496FF] bg-clip-text text-transparent"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
