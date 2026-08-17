import {
  useState,
  useMemo,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { forceDismissSplash } from "@/lib/bootSplash";
import { Link } from "wouter";
import {
  useListServices,
  useGetAvailability,
  useCreateBooking,
  type Service,
  type Booking,
} from "@workspace/api-client-react";
import {
  formatTime12h,
  formatDateLong,
  formatDateShort,
  formatDateTimeLong,
  formatPrice,
  formatDuration,
  isQuoteOnlyService,
  todayDateString,
  addDaysToDateString,
} from "@/lib/format";
import VehiclePhotoPicker from "@/components/VehiclePhotoPicker";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";
import { packageDescKey, packageTitleKey, BOOKING_SLUG_TO_PKG, PKG_PHOTO } from "@/i18n/packageMap";
import OptimizedImage, { imageUrl } from "@/components/OptimizedImage";
import {
  revokePickedPhotos,
  uploadBookingPhotos,
  type PickedPhoto,
} from "@/lib/bookingPhotos";

// Slug-based merchandising badges shown on the service-picker cards.
// Keep these short — the badge sits inline next to the title.
const SERVICE_BADGES: Record<
  string,
  { label: string; tone: "popular" | "value" | "express" | "notice" }
> = {
  "apex-interior-detailing": { label: "Most Booked", tone: "popular" },
  "apex-full-detailing": { label: "Best Value", tone: "value" },
  "apex-express-interior-detailing": { label: "Express", tone: "express" },
  "apex-ceramic-coating": { label: "3-Day Notice", tone: "notice" },
};
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Zap,
  Loader2,
  MapPin,
  Phone,
  Wand2,
  Droplets,
  Car,
  Sparkles,
  CheckCircle2,
  Shield,
} from "lucide-react";

const SERVICE_ICONS: Record<string, { icon: typeof Wand2; color: string }> = {
  "apex-full-detailing": { icon: Wand2, color: "text-[#FF1AD8]" },
  "apex-interior-detailing": { icon: Droplets, color: "text-[#FF1AD8]" },
  "apex-express-interior-detailing": { icon: Droplets, color: "text-[#FF1AD8]" },
  "apex-exterior-detailing": { icon: Car, color: "text-[#00E5FF]" },
  "apex-wash-clay-wax": { icon: Sparkles, color: "text-[#FF1AD8]" },
  "apex-headlight-restoration": { icon: CheckCircle2, color: "text-[#00E5FF]" },
  "apex-ceramic-coating": { icon: Shield, color: "text-[#00E5FF]" },
  "apex-paint-correction": { icon: Sparkles, color: "text-[#FF1AD8]" },
};

type Step = "service" | "datetime" | "info" | "confirm";

interface Form {
  customerName: string;
  email: string;
  phone: string;
  vehicle: string;
  notes: string;
  smsConsent: boolean;
}

const EMPTY_FORM: Form = {
  customerName: "",
  email: "",
  phone: "",
  vehicle: "",
  notes: "",
  smsConsent: true,
};

function locServiceName(
  t: (key: string) => string,
  service: { slug: string; name: string },
) {
  const key = packageTitleKey(service.slug);
  return key ? t(key) : service.name;
}

