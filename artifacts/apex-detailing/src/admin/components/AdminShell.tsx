import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { ADMIN_FIRST, ADMIN_NAME, ADMIN_ROLE, NAV_ITEMS, PAGE_TITLES } from "../constants";
import { useAdmin } from "../context";
import { formatShopDateLong, matchesSearch } from "../utils";
import { fieldClass } from "./ui";

export default function AdminShell({ children }: { children: ReactNode }) {
  const { section, bookings, searchQuery, setSearchQuery, onLogout, setDetail } = useAdmin();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [section]);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return bookings.filter((b) => matchesSearch(b, searchQuery)).slice(0, 8);
  }, [bookings, searchQuery]);

  const title = PAGE_TITLES[section] ?? "Dashboard";

  return (
    <div className="apex-admin min-h-screen flex">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#0B0B0B] transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <Link href="/admin" className="block">
            <BrandLogo
              variant="nav"
              priority
              className="h-16 w-auto max-w-[11rem] object-contain"
            />
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[#9CA3AF]">
            Control Center
          </p>
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
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-200",
                  active
                    ? "bg-[#111111] text-white shadow-[inset_2px_0_0_#FF2AD4,0_0_18px_rgba(255,42,212,0.12)]"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.04]",
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-[#FF2AD4]" : "text-current")} />
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
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-white/10 text-sm text-[#9CA3AF] hover:text-white hover:bg-white/5 transition duration-200"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/95 backdrop-blur">
          <div className="h-16 px-4 md:px-6 flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-lg font-bold text-white shrink-0">{title}</h1>

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
                  className={cn(fieldClass, "pl-9 h-10 py-0")}
                />
                {searchOpen && searchQuery.trim() && (
                  <div className="absolute top-full mt-2 w-full rounded-xl border border-white/10 bg-[#111111] shadow-xl overflow-hidden">
                    {results.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-[#9CA3AF]">No matches</p>
                    ) : (
                      results.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 border-b border-white/5 last:border-0"
                          onClick={() => {
                            setDetail(b);
                            setSearchOpen(false);
                            setLocation(`/admin/appointments/${b.id}`);
                          }}
                        >
                          <span className="text-white font-medium">{b.customerName}</span>
                          <span className="text-[#9CA3AF]"> · {b.serviceName} · #{String(b.id).padStart(5, "0")}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1.5 md:gap-2">
              <button
                type="button"
                className="md:hidden w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/5 transition duration-200"
                  onClick={() => {
                    setBellOpen((v) => !v);
                    setHelpOpen(false);
                  }}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#111111] p-4 text-sm text-[#9CA3AF]">
                    No notifications yet.
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-white/5 transition duration-200"
                  onClick={() => {
                    setHelpOpen((v) => !v);
                    setBellOpen(false);
                  }}
                  aria-label="Help"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#111111] p-4 text-sm text-[#9CA3AF]">
                    Open an appointment to view customer contact details, notes, and edit or cancel the booking.
                  </div>
                )}
              </div>
              <span className="hidden sm:block text-xs text-[#9CA3AF] px-2">{formatShopDateLong()}</span>
              <Link
                href="/admin/settings"
                className="w-9 h-9 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-[11px] font-bold"
                title={ADMIN_NAME}
              >
                {ADMIN_FIRST.slice(0, 1)}G
              </Link>
            </div>
          </div>
          {searchOpen && (
            <div className="md:hidden px-4 pb-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className={fieldClass}
              />
            </div>
          )}
        </header>

        <main className="px-4 md:px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
