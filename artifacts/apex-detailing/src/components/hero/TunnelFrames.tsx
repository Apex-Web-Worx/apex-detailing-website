import { useMemo } from "react";
import { hexPath } from "./heroTiming";

/**
 * Thin hex strokes only — sit on the photo tunnel rings and pulse one color.
 * Inner rings are skipped so nothing covers the grille.
 */
export default function TunnelFrames() {
  const frames = useMemo(() => {
    const cx = 768;
    const cy = 498;
    return [
      { rx: 355, ry: 232, sw: 2.1 },
      { rx: 455, ry: 298, sw: 2.25 },
      { rx: 570, ry: 374, sw: 2.4 },
      { rx: 700, ry: 458, sw: 2.55 },
      { rx: 850, ry: 556, sw: 2.7 },
    ].map((f, i) => ({
      i,
      d: hexPath(cx, cy, f.rx, f.ry),
      sw: f.sw,
    }));
  }, []);

  return (
    <div className="apex-tunnel" aria-hidden="true">
      <svg
        className="apex-tunnel-svg"
        viewBox="0 0 1536 1024"
        preserveAspectRatio="none"
      >
        {frames.map((f) => (
          <path
            key={f.i}
            className="apex-tunnel-line"
            d={f.d}
            fill="none"
            stroke="#FF1AD8"
            strokeWidth={f.sw}
            strokeLinejoin="miter"
          />
        ))}
      </svg>
    </div>
  );
}
