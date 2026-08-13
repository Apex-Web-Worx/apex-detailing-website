import { Link, useLocation } from "wouter";
import { CalendarOff, Plus, RefreshCw } from "lucide-react";
import { todayDateString } from "@/lib/format";
import { ADMIN_FIRST } from "../constants";
import { useAdmin } from "../context";
import {
  bookingShopDate,
  bookingShopTime,
  computeKpis,
  deriveTasks,
  greetingForNow,
} from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { AdminCard, EmptyState, GhostButton } from "../components/ui";
import { useOwnerCalendarEvents } from "../useOwnerCalendarEvents";
import { useState } from "react";

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
    openEditBlockedDate,
    token,
  } = useAdmin();
  const [, setLocation] = useLocation();
  const today = todayDateString();
  const [calMonth, setCalMonth] = useState(today.slice(0, 7));
  const { data: personalEvents = [] } = useOwnerCalendarEvents(token, calMonth);
  const kpis = computeKpis(bookings);
  const todayBlocked = blockedDates.find((b) => b.date === today);
  const todayAppts = bookings
    .filter((b) => b.status !== "cancelled" && bookingShopDate(b) === today)
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
  const tasks = deriveTasks(bookings);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold">
          {greetingForNow()}, {ADMIN_FIRST}
        </h2>
        <div className="flex flex-wrap gap-2">
          <GhostButton type="button" onClick={() => refetch()} className="px-3">
            <RefreshCw className="w-4 h-4" /> Refresh
          </GhostButton>
          <GhostButton type="button" onClick={() => openBlockDate()} className="px-3">
            <CalendarOff className="w-4 h-4" /> Block
          </GhostButton>
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 min-h-11 h-11 px-4 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold transition duration-200 hover:bg-[#ff4adc] touch-manipulation"
          >
            <Plus className="w-4 h-4" /> New Appointment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <Kpi href="/admin/appointments" label="Today" value={String(kpis.todayCount)} />
        <Kpi href="/admin/appointments" label="This week" value={String(kpis.weekCount)} />
        <Kpi href="/admin/appointments" label="Upcoming" value={String(kpis.upcomingQuotedCount)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold">Today's Schedule</h3>
            <Link href="/admin/calendar" className="lg:hidden text-xs font-semibold text-[#9CA3AF] py-2">
              Calendar →
            </Link>
          </div>
          {isLoading ? (
            <p className="text-sm text-[#9CA3AF]">Loading…</p>
          ) : todayAppts.length === 0 && !todayBlocked ? (
            <EmptyState title="No detailing appointments today" body="Shop bookings and blocked days show here. Personal calendar items are on Calendar." />
          ) : (
            <>
              {todayBlocked && (
                <div className="rounded-xl border border-white/10 bg-[#111111] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">
                      Blocked{todayBlocked.reason ? ` · ${todayBlocked.reason}` : ""}
                    </p>
                    {(todayBlocked.name || todayBlocked.phone) && (
                      <p className="text-xs text-[#9CA3AF]">
                        {[todayBlocked.name, todayBlocked.surname].filter(Boolean).join(" ")}
                        {todayBlocked.phone ? ` ${todayBlocked.phone}` : ""}
                      </p>
                    )}
                  </div>
                  <GhostButton
                    type="button"
                    className="shrink-0"
                    onClick={() => openEditBlockedDate(todayBlocked)}
                  >
                    Edit
                  </GhostButton>
                </div>
              )}
              {todayAppts.map((b) => (
                <AppointmentRow
                  key={b.id}
                  booking={b}
                  onView={() => setDetail(b)}
                  onEdit={() => setEditing(b)}
                  onCancel={() => cancelBooking(b.id)}
                />
              ))}
            </>
          )}
        </div>
        <div className="hidden lg:block">
          <MonthCalendar
            compact
            month={calMonth}
            onMonthChange={setCalMonth}
            bookings={bookings}
            blockedDates={blockedDates}
            personalEvents={personalEvents}
            selectedDate={today}
            onSelectDate={() => setLocation("/admin/calendar")}
          />
        </div>
      </div>

      {tasks.length > 0 && (
        <AdminCard hover={false} className="p-5 max-w-xl">
          <h3 className="font-bold mb-3">Follow-ups</h3>
          <div className="space-y-3">
            {tasks.map((t) => (
              <Link key={t.id} href={t.href} className="block">
                <p className="text-sm font-medium text-white">{t.title}</p>
                <p className="text-xs text-[#9CA3AF]">{t.detail}</p>
              </Link>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}

function Kpi({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <Link href={href} className="touch-manipulation">
      <AdminCard className="p-3 md:p-4">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] leading-tight">
          {label}
        </p>
        <p className="text-2xl md:text-3xl font-bold mt-1.5 md:mt-2">{value}</p>
      </AdminCard>
    </Link>
  );
}
