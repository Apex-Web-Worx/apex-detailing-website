import type { Service } from "@workspace/api-client-react";

/**
 * Packages that must appear on Choose Service even if the live API catalog
 * is one publish behind (common when Vite proxies to production).
 * Real API rows always win when present (same slug).
 */
export const CATALOG_FALLBACKS: Service[] = [
  {
    id: -65,
    slug: "apex-moto",
    name: "Apex Moto",
    description:
      "Motorcycle detailing starting at $150. $150 hand wash with 1-month ceramic spray protection. $250 polish for paint and chrome plus carnauba wax or polymer sealant for up to 6–8 months of shine and protection.",
    durationMinutes: 120,
    priceCents: 15000,
    sortOrder: 65,
    active: true,
  },
];

/** Merge API services with any fallback packages still missing from the API. */
export function mergeServiceCatalog(api: Service[] | undefined): Service[] | undefined {
  if (!api) return api;
  const have = new Set(api.map((s) => s.slug));
  const extras = CATALOG_FALLBACKS.filter((s) => !have.has(s.slug));
  if (extras.length === 0) return api;
  return [...api, ...extras].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}
