import { useEffect, useState } from "react";
import { bookingDetailElapsedMs, formatElapsedClock, formatElapsedLong } from "../utils";
import type { Booking } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export default function DetailTimer({
  booking,
  size = "md",
}: {
  booking: Booking;
  size?: "sm" | "md" | "lg";
}) {
  const running = booking.status === "in_progress" && Boolean(booking.inProgressAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running, booking.inProgressAt]);

  const ms = bookingDetailElapsedMs(booking, now);
  if (ms == null) return null;

  const clock = formatElapsedClock(ms);
  const label = running ? "Detailing" : "Detailed";

  return (
    <div className={cn("min-w-0", size === "lg" && "text-center")}>
      <p
        className={cn(
          "font-bold tabular-nums text-white tracking-tight",
          size === "lg" && "text-4xl md:text-5xl",
          size === "md" && "text-lg",
          size === "sm" && "text-sm",
        )}
      >
        {clock}
      </p>
      <p className={cn("text-[#9CA3AF]", size === "lg" ? "text-xs mt-1" : "text-[11px]")}>
        {running ? `${label}…` : `${label} ${formatElapsedLong(ms)}`}
      </p>
    </div>
  );
}
