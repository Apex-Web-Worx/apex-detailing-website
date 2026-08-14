/** Storyboard: 8 frames, back → front, stay ON. */
export const FRAME_COUNT = 8;
export const FRAME_ON_MS = [200, 400, 600, 800, 1000, 1200, 1400, 1600] as const;
export const FRAME_LIGHT_MS = 220;
export const INTRO_MS = 2000;
export const HEADLIGHT_START_MS = 1000;
export const HEADLIGHT_END_MS = 1800;

export function ramp(ms: number, start: number, end: number, reduced: boolean): number {
  if (reduced) return 1;
  if (ms <= start) return 0;
  if (ms >= end) return 1;
  return (ms - start) / (end - start);
}

export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

/** OFF until onMs; then illuminates and stays ON. */
export function frameOpacity(clockMs: number, index: number, reduced: boolean): number {
  if (reduced) return 1;
  const start = FRAME_ON_MS[index] ?? 200 + index * 200;
  if (clockMs < start) return 0;
  const t = (clockMs - start) / FRAME_LIGHT_MS;
  if (t <= 0) return 0.4;
  return 0.4 + easeOutCubic(Math.min(1, t)) * 0.6;
}

/** SVG glow is only for the light-up; at 2000ms the photo is the picture. */
export function overlayFade(clockMs: number, reduced: boolean): number {
  if (reduced) return 0;
  if (clockMs >= INTRO_MS) return 0;
  if (clockMs <= 1650) return 1;
  return 1 - (clockMs - 1650) / (INTRO_MS - 1650);
}

export function hexPath(cx: number, cy: number, rx: number, ry: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * rx).toFixed(2)},${(cy + Math.sin(a) * ry).toFixed(2)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
}
