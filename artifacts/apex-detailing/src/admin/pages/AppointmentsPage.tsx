import { useMemo, useState } from "react";
import { todayDateString } from "@/lib/format";
import { useAdmin } from "../context";
import { bookingShopDate, displayStatus, matchesSearch } from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { EmptyState, fieldClass, GhostButton } from "../components/ui";
import { useOwnerCalendarEvents } from "../useOwnerCalendarEvents";

export default function AppointmentsPage() {
  const { bookings, blockedDates, isLoading, setDetail, setEditing, cancelBooking, openBlockDate, searchQuery, setSearchQuery, token } = useAdmin();
  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [calMonth, setCalMonth] = useState(todayDateString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const { data: personalEvents = [] } = useOwnerCalendarEvents(token, calMonth);

  const serviceOptions = useMemo(
    () => Array.from(new Set(bookings.map((b) => b.serviceName))).sort(),
    [bookings],
  );

  const filtered = bookings.filter((b) => {
    if (searchQuery && !matchesSearch(b, searchQuery)) return false;
    if (filterService && b.serviceName !== filterService) return false;
    if (filterDate && bookingShopDate(b) !== filterDate) return false;
    if (filterStatus && displayStatus(b) !== filterStatus) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const sa = displayStatus(a);
    const sb = displayStatus(b);
    const rank = { confirmed: 0, completed: 1, cancelled: 2 };
    if (rank[sa] !== rank[sb]) return rank[sa] - rank[sb];
    if (sa === "confirmed") return +new Date(a.scheduledAt) - +new Date(b.scheduledAt);
    return +new Date(b.scheduledAt) - +new Date(a.scheduledAt);
  });
  const dayList = sorted.filter((b) => bookingShopDate(b) === selectedDate);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold">Appointments</h2>
          <GhostButton type="button" onClick={() => openBlockDate()} className="px-3 shrink-0">
            Block
          </GhostButton>
        </div>
        <div className="grid grid-cols-2 rounded-xl border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`min-h-11 text-sm touch-manipulation ${view === "list" ? "bg-[#111111] text-white" : "text-[#9CA3AF]"}`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`min-h-11 text-sm touch-manipulation ${view === "calendar" ? "bg-[#111111] text-white" : "text-[#9CA3AF]"}`}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search appointments"
          className={`${fieldClass} sm:max-w-sm`}
          aria-label="Search appointments"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={fieldClass}
          aria-label="Filter by date"
        />
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className={fieldClass}
          aria-label="Filter by service"
        >
          <option value="">All services</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={fieldClass}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(filterDate || filterService || filterStatus) && (
          <GhostButton
            type="button"
            className="h-10"
            onClick={() => {
              setFilterDate("");
              setFilterService("");
              setFilterStatus("");
            }}
          >
            Clear
          </GhostButton>
        )}
      </div>

      {view === "calendar" && (
        <MonthCalendar
          month={calMonth}
          onMonthChange={setCalMonth}
          bookings={bookings}
          blockedDates={blockedDates}
          personalEvents={personalEvents}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onBlockDate={() => openBlockDate(selectedDate)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-[#9CA3AF]">Loading bookings…</p>
      ) : (view === "calendar" ? dayList : sorted).length === 0 ? (
        <EmptyState title="No appointments" body="No bookings match these filters." />
      ) : (
        <div className="space-y-2">
          {(view === "calendar" ? dayList : sorted).map((b) => (
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
    </div>
  );
}
