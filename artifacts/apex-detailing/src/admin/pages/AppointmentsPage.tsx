import { useMemo, useState } from "react";
import type { BlockedDate, Booking } from "@workspace/api-client-react";
import { todayDateString } from "@/lib/format";
import { useAdmin } from "../context";
import {
  bookingShopDate,
  displayStatus,
  holdDisplayStatus,
  holdServiceLabel,
  isClientHold,
  matchesHold,
  matchesSearch,
  type DisplayStatus,
} from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import HeldAppointmentRow from "../components/HeldAppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { AdminSelect, EmptyState, fieldClass, GhostButton } from "../components/ui";
import { useOwnerCalendarEvents } from "../useOwnerCalendarEvents";

type ListItem =
  | { kind: "booking"; key: string; date: string; status: DisplayStatus; booking: Booking }
  | { kind: "hold"; key: string; date: string; status: "confirmed" | "completed"; hold: BlockedDate };

export default function AppointmentsPage() {
  const { bookings, blockedDates, isLoading, setDetail, setEditing, cancelBooking, openBlockDate, searchQuery, setSearchQuery, token } = useAdmin();
  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [calMonth, setCalMonth] = useState(todayDateString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(todayDateString());
  const { data: personalEvents = [] } = useOwnerCalendarEvents(token, calMonth);

  const serviceOptions = useMemo(() => {
    const names = new Set(bookings.map((b) => b.serviceName));
    for (const hold of blockedDates.filter(isClientHold)) {
      names.add(holdServiceLabel(hold));
    }
    return Array.from(names).sort();
  }, [bookings, blockedDates]);

  const items = useMemo(() => {
    const list: ListItem[] = [];
    for (const booking of bookings) {
      if (searchQuery && !matchesSearch(booking, searchQuery)) continue;
      if (filterService && booking.serviceName !== filterService) continue;
      if (filterDate && bookingShopDate(booking) !== filterDate) continue;
      const status = displayStatus(booking);
      if (filterStatus && status !== filterStatus) continue;
      list.push({
        kind: "booking",
        key: `booking-${booking.id}`,
        date: bookingShopDate(booking),
        status,
        booking,
      });
    }
    for (const hold of blockedDates.filter(isClientHold)) {
      if (searchQuery && !matchesHold(hold, searchQuery)) continue;
      if (filterService && holdServiceLabel(hold) !== filterService) continue;
      if (filterDate && hold.date !== filterDate) continue;
      const status = holdDisplayStatus(hold);
      if (filterStatus && status !== filterStatus) continue;
      list.push({
        kind: "hold",
        key: `hold-${hold.id}`,
        date: hold.date,
        status,
        hold,
      });
    }
    const rank: Record<string, number> = {
      confirmed: 0,
      in_progress: 1,
      ready_for_pickup: 2,
      completed: 3,
      cancelled: 4,
    };
    list.sort((a, b) => {
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      if (a.status === "confirmed" || a.status === "in_progress" || a.status === "ready_for_pickup") {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (a.kind !== b.kind) return a.kind === "hold" ? -1 : 1;
        if (a.kind === "booking" && b.kind === "booking") {
          return +new Date(a.booking.scheduledAt) - +new Date(b.booking.scheduledAt);
        }
        return 0;
      }
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      if (a.kind !== b.kind) return a.kind === "hold" ? -1 : 1;
      return 0;
    });
    return list;
  }, [bookings, blockedDates, searchQuery, filterService, filterDate, filterStatus]);

  const visible = view === "calendar" ? items.filter((item) => item.date === selectedDate) : items;

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
        <AdminSelect
          value={filterService}
          onChange={setFilterService}
          aria-label="Filter by service"
          options={[
            { value: "", label: "All services" },
            ...serviceOptions.map((s) => ({ value: s, label: s })),
          ]}
        />
        <AdminSelect
          value={filterStatus}
          onChange={setFilterStatus}
          aria-label="Filter by status"
          options={[
            { value: "", label: "All statuses" },
            { value: "confirmed", label: "Confirmed" },
            { value: "in_progress", label: "In progress" },
            { value: "ready_for_pickup", label: "Ready for pickup" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
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
        />
      )}

      {isLoading ? (
        <p className="text-sm text-[#9CA3AF]">Loading bookings…</p>
      ) : visible.length === 0 ? (
        <EmptyState title="No appointments" body="No bookings match these filters." />
      ) : (
        <div className="space-y-2">
          {visible.map((item) =>
            item.kind === "hold" ? (
              <HeldAppointmentRow key={item.key} hold={item.hold} />
            ) : (
              <AppointmentRow
                key={item.key}
                booking={item.booking}
                onView={() => setDetail(item.booking)}
                onEdit={() => setEditing(item.booking)}
                onCancel={() => cancelBooking(item.booking.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
