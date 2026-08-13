import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Users,
  X,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { ADMIN_FIRST, ADMIN_NAME, ADMIN_ROLE, NAV_ITEMS, PAGE_TITLES } from "../constants";
import { useAdmin } from "../context";
import { matchesSearch } from "../utils";
import { fieldClass } from "./ui";

const TAB_ITEMS = [
  { href: "/admin", section: "dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/admin/appointments", section: "appointments", label: "Appts", icon: CalendarClock },
  { href: "/admin/calendar", section: "calendar", label: "Calendar", icon: CalendarDays },
  { href: "/admin/customers", section: "customers", label: "Customers", icon: Users },
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  const { section, bookings, searchQuery, setSearchQuery, onLogout, setDetail } = useAdmin();
  const [, setLocation] = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
  }, [section]);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen]);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return bookings.filter((b) => matchesSearch(b, searchQuery)).slice(0, 8);
  }, [bookings, searchQuery]);

  const title = PAGE_TITLES[section] ?? "Dashboard";
  const moreActive = !TAB_ITEMS.some((t) => t.section === section);

  const openResult = (id: number, booking = bookings.find((b) => b.id === id)) => {
    if (!booking) return;
    setDetail(booking);
    setSearchOpen(false);
    setSearchQuery("");
    setLocation(`/admin/appointments/${booking.id}`);
  };

  return (
    <div className="apex-admin min-h-dvh">
      {navOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-black/60"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(18rem,86vw)] flex flex-col border-r border-white/10 bg-[#0B0B0B] transition-transform duration-200 ease-out pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-start justify-between gap-3">
          <Link href="/admin" className="block min-w-0" onClick={() => setNavOpen(false)}>
            <BrandLogo
              variant="nav"
              priority
              className="h-16 w-auto max-w-[11rem] object-contain"
            />
            <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[#9CA3AF]">
              Control Center
            </p>
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/5 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = section === item.section;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition duration-200 min-h-11",
                  active
                    ? "bg-[#111111] text-white shadow-[inset_2px_0_0_#FF2AD4,0_0_18px_rgba(255,42,212,0.12)]"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-[#FF2AD4]" : "text-current")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-xs font-bold text-white">
              MG
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{ADMIN_NAME}</p>
              <p className="text-xs text-[#9CA3AF]">{ADMIN_ROLE}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 min-h-11 h-11 rounded-xl border border-white/10 text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 transition duration-200"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/95 backdrop-blur pt-[env(safe-area-inset-top)]">
          <div className="h-14 md:h-16 px-3 md:px-6 flex items-center gap-2">
            <button
              type="button"
              className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/5 touch-manipulation"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-lg font-bold text-white truncate">{title}</h1>

            <div className="hidden md:flex flex-1 justify-center px-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search customers, vehicles, appointments…"
                  className={cn(fieldClass, "pl-9 h-11 py-0")}
                />
                {searchOpen && searchQuery.trim() && (
                  <SearchResults results={results} onPick={openResult} />
                )}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                className="md:hidden w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center touch-manipulation"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <Link
                href="/admin/settings"
                className="w-11 h-11 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-[11px] font-bold"
                title={ADMIN_NAME}
              >
                {ADMIN_FIRST.slice(0, 1)}G
              </Link>
            </div>
          </div>
          {searchOpen && (
            <div className="md:hidden px-3 pb-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, vehicles…"
                autoFocus
                className={fieldClass}
              />
              {searchQuery.trim() && (
                <div className="mt-2 rounded-xl border border-white/10 bg-[#111111] overflow-hidden">
                  {results.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#9CA3AF]">No matches</p>
                  ) : (
                    results.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className="w-full text-left px-4 py-3.5 text-sm hover:bg-white/5 border-b border-white/5 last:border-0 min-h-12"
                        onClick={() => openResult(b.id, b)}
                      >
                        <span className="text-white font-medium">{b.customerName}</span>
                        <span className="block text-[#9CA3AF] text-xs mt-0.5">
                          {b.serviceName} · {b.vehicle}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        <main className="px-3 md:px-6 py-4 md:py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-6">
          {children}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0B0B0B]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {TAB_ITEMS.map((item) => {
            const active = section === item.section;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-h-14 text-[10px] font-bold uppercase tracking-wide touch-manipulation",
                  active ? "text-[#FF2AD4]" : "text-[#9CA3AF]",
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-h-14 text-[10px] font-bold uppercase tracking-wide touch-manipulation",
              moreActive ? "text-[#FF2AD4]" : "text-[#9CA3AF]",
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            More
          </button>
        </div>
      </nav>
    </div>
  );
}

function SearchResults({
  results,
  onPick,
}: {
  results: Array<{ id: number; customerName: string; serviceName: string }>;
  onPick: (id: number) => void;
}) {
  return (
    <div className="absolute top-full mt-2 w-full rounded-xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden z-20">
      {results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-[#9CA3AF]">No matches</p>
      ) : (
        results.map((b) => (
          <button
            key={b.id}
            type="button"
            className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 border-b border-white/5 last:border-0"
            onClick={() => onPick(b.id)}
          >
            <span className="text-white font-medium">{b.customerName}</span>
            <span className="text-[#9CA3AF]"> · {b.serviceName} · #{String(b.id).padStart(5, "0")}</span>
          </button>
        ))
      )}
    </div>
  );
}
