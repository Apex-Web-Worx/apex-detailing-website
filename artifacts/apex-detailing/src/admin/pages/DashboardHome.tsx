import { Link, useLocation } from "wouter";
import { CalendarOff, Play, Plus, RefreshCw } from "lucide-react";
import { todayDateString, formatTime12h } from "@/lib/format";
import { ADMIN_FIRST } from "../constants";
import { useAdmin } from "../context";
import {
  bookingShopDate,
  bookingShopTime,
  bookingStoredDetailMs,
  canStartHold,
  canStartJob,
  computeKpis,
  customerKey,
  deriveTasks,
  displayStatus,
  formatElapsedLong,
  greetingForNow,
  heldCustomerName,
  holdServiceLabel,
  isClientHold,
  scheduledAtToShopTime,
  bookingIso,
  vehicleKey,
} from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import HeldAppointmentRow from "../components/HeldAppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { AdminCard, GhostButton } from "../components/ui";
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
    startBooking,
    startHold,
    token,
  } = useAdmin();
  const [, setLocation] = useLocation();
  const today = todayDateString();
  const [calMonth, setCalMonth] = useState(today.slice(0, 7));
  const { data: personalEvents = [] } = useOwnerCalendarEvents(token, calMonth);
  const kpis = computeKpis(bookings, blockedDates);
  const todayBlocked = blockedDates.find((b) => b.date === today);
  const todayAppts = bookings
    .filter((b) => {
      if (bookingShopDate(b) !== today) return false;
      const status = displayStatus(b);
      return status !== "cancelled" && status !== "completed";
    })
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
  const tasks = deriveTasks(bookings);
  const shopEmpty = todayAppts.length === 0 && !todayBlocked;
  const startableToday = todayAppts.filter(canStartJob);
  const startableHold = todayBlocked && canStartHold(todayBlocked) ? todayBlocked : null;
  const readyForPickup = bookings.filter((b) => displayStatus(b) === "ready_for_pickup");
  const recentDetailTimes = bookings
    .filter((b) => bookingStoredDetailMs(b) != null)
    .sort((a, b) => {
      const aAt = a.readyAt ? new Date(a.readyAt).getTime() : +new Date(bookingIso(a));
      const bAt = b.readyAt ? new Date(b.readyAt).getTime() : +new Date(bookingIso(b));
      return bAt - aAt;
    })
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
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

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Kpi href="/admin/appointments" label="Today" value={String(kpis.todayCount)} />
        <Kpi href="/admin/appointments" label="This week" value={String(kpis.weekCount)} />
        <Kpi href="/admin/appointments" label="Upcoming" value={String(kpis.upcomingQuotedCount)} />
      </div>

      {readyForPickup.length > 0 && (
        <AdminCard hover={false} className="p-4 md:p-5">
          <h3 className="text-base font-bold mb-3">Ready for pickup</h3>
          <p className="text-sm text-[#9CA3AF] mb-3">
            {readyForPickup.length} vehicle{readyForPickup.length === 1 ? "" : "s"} ready
          </p>
          <div className="space-y-3">
            {readyForPickup.map((b) => {
              const took = bookingStoredDetailMs(b);
              return (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{b.customerName}</p>
                    <p className="text-xs text-[#9CA3AF]">{b.vehicle}</p>
                    {took != null ? (
                      <p className="text-xs font-semibold text-[#23B9FF]">
                        Detailed {formatElapsedLong(took)}
                      </p>
                    ) : null}
                    <p className="text-xs text-[#9CA3AF]">
                      Pickup: {formatTime12h(scheduledAtToShopTime(b.pickupAt || bookingIso(b)))}
                    </p>
                  </div>
                  <GhostButton type="button" className="shrink-0" onClick={() => setDetail(b)}>
                    View appointment
                  </GhostButton>
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

      <AdminCard hover={false} className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold">Detailing times</h3>
          <Link href="/admin/vehicles" className="text-xs font-semibold text-[#9CA3AF] hover:text-white py-1">
            Vehicles
          </Link>
        </div>
        {(startableHold || startableToday.length > 0) && (
          <div className="space-y-2 mb-4">
            {startableHold ? (
              <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
                <p className="text-sm font-semibold text-white">{holdServiceLabel(startableHold)}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {heldCustomerName(startableHold)}
                  {startableHold.vehicle ? ` · ${startableHold.vehicle}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => void startHold(startableHold.id)}
                  className="mt-3 w-full min-h-12 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#ff4adc] touch-manipulation"
                >
                  <Play className="w-4 h-4" /> Start detailing
                </button>
              </div>
            ) : null}
            {startableToday.map((b) => (
              <div key={b.id} className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
                <p className="text-sm font-semibold text-white">{b.serviceName}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  {b.customerName} · {b.vehicle}
                </p>
                <button
                  type="button"
                  onClick={() => void startBooking(b.id)}
                  className="mt-3 w-full min-h-12 rounded-xl bg-[#FF2AD4] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#ff4adc] touch-manipulation"
                >
                  <Play className="w-4 h-4" /> Start detailing
                </button>
              </div>
            ))}
          </div>
        )}
        {recentDetailTimes.length === 0 && !startableHold && startableToday.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">
            Tap Start on a job, then Ready for Pickup. Time for that car is saved here.
          </p>
        ) : recentDetailTimes.length > 0 ? (
          <div className="space-y-3">
            {recentDetailTimes.map((b) => {
              const took = bookingStoredDetailMs(b);
              return (
                <Link
                  key={b.id}
                  href={`/admin/vehicles/${encodeURIComponent(`${customerKey(b.email)}||${vehicleKey(b.vehicle)}`)}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{b.vehicle}</p>
                    <p className="text-xs text-[#9CA3AF] truncate">
                      {b.serviceName}
                      {b.readyAt
                        ? ` · ${new Date(b.readyAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}`
                        : ""}
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums text-[#23B9FF] shrink-0">
                    {took != null ? formatElapsedLong(took) : "—"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch">
        <div className="flex flex-col gap-4 min-h-0">
          <AdminCard hover={false} className="p-4 md:p-5 flex-1 flex flex-col min-h-[280px]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold">Today's Schedule</h3>
              <Link href="/admin/calendar" className="text-xs font-semibold text-[#9CA3AF] hover:text-white py-1">
                View calendar
              </Link>
            </div>
            {isLoading ? (
              <p className="text-sm text-[#9CA3AF]">Loading…</p>
            ) : shopEmpty ? (
              <p className="text-sm text-[#9CA3AF] m-auto py-8 text-center">
                No detailing appointments today.
              </p>
            ) : (
              <div className="space-y-2">
                {todayBlocked && isClientHold(todayBlocked) && (
                  <HeldAppointmentRow hold={todayBlocked} />
                )}
                {todayBlocked && !isClientHold(todayBlocked) && (
                  <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">
                        Blocked{todayBlocked.reason ? ` · ${todayBlocked.reason}` : ""}
                      </p>
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
                    stackedAction
                    onView={() => setDetail(b)}
                    onEdit={() => setEditing(b)}
                    onCancel={() => cancelBooking(b.id)}
                  />
                ))}
              </div>
            )}
          </AdminCard>

          {tasks.length > 0 && (
            <AdminCard hover={false} className="p-4 md:p-5">
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

        <div className="hidden lg:block min-h-[280px]">
          <MonthCalendar
            compact
            className="h-full"
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
    <Link href={href} className="block h-full touch-manipulation">
      <AdminCard hover={false} className="h-full p-4 md:p-5">
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">
          {label}
        </p>
        <p className="text-2xl md:text-3xl font-bold mt-2">{value}</p>
        <p className="text-xs text-[#9CA3AF] mt-1">Appointments</p>
      </AdminCard>
    </Link>
  );
}
