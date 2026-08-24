/** Finished-example photos shown on every package card. */
export const PKG_PHOTO: Record<string, string> = {
  full: "pkg-full.jpg",
  interior: "pkg-interior.jpg",
  express: "pkg-express.jpg",
  exterior: "pkg-exterior.jpg",
  wax: "pkg-wax.jpg",
  headlight: "pkg-headlight.jpg",
  ceramic: "pkg-ceramic.jpg",
  paint: "pkg-paint.jpg",
};

/** Maps booking API slugs to homepage package copy keys. */
export const BOOKING_SLUG_TO_PKG: Record<string, string> = {
  "apex-full-detailing": "full",
  "apex-interior-detailing": "interior",
  "apex-express-interior-detailing": "express",
  "apex-exterior-detailing": "exterior",
  "apex-wash-clay-wax": "wax",
  "apex-headlight-restoration": "headlight",
  "apex-ceramic-coating": "ceramic",
  "apex-paint-correction": "paint",
};

export function packageTitleKey(slug: string): string | null {
  const pkg = BOOKING_SLUG_TO_PKG[slug];
  return pkg ? `pkg.${pkg}.title` : null;
}

export function packageDescKey(slug: string): string | null {
  const pkg = BOOKING_SLUG_TO_PKG[slug];
  return pkg ? `pkg.${pkg}.desc` : null;
}

export type PackagePriceTier = { label: string; amount: string };

/** Vehicle-size price rows from `pkg.{name}.tier.{n}.label` / `.amount`. */
export function packagePriceTiers(
  t: (key: string) => string,
  pkg: string | undefined,
): PackagePriceTier[] {
  if (!pkg) return [];
  const rows: PackagePriceTier[] = [];
  for (let i = 0; i < 8; i++) {
    const labelKey = `pkg.${pkg}.tier.${i}.label`;
    const amountKey = `pkg.${pkg}.tier.${i}.amount`;
    const label = t(labelKey);
    const amount = t(amountKey);
    if (label === labelKey || amount === amountKey) break;
    rows.push({ label, amount });
  }
  return rows;
}

