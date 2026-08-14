import HeroCopy from "./HeroCopy";
import TransformSplit from "./TransformSplit";

type Props = {
  bookingHref: string;
  giftHref: string;
  reviewsHref: string;
  onBook: (e: React.MouseEvent) => void;
  onExplore: (e: React.MouseEvent) => void;
};

/**
 * Concept 3 — Transform hero.
 * Left: existing Apex copy/CTAs. Right: before/after neon split.
 * Rest of homepage untouched.
 */
export default function ApexHero({
  bookingHref,
  giftHref,
  reviewsHref,
  onBook,
  onExplore,
}: Props) {
  return (
    <section id="home" className="apex-hero apex-hero--transform">
      <div className="apex-hero-stage" aria-hidden="true">
        <div className="apex-hero-glow pink" />
        <div className="apex-hero-glow blue" />
        <div className="apex-hero-visual">
          <TransformSplit />
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
