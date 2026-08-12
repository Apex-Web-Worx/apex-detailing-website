import { Link, useLocation } from "wouter";
import {
  CalendarClock,
  CalendarOff,
  DollarSign,
  Plus,
  RefreshCw,
} from "lucide-react";
import { formatPrice, todayDateString } from "@/lib/format";
import { ADMIN_FIRST } from "../constants";
import { useAdmin } from "../context";
import {
  bookingShopDate,
  bookingShopTime,
  computeKpis,
  deriveTasks,
  displayStatus,
  formatSignedPercent,
  greetingForNow,
  monthLabel,
  monthRevenue,
  monthlySeries,
  percentChange,
} from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { AdminCard, EmptyState, GhostButton, Sparkline, StatusBadge } from "../components/ui";
import { useState, type ReactNode } from "react";

export default function DashboardHome() {
  const {
    bookings,
    blockedDates,
    isLoading,
    refetch,
    setDetail,
    setEditing,
    cancelBooking,
    openBlockDate,
  } = useAdmin();
  const [, setLocation] = useLocation();
  const today = todayDateString();
  const [calMonth, setCalMonth] = useState(today.slice(0, 7));
  const kpis = computeKpis(bookings);
  const todayAppts = bookings
    .filter((b) => b.status !== "cancelled" && bookingShopDate(b) === today)
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
  const recent = [...bookings]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);
  const series = monthlySeries(bookings, 6);
  const thisMonth = today.slice(0, 7);
  const prevMonth = monthRevenue(bookings, series[series.length - 2]?.month ?? thisMonth);
  const change = percentChange(kpis.monthCollectedCents, prevMonth);
  const tasks = deriveTasks(bookings);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold">
            {greetingForNow()}, {ADMIN_FIRST} 👋
          </h2>
          <p className="text-[#9CA3AF] mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GhostButton type="button" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </GhostButton>
          <GhostButton type="button" onClick={() => openBlockDate()}>
            <CalendarOff className="w-4 h-4" /> Block Date
          </GhostButton>
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold transition duration-200 hover:bg-[#ff4adc] hover:shadow-[0_0_16px_rgba(255,42,212,0.28)]"
          >
            <Plus className="w-4 h-4" /> New Appointment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi
          href="/admin/appointments"
          label="Today"
          value={String(kpis.todayCount)}
          hint="Appointments"
          icon={<CalendarClock className="w-4 h-4 text-[#FF2AD4]" />}
          glow="rgba(255,42,212,0.25)"
        />
        <Kpi
          href="/admin/appointments"
          label="This week"
          value={String(kpis.weekCount)}
          hint="Appointments"
          icon={<CalendarClock className="w-4 h-4 text-[#8A52FF]" />}
          glow="rgba(138,82,255,0.25)"
        />
        <Kpi
          href="/admin/payments"
          label="Revenue"
          value={formatPrice(kpis.monthCollectedCents)}
          hint="Completed this month"
          icon={<DollarSign className="w-4 h-4 text-[#23B9FF]" />}
          glow="rgba(35,185,255,0.25)"
        />
        <Kpi
          href="/admin/appointments"
          label="Upcoming"
          value={String(kpis.upcomingQuotedCount)}
          hint="Quoted appointments"
          icon={<CalendarClock className="w-4 h-4 text-[#FF2AD4]" />}
          glow="rgba(255,42,212,0.18)"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 space-y-3">
          <h3 className="text-lg font-bold">Today's Schedule</h3>
          {isLoading ? (
            <p className="text-sm text-[#9CA3AF]">Loading…</p>
          ) : todayAppts.length === 0 ? (
            <EmptyState title="No appointments today" body="When bookings land on today's date, they will show here." />
          ) : (
            todayAppts.map((b) => (
              <AppointmentRow
                key={b.id}
                booking={b}
                onView={() => setDetail(b)}
                onEdit={() => setEditing(b)}
                onCancel={() => cancelBooking(b.id)}
              />
            ))
          )}
        </div>
        <div className="xl:col-span-2">
          <MonthCalendar
            month={calMonth}
            onMonthChange={setCalMonth}
            bookings={bookings}
            blockedDates={blockedDates}
            selectedDate={today}
            onSelectDate={() => setLocation("/admin/calendar")}
            onBlockDate={() => openBlockDate()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <AdminCard hover={false} className="p-5 xl:col-span-1">
          <h3 className="font-bold mb-1">Revenue Overview</h3>
          <p className="text-sm text-[#9CA3AF]">{monthLabel(thisMonth)}</p>
          <p className="text-3xl font-bold mt-3">{formatPrice(kpis.monthCollectedCents)}</p>
          <p className={`text-sm mt-1 ${change && change > 0 ? "text-emerald-400" : change && change < 0 ? "text-red-400" : "text-[#9CA3AF]"}`}>
            {formatSignedPercent(change)} vs previous month
          </p>
          <p className="text-[11px] text-[#9CA3AF] mt-1">Quoted value of completed appointments. Payments are not tracked separately.</p>
          <Sparkline values={series.map((s) => s.cents)} className="mt-4" />
        </AdminCard>

        <AdminCard hover={false} className="p-5 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Recent Bookings</h3>
            <Link href="/admin/appointments" className="text-xs text-[#23B9FF] hover:underline">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setDetail(b)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{b.customerName}</span>
                    <StatusBadge status={displayStatus(b)} />
                  </div>
                  <p className="text-xs text-[#9CA3AF] truncate">
                    {b.vehicle} · {b.serviceName} · {formatPrice(b.servicePriceCents)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard hover={false} className="p-5">
          <h3 className="font-bold mb-3">Upcoming Tasks</h3>
          {tasks.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No follow-ups from current bookings.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((t) => (
                <Link key={t.id} href={t.href} className="block">
                  <p className="text-sm font-medium text-white">{t.title}</p>
                  <p className="text-xs text-[#9CA3AF]">{t.detail}</p>
                </Link>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

function Kpi({
  href,
  label,
  value,
  hint,
  icon,
  glow,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  glow: string;
}) {
  return (
    <Link href={href}>
      <AdminCard className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">{label}</p>
          <span
            className="w-9 h-9 rounded-xl bg-[#0B0B0B] border border-white/10 flex items-center justify-center"
            style={{ boxShadow: `0 0 18px ${glow}` }}
          >
            {icon}
          </span>
        </div>
        <p className="text-3xl font-bold mt-3">{value}</p>
        <p className="text-sm text-[#9CA3AF] mt-1">{hint}</p>
      </AdminCard>
    </Link>
  );
}
