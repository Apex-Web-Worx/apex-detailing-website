import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  useAdminListBookings,
  adminCancelBooking,
  adminUpdateBooking,
  adminRescheduleBooking,
  getAdminListBookingsQueryKey,
  useAdminListBlockedDates,
  adminAddBlockedDate,
  adminUnblockDate,
  getAdminListBlockedDatesQueryKey,
  useGetAvailability,
  useAdminListServiceRules,
  adminCreateServiceRule,
  adminUpdateServiceRule,
  adminDeleteServiceRule,
  adminAddRuleSlot,
  adminRemoveRuleSlot,
  getAdminListServiceRulesQueryKey,
  useListServices,
  type Booking,
  type BlockedDate,
  type ServiceDayRule,
  type Service,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  LogOut,
  Lock,
  Mail,
  Pencil,
  Phone,
  Trash2,
  Car,
  StickyNote,
  CalendarOff,
  Plus,
  X as XIcon,
  ChevronDown,
  ChevronRight,
  Filter,
  Check as CheckIcon,
} from "lucide-react";
import {
  formatDateLong,
  formatDateShort,
  formatDateTimeLong,
  formatPrice,
  formatDuration,
  formatTime12h,
  todayDateString,
  addDaysToDateString,
} from "@/lib/format";
import { AdminPwaInstallHint } from "@/components/PwaManifestSwitch";

function scheduledAtToShopDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function scheduledAtToShopTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

const TOKEN_KEY = "apex_admin_token";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  if (!token) {
    return <Login onSubmit={setToken} />;
  }

  return <Dashboard token={token} onLogout={() => setToken(null)} />;
}

function Login({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { "x-admin-token": value },
      });
      if (res.status === 401) {
        setError("Wrong password. Try again.");
        return;
      }
      if (!res.ok) {
        setError(`Server error (${res.status}). Try again.`);
        return;
      }
      try {
        localStorage.setItem(TOKEN_KEY, value);
      } catch {
        // ignore
      }
      onSubmit(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <form
          onSubmit={handle}
          method="post"
          action="#"
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8"
        >
          <input
            type="text"
            name="username"
            value="apex-admin"
            autoComplete="username"
            readOnly
            aria-hidden="true"
            tabIndex={-1}
            style={{ display: "none" }}
          />
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-6 border border-white/10">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF1AD8] via-[#9D00FF] to-[#00E5FF]"
            />
            <Lock className="relative z-[1] w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-center mb-2">Admin Access</h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Enter your admin password to view bookings.
          </p>
          <input
            type="password"
            name="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition mb-4 text-white placeholder:text-gray-500"
          />
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={!value || submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-sm bg-[#FF1AD8] text-white font-black uppercase tracking-[0.14em] transition hover:bg-[#ff45e0] hover:shadow-[0_0_16px_rgba(255,26,216,0.35)] disabled:bg-[#FF1AD8]/35 disabled:text-white/80 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Sign in</span>
          </button>
          <AdminPwaInstallHint />
          <Link
            href="/"
            className="block text-center mt-4 text-sm text-gray-400 hover:text-white"
          >
            ← Back to site
          </Link>
        </form>
      </div>
      <DevFooter />
    </div>
  );
}

/* ---------- APEX WEB WORX Footer ---------- */
function DevFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] py-8">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <a
          href="https://www.apexwebworx.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-3 hover:opacity-100 transition-all"
          aria-label="APEX WEB WORX"
        >
          <picture>
            <source srcSet={`${import.meta.env.BASE_URL}images/apex-webworx-logo.webp`} type="image/webp" />
            <img
              src={`${import.meta.env.BASE_URL}images/apex-webworx-logo.png`}
              alt="APEX WEB WORX"
              className="h-14 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest group-hover:text-white transition-colors">
            Designed and developed by <span className="text-[#00E5FF] font-bold">APEX WEB WORX</span>
          </p>
        </a>
      </div>
    </footer>
  );
}

function Dashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useAdminListBookings({
    request: { headers: { "x-admin-token": token } },
    query: {
      queryKey: getAdminListBookingsQueryKey(),
      retry: false,
    },
  });

  useEffect(() => {
    if (error && error instanceof Error && /401|Unauthorized/i.test(error.message)) {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }
      onLogout();
    }
  }, [error, onLogout]);

  const handleLogout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    onLogout();
  };

  const cancel = async (id: number) => {
    if (!confirm("Cancel this booking? The customer will not be notified automatically.")) {
      return;
    }
    try {
      await adminCancelBooking(id, { headers: { "x-admin-token": token } });
      queryClient.invalidateQueries({ queryKey: getAdminListBookingsQueryKey() });
    } catch (e) {
      alert(`Failed to cancel: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const [editing, setEditing] = useState<Booking | null>(null);

  const bookings = data ?? [];
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.scheduledAt as unknown as string) >= new Date(),
  );
  const past = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.scheduledAt as unknown as string) < new Date(),
  );
  // ----- Active-bookings filters (date + service type) -----
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterService, setFilterService] = useState<string>("");
  const serviceOptions = Array.from(
    new Set(upcoming.map((b) => b.serviceName)),
  ).sort();
  const filteredUpcoming = upcoming.filter((b) => {
    if (filterService && b.serviceName !== filterService) return false;
    if (filterDate) {
      const bookingDate = new Date(
        b.scheduledAt as unknown as string,
      )
        .toISOString()
        .slice(0, 10);
      // Compare in shop-local date by using the YYYY-MM-DD prefix of
      // the local string; cheaper than re-parsing the timezone here
      // and good enough for an exact-day match.
      const local = new Date(
        b.scheduledAt as unknown as string,
      ).toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
      if (local !== filterDate && bookingDate !== filterDate) return false;
    }
    return true;
  });
  const filtersActive = filterDate !== "" || filterService !== "";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to site</span>
          </Link>
          <div className="text-sm font-bold tracking-widest text-white/80">
            BOOKINGS
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">Appointments</h1>
            <p className="text-gray-400 text-sm mt-1">
              {upcoming.length} upcoming · {past.length} completed
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5"
          >
            Refresh
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 text-gray-400 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings…
          </div>
        )}

        {!isLoading && upcoming.length === 0 && past.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No bookings yet.</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <Section
            title="Upcoming"
            count={filteredUpcoming.length}
            totalCount={upcoming.length}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
                aria-label="Filter by date"
              />
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#00E5FF]"
                aria-label="Filter by service type"
              >
                <option value="">All services</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {filtersActive && (
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterService("");
                  }}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 flex items-center gap-1"
                >
                  <XIcon className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            {filteredUpcoming.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-gray-500">
                No upcoming bookings match these filters.
              </div>
            ) : (
              filteredUpcoming.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancel={() => cancel(b.id)}
                  onEdit={() => setEditing(b)}
                />
              ))
            )}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="Completed" count={past.length} collapsible defaultOpen={false}>
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} muted />
            ))}
          </Section>
        )}


        <BlockedDatesPanel token={token} />
        <ServiceRulesPanel token={token} />
      </main>

      {editing && (
        <EditBookingModal
          booking={editing}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={() => {
            queryClient.invalidateQueries({
              queryKey: getAdminListBookingsQueryKey(),
            });
          }}
        />
      )}
      <DevFooter />
    </div>
  );
}

function BlockedDatesPanel({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminListBlockedDates({
    request: { headers: { "x-admin-token": token } },
    query: {
      queryKey: getAdminListBlockedDatesQueryKey(),
      retry: false,
    },
  });
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const blocked = data ?? [];
  const today = todayDateString();
  const upcomingBlocked = blocked.filter((b) => b.date >= today);

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getAdminListBlockedDatesQueryKey(),
    });

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSubmitting(true);
    setError(null);
    setSuccessNote(null);
    try {
      const payload: {
        date: string;
        reason?: string;
        name?: string;
        surname?: string;
        phone?: string;
      } = { date };
      const reasonTrim = reason.trim();
      const nameTrim = name.trim();
      const surnameTrim = surname.trim();
      const phoneTrim = phone.trim();
      if (reasonTrim) payload.reason = reasonTrim;
      if (nameTrim) payload.name = nameTrim;
      if (surnameTrim) payload.surname = surnameTrim;
      if (phoneTrim) payload.phone = phoneTrim;

      await adminAddBlockedDate(payload, {
        headers: { "x-admin-token": token },
      });
      setDate("");
      setReason("");
      setName("");
      setSurname("");
      setPhone("");
      setSuccessNote(
        phoneTrim
          ? `Date blocked. Confirmation text sent to ${phoneTrim}.`
          : "Date blocked.",
      );
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not block date";
      // Try to surface a friendlier message for the common cases
      if (/409/.test(msg)) {
        setError("That date is already blocked.");
      } else if (/400/.test(msg)) {
        setError("Pick a valid date that is today or later.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (d: string) => {
    if (!confirm(`Re-open ${formatDateLong(d)}? Customers will be able to book it again.`)) {
      return;
    }
    try {
      await adminUnblockDate(d, { headers: { "x-admin-token": token } });
      refresh();
    } catch (e) {
      alert(`Could not re-open: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const fieldClass =
    "px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition text-white placeholder:text-gray-500";

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <CalendarOff className="w-5 h-5 text-[#00E5FF]" />
        <h2 className="text-xl font-black">Block off days</h2>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        Mark a date as closed (vacation, personal day, etc.) so customers can't book it. Sundays are already closed automatically.
      </p>

      <form
        onSubmit={add}
        className="mb-5 p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            required
            className={fieldClass}
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional, e.g. Family trip)"
            maxLength={200}
            className={`flex-1 ${fieldClass}`}
          />
        </div>

        <div className="rounded-xl border border-[#00E5FF]/25 bg-[#00E5FF]/[0.04] p-3 space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">
              Contact for this day (optional)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              If you add a phone number, we send them an appointment confirmation text.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              maxLength={100}
              autoComplete="given-name"
              className={fieldClass}
            />
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Surname"
              maxLength={100}
              autoComplete="family-name"
              className={fieldClass}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="Phone"
              maxLength={14}
              autoComplete="tel"
              inputMode="tel"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!date || submitting}
            className="btn-cyber btn-cyber-sm disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Block date</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-3 text-gray-400 py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading blocked dates…
        </div>
      ) : upcomingBlocked.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-gray-400 text-sm">
            No upcoming blocked days. The shop is open every day except Sundays.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {upcomingBlocked.map((b) => (
            <BlockedDateCard
              key={b.id}
              blocked={b}
              onRemove={() => remove(b.date)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BlockedDateCard({
  blocked,
  onRemove,
}: {
  blocked: BlockedDate;
  onRemove: () => void;
}) {
  const contactName = [blocked.name, blocked.surname].filter(Boolean).join(" ");
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[#00E5FF] font-bold text-sm mb-1">
          <CalendarOff className="w-4 h-4" />
          {formatDateLong(blocked.date)}
        </div>
        {blocked.reason && (
          <p className="text-sm text-gray-400 truncate">{blocked.reason}</p>
        )}
        {(contactName || blocked.phone) && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {contactName}
            {contactName && blocked.phone ? " · " : ""}
            {blocked.phone}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        title="Re-open this day"
        className="p-1.5 rounded-lg text-gray-500 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Service-day rule editor                                             */
/* ------------------------------------------------------------------ */

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatHHMM12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function ServiceRulesPanel({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const headers = { "x-admin-token": token };
  const { data: rules, isLoading } = useAdminListServiceRules({
    request: { headers },
    query: {
      queryKey: getAdminListServiceRulesQueryKey(),
      retry: false,
    },
  });
  const { data: services } = useListServices();

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getAdminListServiceRulesQueryKey(),
    });

  // Group rules by service for display.
  const byService = useMemo(() => {
    const map = new Map<number, { name: string; slug: string; rules: ServiceDayRule[] }>();
    for (const r of rules ?? []) {
      const entry = map.get(r.serviceId) ?? {
        name: r.serviceName,
        slug: r.serviceSlug,
        rules: [],
      };
      entry.rules.push(r);
      map.set(r.serviceId, entry);
    }
    return map;
  }, [rules]);

  // "Add rule" form state.
  const [newServiceId, setNewServiceId] = useState<number | "">("");
  const [newDow, setNewDow] = useState<number>(1);
  const [newWholeDay, setNewWholeDay] = useState<boolean>(true);
  const [newSlotsCsv, setNewSlotsCsv] = useState<string>("07:30, 08:00");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newServiceId === "") return;
    setAddError(null);
    setAdding(true);
    try {
      const slots = newSlotsCsv
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const t of slots) {
        if (!/^\d{2}:\d{2}$/.test(t)) {
          throw new Error(`"${t}" is not a valid HH:MM time.`);
        }
      }
      await adminCreateServiceRule(
        {
          serviceId: Number(newServiceId),
          dayOfWeek: newDow,
          wholeDayLock: newWholeDay,
          slots,
        },
        { headers },
      );
      setNewSlotsCsv("07:30, 08:00");
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not add rule";
      if (/409/.test(msg)) {
        setAddError(
          "A rule for that service and day already exists. Edit it instead.",
        );
      } else {
        setAddError(msg);
      }
    } finally {
      setAdding(false);
    }
  };

  const toggleLock = async (rule: ServiceDayRule) => {
    try {
      await adminUpdateServiceRule(
        rule.id,
        { wholeDayLock: !rule.wholeDayLock },
        { headers },
      );
      refresh();
    } catch (e) {
      alert(`Could not update: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const toggleActive = async (rule: ServiceDayRule) => {
    try {
      await adminUpdateServiceRule(
        rule.id,
        { active: !rule.active },
        { headers },
      );
      refresh();
    } catch (e) {
      alert(`Could not update: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const deleteRule = async (rule: ServiceDayRule) => {
    if (
      !confirm(
        `Delete the ${DOW_LONG[rule.dayOfWeek]} rule for ${rule.serviceName}? Customers will no longer be able to book it on ${DOW_LONG[rule.dayOfWeek]}s.`,
      )
    ) {
      return;
    }
    try {
      await adminDeleteServiceRule(rule.id, { headers });
      refresh();
    } catch (e) {
      alert(`Could not delete: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const addSlot = async (rule: ServiceDayRule, time: string) => {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      alert("Time must be HH:MM (24-hour), e.g. 07:30 or 14:00.");
      return;
    }
    try {
      await adminAddRuleSlot(rule.id, { time }, { headers });
      refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      if (/409/.test(msg)) alert("That time slot already exists for this rule.");
      else alert(`Could not add slot: ${msg}`);
    }
  };

  const removeSlot = async (rule: ServiceDayRule, slotId: number) => {
    try {
      await adminRemoveRuleSlot(rule.id, slotId, { headers });
      refresh();
    } catch (e) {
      alert(`Could not remove: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <Clock className="w-5 h-5 text-[#00E5FF]" />
        <h2 className="text-xl font-black">Booking schedule</h2>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        Choose which days each service is bookable, the times offered,
        and whether one booking takes the whole day. Sundays stay closed
        automatically.
      </p>

      <form
        onSubmit={addRule}
        className="grid grid-cols-1 md:grid-cols-[1.2fr_0.6fr_0.5fr_1.4fr_auto] gap-3 mb-5 p-4 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <select
          value={newServiceId}
          onChange={(e) =>
            setNewServiceId(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:border-[#00E5FF] focus:outline-none"
          required
        >
          <option value="">Pick a service…</option>
          {(services ?? []).map((s: Service) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={newDow}
          onChange={(e) => setNewDow(Number(e.target.value))}
          className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:border-[#00E5FF] focus:outline-none"
        >
          {DOW_LABELS.map((label, i) => (
            <option key={i} value={i} disabled={i === 0}>
              {label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white cursor-pointer">
          <input
            type="checkbox"
            checked={newWholeDay}
            onChange={(e) => setNewWholeDay(e.target.checked)}
            className="accent-[#00E5FF]"
          />
          Whole-day lock
        </label>
        <input
          type="text"
          value={newSlotsCsv}
          onChange={(e) => setNewSlotsCsv(e.target.value)}
          placeholder="Times (HH:MM, comma-separated)"
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-gray-500 focus:border-[#00E5FF] focus:outline-none"
        />
        <button
          type="submit"
          disabled={newServiceId === "" || adding}
          className="btn-cyber btn-cyber-sm disabled:opacity-50 whitespace-nowrap"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Add rule</span>
        </button>
      </form>

      {addError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {addError}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-3 text-gray-400 py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading rules…
        </div>
      ) : byService.size === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-gray-400 text-sm">
            No rules yet. Add one above to make a service bookable.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byService.entries()).map(([sid, group]) => (
            <div
              key={sid}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="font-bold text-white">{group.name}</div>
                <div className="text-xs text-gray-500">{group.slug}</div>
              </div>
              <div className="divide-y divide-white/5">
                {group.rules
                  .slice()
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((r) => (
                    <RuleRow
                      key={r.id}
                      rule={r}
                      onToggleLock={() => toggleLock(r)}
                      onToggleActive={() => toggleActive(r)}
                      onDelete={() => deleteRule(r)}
                      onAddSlot={(t) => addSlot(r, t)}
                      onRemoveSlot={(slotId) => removeSlot(r, slotId)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RuleRow({
  rule,
  onToggleLock,
  onToggleActive,
  onDelete,
  onAddSlot,
  onRemoveSlot,
}: {
  rule: ServiceDayRule;
  onToggleLock: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onAddSlot: (time: string) => void;
  onRemoveSlot: (slotId: number) => void;
}) {
  const [newTime, setNewTime] = useState("");

  return (
    <div className={`p-4 ${rule.active ? "" : "opacity-50"}`}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="font-bold text-white min-w-[60px]">
          {DOW_LONG[rule.dayOfWeek]}
        </div>
        <button
          onClick={onToggleLock}
          title={
            rule.wholeDayLock
              ? "One booking on this day blocks all other bookings of any service."
              : "Multiple bookings can coexist across the configured time slots."
          }
          className={`text-xs px-3 py-1 rounded-full border transition ${
            rule.wholeDayLock
              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
              : "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
          }`}
        >
          {rule.wholeDayLock ? "Whole day" : "Per slot"}
        </button>
        <button
          onClick={onToggleActive}
          className={`text-xs px-3 py-1 rounded-full border transition ${
            rule.active
              ? "bg-white/5 border-white/20 text-gray-300"
              : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
        >
          {rule.active ? "Active" : "Paused"}
        </button>
        <div className="ml-auto">
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition"
            title="Delete this rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {rule.slots.length === 0 && (
          <span className="text-xs text-gray-500 italic">
            No times yet — add one →
          </span>
        )}
        {rule.slots.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-1 text-xs bg-white/[0.04] border border-white/10 rounded-full px-3 py-1"
          >
            <Clock className="w-3 h-3 text-[#00E5FF]" />
            {formatHHMM12h(s.time)}
            <button
              onClick={() => onRemoveSlot(s.id)}
              className="ml-1 text-gray-500 hover:text-red-300"
              title={`Remove ${s.time}`}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-xs text-white focus:border-[#00E5FF] focus:outline-none"
        />
        <button
          onClick={() => {
            if (!newTime) return;
            onAddSlot(newTime);
            setNewTime("");
          }}
          disabled={!newTime}
          className="text-xs px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] disabled:opacity-40 transition"
        >
          + Add time
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  count,
  totalCount,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  count?: number;
  totalCount?: number;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const showHeader = collapsible || count !== undefined;
  const headerLabel = (
    <>
      {title}
      {count !== undefined && (
        <span className="ml-2 text-gray-600 normal-case tracking-normal font-semibold">
          {totalCount !== undefined && totalCount !== count
            ? `${count} of ${totalCount}`
            : count}
        </span>
      )}
    </>
  );
  return (
    <section className="mb-8">
      {showHeader &&
        (collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest text-gray-500 hover:text-white font-bold w-full text-left"
            aria-expanded={open}
          >
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {headerLabel}
          </button>
        ) : (
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
            {headerLabel}
          </h2>
        ))}
      {(!collapsible || open) && (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}

function BookingCard({
  booking,
  onCancel,
  onEdit,
  muted,
  strikethrough,
}: {
  booking: Booking;
  onCancel?: () => void;
  onEdit?: () => void;
  muted?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        muted
          ? "border-white/5 bg-white/[0.01] opacity-70"
          : "border-white/10 bg-white/[0.03] hover:border-[#00E5FF]/30 transition"
      } ${strikethrough ? "line-through" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold">{booking.serviceName}</h3>
            <span className="text-xs text-gray-500">
              · {formatDuration(booking.serviceDurationMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-bold text-sm mb-3">
            <Calendar className="w-4 h-4" />
            {formatDateTimeLong(
              typeof booking.scheduledAt === "string"
                ? booking.scheduledAt
                : new Date(booking.scheduledAt as unknown as string).toISOString(),
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-500" />
              <span className="text-white">{booking.customerName}</span>
              <span className="text-gray-500">· {booking.vehicle}</span>
            </div>
            <a
              href={`tel:${booking.phone}`}
              className="flex items-center gap-2 hover:text-[#00E5FF]"
            >
              <Phone className="w-4 h-4 text-gray-500" />
              {booking.phone}
            </a>
            <a
              href={`mailto:${booking.email}`}
              className="flex items-center gap-2 hover:text-[#00E5FF]"
            >
              <Mail className="w-4 h-4 text-gray-500" />
              {booking.email}
            </a>
            {booking.notes && (
              <div className="flex items-start gap-2 sm:col-span-2 mt-1">
                <StickyNote className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 italic">{booking.notes}</span>
              </div>
            )}
          </div>
        </div>
        {(onEdit || onCancel) && (
          <div className="flex items-center gap-2 self-start">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 text-xs text-[#00E5FF] hover:text-white hover:bg-[#00E5FF]/10 px-3 py-1.5 rounded-lg border border-[#00E5FF]/30 transition"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Admin Edit Modal ---------- */
function EditBookingModal({
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

  // Lock background scroll while open + close on Escape.
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-t-2xl sm:rounded-2xl max-h-[95vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-lg font-bold truncate">
              Edit booking #{String(booking.id).padStart(5, "0")}
            </h2>
            <p className="text-xs text-gray-500 truncate">
              {booking.customerName} · {booking.serviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-4 flex gap-2 border-b border-white/10">
          <TabButton active={tab === "details"} onClick={() => setTab("details")}>
            Details
          </TabButton>
          <TabButton
            active={tab === "reschedule"}
            onClick={() => setTab("reschedule")}
          >
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
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition ${
        active
          ? "text-white border-[#00E5FF]"
          : "text-gray-400 border-transparent hover:text-white"
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
          <CheckIcon className="w-7 h-7 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Booking details updated</h3>
        <p className="text-sm text-gray-400">
          Calendar event re-synced. No notification was sent to the customer.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Customer name">
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition"
          />
        </Field>
      </div>
      <Field label="Vehicle">
        <input
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition"
        />
      </Field>
      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#00E5FF] focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/20 transition resize-none"
        />
      </Field>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Saving updates the booking record and re-syncs the Google Calendar event. The customer is not emailed.
      </p>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={!dirty || submitting}
          className="btn-cyber btn-cyber-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> <span>Saving…</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> <span>Save changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
        {label}
      </span>
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
  const [windowStart, setWindowStart] = useState(today);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ date: string; time: string } | null>(
    null,
  );

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

  useEffect(() => {
    setError(null);
  }, [pickedDate, pickedTime]);

  const isCurrentSlot =
    pickedDate === currentDate && pickedTime === currentTime;

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
          <CheckIcon className="w-7 h-7 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Appointment rescheduled</h3>
        <p className="text-sm text-gray-300 mb-3">
          New time:{" "}
          <span className="text-white font-semibold">
            {formatDateLong(success.date)} at {formatTime12h(success.time)}
          </span>
        </p>
        <p className="text-sm text-gray-400">
          Confirmation sent to {booking.customerName} via email and SMS.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-5">
        Current:{" "}
        <span className="text-white font-semibold">
          {formatDateTimeLong(scheduledIso)}
        </span>
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

      {selectedDay && !selectedDay.closed && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-5">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-3">
            <Clock className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
            {formatDateLong(selectedDay.date)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {selectedDay.slots.map((slot) => {
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
                      ? "bg-[#FF1AD8] text-white"
                      : available
                        ? "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10"
                        : "bg-white/[0.02] text-gray-600 cursor-not-allowed line-through"
                  }`}
                >
                  {formatTime12h(slot.time)}
                  {isOwnCurrent && (
                    <div className="text-[10px] font-normal opacity-70 mt-0.5">
                      (current)
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 mb-4">
        Confirming sends the customer the standard reschedule email and moves the Google Calendar event.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={submit}
          disabled={
            !pickedDate || !pickedTime || isCurrentSlot || submitting
          }
          className="btn-cyber btn-cyber-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> <span>Updating…</span>
            </>
          ) : (
            <>
              <span>{isCurrentSlot ? "Pick a different time" : "Confirm new time"}</span>
              <Check className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
