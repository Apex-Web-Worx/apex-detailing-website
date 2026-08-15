/** Finished-example photos shown on Full / Interior / Express cards. */
export const PKG_PHOTO: Record<string, string> = {
  full: "pkg-full.jpg",
  interior: "pkg-interior.jpg",
  express: "pkg-express.jpg",
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

