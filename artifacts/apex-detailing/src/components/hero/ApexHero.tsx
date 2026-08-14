import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { imageUrl } from "@/components/OptimizedImage";
import HeroCopy from "./HeroCopy";
import { INTRO_MS, ramp } from "./heroTiming";

type Props = {
  bookingHref: string;
  giftHref: string;
  reviewsHref: string;
  onBook: (e: React.MouseEvent) => void;
  onExplore: (e: React.MouseEvent) => void;
};

function readHeroAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("heroAt");
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, n) : null;
}

function waitForSplashGone(): Promise<void> {
  return new Promise((resolve) => {
    if (!document.getElementById("app-loading")) {
      resolve();
      return;
    }
    const obs = new MutationObserver(() => {
      if (!document.getElementById("app-loading")) {
        obs.disconnect();
        resolve();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => {
      obs.disconnect();
      resolve();
    }, 8000);
  });
}

/**
 * Hero visual is the front-facing Camaro + hex tunnel photograph on the right.
 * No SVG rings over the car — those blocked the grille.
 */
export default function ApexHero({
  bookingHref,
  giftHref,
  reviewsHref,
  onBook,
  onExplore,
}: Props) {
  const reduce = !!useReducedMotion();
  const freezeAt = useRef(readHeroAt()).current;
  const [clockMs, setClockMs] = useState(() =>
    reduce ? INTRO_MS : (freezeAt ?? 0),
  );

  useEffect(() => {
    if (reduce) {
      setClockMs(INTRO_MS);
      return;
    }
    if (freezeAt != null) {
      setClockMs(freezeAt);
      return;
    }
    let cancelled = false;
    let raf = 0;
    (async () => {
      await waitForSplashGone();
      if (cancelled) return;
      const t0 = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const ms = Math.min(INTRO_MS, now - t0);
        setClockMs(ms);
        if (ms < INTRO_MS) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [reduce, freezeAt]);

  const scene = imageUrl("hero-tunnel-scene.jpg");
  const sceneWebp = scene.replace(/\.jpg$/i, ".webp");
  const sceneBright = 0.22 + ramp(clockMs, 200, INTRO_MS, reduce) * 0.78;
  const shine = !reduce && (freezeAt == null ? clockMs > 0 : true);

  return (
    <section id="home" className={`apex-hero${shine ? " is-shining" : ""}`}>
      <div className="apex-hero-stage" aria-hidden="true">
        <div className="apex-hero-plate">
          <picture>
            <source
              srcSet={`${scene.replace(/\.jpg$/i, ".sm.webp")} 960w, ${sceneWebp} 1536w`}
              type="image/webp"
              sizes="100vw"
            />
            <img
              src={scene}
              alt=""
              width={1536}
              height={1024}
              className="apex-hero-scene"
              style={{ filter: `brightness(${sceneBright})` }}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </picture>
          <div className="apex-hero-lights" aria-hidden="true">
            <span className="apex-hl-spot apex-hl-spot-l">
              <span className="apex-hl-sheen" />
            </span>
            <span className="apex-hl-spot apex-hl-spot-r">
              <span className="apex-hl-sheen" />
            </span>
            <span className="apex-hl-brow apex-hl-brow-l">
              <span className="apex-hl-sheen" />
            </span>
            <span className="apex-hl-brow apex-hl-brow-r">
              <span className="apex-hl-sheen" />
            </span>
            <span className="apex-hl-drl apex-hl-drl-l">
              <span className="apex-hl-sheen" />
            </span>
            <span className="apex-hl-drl apex-hl-drl-r">
              <span className="apex-hl-sheen" />
            </span>
          </div>
        </div>
      </div>
      <div className="apex-hero-wash" aria-hidden="true" />
      <div className="apex-hero-shell">
        <HeroCopy
          bookingHref={bookingHref}
          giftHref={giftHref}
          reviewsHref={reviewsHref}
          onBook={onBook}
          onExplore={onExplore}
        />
      </div>
      <div className="apex-hero-bridge" aria-hidden="true">
        <div className="apex-hero-bridge-fade" />
        <div className="apex-hero-bridge-pattern" />
        <svg className="apex-hero-bridge-hex" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF1AD8" />
              <stop offset="50%" stopColor="#9D00FF" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>
          </defs>
          {[0.18, 0.34, 0.5, 0.66, 0.82].map((t, i) => {
            const cx = 220 + t * 1000;
            const cy = 78;
            const rx = 70 + i * 14;
            const ry = rx * 0.55;
            const pts = Array.from({ length: 6 }, (_, k) => {
              const a = (Math.PI / 3) * k - Math.PI / 2;
              return `${(cx + Math.cos(a) * rx).toFixed(1)},${(cy + Math.sin(a) * ry).toFixed(1)}`;
            });
            return (
              <polygon
                key={i}
                points={pts.join(" ")}
                fill="none"
                stroke="url(#bridgeGrad)"
                strokeWidth={1.2 + i * 0.15}
                opacity={0.22 + i * 0.08}
              />
            );
          })}
        </svg>
        <div className="apex-hero-bridge-bar" />
      </div>
    </section>
  );
}
