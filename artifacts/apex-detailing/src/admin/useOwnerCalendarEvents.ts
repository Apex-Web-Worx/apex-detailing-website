import { useQuery } from "@tanstack/react-query";
import { addDaysToDateString } from "@/lib/format";

export type VisualCalendarEvent = {
  id: string;
  title: string;
  allDay: boolean;
  startTime: string;
  dates: string[];
  calendar?: string;
};

export function useOwnerCalendarEvents(token: string, month: string) {
  const start = addDaysToDateString(`${month}-01`, -7);
  const end = addDaysToDateString(`${month}-01`, 38);
  return useQuery({
    queryKey: ["admin-calendar-events", start, end],
    queryFn: async (): Promise<VisualCalendarEvent[]> => {
      const res = await fetch(
        `/api/admin/calendar-events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        { headers: { "x-admin-token": token } },
      );
      if (!res.ok) return [];
      const json = (await res.json()) as { events?: VisualCalendarEvent[] };
      return json.events ?? [];
    },
    staleTime: 60_000,
  });
}
