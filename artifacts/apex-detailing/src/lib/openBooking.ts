import { forceDismissSplash } from "@/lib/bootSplash";

/** Optional `pkg` deep-links to that package card on the booking picker (e.g. `ceramic`). */
export function bookingUrl(pkg?: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (pkg) {
    return `${base}/book?pkg=${encodeURIComponent(pkg)}`;
  }
  return `${base}/book`;
}

/** Leave the heavy homepage behind so booking is a fresh, tappable page. */
export function goBookNow(
  event?: { preventDefault?: () => void },
  pkg?: string,
) {
  event?.preventDefault?.();
  forceDismissSplash();
  window.location.assign(bookingUrl(pkg));
}
