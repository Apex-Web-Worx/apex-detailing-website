import { useEffect, useRef, useState } from "react";
import OptimizedImage from "@/components/OptimizedImage";

type Props = {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
};

/** Looping gallery card video — attach src only when on screen. */
export default function GalleryVideoThumb({ src, poster, alt, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || failed) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (on) {
          if (!el.getAttribute("src")) el.src = src;
          void el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.35, 0.6], rootMargin: "80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [failed, src]);

  if (failed) {
    if (!poster) return null;
    return (
      <OptimizedImage
        src={poster}
        alt={alt}
        className={className}
        style={{ filter: "brightness(1.15) contrast(1.15)" }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <video
      ref={ref}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      controls={false}
      onError={() => setFailed(true)}
    />
  );
}
