import { useCallback, useEffect, useRef, useState } from "react";
import { imageUrl } from "@/components/OptimizedImage";

/**
 * Concept 3 — Transform: aligned before/after plates with neon magenta split.
 * Drag optional; starts near 52% (after slightly dominant).
 */
export default function TransformSplit() {
  const beforeSrc = imageUrl("hero-transform-before.png");
  const afterSrc = imageUrl("hero-transform-after.png");
  const beforeWebp = beforeSrc.replace(/\.png$/i, ".webp");
  const afterWebp = afterSrc.replace(/\.png$/i, ".webp");

  const [pos, setPos] = useState(52);
  const dragging = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(8, Math.min(92, next)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setFromClientX]);

  return (
    <div
      ref={wrapRef}
      className="apex-transform"
      role="img"
      aria-label="Before and after detailing transformation"
    >
      <div className="apex-transform-layer after">
        <picture>
          <source
            srcSet={`${afterSrc.replace(/\.png$/i, ".sm.webp")} 900w, ${afterWebp} 1400w`}
            type="image/webp"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <img
            src={afterSrc}
            alt=""
            width={1400}
            height={1000}
            className="apex-transform-img"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
        </picture>
        <span className="apex-transform-label after-label">After</span>
      </div>

      <div
        className="apex-transform-layer before"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <picture>
          <source
            srcSet={`${beforeSrc.replace(/\.png$/i, ".sm.webp")} 900w, ${beforeWebp} 1400w`}
            type="image/webp"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <img
            src={beforeSrc}
            alt=""
            width={1400}
            height={1000}
            className="apex-transform-img"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </picture>
        <span className="apex-transform-label before-label">Before</span>
      </div>

      <div
        className="apex-transform-divider"
        style={{ left: `${pos}%` }}
        onPointerDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          setFromClientX(e.clientX);
        }}
      >
        <span className="apex-transform-handle" aria-hidden="true" />
      </div>
    </div>
  );
}
