import { useId, useMemo } from "react";
import { FRAME_COUNT, hexPath } from "./heroTiming";

/**
 * Outer hex rings only. A center mask keeps strokes off the car.
 * Slow blink is CSS (opacity + glow).
 */
export default function TunnelFrames() {
  const uid = useId().replace(/:/g, "");
  const gradId = `tunGrad-${uid}`;
  const glowId = `tunGlow-${uid}`;
  const maskId = `tunMask-${uid}`;

  const frames = useMemo(() => {
    const cx = 768;
    const cy = 500;
    const innerSkip = 5;
    return Array.from({ length: FRAME_COUNT - innerSkip }, (_, j) => {
      const i = j + innerSkip;
      const t = i / (FRAME_COUNT - 1);
      const rx = 70 + t * 360;
      const ry = rx * 0.68;
      return {
        i,
        d: hexPath(cx, cy, rx, ry),
        stroke: 1.8 + t * 1.6,
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
          <mask id={maskId}>
            <rect width="1536" height="1024" fill="white" />
            <ellipse cx="768" cy="530" rx="310" ry="250" fill="black" />
          </mask>
        </defs>
        <g filter={`url(#${glowId})`} mask={`url(#${maskId})`}>
          {frames.map((f) => (
            <path
              key={f.i}
              className={`tunnel-frame frame-${f.i + 1}`}
              d={f.d}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={f.stroke}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
