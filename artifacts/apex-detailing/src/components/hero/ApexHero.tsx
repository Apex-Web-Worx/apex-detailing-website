import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { imageUrl } from "@/components/OptimizedImage";
import HeroCopy from "./HeroCopy";
import TunnelFrames from "./TunnelFrames";

type Props = {
  bookingHref: string;
  giftHref: string;
  reviewsHref: string;
  onBook: (e: React.MouseEvent) => void;
  onExplore: (e: React.MouseEvent) => void;
};

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
 * Front-facing Camaro on the right. Headlights and outer tunnel rings
 * blink slowly. A mask keeps hex strokes off the car.
 */
export default function ApexHero({
  bookingHref,
  giftHref,
  reviewsHref,
  onBook,
  onExplore,
}: Props) {
  const reduce = !!useReducedMotion();
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    (async () => {
      await waitForSplashGone();
      if (!cancelled) setAnimating(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [reduce]);

  const scene = imageUrl("hero-tunnel-scene.jpg");
  const sceneWebp = scene.replace(/\.jpg$/i, ".webp");

  return (
    <section id="home" className={`apex-hero${animating ? " is-animating" : ""}`}>
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
              loading="eager"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </picture>
          <div className="apex-hero-tunnel-layer">
            <TunnelFrames />
          </div>
          <div className="apex-hero-lights">
            <span className="apex-hl apex-hl-l" />
            <span className="apex-hl apex-hl-r" />
            <span className="apex-hl apex-hl-drl-l" />
            <span className="apex-hl apex-hl-drl-r" />
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
    </section>
  );
}
