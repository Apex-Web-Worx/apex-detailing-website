import { useEffect, useRef } from "react";

type Side = "left" | "right";

type PixelProcessorRailProps = {
  side: Side;
  className?: string;
};

/**
 * Homepage-only SoC edge — soft full-height Apex brand film-grain atmosphere
 * (magenta → purple). Fades into the page; never blocks copy/CTAs.
 */
export default function PixelProcessorRail({
  side,
  className = "",
}: PixelProcessorRailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let cssW = 1;
    let cssH = 1;
    // Low-res noise buffer (upscaled softly) — fine film grain, not LED cells.
    let nw = 0;
    let nh = 0;
    let noise: Uint8ClampedArray = new Uint8ClampedArray(0);
    let frame = 0;

    // Apex brand accents (index.css --brand-magenta / --brand-purple).
    const MAGENTA = { r: 255, g: 26, b: 216 }; // #FF1AD8
    const PURPLE = { r: 157, g: 0, b: 255 }; // #9D00FF

    const seedNoise = () => {
      for (let i = 0; i < noise.length; i++) {
        // Bias toward mid-dark so the brand wash reads through the speckles.
        noise[i] = (Math.random() * 180 + 40) | 0;
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      // ~1.25 CSS-px grain cells → fine film texture when stretched.
      nw = Math.max(24, Math.round(cssW / 1.25));
      nh = Math.max(80, Math.round(cssH / 1.25));
      canvas.width = nw;
      canvas.height = nh;
      noise = new Uint8ClampedArray(nw * nh);
      seedNoise();
    };

    const paint = () => {
      if (!running) return;
      frame++;

      // Rare micro-respeckle so the grain feels alive without “processor sparkle”.
      if (!reduceMotion && frame % 3 === 0) {
        const count = Math.max(4, (nw * nh * 0.004) | 0);
        for (let k = 0; k < count; k++) {
          const i = (Math.random() * noise.length) | 0;
          noise[i] = (Math.random() * 200 + 30) | 0;
        }
      }

      const img = ctx.createImageData(nw, nh);
      const data = img.data;
      const towardContent = side === "left";

      for (let y = 0; y < nh; y++) {
        for (let x = 0; x < nw; x++) {
          const i = y * nw + x;
          const g = noise[i]! / 255;
          // Outer edge strongest; long soft falloff into content (atmosphere, not a bar).
          const edgeT = towardContent ? 1 - x / Math.max(1, nw - 1) : x / Math.max(1, nw - 1);
          const fall = Math.pow(Math.max(0, edgeT), 1.15);
          // Vertical breathing so the edge isn’t a flat column.
          const vWave =
            0.88 +
            0.12 * Math.sin((y / nh) * Math.PI * 2.2 + frame * 0.008);
          const a = Math.min(0.85, (0.12 + g * 0.7) * fall * vWave);
          const o = i * 4;
          // Apex magenta→purple grain (no cyan flecks — keeps one cohesive brand wash).
          const mix = g * 0.55;
          data[o] = (MAGENTA.r * (1 - mix) + PURPLE.r * mix) | 0;
          data[o + 1] = (MAGENTA.g * (1 - mix) + PURPLE.g * mix) | 0;
          data[o + 2] = (MAGENTA.b * (1 - mix) + PURPLE.b * mix) | 0;
          data[o + 3] = (a * 255) | 0;
        }
      }

      ctx.putImageData(img, 0, 0);

      // Soft Apex brand wash — magenta at the outer edge, purple depth inward.
      const wash = ctx.createLinearGradient(
        towardContent ? 0 : nw,
        0,
        towardContent ? nw : 0,
        0,
      );
      wash.addColorStop(0, "rgba(255, 26, 216, 0.52)");
      wash.addColorStop(0.28, "rgba(157, 0, 255, 0.24)");
      wash.addColorStop(0.62, "rgba(80, 0, 120, 0.08)");
      wash.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, nw, nh);

      if (!reduceMotion) {
        raf = requestAnimationFrame(paint);
      }
    };

    resize();
    const onResize = () => {
      resize();
      if (reduceMotion) paint();
    };
    window.addEventListener("resize", onResize);
    if (reduceMotion) {
      paint();
    } else {
      raf = requestAnimationFrame(paint);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [side]);

  return (
    <div
      className={`apex-soc-edge apex-soc-edge--${side} ${className}`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="apex-soc-edge__canvas" />
    </div>
  );
}
