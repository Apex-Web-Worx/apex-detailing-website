import { formatTime12h } from "@/lib/format";
import { cn } from "@/lib/utils";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function parseTime(value: string): { hour24: number; minute: number } {
  const [hStr, mStr] = (value || "12:00").split(":");
  const hour24 = Math.min(23, Math.max(0, Number(hStr) || 0));
  const minute = Math.min(59, Math.max(0, Number(mStr) || 0));
  return { hour24, minute };
}

function toHHmm(hour24: number, minute: number): string {
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function snapMinute(minute: number): number {
  return Math.min(55, Math.round(minute / 5) * 5);
}

export function snapTimeToFiveMinutes(value: string): string {
  const { hour24, minute } = parseTime(value);
  return toHHmm(hour24, snapMinute(minute));
}

export default function AdminTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (time: string) => void;
}) {
  const { hour24, minute } = parseTime(value);
  const minuteSnapped = snapMinute(minute);
  const isPm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const setParts = (nextHour12: number, nextMinute: number, nextPm: boolean) => {
    const nextHour24 = nextPm ? (nextHour12 % 12) + 12 : nextHour12 % 12;
    onChange(toHHmm(nextHour24, nextMinute));
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] p-3 space-y-3">
      <p className="text-lg font-bold tabular-nums text-white">{formatTime12h(toHHmm(hour24, minuteSnapped))}</p>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">Hour</p>
        <div className="grid grid-cols-6 gap-1.5">
          {HOURS.map((hour) => {
            const active = hour === hour12;
            return (
              <button
                key={hour}
                type="button"
                onClick={() => setParts(hour, minuteSnapped, isPm)}
                className={cn(
                  "min-h-11 rounded-lg text-sm font-semibold tabular-nums touch-manipulation",
                  active
                    ? "bg-[#FF2AD4] text-white"
                    : "bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/10",
                )}
              >
                {hour}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">Minutes</p>
        <div className="grid grid-cols-6 gap-1.5">
          {MINUTES.map((m) => {
            const active = m === minuteSnapped;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setParts(hour12, m, isPm)}
                className={cn(
                  "min-h-11 rounded-lg text-sm font-semibold tabular-nums touch-manipulation",
                  active
                    ? "bg-[#FF2AD4] text-white"
                    : "bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/10",
                )}
              >
                {String(m).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {(["AM", "PM"] as const).map((period) => {
          const active = period === "PM" ? isPm : !isPm;
          return (
            <button
              key={period}
              type="button"
              onClick={() => setParts(hour12, minuteSnapped, period === "PM")}
              className={cn(
                "min-h-11 rounded-lg text-sm font-semibold touch-manipulation",
                active
                  ? "bg-[#FF2AD4] text-white"
                  : "bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/10",
              )}
            >
              {period}
            </button>
          );
        })}
      </div>
    </div>
  );
}
