import { ChevronDown } from "lucide-react";
import { useId, type MouseEvent } from "react";

type Props = {
  href: string;
  onExplore?: (e: MouseEvent) => void;
};

/** Magenta-to-cyan dip + ripple on the join between two page blocks. */
export default function HeroDip({ href, onExplore }: Props) {
  const uid = useId().replace(/:/g, "");
  const gradId = `dipGrad-${uid}`;
  const glowId = `dipGlow-${uid}`;
  const id = href.replace(/^#/, "");

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onExplore) {
      onExplore(e);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="apex-seam">
      <div className="apex-hero-ripple" aria-hidden="true" />
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
      <a href={href} className="apex-hero-dip-btn" onClick={onClick} aria-label="Next section">
        <ChevronDown className="w-5 h-5" strokeWidth={2.4} />
      </a>
    </div>
  );
}
