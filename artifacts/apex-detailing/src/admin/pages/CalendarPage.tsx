import { useState } from "react";
import { formatDateLong, todayDateString } from "@/lib/format";
import { useAdmin } from "../context";
import { bookingShopDate, bookingShopTime } from "../utils";
import AppointmentRow from "../components/AppointmentRow";
import MonthCalendar from "../components/MonthCalendar";
import { EmptyState, GhostButton } from "../components/ui";
import { adminUnblockDate, getAdminListBlockedDatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function CalendarPage() {
  const { token, bookings, blockedDates, setDetail, setEditing, cancelBooking, openBlockDate } = useAdmin();
  const today = todayDateString();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const queryClient = useQueryClient();
  const dayBookings = bookings
    .filter((b) => bookingShopDate(b) === selected)
    .sort((a, b) => bookingShopTime(a).localeCompare(bookingShopTime(b)));
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
        <h2 className="text-2xl font-bold">Calendar</h2>
        <GhostButton type="button" onClick={() => openBlockDate(selected)}>+ Block Date</GhostButton>
      </div>
      <MonthCalendar
        month={month}
        onMonthChange={setMonth}
        bookings={bookings}
        blockedDates={blockedDates}
        selectedDate={selected}
        onSelectDate={setSelected}
        onBlockDate={() => openBlockDate(selected)}
      />
      <div>
        <h3 className="font-bold mb-2">{formatDateLong(selected)}</h3>
        {blocked && (
          <div className="mb-3 rounded-xl border border-white/10 bg-[#111111] p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-white">Blocked{blocked.reason ? ` · ${blocked.reason}` : ""}</p>
              {(blocked.name || blocked.phone) && (
                <p className="text-xs text-[#9CA3AF]">{[blocked.name, blocked.surname].filter(Boolean).join(" ")} {blocked.phone}</p>
              )}
            </div>
            <GhostButton type="button" onClick={unblock}>Re-open</GhostButton>
          </div>
        )}
        {dayBookings.length === 0 ? (
          <EmptyState title="No appointments this day" body="Select another date or create a booking from the public form." />
        ) : (
          <div className="space-y-2">
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
