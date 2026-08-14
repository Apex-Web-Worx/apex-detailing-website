import { useId, useMemo } from "react";
import { FRAME_COUNT, frameOpacity, hexPath } from "./heroTiming";

type Props = {
  clockMs: number;
  reduced: boolean;
};

/**
 * Outer SVG hex frames only (inner/middle rings omitted so the grille stays clear).
 * Geometry is static. Only opacity + glow change.
 */
export default function TunnelFrames({ clockMs, reduced }: Props) {
  const uid = useId().replace(/:/g, "");
  const gradId = `tunGrad-${uid}`;
  const glowId = `tunGlow-${uid}`;

  const frames = useMemo(() => {
    // Skip inner rings so they do not sit on the grille
    const cx = 768;
    const cy = 500;
    const innerSkip = 3;
    return Array.from({ length: FRAME_COUNT - innerSkip }, (_, j) => {
      const i = j + innerSkip;
      const t = i / (FRAME_COUNT - 1);
      const rx = 70 + t * 360;
      const ry = rx * 0.68;
      return {
        i,
        d: hexPath(cx, cy, rx, ry),
        stroke: 1.6 + t * 1.8,
      };
    });
  }, []);

  return (
    <div className="apex-tunnel" aria-hidden="true">
      <svg
        className="apex-tunnel-svg"
        viewBox="0 0 1536 1024"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF2AD4" />
            <stop offset="48%" stopColor="#8A52FF" />
            <stop offset="100%" stopColor="#23B9FF" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${glowId})`}>
          {frames.map((f) => (
            <path
              key={f.i}
              className={`tunnel-frame frame-${f.i + 1}`}
              d={f.d}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={f.stroke}
              strokeLinejoin="round"
              opacity={frameOpacity(clockMs, f.i, reduced)}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
