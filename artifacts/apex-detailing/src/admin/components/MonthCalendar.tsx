import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Booking, BlockedDate } from "@workspace/api-client-react";
import { todayDateString } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addMonths, bookingShopDate, daysInMonth, displayStatus, isClientHold, monthLabel } from "../utils";
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
  compact = false,
  className,
}: {
  month: string;
  onMonthChange: (next: string) => void;
  bookings: Booking[];
  blockedDates: BlockedDate[];
  personalEvents?: VisualCalendarEvent[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onBlockDate?: () => void;
  compact?: boolean;
  className?: string;
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
    <div className={cn("rounded-2xl border border-white/10 bg-[#111111] p-3 md:p-4 h-full", className)}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-bold text-white mr-auto">{monthLabel(month)}</h3>
        <GhostButton type="button" className="h-8 px-3 text-xs" onClick={() => onMonthChange(today.slice(0, 7))}>
          Today
        </GhostButton>
        <button
          type="button"
          className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/5 touch-manipulation"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 mx-auto" />
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/5 touch-manipulation"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 mx-auto" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-[10px] font-bold tracking-wider text-[#9CA3AF] text-center py-1">
            <span className="md:hidden">{d.slice(0, 1)}</span>
            <span className="hidden md:inline">{d}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="min-h-10 md:min-h-12" />;
          const dayBookings = bookings.filter((b) => bookingShopDate(b) === date && displayStatus(b) !== "cancelled");
          const dayPersonal = personalEvents.filter((e) => e.dates.includes(date));
          const blocked = blockedByDate.get(date);
          const hold = blocked && isClientHold(blocked);
          const dots: Array<"booking" | "personal" | "blocked" | "done"> = [];
          if (blocked) {
            if (hold) dots.push(date < today ? "done" : "booking");
            else dots.push("blocked");
          }
          for (const b of dayBookings) {
            if (dots.length >= 4) break;
            dots.push(displayStatus(b) === "completed" ? "done" : "booking");
          }
          for (let i = 0; i < dayPersonal.length && dots.length < 4; i++) {
            dots.push("personal");
          }
          const isToday = date === today;
          const isSelected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate?.(date)}
              className={cn(
                "min-h-10 md:min-h-12 rounded-lg p-1 text-center border transition duration-150 touch-manipulation",
                isSelected
                  ? "border-[#FF2AD4]/50 bg-[#FF2AD4]/10"
                  : "border-transparent hover:bg-white/5",
                blocked && !hold && !isSelected && "bg-[#8A52FF]/10",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold inline-flex w-6 h-6 items-center justify-center rounded-full mx-auto",
                  isToday ? "bg-[#FF2AD4] text-white" : "text-white",
                )}
              >
                {Number(date.slice(-2))}
              </span>
              <div className="mt-0.5 flex flex-wrap justify-center gap-0.5 min-h-1.5">
                {dots.map((tone, idx) => (
                  <span
                    key={`${date}-${idx}`}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      tone === "personal" && "bg-[#23B9FF]",
                      tone === "booking" && "bg-[#FF2AD4]",
                      tone === "blocked" && "bg-[#8A52FF]",
                      tone === "done" && "bg-[#9CA3AF]",
                    )}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-[11px] text-[#9CA3AF]">
        <Legend color="bg-[#FF2AD4]" label="Appointment" />
        <Legend color="bg-[#23B9FF]" label="Personal" />
        <Legend color="bg-[#8A52FF]" label="Blocked" />
        {onBlockDate && !compact && (
          <PrimaryButton type="button" className="ml-auto h-9 px-3 text-xs w-full sm:w-auto" onClick={onBlockDate}>
            {selectedDate && blockedByDate.has(selectedDate) ? "Edit blocked date" : "+ Block Date"}
          </PrimaryButton>
        )}
      </div>
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
