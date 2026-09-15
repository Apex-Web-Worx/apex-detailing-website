import { useReducedMotion } from "framer-motion";
import { imageUrl } from "@/components/OptimizedImage";
import HeroCopy from "./HeroCopy";

type Props = {
  bookingHref: string;
  giftHref: string;
  reviewsHref: string;
  onExplore: (e: React.MouseEvent) => void;
};

/**
 * Hero visual is the front-facing Camaro + hex tunnel photograph on the right.
 * No SVG rings over the car — those blocked the grille.
 */
export default function ApexHero({
  bookingHref,
  giftHref,
  reviewsHref,
  onExplore,
}: Props) {
  const reduce = !!useReducedMotion();
  const scene = imageUrl("hero-tunnel-scene.jpg");
  const sceneWebp = scene.replace(/\.jpg$/i, ".webp");
  const sceneSm = scene.replace(/\.jpg$/i, ".sm.webp");
  const shine = !reduce;

  return (
    <section
      id="home"
      data-mobile-hero="stack-v2"
      className={`apex-hero${shine ? " is-shining" : ""}`}
    >
      {/* Mobile: stage is first in document order; desktop CSS pulls it to the right pane */}
      <div className="apex-hero-stage" aria-hidden="true">
        <div className="apex-hero-plate">
          <picture>
            <source
              media="(max-width: 1023px)"
              srcSet={sceneSm}
              type="image/webp"
            />
            <source
              srcSet={`${sceneSm} 960w, ${sceneWebp} 1536w`}
              type="image/webp"
              sizes="(max-width: 1023px) 100vw, 54vw"
            />
            <img
              src={sceneSm}
              alt=""
              width={1536}
              height={1024}
              className="apex-hero-scene"
              style={{ filter: "brightness(1)" }}
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
          onExplore={onExplore}
        />
      </div>
      <div className="apex-hero-blend" aria-hidden="true" />
    </section>
  );
}
