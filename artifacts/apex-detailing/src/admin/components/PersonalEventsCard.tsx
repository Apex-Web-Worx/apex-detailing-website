import { formatTime12h } from "@/lib/format";
import type { VisualCalendarEvent } from "../useOwnerCalendarEvents";

export function PersonalEventsCard({ events }: { events: VisualCalendarEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3">
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#9CA3AF] mb-2">PERSONAL</p>
      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-white truncate">{e.title}</p>
            <p className="text-xs text-[#9CA3AF] shrink-0">
              {e.allDay ? "All day" : formatTime12h(e.startTime)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
