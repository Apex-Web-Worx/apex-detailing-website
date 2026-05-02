import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  useAdminListBookings,
  adminCancelBooking,
  getAdminListBookingsQueryKey,
  useAdminListBlockedDates,
  adminAddBlockedDate,
  adminUnblockDate,
  getAdminListBlockedDatesQueryKey,
  type Booking,
  type BlockedDate,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  LogOut,
  Lock,
  Mail,
  Phone,
  Trash2,
  Car,
  StickyNote,
  CalendarOff,
  Plus,
  X as XIcon,
} from "lucide-react";
import {
  formatDateLong,
  formatDateTimeLong,
  formatPrice,
  formatDuration,
  todayDateString,
} from "@/lib/format";

const TOKEN_KEY = "apex_admin_token";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <form
        onSubmit={handle}
        method="post"
        action="#"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8"
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
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#A886CD] to-[#3496FF] flex items-center justify-center mx-auto mb-6">
          <Lock className="w-6 h-6 text-white" />
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
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#3496FF] focus:outline-none focus:ring-2 focus:ring-[#3496FF]/20 transition mb-4"
        />
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={!value || submitting}
          className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Sign in
        </button>
        <Link
          href="/"
          className="block text-center mt-4 text-sm text-gray-400 hover:text-white"
        >
          ← Back to site
        </Link>
      </form>
    </div>
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

  const bookings = data ?? [];
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.scheduledAt as unknown as string) >= new Date(),
  );
  const past = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.scheduledAt as unknown as string) < new Date(),
  );
  const cancelled = bookings.filter((b) => b.status === "cancelled");

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
              {upcoming.length} upcoming · {past.length} completed · {cancelled.length}{" "}
              cancelled
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
          <Section title="Upcoming">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={() => cancel(b.id)} />
            ))}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="Completed">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} muted />
            ))}
          </Section>
        )}

        {cancelled.length > 0 && (
          <Section title="Cancelled">
            {cancelled.map((b) => (
              <BookingCard key={b.id} booking={b} muted strikethrough />
            ))}
          </Section>
        )}

        <BlockedDatesPanel token={token} />
      </main>
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = data ?? [];
  const today = todayDateString();
  const upcomingBlocked = blocked.filter((b) => b.date >= today);

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getAdminListBlockedDatesQueryKey(),
    });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSubmitting(true);
    setError(null);
    try {
      await adminAddBlockedDate(
        { date, reason: reason.trim() },
        { headers: { "x-admin-token": token } },
      );
      setDate("");
      setReason("");
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

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <CalendarOff className="w-5 h-5 text-[#A886CD]" />
        <h2 className="text-xl font-black">Block off days</h2>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        Mark a date as closed (vacation, personal day, etc.) so customers can't book it. Sundays are already closed automatically.
      </p>

      <form
        onSubmit={add}
        className="flex flex-col sm:flex-row gap-3 mb-5 p-4 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={today}
          required
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#3496FF] focus:outline-none focus:ring-2 focus:ring-[#3496FF]/20 transition text-white"
        />
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional, e.g. Family trip)"
          maxLength={200}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#3496FF] focus:outline-none focus:ring-2 focus:ring-[#3496FF]/20 transition text-white placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={!date || submitting}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A886CD] to-[#3496FF] text-white font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-[#3496FF]/30 transition flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Block date
        </button>
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
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[#A886CD] font-bold text-sm mb-1">
          <CalendarOff className="w-4 h-4" />
          {formatDateLong(blocked.date)}
        </div>
        {blocked.reason && (
          <p className="text-sm text-gray-400 truncate">{blocked.reason}</p>
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function BookingCard({
  booking,
  onCancel,
  muted,
  strikethrough,
}: {
  booking: Booking;
  onCancel?: () => void;
  muted?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        muted
          ? "border-white/5 bg-white/[0.01] opacity-70"
          : "border-white/10 bg-white/[0.03] hover:border-[#3496FF]/30 transition"
      } ${strikethrough ? "line-through" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold">{booking.serviceName}</h3>
            <span className="text-sm font-black bg-gradient-to-r from-[#A886CD] to-[#3496FF] bg-clip-text text-transparent">
              {formatPrice(booking.servicePriceCents)}
            </span>
            <span className="text-xs text-gray-500">
              · {formatDuration(booking.serviceDurationMinutes)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#3496FF] font-bold text-sm mb-3">
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
              className="flex items-center gap-2 hover:text-[#3496FF]"
            >
              <Phone className="w-4 h-4 text-gray-500" />
              {booking.phone}
            </a>
            <a
              href={`mailto:${booking.email}`}
              className="flex items-center gap-2 hover:text-[#3496FF]"
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
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition self-start"
          >
            <Trash2 className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}
