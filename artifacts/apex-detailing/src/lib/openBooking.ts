import { forceDismissSplash } from "@/lib/bootSplash";

export function bookingUrl(): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${base}/book`;
}

/** Leave the heavy homepage behind so booking is a fresh, tappable page. */
export function goBookNow(event?: { preventDefault?: () => void }) {
  event?.preventDefault?.();
  forceDismissSplash();
  window.location.assign(bookingUrl());
}
