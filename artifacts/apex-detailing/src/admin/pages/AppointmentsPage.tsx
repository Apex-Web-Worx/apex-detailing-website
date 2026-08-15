import { useMemo, useState } from "react";
import type { BlockedDate, Booking } from "@workspace/api-client-react";
import { todayDateString } from "@/lib/format";
import { RefreshCw } from "lucide-react";
import { useAdmin } from "../context";
import {
  bookingShopDate,
  displayStatus,
  holdDisplayStatus,
  holdServiceLabel,
  isClientHold,
  linkedHoldBooking,
  isDuplicateHoldBooking,
  matchesHold,
  matchesSearch,
  type DisplayStatus,
} from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import HeldAppointmentRow from "../components/HeldAppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { AdminSelect, EmptyState, fieldClass, GhostButton } from "../components/ui";
import AdminDatePicker from "../components/AdminDatePicker";
import { useOwnerCalendarEvents } from "../useOwnerCalendarEvents";

type ListItem =
  | { kind: "booking"; key: string; date: string; status: DisplayStatus; booking: Booking }
  | { kind: "hold"; key: string; date: string; status: "confirmed" | "completed"; hold: BlockedDate };

export default function AppointmentsPage() {
  const { bookings, blockedDates, isLoading, isRefreshing, refetch, setDetail, setEditing, cancelBooking, openBlockDate, searchQuery, setSearchQuery, token } = useAdmin();
  const [filterDate, setFilterDate] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterStatus, setFilterStatus] = useState<DisplayStatus | "">("");
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
    const today = todayDateString();
    const list: ListItem[] = [];
    for (const booking of bookings) {
      if (searchQuery && !matchesSearch(booking, searchQuery)) continue;
      if (filterService && booking.serviceName !== filterService) continue;
      const date = bookingShopDate(booking);
      if (filterDate && date !== filterDate) continue;
      const status = displayStatus(booking);
      if (isDuplicateHoldBooking(booking, bookings)) continue;
      if (status === "completed" && filterStatus !== "completed") continue;
      if (status === "cancelled" && filterStatus !== "cancelled") continue;
      if (filterStatus && status !== filterStatus) continue;
      if (!filterStatus && !filterDate && view === "list" && status === "confirmed" && date < today) continue;
      if (filterStatus === "confirmed" && !filterDate && view === "list" && date < today) continue;
      list.push({
        kind: "booking",
        key: `booking-${booking.id}`,
        date,
        status,
        booking,
      });
    }
    for (const hold of blockedDates.filter(isClientHold)) {
      if (linkedHoldBooking(bookings, hold)) continue;
      if (searchQuery && !matchesHold(hold, searchQuery)) continue;
      if (filterService && holdServiceLabel(hold) !== filterService) continue;
      if (filterDate && hold.date !== filterDate) continue;
      const status = holdDisplayStatus(hold);
      if (status === "completed" && filterStatus !== "completed") continue;
      if (filterStatus && status !== filterStatus) continue;
      if (!filterDate && view === "list" && hold.date < today && filterStatus !== "completed") continue;
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
  }, [bookings, blockedDates, searchQuery, filterService, filterDate, filterStatus, view]);

  const visible = view === "calendar" ? items.filter((item) => item.date === selectedDate) : items;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="hidden md:block text-xl md:text-2xl font-bold mr-auto">Appointments</h2>
        <div className="grid grid-cols-2 rounded-xl border border-white/10 overflow-hidden w-[10.5rem] md:w-72 shrink-0">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`min-h-10 text-xs md:text-sm touch-manipulation ${view === "list" ? "bg-[#111111] text-white" : "text-[#9CA3AF]"}`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`min-h-10 text-xs md:text-sm touch-manipulation ${view === "calendar" ? "bg-[#111111] text-white" : "text-[#9CA3AF]"}`}
          >
            Calendar
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <GhostButton type="button" onClick={() => void refetch()} disabled={isRefreshing} className="px-3">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </GhostButton>
          <GhostButton type="button" onClick={() => openBlockDate()} className="px-3">
            Block
          </GhostButton>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search appointments"
          className={`${fieldClass} h-10 py-0 text-sm`}
          aria-label="Search appointments"
        />
        <div className="grid grid-cols-3 gap-2">
          <AdminDatePicker
            value={filterDate}
            onChange={setFilterDate}
            bookings={bookings}
            blockedDates={blockedDates}
            compact
          />
          <AdminSelect
            value={filterService}
            onChange={setFilterService}
            aria-label="Filter by service"
            compact
            className="min-w-0"
            options={[
              { value: "", label: "All services" },
              ...serviceOptions.map((s) => ({ value: s, label: s })),
            ]}
          />
          <AdminSelect
            value={filterStatus}
            onChange={(value) => setFilterStatus(value as DisplayStatus | "")}
            aria-label="Filter by status"
            compact
            menuAlign="right"
            className="min-w-0"
            options={[
              { value: "", label: "Upcoming" },
              { value: "confirmed", label: "Confirmed" },
              { value: "in_progress", label: "In progress" },
              { value: "ready_for_pickup", label: "Ready for pickup" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>
        {(filterDate || filterService || filterStatus) && (
          <GhostButton
            type="button"
            className="h-10 self-start"
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
