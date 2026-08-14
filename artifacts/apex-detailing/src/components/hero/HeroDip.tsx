import { useId } from "react";

/** Angular 45° neon join — magenta left, purple center, cyan right. */
export default function HeroDip() {
  const uid = useId().replace(/:/g, "");
  const gradId = `dipGrad-${uid}`;
  const glowId = `dipGlow-${uid}`;
  const path = "M0 16 H300 L380 94 H620 L700 16 H1000";

  return (
    <div className="apex-seam" aria-hidden="true">
      <svg className="apex-hero-dip-line" viewBox="0 0 1000 110" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF1AD8" />
            <stop offset="28%" stopColor="#FF1AD8" />
            <stop offset="50%" stopColor="#9D00FF" />
            <stop offset="72%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <filter id={glowId} x="-8%" y="-80%" width="116%" height="260%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={`${path} V110 H0 Z`} fill="#050505" />
        <path
          d={path}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3.4"
          strokeLinejoin="miter"
          strokeLinecap="square"
          filter={`url(#${glowId})`}
        />
        <path
          d={path}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="1.15"
          strokeLinejoin="miter"
          strokeLinecap="square"
          opacity="0.95"
        />
      </svg>
    </div>
  );
}
