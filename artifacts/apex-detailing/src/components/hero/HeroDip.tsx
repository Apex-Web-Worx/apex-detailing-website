import { ChevronDown } from "lucide-react";
import { useId, type MouseEvent } from "react";

type Props = {
  onExplore: (e: MouseEvent) => void;
};

/** Neon dip sitting on the horizontal join between hero and services. */
export default function HeroDip({ onExplore }: Props) {
  const uid = useId().replace(/:/g, "");
  const gradId = `dipGrad-${uid}`;
  const glowId = `dipGlow-${uid}`;

  return (
    <div className="apex-hero-dip">
      <svg className="apex-hero-dip-line" viewBox="0 0 1000 110" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF1AD8" />
            <stop offset="50%" stopColor="#9D00FF" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M0 2 H380 L460 72 H540 L620 2 H1000"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="2.6"
          strokeLinejoin="miter"
          filter={`url(#${glowId})`}
        />
      </svg>
      <a
        href="#services"
        className="apex-hero-dip-btn"
        onClick={onExplore}
        aria-label="Scroll to services"
      >
        <ChevronDown className="w-5 h-5" strokeWidth={2.4} />
      </a>
    </div>
  );
}
