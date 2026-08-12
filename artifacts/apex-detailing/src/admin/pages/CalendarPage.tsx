import { useState } from "react";
import { formatDateLong, todayDateString } from "@/lib/format";
import { useAdmin } from "../context";
import { bookingShopDate, bookingShopTime } from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { EmptyState, GhostButton } from "../components/ui";
import { PersonalEventsCard } from "../components/PersonalEventsCard";
import { adminUnblockDate, getAdminListBlockedDatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useOwnerCalendarEvents } from "../useOwnerCalendarEvents";

export default function CalendarPage() {
  const { token, bookings, blockedDates, setDetail, setEditing, cancelBooking, openBlockDate, openEditBlockedDate } = useAdmin();
  const today = todayDateString();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const queryClient = useQueryClient();
  const { data: personalEvents = [] } = useOwnerCalendarEvents(token, month);
  const dayBookings = bookings
    .filter((b) => bookingShopDate(b) === selected)
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
  const dayPersonal = personalEvents.filter((e) => e.dates.includes(selected));
  const blocked = blockedDates.find((b) => b.date === selected);

  const unblock = async () => {
    if (!blocked) return;
    if (!confirm(`Re-open ${formatDateLong(blocked.date)}? Customers will be able to book it again.`)) return;
    try {
      await adminUnblockDate(blocked.date, { headers: { "x-admin-token": token } });
      queryClient.invalidateQueries({ queryKey: getAdminListBlockedDatesQueryKey() });
    } catch (e) {
      alert(`Could not re-open: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold">Calendar</h2>
        <GhostButton type="button" onClick={() => openBlockDate(selected)} className="px-3 shrink-0">
          {blocked ? "Edit block" : "Block"}
        </GhostButton>
      </div>
      <MonthCalendar
        month={month}
        onMonthChange={setMonth}
        bookings={bookings}
        blockedDates={blockedDates}
        personalEvents={personalEvents}
        selectedDate={selected}
        onSelectDate={setSelected}
      />
      <div>
        <h3 className="font-bold mb-2">{formatDateLong(selected)}</h3>
        {blocked && (
          <div className="mb-3 rounded-xl border border-white/10 bg-[#111111] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-white">Blocked{blocked.reason ? ` · ${blocked.reason}` : ""}</p>
              {(blocked.name || blocked.phone) && (
                <p className="text-xs text-[#9CA3AF]">{[blocked.name, blocked.surname].filter(Boolean).join(" ")} {blocked.phone}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <GhostButton type="button" onClick={() => openEditBlockedDate(blocked)}>Edit</GhostButton>
              <GhostButton type="button" onClick={unblock}>Re-open</GhostButton>
            </div>
          </div>
        )}
        <PersonalEventsCard events={dayPersonal} />
        {dayBookings.length === 0 && dayPersonal.length === 0 && !blocked ? (
          <EmptyState title="Nothing on this day" body="No appointments or personal calendar events." />
        ) : (
          <div className="space-y-2 mt-3">
            {dayBookings.map((b) => (
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
    </div>
  );
}
