import { Link, useLocation } from "wouter";
import { CalendarOff, Plus, RefreshCw } from "lucide-react";
import { todayDateString, formatTime12h } from "@/lib/format";
import { ADMIN_FIRST } from "../constants";
import { useAdmin } from "../context";
import {
  bookingShopDate,
  bookingShopTime,
  computeKpis,
  deriveTasks,
  displayStatus,
  greetingForNow,
  isClientHold,
  isDuplicateHoldBooking,
  linkedHoldBooking,
  scheduledAtToShopTime,
  bookingIso,
} from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import HeldAppointmentRow from "../components/HeldAppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { AdminCard, GhostButton, PrimaryButton } from "../components/ui";
import { useOwnerCalendarEvents } from "../useOwnerCalendarEvents";
import { useEffect, useState } from "react";

export default function DashboardHome() {
  const {
    bookings,
    blockedDates,
    isLoading,
    refetch,
    isRefreshing,
    setDetail,
    setEditing,
    cancelBooking,
    openBlockDate,
    openEditBlockedDate,
    token,
    sendReviewRequest,
    skipReviewRequest,
  } = useAdmin();
  const [, setLocation] = useLocation();
  const today = todayDateString();
  const [calMonth, setCalMonth] = useState(today.slice(0, 7));
  const [reviewItems, setReviewItems] = useState<
    Array<{
      bookingId: number;
      customerName: string;
      vehicle: string;
      reviewStatus: string;
    }>
  >([]);
  const [reviewBusyId, setReviewBusyId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/review-requests", { headers: { "x-admin-token": token } })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json || !Array.isArray(json.items)) return;
        setReviewItems(json.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [token, bookings]);

  const pendingReviews = reviewItems.filter(
    (item) => item.reviewStatus === "none" || item.reviewStatus === "failed",
  );
  const { data: personalEvents = [] } = useOwnerCalendarEvents(token, calMonth);
  const kpis = computeKpis(bookings, blockedDates);
  const todayBlocked = blockedDates.find((b) => b.date === today);
  const todayAppts = bookings
    .filter((b) => {
      if (bookingShopDate(b) !== today) return false;
      if (isDuplicateHoldBooking(b, bookings)) return false;
      const status = displayStatus(b);
      return status !== "cancelled" && status !== "completed";
    })
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
  const tasks = deriveTasks(bookings);
  const linkedTodayHold = todayBlocked ? linkedHoldBooking(bookings, todayBlocked) : null;
  const showHoldRow =
    Boolean(todayBlocked && isClientHold(todayBlocked) && !linkedTodayHold);
  const readyForPickup = bookings.filter((b) => displayStatus(b) === "ready_for_pickup");
  const shopEmpty = todayAppts.length === 0 && !todayBlocked;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold">
          {greetingForNow()}, {ADMIN_FIRST}
        </h2>
        <div className="flex flex-wrap gap-2">
          <GhostButton type="button" onClick={() => void refetch()} disabled={isRefreshing} className="px-3">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
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
              return (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{b.customerName}</p>
                    <p className="text-xs text-[#9CA3AF]">{b.vehicle}</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
      <AdminCard hover={false} className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-base font-bold">Reviews</h3>
          <Link href="/admin/reviews" className="text-xs font-semibold text-[#9CA3AF] hover:text-white py-1">
            All reviews
          </Link>
        </div>
        <p className="text-sm text-[#9CA3AF] mb-3">
          Reviews are not sent automatically. Send the Google review link here when you want.
        </p>
        {reviewNote ? <p className="text-sm text-[#23B9FF] mb-3">{reviewNote}</p> : null}
        {pendingReviews.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">No reviews waiting to send.</p>
        ) : (
          <div className="space-y-3">
            {pendingReviews.map((item) => (
              <div
                key={item.bookingId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.customerName}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{item.vehicle}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <PrimaryButton
                    type="button"
                    className="h-10 text-xs px-3"
                    disabled={reviewBusyId === item.bookingId}
                    onClick={() => {
                      setReviewBusyId(item.bookingId);
                      setReviewNote(null);
                      void sendReviewRequest(item.bookingId)
                        .then((result) => {
                          setReviewNote(
                            result === "already" ? "Review link already sent." : "Review link sent.",
                          );
                          setReviewItems((rows) =>
                            rows.map((row) =>
                              row.bookingId === item.bookingId ? { ...row, reviewStatus: "sent" } : row,
                            ),
                          );
                        })
                        .catch((e) => {
                          setReviewNote(e instanceof Error ? e.message : "Could not send review");
                        })
                        .finally(() => setReviewBusyId(null));
                    }}
                  >
                    Send review link
                  </PrimaryButton>
                  <GhostButton
                    type="button"
                    className="h-10 text-xs px-3"
                    disabled={reviewBusyId === item.bookingId}
                    onClick={() => {
                      setReviewBusyId(item.bookingId);
                      setReviewNote(null);
                      void skipReviewRequest(item.bookingId)
                        .then(() => {
                          setReviewNote("Review will not be sent to this client.");
                          setReviewItems((rows) =>
                            rows.map((row) =>
                              row.bookingId === item.bookingId ? { ...row, reviewStatus: "skipped" } : row,
                            ),
                          );
                        })
                        .catch((e) => {
                          setReviewNote(e instanceof Error ? e.message : "Could not skip review");
                        })
                        .finally(() => setReviewBusyId(null));
                    }}
                  >
                    Don’t send
                  </GhostButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      </div>

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
                {showHoldRow && todayBlocked && (
                  <HeldAppointmentRow hold={todayBlocked} />
                )}
                {todayBlocked && !showHoldRow && todayAppts.length === 0 && (
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
