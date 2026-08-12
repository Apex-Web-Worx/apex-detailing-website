import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking, BlockedDate } from "@workspace/api-client-react";
import { todayDateString } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addMonths, bookingShopDate, daysInMonth, displayStatus, monthLabel } from "../utils";
import type { VisualCalendarEvent } from "../useOwnerCalendarEvents";
import { GhostButton, PrimaryButton } from "./ui";

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function MonthCalendar({
  month,
  onMonthChange,
  bookings,
  blockedDates,
  personalEvents = [],
  selectedDate,
  onSelectDate,
  onBlockDate,
}: {
  month: string;
  onMonthChange: (next: string) => void;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  personalEvents?: VisualCalendarEvent[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onBlockDate?: () => void;
}) {
  const today = todayDateString();
  const [year, monthNum] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNum - 1, 1));
  const startPad = first.getUTCDay();
  const count = daysInMonth(month);
  const cells: (string | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const blockedSet = new Set(blockedDates.map((b) => b.date));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-4">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h3 className="font-bold text-white mr-auto">{monthLabel(month)}</h3>
        <GhostButton type="button" className="h-8 px-3 text-xs" onClick={() => onMonthChange(today.slice(0, 7))}>
          Today
        </GhostButton>
        <button
          type="button"
          className="w-8 h-8 rounded-lg border border-white/10 hover:bg-white/5"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 mx-auto" />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-lg border border-white/10 hover:bg-white/5"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 mx-auto" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-[10px] font-bold tracking-wider text-[#9CA3AF] text-center py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="min-h-14" />;
          const dayBookings = bookings.filter((b) => bookingShopDate(b) === date);
          const dayPersonal = personalEvents.filter((e) => e.dates.includes(date));
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const blocked = blockedSet.has(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate?.(date)}
              className={cn(
                "min-h-14 rounded-xl p-1 text-left border transition duration-150",
                isSelected
                  ? "border-[#FF2AD4]/50 bg-[#FF2AD4]/10"
                  : "border-transparent hover:bg-white/5",
                blocked && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold inline-flex w-6 h-6 items-center justify-center rounded-full",
                  isToday ? "bg-[#FF2AD4] text-white" : "text-white",
                )}
              >
                {Number(date.slice(-2))}
              </span>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {dayBookings.slice(0, 3).map((b) => {
                  const status = displayStatus(b);
                  const color =
                    status === "cancelled"
                      ? "bg-red-400"
                      : status === "completed"
                        ? "bg-gray-500"
                        : "bg-[#FF2AD4]";
                  return <span key={b.id} className={cn("w-1.5 h-1.5 rounded-full", color)} />;
                })}
                {dayPersonal.slice(0, 2).map((e) => (
                  <span key={e.id} className="w-1.5 h-1.5 rounded-full bg-[#23B9FF]" />
                ))}
                {blocked && <span className="w-1.5 h-1.5 rounded-full bg-[#8A52FF]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] text-[#9CA3AF]">
        <Legend color="bg-[#FF2AD4]" label="Confirmed" />
        <Legend color="bg-[#23B9FF]" label="Personal" />
        <Legend color="bg-[#8A52FF]" label="Blocked" />
        <Legend color="bg-gray-500" label="Completed" />
        {onBlockDate && (
          <PrimaryButton type="button" className="ml-auto h-8 px-3 text-xs" onClick={onBlockDate}>
            + Block Date
          </PrimaryButton>
        )}
      </div>
      <p className="text-[11px] text-[#9CA3AF] mt-2">
        Personal events are from your Gmail calendar. They are visual only and do not change customer booking availability.
      </p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("w-2 h-2 rounded-full", color)} />
      {label}
    </span>
  );
}