// Auto-format phone as user types: (XXX) XXX-XXXX
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function BookingPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [vehiclePhotos, setVehiclePhotos] = useState<PickedPhoto[]>([]);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [photoWarning, setPhotoWarning] = useState(false);
  const vehiclePhotosRef = useRef(vehiclePhotos);
  vehiclePhotosRef.current = vehiclePhotos;

  useEffect(() => {
    forceDismissSplash();
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.documentElement.classList.remove("is-booting");
    return () => revokePickedPhotos(vehiclePhotosRef.current);
  }, []);

  const stepIndex = ["service", "datetime", "info", "confirm"].indexOf(step);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          {confirmed || step === "service" ? (
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{t("book.backSite")}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (step === "datetime") setStep("service");
                else if (step === "info") setStep("datetime");
                else if (step === "confirm") setStep("info");
              }}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t("book.backTo")}{" "}
                {step === "datetime"
                  ? t("book.backService")
                  : step === "info"
                    ? t("book.backDate")
                    : t("book.backInfo")}
              </span>
            </button>
          )}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="text-sm font-bold tracking-widest text-white/80">
              {t("book.title")}
            </div>
          </div>
          <a
            href="tel:417-527-6165"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-[#00E5FF] transition"
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
              { label: t("book.step.service"), n: 0 },
              { label: t("book.step.datetime"), n: 1 },
              { label: t("book.step.info"), n: 2 },
              { label: t("book.step.confirm"), n: 3 },
            ].map((s, i) => {
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <div key={s.label} className="flex-1 flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className={`relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition overflow-hidden ${
                        active
                          ? "text-white border-0 shadow-[0_0_12px_rgba(255,26,216,0.3)]"
                          : done
                            ? "bg-[#00E5FF]/15 border-2 border-[#00E5FF] text-[#00E5FF]"
                            : "border-2 border-white/20 text-gray-500 bg-[#0a0a0a]"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]"
                        />
                      )}
                      <span className="relative z-[1]">
                        {done ? <Check className="w-4 h-4" /> : i + 1}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                        active ? "text-white" : done ? "text-[#00E5FF]" : "text-gray-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      className={`flex-1 h-0.5 mb-6 ${
                        done ? "bg-[#00E5FF]" : "bg-white/10"
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
          <ConfirmationView booking={confirmed} photoWarning={photoWarning} />
        ) : step === "service" ? (
          <ServiceStep
            selected={service}
            onPick={(s) => {
              // Clear any previously-picked slot when the service changes,
              // since service-specific availability (e.g. Friday Express
              // only) means the prior slot may no longer be valid.
              if (!service || s.id !== service.id) {
                setDate(null);
                setTime(null);
              }
              setService(s);
            }}
            onContinue={() => setStep("datetime")}
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
            photos={vehiclePhotos}
            onPhotosChange={setVehiclePhotos}
            onBack={() => setStep("datetime")}
            onNext={() => setStep("confirm")}
          />
        ) : (
          <ConfirmStep
            service={service!}
            date={date!}
            time={time!}
            form={form}
            photos={vehiclePhotos}
            onBack={() => setStep("info")}
            onConfirmed={(b, photosFailed) => {
              setPhotoWarning(photosFailed);
              setConfirmed(b);
            }}
          />
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0a] mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>{t("book.questions")}</span>
            <a
              href="tel:417-527-6165"
              className="text-[#00E5FF] font-semibold hover:underline"
            >
              417-527-6165
            </a>
            <span className="hidden sm:inline">{t("book.byPhone")}</span>
          </div>
          <nav className="flex items-center gap-5">
            <Link href="/" className="hover:text-white transition">
              {t("book.home")}
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              {t("footer.terms")}
            </Link>
          </nav>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-6 text-xs text-gray-600 text-center sm:text-left">
          You'll receive transactional SMS notifications by default. If
          you prefer not to receive texts, leave the box unchecked and we'll
          contact you by email and phone only. Reply STOP to opt out at any
          time. Msg &amp; data rates may apply. See{" "}
          <Link href="/privacy" className="underline hover:text-gray-400">
            Privacy Policy
          </Link>
          .
        </div>
        <div className="py-4 border-t border-white/10 flex flex-col items-center justify-center gap-2 text-center">
          <a
            href="https://www.apexwebworx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 hover:opacity-100 transition-all"
            aria-label="APEX WEB WORX"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/apex-webworx-logo.png`}
              alt="APEX WEB WORX"
              className="h-14 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest group-hover:text-white transition-colors">
              Designed and developed by <span className="text-[#00E5FF] font-bold">APEX WEB WORX</span>
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}

/** True when this interaction should use two-tap confirm (phones / touch). */
function isTwoTapInteraction(e?: ReactMouseEvent | ReactPointerEvent): boolean {
  if (typeof window === "undefined") return false;
  const ne = e?.nativeEvent as
    | (Event & {
        pointerType?: string;
        sourceCapabilities?: { firesTouchEvents?: boolean };
      })
    | undefined;
  if (ne?.pointerType === "touch" || ne?.pointerType === "pen") return true;
  if (ne?.sourceCapabilities?.firesTouchEvents) return true;
  if (window.matchMedia("(max-width: 1023px)").matches) return true;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return true;
  return false;
}

function readTwoTapUi(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 1023px)").matches ||
    window.matchMedia("(hover: none), (pointer: coarse)").matches
  );
}

/* ---------- Service step ---------- */
function ServiceStep({
  selected,
  onPick,
  onContinue,
}: {
  selected: Service | null;
  onPick: (s: Service) => void;
  onContinue: () => void;
}) {
  const { t } = useLanguage();
  const { data, isLoading, error } = useListServices();
  // Sync init so the first paint / first tap is not treated as desktop.
  const [twoTapUi, setTwoTapUi] = useState(readTwoTapUi);
  const [highlightedId, setHighlightedId] = useState<number | null>(
    selected?.id != null ? Number(selected.id) : null,
  );
  // Refs survive re-renders and ignore ghost double-clicks from one physical tap.
  const pendingIdRef = useRef<number | null>(
    selected?.id != null ? Number(selected.id) : null,
  );
  const armedAtRef = useRef<number>(0);

  useEffect(() => {
    const sync = () => setTwoTapUi(readTwoTapUi());
    sync();
    const mqs = [
      window.matchMedia("(max-width: 1023px)"),
      window.matchMedia("(hover: none), (pointer: coarse)"),
    ];
    mqs.forEach((mq) => mq.addEventListener("change", sync));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", sync));
  }, []);

  useEffect(() => {
    const id = selected?.id != null ? Number(selected.id) : null;
    setHighlightedId(id);
    pendingIdRef.current = id;
    if (id != null) armedAtRef.current = Date.now();
  }, [selected?.id]);

  const handleServiceTap = (s: Service, e: ReactMouseEvent) => {
    const id = Number(s.id);
    const twoTap = isTwoTapInteraction(e);

    // Mouse / trackpad desktop: one click selects and advances.
    if (!twoTap) {
      pendingIdRef.current = null;
      armedAtRef.current = 0;
      onPick(s);
      onContinue();
      return;
    }

    const pending = pendingIdRef.current;
    const elapsed = Date.now() - armedAtRef.current;
    // Same card + enough time since arming = intentional second tap.
    // Ignore <320ms repeats (ghost click / touch+click from one finger press).
    if (pending != null && pending === id && elapsed >= 320) {
      pendingIdRef.current = null;
      armedAtRef.current = 0;
      onPick(s);
      onContinue();
      return;
    }

    // First tap (or switch to another package): arm + highlight only.
    pendingIdRef.current = id;
    armedAtRef.current = Date.now();
    setHighlightedId(id);
    onPick(s);
  };

  return (
    <section className={twoTapUi && selected ? "pb-28" : undefined}>
      <h1 className="text-3xl sm:text-4xl font-black mb-2 font-display">{t("book.choose")}</h1>
      <p className="text-gray-300 mb-8">
        {twoTapUi ? t("book.chooseSubMobile") : t("book.chooseSub")}
      </p>

      {isLoading && <Loading label={t("book.loadingServices")} />}
      {error && <ErrorMessage>{t("book.loadFail")}</ErrorMessage>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {data?.map((s) => {
          const id = Number(s.id);
          const isSelected = highlightedId === id || Number(selected?.id) === id;
          const iconMeta = SERVICE_ICONS[s.slug];
          const Icon = iconMeta?.icon;
          const badge = SERVICE_BADGES[s.slug];
          const pkg = BOOKING_SLUG_TO_PKG[s.slug];
          const photo = pkg ? PKG_PHOTO[pkg] : undefined;
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={isSelected}
              onClick={(e) => handleServiceTap(s, e)}
              className={`relative flex h-full min-h-[12rem] flex-col text-left rounded-2xl border overflow-hidden transition touch-manipulation select-none [-webkit-tap-highlight-color:transparent] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-2xl [@media(hover:hover)_and_(pointer:fine)]:hover:border-[#00E5FF]/40 ${
                isSelected
                  ? "border-[#FF1AD8] bg-[#FF1AD8]/10 shadow-[0_0_24px_rgba(255,26,216,0.22)] ring-1 ring-[#FF1AD8]/50"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                  <Check className="w-3 h-3" />
                  {t("book.selected")}
                </span>
              )}
              {photo && !twoTapUi && (
                <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[#111]">
                  <OptimizedImage
                    src={imageUrl(photo)}
                    alt={t(`pkg.${pkg}.photoAlt`)}
                    className="pointer-events-none absolute inset-0 block h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                    noBlur
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent"
                    aria-hidden="true"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start gap-3 mb-3">
                {Icon && (
                  <span className={`shrink-0 p-2 rounded-lg inline-flex items-center justify-center ${
                    isSelected ? "bg-[#FF1AD8]/15 border border-[#FF1AD8]/40" : "bg-white/5"
                  }`}>
                    <Icon className={`w-5 h-5 ${iconMeta.color}`} />
                  </span>
                )}
                <div className="min-w-0 flex-1 pr-16">
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {packageTitleKey(s.slug) ? t(packageTitleKey(s.slug)!) : s.name}
                  </h3>
                  {badge && (
                    <span
                      className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        badge.tone === "notice"
                          ? "bg-amber-500/90 text-white"
                          : "badge-gold"
                      }`}
                    >
                      {badge.tone === "express" && <Zap className="w-3 h-3" />}
                      {badge.tone === "popular"
                        ? t("badge.popular")
                        : badge.tone === "value"
                          ? t("badge.value")
                          : badge.tone === "express"
                            ? t("badge.express")
                            : t("badge.notice")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                {isQuoteOnlyService(s) ? (
                  <span className="text-base font-black text-[#00E5FF]">
                    {t("services.callQuote")}
                  </span>
                ) : (
                  <>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      {t("services.startingAt")}
                    </span>
                    <span className="text-2xl font-black text-white font-display">
                      {formatPrice(s.priceCents)}
                    </span>
                  </>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(s.durationMinutes)}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-4 leading-relaxed flex-1">
                {packageDescKey(s.slug) ? t(packageDescKey(s.slug)!) : s.description}
                {BOOKING_SLUG_TO_PKG[s.slug] === "express" && (
                  <>
                    {" "}
                    <span className="text-[#FFA500] font-bold">{t("pkg.express.warn")}</span>
                  </>
                )}
              </p>

              <div className="mt-auto flex items-center justify-end pt-1">
                <span
                  className={`font-bold text-xs flex items-center gap-1 ${
                    isSelected && twoTapUi ? "text-[#FF1AD8]" : "text-[#00E5FF]"
                  }`}
                >
                  {isSelected && twoTapUi ? t("book.tapAgain") : t("book.select")}{" "}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              </div>
            </button>
          );
        })}
      </div>

      {twoTapUi && selected && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-5xl px-4 pt-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContinue();
              }}
              className="btn-cyber btn-cyber-lg btn-cyber-block w-full min-h-12"
            >
              <span>{t("book.continue")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
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
  const { t } = useLanguage();
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
        <ChevronLeft className="w-4 h-4" /> {t("book.changeService")}
      </button>
      <h1 className="text-3xl sm:text-4xl font-black mb-2 font-display">{t("book.pickDate")}</h1>
      <p className="text-gray-400 mb-8">
        {t("book.booking")} <span className="text-white font-semibold">{locServiceName(t, service)}</span>
      </p>

      {/* Date picker */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">
            <Calendar className="w-4 h-4 inline mr-2 -mt-0.5" />
            {t("book.selectDay")}
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
          <Loading label={t("book.checking")} />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {days.map((d) => {
              const allFull = d.slots.every((s) => !s.available);
              const isPast = d.date < today;
              const disabled = isPast || d.closed || allFull;
              const isPicked = pickedDate === d.date;
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => {
                    setPickedDate(d.date);
                    setPickedTime(null);
                  }}
                  onTouchEnd={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    setPickedDate(d.date);
                    setPickedTime(null);
                  }}
                  disabled={disabled}
                  className={`p-3 rounded-xl text-center transition ${
                    isPicked
                      ? "bg-[#FF1AD8] text-white"
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
                      ? t("book.past")
                      : d.closed
                        ? t("book.closed")
                        : allFull
                          ? t("book.full")
                          : t("book.open")}
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
                  type="button"
                  onClick={() => setPickedTime(slot.time)}
                  onTouchEnd={(e) => {
                    if (!slot.available) return;
                    e.preventDefault();
                    setPickedTime(slot.time);
                  }}
                  disabled={!slot.available}
                  className={`py-4 rounded-xl font-bold transition ${
                    isPicked
                      ? "bg-[#FF1AD8] text-white"
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
              {t("book.allBooked")}{" "}
              <a href="tel:417-527-6165" className="text-[#00E5FF] underline">
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
          className="btn-cyber disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>{t("book.continue")}</span> <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

/* ---------- Info step ---------- */
function InfoStep({
  form,
  onChange,
  photos,
  onPhotosChange,
  onBack,
  onNext,
}: {
  form: Form;
  onChange: (f: Form) => void;
  photos: PickedPhoto[];
  onPhotosChange: (photos: PickedPhoto[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { t } = useLanguage();
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
        <ChevronLeft className="w-4 h-4" /> {t("book.changeTime")}
      </button>
      <h1 className="text-3xl sm:text-4xl font-black mb-2 font-display">{t("book.yourDetails")}</h1>
      <p className="text-gray-400 mb-8">
        {t("book.detailsSub")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={t("book.name")}
          required
          value={form.customerName}
          onChange={(v) => onChange({ ...form, customerName: v })}
          placeholder="Jane Smith"
        />
        <Field
          label={t("book.email")}
          required
          type="email"
          value={form.email}
          onChange={(v) => onChange({ ...form, email: v })}
          placeholder="jane@example.com"
        />
        <Field
          label={t("book.phone")}
          required
          type="tel"
          value={form.phone}
          onChange={(v) => onChange({ ...form, phone: formatPhone(v) })}
          placeholder="(417) 555-0123"
        />
        <Field
          label={t("book.vehicle")}
          required
          value={form.vehicle}
          onChange={(v) => onChange({ ...form, vehicle: v })}
          placeholder="2022 Toyota Tacoma"
        />
        <div className="sm:col-span-2">
          <VehiclePhotoPicker photos={photos} onChange={onPhotosChange} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-gray-300 mb-2">
            {t("book.notesLabel")}
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            placeholder={t("book.notes")}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition resize-none"
          />
        </div>
      </div>

      <label
        htmlFor="sms-consent"
        className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition"
      >
        <input
          id="sms-consent"
          type="checkbox"
          checked={form.smsConsent}
          onChange={(e) =>
            onChange({ ...form, smsConsent: e.target.checked })
          }
          className="mt-1 w-5 h-5 accent-[#00E5FF] flex-shrink-0 cursor-pointer"
        />
        <span className="text-xs text-gray-400 leading-relaxed">
          <span className="text-white font-semibold">SMS notifications:</span>{" "}
          You'll receive transactional text messages from{" "}
          <span className="text-white font-semibold">Apex Detailing</span>{" "}
          at the phone number above, including appointment confirmations,
          reschedule and cancellation notices, and a one-time reminder
          approximately 24 hours before your appointment. Message frequency
          is approximately 2–4 messages per appointment. Reply{" "}
          <span className="text-white font-semibold">STOP</span> to
          opt out at any time, or{" "}
          <span className="text-white font-semibold">HELP</span> for help.
          Message and data rates may apply. If you prefer not to receive SMS,
          leave this unchecked and we'll contact you by email and phone only.
          Your phone number and consent will not be sold or shared with third
          parties for marketing. See our{" "}
          <Link href="/privacy" className="text-[#00E5FF] hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-[#00E5FF] hover:underline">
            Terms &amp; Conditions
          </Link>
          .
        </span>
      </label>

      <div className="flex justify-end mt-6">
        <button
          disabled={!valid}
          onClick={onNext}
          className="btn-cyber disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>{t("book.reviewBooking")}</span> <ArrowRight className="w-4 h-4" />
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
        {required && <span className="text-[#00E5FF] ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition"
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
  photos,
  onBack,
  onConfirmed,
}: {
  service: Service;
  date: string;
  time: string;
  form: Form;
  photos: PickedPhoto[];
  onBack: () => void;
  onConfirmed: (b: Booking, photosFailed: boolean) => void;
}) {
  const { t } = useLanguage();
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
          smsConsent: form.smsConsent,
        },
      });
      let photosFailed = false;
      if (photos.length > 0 && result.manageToken) {
        try {
          await uploadBookingPhotos(result.id, result.manageToken, photos);
        } catch {
          photosFailed = true;
        }
      } else if (photos.length > 0) {
        photosFailed = true;
      }
      onConfirmed(result, photosFailed);
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
        <ChevronLeft className="w-4 h-4" /> {t("book.editDetails")}
      </button>
      <h1 className="text-3xl sm:text-4xl font-black mb-2 font-display">{t("book.review")}</h1>
      <p className="text-gray-400 mb-8">
        {t("book.reviewSub")}
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        <SummaryRow label={t("book.step.service")} value={locServiceName(t, service)} />
        <SummaryRow
          label={t("book.when")}
          value={`${formatDateLong(date)} at ${formatTime12h(time)}`}
          highlight
        />
        <SummaryRow label={t("book.customer")} value={form.customerName} />
        <SummaryRow label={t("book.email")} value={form.email} />
        <SummaryRow label={t("book.phone")} value={form.phone} />
        <SummaryRow label={t("book.vehicle")} value={form.vehicle} />
        {photos.length > 0 && (
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <span className="text-sm text-gray-400 font-medium">{t("book.photos")}</span>
            <div className="flex gap-2">
              {photos.map((p) => (
                <img
                  key={p.id}
                  src={p.previewUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover border border-white/10"
                />
              ))}
            </div>
          </div>
        )}
        {form.notes && <SummaryRow label={t("book.notesRow")} value={form.notes} />}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-sm text-gray-300 flex gap-3">
        <MapPin className="w-5 h-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-1">{t("book.dropOff")}</p>
          <p>{t("book.dropOffAddr")}</p>
        </div>
      </div>

      {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition"
        >
          {t("book.back")}
        </button>
        <button
          disabled={mutation.isPending}
          onClick={submit}
          className="btn-cyber disabled:opacity-50"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> <span>{t("book.bookingPending")}</span>
            </>
          ) : (
            <>
              <span>{t("book.confirm")}</span> <Check className="w-4 h-4" />
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
            ? "text-xl text-white"
            : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------- Confirmation view ---------- */
function ConfirmationView({
  booking,
  photoWarning,
}: {
  booking: Booking;
  photoWarning: boolean;
}) {
  const { t } = useLanguage();
  return (
    <section className="text-center max-w-2xl mx-auto pt-12">
      <div className="w-20 h-20 mx-auto rounded-full bg-[#FF1AD8] flex items-center justify-center mb-6 shadow-[0_0_18px_rgba(255,26,216,0.3)]">
        <Check className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black mb-3 font-display">{t("book.youreBooked")}</h1>
      <p className="text-gray-400 text-lg mb-8">
        {t("book.lockedIn")} {booking.customerName.split(" ")[0]}.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">
              {t("book.confirmation")}
            </div>
            <div className="text-lg font-black">#{String(booking.id).padStart(5, "0")}</div>
          </div>
        </div>
        <SummaryRow label={t("book.step.service")} value={booking.serviceName} />
        <SummaryRow
          label={t("book.when")}
          value={formatDateTimeLong(
            typeof booking.scheduledAt === "string"
              ? booking.scheduledAt
              : new Date(booking.scheduledAt as unknown as string).toISOString(),
          )}
        />
        <SummaryRow label={t("book.vehicle")} value={booking.vehicle} />
      </div>

      {photoWarning && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm text-left">
          {t("book.photoWarn")}
        </div>
      )}

      <div className="p-4 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-sm text-gray-300 flex gap-3 text-left mb-8">
        <MapPin className="w-5 h-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white mb-1">{t("book.dropOffTitle")}</p>
          <p>{t("book.dropOffCall")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-white/10 text-gray-300 font-bold hover:bg-white/5 transition"
        >
          {t("404.home")}
        </Link>
        <a
          href="tel:417-527-6165"
          className="btn-cyber"
        >
          <Phone className="w-4 h-4" /> <span>{t("book.callShop")}</span>
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
