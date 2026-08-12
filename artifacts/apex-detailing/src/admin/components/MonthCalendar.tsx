import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking, BlockedDate } from "@workspace/api-client-react";
import { formatTime12h, todayDateString } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  addMonths,
  bookingShopDate,
  bookingShopTime,
  daysInMonth,
  displayStatus,
  monthLabel,
} from "../utils";
import type { VisualCalendarEvent } from "../useOwnerCalendarEvents";
import { GhostButton, PrimaryButton } from "./ui";

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type DayItem = {
  key: string;
  sort: string;
  time: string;
  label: string;
  tone: "booking" | "personal" | "blocked" | "done";
};

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

  const blockedByDate = new Map(blockedDates.map((b) => [b.date, b]));

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
          if (!date) return <div key={`e-${i}`} className="min-h-20 md:min-h-24" />;
          const dayBookings = bookings.filter((b) => bookingShopDate(b) === date);
          const dayPersonal = personalEvents.filter((e) => e.dates.includes(date));
          const blocked = blockedByDate.get(date);
          const items: DayItem[] = [
            ...dayBookings.map((b) => {
              const status = displayStatus(b);
              return {
                key: `b-${b.id}`,
                sort: bookingShopTime(b),
                time: formatTime12h(bookingShopTime(b)),
                label: b.serviceName,
                tone: (status === "confirmed" ? "booking" : "done") as DayItem["tone"],
              };
            }),
            ...dayPersonal.map((e) => ({
              key: `p-${e.id}`,
              sort: e.allDay ? "00:00" : e.startTime,
              time: e.allDay ? "All day" : formatTime12h(e.startTime),
              label: e.title,
              tone: "personal" as const,
            })),
          ];
          if (blocked) {
            items.unshift({
              key: `x-${blocked.id}`,
              sort: "",
              time: "",
              label: blocked.reason?.trim() ? blocked.reason : "Blocked",
              tone: "blocked",
            });
          }
          items.sort((a, b) => a.sort.localeCompare(b.sort));
          const shown = items.slice(0, 3);
          const extra = items.length - shown.length;
          const isToday = date === today;
          const isSelected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate?.(date)}
              className={cn(
                "min-h-20 md:min-h-24 rounded-xl p-1 text-left border transition duration-150 overflow-hidden",
                isSelected
                  ? "border-[#FF2AD4]/50 bg-[#FF2AD4]/10"
                  : "border-transparent hover:bg-white/5",
                blocked && "opacity-80",
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
              <div className="mt-0.5 space-y-0.5">
                {shown.map((item) => (
                  <p
                    key={item.key}
                    className={cn(
                      "text-[9px] md:text-[10px] leading-tight truncate",
                      item.tone === "personal" && "text-[#23B9FF]",
                      item.tone === "booking" && "text-[#FF2AD4]",
                      item.tone === "blocked" && "text-[#8A52FF]",
                      item.tone === "done" && "text-[#9CA3AF]",
                    )}
                    title={`${item.time} ${item.label}`.trim()}
                  >
                    {item.time ? `${item.time} ` : ""}
                    {item.label}
                  </p>
                ))}
                {extra > 0 && (
                  <p className="text-[9px] text-[#9CA3AF]">+{extra} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] text-[#9CA3AF]">
        <Legend color="bg-[#FF2AD4]" label="Appointment" />
        <Legend color="bg-[#23B9FF]" label="Personal" />
        <Legend color="bg-[#8A52FF]" label="Blocked" />
        {onBlockDate && (
          <PrimaryButton type="button" className="ml-auto h-8 px-3 text-xs" onClick={onBlockDate}>
            + Block Date
          </PrimaryButton>
        )}
      </div>
      <p className="text-[11px] text-[#9CA3AF] mt-2">
        Blue text is from your Gmail and Interactio calendars. It is visual only and does not change customer booking availability.
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
