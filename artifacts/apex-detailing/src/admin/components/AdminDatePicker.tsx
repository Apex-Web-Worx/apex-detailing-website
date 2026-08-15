import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BlockedDate, Booking } from "@workspace/api-client-react";
import { formatDateShort, todayDateString } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fieldClass } from "./ui";
import {
  addMonths,
  bookingShopDate,
  daysInMonth,
  displayStatus,
  isClientHold,
  linkedHoldBooking,
  monthLabel,
} from "../utils";

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function AdminDatePicker({
  value,
  onChange,
  minDate,
  bookings = [],
  blockedDates = [],
  allowDate,
  disableBlocked = false,
  required = false,
  compact = false,
  className,
}: {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  bookings?: Booking[];
  blockedDates?: BlockedDate[];
  /** Date that stays selectable even if it is blocked (the row being edited). */
  allowDate?: string;
  disableBlocked?: boolean;
  required?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const today = todayDateString();
  const [month, setMonth] = useState(() => (value || minDate || today).slice(0, 7));
  const [open, setOpen] = useState(!compact);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setMonth(value.slice(0, 7));
  }, [value]);

  useEffect(() => {
    if (!compact || !open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [compact, open]);

  const blockedByDate = useMemo(
    () => new Map(blockedDates.map((row) => [row.date, row])),
    [blockedDates],
  );
  const appointmentCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    for (const booking of bookings) {
      if (displayStatus(booking) === "cancelled") continue;
      const date = bookingShopDate(booking);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
    for (const row of blockedDates) {
      if (!isClientHold(row)) continue;
      if (linkedHoldBooking(bookings, row)) continue;
      counts.set(row.date, (counts.get(row.date) ?? 0) + 1);
    }
    return counts;
  }, [bookings, blockedDates]);

  const [year, monthNum] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, monthNum - 1, 1));
  const startPad = first.getUTCDay();
  const count = daysInMonth(month);
  const cells: (string | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const pick = (next: string) => {
    onChange(next);
    if (compact) setOpen(false);
  };

  const calendar = (
    <div className={cn(!compact && "rounded-2xl border border-white/10 bg-[#111111] p-3")}>
      <input type="hidden" value={value} required={required} readOnly />
      <div className="flex items-center gap-2 mb-3">
        <p className="font-bold text-white mr-auto">{monthLabel(month)}</p>
        <button
          type="button"
          className="h-8 px-3 text-xs rounded-lg border border-white/10 text-[#9CA3AF] hover:text-white hover:bg-white/5 touch-manipulation"
          onClick={() => {
            const next = today.slice(0, 7);
            setMonth(next);
            if (!minDate || today >= minDate) pick(today);
          }}
        >
          Today
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/5 touch-manipulation"
          onClick={() => setMonth(addMonths(month, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 mx-auto" />
        </button>
        <button
          type="button"
          className="w-9 h-9 rounded-lg border border-white/10 hover:bg-white/5 touch-manipulation"
          onClick={() => setMonth(addMonths(month, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 mx-auto" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d) => (
          <div key={d} className="text-[10px] font-bold tracking-wider text-[#9CA3AF] text-center py-1">
            {d.slice(0, 1)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="min-h-10" />;
          const blocked = blockedByDate.get(date);
          const hold = blocked ? isClientHold(blocked) : false;
          const appointmentCount = appointmentCountByDate.get(date) ?? 0;
          const tooEarly = Boolean(minDate && date < minDate && date !== allowDate);
          const blockedOut = Boolean(disableBlocked && blocked && date !== allowDate);
          const disabled = tooEarly || blockedOut;
          const isToday = date === today;
          const isSelected = date === value;
          const dots = Math.min(appointmentCount, 3);

          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={() => pick(date)}
              title={
                blockedOut
                  ? hold
                    ? "Already held as an appointment"
                    : "Already blocked"
                  : tooEarly
                    ? "Past date"
                    : appointmentCount > 0
                      ? `${appointmentCount} appointment${appointmentCount === 1 ? "" : "s"}`
                      : formatDateShort(date)
              }
              aria-label={`${formatDateShort(date)}${blockedOut ? ", blocked" : ""}${appointmentCount ? `, ${appointmentCount} appointment${appointmentCount === 1 ? "" : "s"}` : ""}`}
              className={cn(
                "min-h-10 rounded-lg p-1 text-center border transition duration-150 touch-manipulation",
                isSelected
                  ? "border-[#FF2AD4]/60 bg-[#FF2AD4]/15"
                  : "border-transparent",
                disabled
                  ? "opacity-40 cursor-not-allowed bg-white/[0.03]"
                  : "hover:bg-white/5",
                blocked && !hold && !isSelected && "bg-[#8A52FF]/15",
                appointmentCount > 0 && !disabled && !isSelected && "bg-[#FF2AD4]/5",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold inline-flex w-6 h-6 items-center justify-center rounded-full mx-auto",
                  isToday && !disabled ? "bg-[#FF2AD4] text-white" : "text-white",
                  disabled && "text-[#6B7280]",
                )}
              >
                {Number(date.slice(-2))}
              </span>
              <div className="mt-0.5 flex flex-wrap justify-center gap-0.5 min-h-1.5">
                {blocked && !hold ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A52FF]" />
                ) : null}
                {Array.from({ length: dots }).map((_, idx) => (
                  <span key={idx} className="w-1.5 h-1.5 rounded-full bg-[#FF2AD4]" />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-[#9CA3AF]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF2AD4]" /> Appointment
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8A52FF]" /> Blocked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6B7280]" /> Unavailable
        </span>
      </div>
      {!compact ? (
        value ? (
          <p className="text-sm text-white mt-2">{formatDateShort(value)}</p>
        ) : (
          <p className="text-sm text-[#9CA3AF] mt-2">Pick a date</p>
        )
      ) : null}
    </div>
  );

  if (!compact) return calendar;

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(fieldClass, "h-10 py-0 text-sm text-left truncate", className)}
        aria-expanded={open}
      >
        {value ? formatDateShort(value) : "Date"}
      </button>
      {open ? (
        <div className="absolute z-30 mt-2 left-0 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-white/10 bg-[#111111] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
          {calendar}
        </div>
      ) : null}
    </div>
  );
}
