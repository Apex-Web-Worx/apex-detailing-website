import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import {
  useListServices,
  useGetAvailability,
  useCreateBooking,
  type Service,
  type Booking,
} from "@workspace/api-client-react";
import {
  formatDuration,
  formatTime12h,
  formatDateLong,
  formatDateShort,
  formatDateTimeLong,
  todayDateString,
  addDaysToDateString,
} from "@/lib/format";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Phone,
} from "lucide-react";

type Step = "service" | "datetime" | "info" | "confirm";

interface Form {
  customerName: string;
  email: string;
  phone: string;
  vehicle: string;
  notes: string;
}

const EMPTY_FORM: Form = {
  customerName: "",
  email: "",
  phone: "",
  vehicle: "",
  notes: "",
};

export default function BookingPage() {
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const stepIndex = ["service", "datetime", "info", "confirm"].indexOf(step);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to site</span>
          </Link>
          <div className="text-sm font-bold tracking-widest text-white/80">
            BOOK A DETAIL
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

      {/* Stepper */}
      {!confirmed && (
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center justify-between gap-2">
            {[
              { label: "Service", n: 0 },
              { label: "Date & Time", n: 1 },
              { label: "Your Info", n: 2 },
              { label: "Confirm", n: 3 },
            ].map((s, i) => {
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <div key={s.label} className="flex-1 flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                        active
                          ? "bg-gradient-to-br from-[#A886CD] to-[#3496FF] border-transparent text-white"
                          : done
                            ? "bg-[#3496FF]/20 border-[#3496FF] text-[#3496FF]"
                            : "border-white/20 text-gray-500"
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                        active ? "text-white" : done ? "text-[#3496FF]" : "text-gray-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={`flex-1 h-0.5 mb-6 ${
                        done ? "bg-[#3496FF]" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8 pb-32">
        {confirmed ? (
          <ConfirmationView booking={confirmed} />
        ) : step === "service" ? (
          <ServiceStep
            selected={service}
            onSelect={(s) => {
              // Clear any previously-picked slot when the service changes,
              // since service-specific availability (e.g. Friday Express
              // only) means the prior slot may no longer be valid.
              if (!service || s.id !== service.id) {
                setDate(null);
                setTime(null);
              }
              setService(s);
              setStep("datetime");
            }}
          />
        ) : step === "datetime" ? (
          <DateTimeStep
            service={service!}
            date={date}
            time={time}
            onSelect={(d, t) => {
              setDate(d);
              setTime(t);
              setStep("info");
            }}
            onBack={() => setStep("service")}
          />
        ) : step === "info" ? (
          <InfoStep
            form={form}
            onChange={setForm}
            onBack={() => setStep("datetime")}
            onNext={() => setStep("confirm")}
          />
        ) : (
          <ConfirmStep
            service={service!}
            date={date!}
            time={time!}
            form={form}
            onBack={() => setStep("info")}
            onConfirmed={(b) => setConfirmed(b)}
          />
        )}
      </main>
    </div>
  );
}

/* ---------- Service step ---------- */
function ServiceStep({
  selected,
  onSelect,
}: {
  selected: Service | null;
  onSelect: (s: Service) => void;
}) {
  const { data, isLoading, error } = useListServices();

  return (
    <section>
      <h1 className="text-3xl sm:text-4xl font-black mb-2">Choose your service</h1>
      <p className="text-gray-400 mb-8">
        Pick the package that fits your vehicle. You can always upgrade in person.
      </p>

      {isLoading && <Loading label="Loading services…" />}
      {error && <ErrorMessage>Couldn't load services. Try again.</ErrorMessage>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.map((s) => {
          const isSelected = selected?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`text-left p-6 rounded-2xl border transition group hover:-translate-y-0.5 hover:shadow-2xl ${
                isSelected
                  ? "border-[#3496FF] bg-gradient-to-br from-[#3496FF]/10 to-[#A886CD]/5"
                  : "border-white/10 bg-white/[0.02] hover:border-[#3496FF]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold text-white">{s.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                {s.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(s.durationMinutes)}
                </span>
                <span className="text-[#3496FF] font-bold flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition">
                  Select <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Date & Time step ---------- */
function DateTimeStep({
  service,
  date,
  time,
  onSelect,
  onBack,
}: {
  service: Service;
  date: string | null;
  time: string | null;
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}) {
  const today = todayDateString();
  const [windowStart, setWindowStart] = useState(today);
  const [pickedDate, setPickedDate] = useState<string | null>(date);
  const [pickedTime, setPickedTime] = useState<string | null>(time);

  const endDate = useMemo(() => addDaysToDateString(windowStart, 13), [windowStart]);

  const { data, isLoading } = useGetAvailability({
    startDate: windowStart,
    endDate,
    serviceId: service.id,
  });

  const days = data ?? [];
  const selectedDay = days.find((d) => d.date === pickedDate);

  // If service-filtered availability now reports the previously-picked
  // slot as missing/unavailable (e.g. user switched from Express to
  // Interior after picking a Friday slot), clear the stale selection so
  // the Continue button can't ferry an invalid combo to the API.
  const pickedSlotStillValid =
    !pickedDate ||
    !pickedTime ||
    Boolean(
      selectedDay &&
        !selectedDay.closed &&
        selectedDay.slots.some((s) => s.time === pickedTime && s.available),
    );
  useEffect(() => {
    if (!data) return;
    if (pickedDate && (!selectedDay || selectedDay.closed)) {
      setPickedDate(null);
      setPickedTime(null);
      return;
    }
    if (
      pickedTime &&
      selectedDay &&
      !selectedDay.slots.some((s) => s.time === pickedTime && s.available)
    ) {
      setPickedTime(null);
    }
  }, [data, pickedDate, pickedTime, selectedDay]);

  const goPrev = () => {
    const prev = addDaysToDateString(windowStart, -14);
    if (prev < today) setWindowStart(today);
    else setWindowStart(prev);
  };
  const goNext = () => setWindowStart(addDaysToDateString(windowStart, 14));

  return (
    <section>
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Change service
      </button>
      <h1 className="text-3xl sm:text-4xl font-black mb-2">Pick a date & time</h1>
      <p className="text-gray-400 mb-8">
        Booking <span className="text-white font-semibold">{service.name}</span> ·{" "}
        {formatDuration(service.durationMinutes)}
      </p>

      {/* Date picker */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">
            <Calendar className="w-4 h-4 inline mr-2 -mt-0.5" />
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
          <Loading label="Checking availability…" />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {days.map((d) => {
              const allFull = d.slots.every((s) => !s.available);
              const disabled = d.closed || allFull;
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
                        ? "bg-white/[0.02] text-gray-600 cursor-not-allowed"
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
                    {d.closed ? "Closed" : allFull ? "Full" : "Open"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Time slots */}
      {selectedDay && !selectedDay.closed && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-4">
            <Clock className="w-4 h-4 inline mr-2 -mt-0.5" />
            {formatDateLong(selectedDay.date)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedDay.slots.map((slot) => {
              const isPicked = pickedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  onClick={() => setPickedTime(slot.time)}
                  disabled={!slot.available}
                  className={`py-4 rounded-xl font-bold transition ${
                    isPicked
                      ? "bg-gradient-to-br from-[#A886CD] to-[#3496FF] text-white"
                      : slot.available
                        ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                        : "bg-white/[0.02] text-gray-600 cursor-not-allowed line-through"
                  }`}
                >
                  {formatTime12h(slot.time)}
                </button>
              );
            })}
          </div>
          {selectedDay.slots.every((s) => !s.available) && (
            <p className="text-sm text-gray-400 mt-4">
              All slots booked for this day. Pick another date or call us at{" "}
              <a href="tel:417-527-6165" className="text-[#3496FF] underline">
                417-527-6165
              </a>
              .
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          disabled={!pickedDate || !pickedTime || !pickedSlotStillValid}
          onClick={() => onSelect(pickedDate!, pickedTime!)}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center gap-2"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

/* ---------- Info step ---------- */
function InfoStep({
  form,
  onChange,
  onBack,
  onNext,
}: {
  form: Form;
  onChange: (f: Form) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid =
    form.customerName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.replace(/\D/g, "").length >= 7 &&
    form.vehicle.trim().length > 0;

  return (
    <section>
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Change time
      </button>
      <h1 className="text-3xl sm:text-4xl font-black mb-2">Your details</h1>
      <p className="text-gray-400 mb-8">
        We'll send a confirmation and reminder to the contact info you provide.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          required
          value={form.customerName}
          onChange={(v) => onChange({ ...form, customerName: v })}
          placeholder="Jane Smith"
        />
        <Field
          label="Email"
          required
          type="email"
          value={form.email}
          onChange={(v) => onChange({ ...form, email: v })}
          placeholder="jane@example.com"
        />
        <Field
          label="Phone"
          required
          type="tel"
          value={form.phone}
          onChange={(v) => onChange({ ...form, phone: v })}
          placeholder="(417) 555-0123"
        />
        <Field
          label="Vehicle (Year / Make / Model)"
          required
          value={form.vehicle}
          onChange={(v) => onChange({ ...form, vehicle: v })}
          placeholder="2022 Toyota Tacoma"
        />
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            placeholder="Anything we should know? Pet hair, problem stains, etc."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#3496FF] focus:outline-none focus:ring-2 focus:ring-[#3496FF]/20 transition resize-none"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mt-6">
        By booking, you agree to receive appointment confirmations and a
        reminder text from Apex Detailing at the phone number above. Reply
        STOP at any time to opt out, or HELP for help. Message and data
        rates may apply. Message frequency varies. See our{" "}
        <Link href="/privacy" className="text-[#3496FF] hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-[#3496FF] hover:underline">
          Terms &amp; Conditions
        </Link>
        .
      </p>

      <div className="flex justify-end mt-6">
        <button
          disabled={!valid}
          onClick={onNext}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center gap-2"
        >
          Review booking <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">
        {label}
        {required && <span className="text-[#3496FF] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#3496FF] focus:outline-none focus:ring-2 focus:ring-[#3496FF]/20 transition"
      />
    </div>
  );
}

/* ---------- Confirm step ---------- */
function ConfirmStep({
  service,
  date,
  time,
  form,
  onBack,
  onConfirmed,
}: {
  service: Service;
  date: string;
  time: string;
  form: Form;
  onBack: () => void;
  onConfirmed: (b: Booking) => void;
}) {
  const mutation = useCreateBooking();

  const submit = async () => {
    try {
      const result = await mutation.mutateAsync({
        data: {
          serviceId: service.id,
          date,
          time,
          customerName: form.customerName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          vehicle: form.vehicle.trim(),
          notes: form.notes.trim(),
        },
      });
      onConfirmed(result);
    } catch {
      // Error displayed below
    }
  };

  const errorMsg =
    mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <section>
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Edit details
      </button>
      <h1 className="text-3xl sm:text-4xl font-black mb-2">Review & confirm</h1>
      <p className="text-gray-400 mb-8">
        Double-check everything below, then confirm your booking.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        <SummaryRow label="Service" value={service.name} />
        <SummaryRow
          label="Duration"
          value={formatDuration(service.durationMinutes)}
        />
        <SummaryRow
          label="When"
          value={`${formatDateLong(date)} at ${formatTime12h(time)}`}
          highlight
        />
        <SummaryRow label="Customer" value={form.customerName} />
        <SummaryRow label="Email" value={form.email} />
        <SummaryRow label="Phone" value={form.phone} />
        <SummaryRow label="Vehicle" value={form.vehicle} />
        {form.notes && <SummaryRow label="Notes" value={form.notes} />}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[#3496FF]/5 border border-[#3496FF]/20 text-sm text-gray-300 flex gap-3">
        <MapPin className="w-5 h-5 text-[#3496FF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-1">Drop off at our shop</p>
          <p>1114 E Lakota St, Nixa, MO 65714. We're open Mon–Sat 8 AM – 6 PM.</p>
        </div>
      </div>

      {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition"
        >
          Back
        </button>
        <button
          disabled={mutation.isPending}
          onClick={submit}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Booking…
            </>
          ) : (
            <>
              Confirm booking <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function SummaryRow({
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
            ? "text-xl bg-gradient-to-r from-[#A886CD] to-[#3496FF] bg-clip-text text-transparent"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------- Confirmation view ---------- */
function ConfirmationView({ booking }: { booking: Booking }) {
  return (
    <section className="text-center max-w-2xl mx-auto pt-12">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#A886CD] to-[#3496FF] flex items-center justify-center mb-6 shadow-2xl shadow-[#3496FF]/30">
        <Check className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black mb-3">You're booked!</h1>
      <p className="text-gray-400 text-lg mb-8">
        We've got your appointment locked in. See you soon, {booking.customerName.split(" ")[0]}.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
              Confirmation
            </div>
            <div className="text-lg font-black">#{String(booking.id).padStart(5, "0")}</div>
          </div>
        </div>
        <SummaryRow label="Service" value={booking.serviceName} />
        <SummaryRow
          label="When"
          value={formatDateTimeLong(
            typeof booking.scheduledAt === "string"
              ? booking.scheduledAt
              : new Date(booking.scheduledAt as unknown as string).toISOString(),
          )}
        />
        <SummaryRow label="Vehicle" value={booking.vehicle} />
      </div>

      <div className="p-4 rounded-xl bg-[#3496FF]/5 border border-[#3496FF]/20 text-sm text-gray-300 flex gap-3 text-left mb-8">
        <MapPin className="w-5 h-5 text-[#3496FF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-1">Drop-off address</p>
          <p>1114 E Lakota St, Nixa, MO 65714 — call 417-527-6165 if you need anything.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition"
        >
          Back to home
        </Link>
        <a
          href="tel:417-527-6165"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" /> Call the shop
        </a>
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */
function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-400 py-12 justify-center">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
      {children}
    </div>
  );
}

// Suppress unused-symbol warnings for icons used only in JSX strings.
void DollarSign;
