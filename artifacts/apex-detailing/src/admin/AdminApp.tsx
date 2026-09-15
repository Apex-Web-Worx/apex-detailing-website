import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, Lock } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { AdminPwaInstallHint } from "@/components/PwaManifestSwitch";
import { TOKEN_KEY } from "./constants";
import { AdminProvider, useAdmin } from "./context";
import AdminShell from "./components/AdminShell";
import AppointmentDetailDrawer from "./components/AppointmentDetailDrawer";
import BlockDateModal from "./components/BlockDateModal";
import ReadyForPickupModal from "./components/ReadyForPickupModal";
import EditBookingModal from "./components/EditBookingModal";
import DashboardHome from "./pages/DashboardHome";
import AppointmentsPage from "./pages/AppointmentsPage";
import CalendarPage from "./pages/CalendarPage";
import CustomersPage from "./pages/CustomersPage";
import ReviewsPage from "./pages/ReviewsPage";
import SettingsPage from "./pages/SettingsPage";

export default function AdminApp() {
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

  return (
    <AdminProvider token={token} onLogout={() => setToken(null)}>
      <AdminShell>
        <AdminSection />
      </AdminShell>
      <AdminOverlays />
    </AdminProvider>
  );
}

function AdminSection() {
  const { section } = useAdmin();
  switch (section) {
    case "appointments":
      return <AppointmentsPage />;
    case "calendar":
      return <CalendarPage />;
    case "customers":
      return <CustomersPage />;
    case "vehicles":
      // Vehicles tab removed — fall through to dashboard.
      return <DashboardHome />;
    case "services":
      // Services admin page removed — fall through to dashboard.
      return <DashboardHome />;
    case "messages":
      // Communications tab removed — fall through to dashboard.
      return <DashboardHome />;
    case "payments":
    case "analytics":
      return <DashboardHome />;
    case "reviews":
      return <ReviewsPage />;
    case "settings":
      return <SettingsPage />;
    default:
      return <DashboardHome />;
  }
}

function AdminOverlays() {
  const { editing, setEditing, token, refetch, readyTarget, readyResend, closeReadyModal } = useAdmin();
  return (
    <>
      <AppointmentDetailDrawer />
      <BlockDateModal />
      {readyTarget && (
        <ReadyForPickupModal
          booking={readyTarget}
          resend={readyResend}
          onClose={closeReadyModal}
        />
      )}
      {editing && (
        <EditBookingModal
          booking={editing}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={refetch}
        />
      )}
    </>
  );
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
    <div className="apex-admin min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <form
          onSubmit={handle}
          method="post"
          action="#"
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-8"
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
          <div className="flex justify-center mb-6">
            <BrandLogo variant="splash" priority className="h-24 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">Apex Control Center</h1>
          <p className="text-sm text-[#9CA3AF] text-center mb-6">
            Enter your admin password to continue.
          </p>
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="password"
              name="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#FF2AD4] focus:outline-none focus:ring-2 focus:ring-[#FF2AD4]/20 transition text-white placeholder:text-gray-500"
            />
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={!value || submitting}
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#FF2AD4] text-white font-semibold transition hover:bg-[#ff4adc] disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Sign in
          </button>
          <AdminPwaInstallHint />
          <Link href="/" className="block text-center mt-4 text-sm text-[#9CA3AF] hover:text-white">
            ← Back to site
          </Link>
        </form>
      </div>
      <footer className="border-t border-white/10 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <a
            href="https://www.apexwebworx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/apex-webworx-logo.png`}
              alt="APEX WEB WORX"
              className="h-14 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-widest">
              Designed and developed by <span className="text-[#23B9FF] font-bold">APEX WEB WORX</span>
            </p>
          </a>
        </div>
      </footer>
    </div>
  );
}
