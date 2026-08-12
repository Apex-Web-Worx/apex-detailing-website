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
  displayStatus,
  greetingForNow,
} from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { PersonalEventsCard } from "../components/PersonalEventsCard";
import { AdminCard, EmptyState, GhostButton, StatusBadge } from "../components/ui";
import { useOwnerCalendarEvents } from "../useOwnerCalendarEvents";
import {
  AdminBookingPhoto,
  CustomerPhotoBadge,
  photoIdsForBooking,
  useAdminBookingPhotoIndex,
} from "../components/CustomerPhotos";
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
    token,
  } = useAdmin();
  const [, setLocation] = useLocation();
  const today = todayDateString();
  const [calMonth, setCalMonth] = useState(today.slice(0, 7));
  const { data: personalEvents = [] } = useOwnerCalendarEvents(token, calMonth);
  const photosQuery = useAdminBookingPhotoIndex(token);
  const kpis = computeKpis(bookings);
  const todayPersonal = personalEvents.filter((e) => e.dates.includes(today));
  const todayAppts = bookings
    .filter((b) => b.status !== "cancelled" && bookingShopDate(b) === today)
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
  const recent = [...bookings]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);
  const tasks = deriveTasks(bookings);

  return (
    <div className="space-y-5">
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold">Today</h3>
            <Link href="/admin/calendar" className="xl:hidden text-xs font-semibold text-[#9CA3AF] py-2">
              Calendar →
            </Link>
          </div>
          {isLoading ? (
            <p className="text-sm text-[#9CA3AF]">Loading…</p>
          ) : todayAppts.length === 0 && todayPersonal.length === 0 ? (
            <EmptyState title="Nothing on the shop calendar today" body="New bookings will show up here." />
          ) : (
            <>
              {todayAppts.map((b) => (
                <AppointmentRow
                  key={b.id}
                  booking={b}
                  onView={() => setDetail(b)}
                  onEdit={() => setEditing(b)}
                  onCancel={() => cancelBooking(b.id)}
                />
              ))}
              {todayAppts.length === 0 && (
                <p className="text-sm text-[#9CA3AF]">No shop appointments today.</p>
              )}
              <PersonalEventsCard events={todayPersonal} />
            </>
          )}
        </div>
        <div className="hidden xl:block xl:col-span-2">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AdminCard hover={false} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Recent</h3>
            <Link href="/admin/appointments" className="text-xs text-[#9CA3AF] hover:text-white">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((b) => {
                const ids = photoIdsForBooking(photosQuery.data, b.id);
                return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setDetail(b)}
                  className="w-full text-left flex items-center gap-3"
                >
                  {ids[0] ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <AdminBookingPhoto
                        token={token}
                        bookingId={b.id}
                        photoId={ids[0]}
                        className="w-full h-full"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{b.customerName}</span>
                      <StatusBadge status={displayStatus(b)} />
                    </div>
                    <p className="text-xs text-[#9CA3AF] truncate">
                      {b.vehicle} · {b.serviceName}
                    </p>
                    <CustomerPhotoBadge count={ids.length} />
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </AdminCard>

        <AdminCard hover={false} className="p-5">
          <h3 className="font-bold mb-3">Follow-ups</h3>
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
