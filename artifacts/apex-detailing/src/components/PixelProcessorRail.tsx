import { useEffect, useRef } from "react";

type Side = "left" | "right";

type PixelProcessorRailProps = {
  side: Side;
  className?: string;
};

type RGB = { r: number; g: number; b: number };

/**
 * Homepage-only SoC edge — soft full-height Apex brand film-grain atmosphere.
 * Drift + shimmer motion; slow tint shifts across brand accents.
 * Sparse grains occasionally break formation and drift toward page content.
 * Fades into the page; never blocks copy/CTAs.
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

    // Apex brand palette — slow cycle, no rainbow disco.
    const MAGENTA: RGB = { r: 255, g: 26, b: 216 }; // #FF1AD8
    const PURPLE: RGB = { r: 157, g: 0, b: 255 }; // #9D00FF
    const CYAN: RGB = { r: 0, g: 229, b: 255 }; // #00E5FF
    const GOLD: RGB = { r: 212, g: 175, b: 55 }; // #D4AF37
    // Soft stops: mostly magenta↔purple, brief cyan/gold whispers.
    const PALETTE: RGB[] = [MAGENTA, PURPLE, CYAN, PURPLE, MAGENTA, GOLD, PURPLE];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpRGB = (a: RGB, b: RGB, t: number): RGB => ({
      r: lerp(a.r, b.r, t),
      g: lerp(a.g, b.g, t),
      b: lerp(a.b, b.b, t),
    });

    /** Smooth brand tint for time t (seconds). Full cycle ~36s (slower, calmer). */
    const brandAt = (tSec: number): RGB => {
      const cycle = ((tSec / 36) % 1 + 1) % 1;
      const scaled = cycle * (PALETTE.length - 1);
      const i = Math.floor(scaled);
      const f = scaled - i;
      // Ease in/out so hue shifts feel atmospheric, not stepped.
      const ease = f * f * (3 - 2 * f);
      const a = PALETTE[i]!;
      const b = PALETTE[Math.min(i + 1, PALETTE.length - 1)]!;
      return lerpRGB(a, b, ease);
    };

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

    const sampleNoise = (x: number, y: number) => {
      // Wrapped sample so vertical/horizontal drift scrolls the grain field.
      const sx = ((x % nw) + nw) % nw;
      const sy = ((y % nh) + nh) % nh;
      return noise[(sy | 0) * nw + (sx | 0)]! / 255;
    };

    const paint = () => {
      if (!running) return;
      frame++;
      const t = frame / 60; // ~seconds at 60fps

      // Live respeckle — grain churns without LED sparkle (slower cadence).
      if (!reduceMotion && frame % 5 === 0) {
        const count = Math.max(8, (nw * nh * 0.007) | 0);
        for (let k = 0; k < count; k++) {
          const i = (Math.random() * noise.length) | 0;
          noise[i] = (Math.random() * 200 + 30) | 0;
        }
      }

      // Drift: grain field scrolls up the edge + slight horizontal shimmer (~1.4× slower again).
      const driftY = reduceMotion ? 0 : t * 9;
      const driftX = reduceMotion ? 0 : Math.sin(t * 0.27) * 4.5;
      // Edge pulse — atmosphere breathes in/out.
      const pulse = reduceMotion ? 1 : 0.82 + 0.18 * Math.sin(t * 0.52);
      // Secondary shimmer wave traveling along the rail.
      const shimmerPhase = t * 0.78;

      const tint = brandAt(reduceMotion ? 0 : t);
      // Secondary tint lagged for wash depth (purple-leaning companion).
      const tintB = brandAt(reduceMotion ? 2.5 : t + 4.2);

      const img = ctx.createImageData(nw, nh);
      const data = img.data;
      const towardContent = side === "left";

      // Occasional inward pull — stray grains leave the edge line toward content.
      const escapePull = reduceMotion ? 0 : 0.55 + 0.45 * Math.sin(t * 0.33);

      for (let y = 0; y < nh; y++) {
        const yN = y / Math.max(1, nh - 1);
        const vWave =
          0.78 +
          0.22 * Math.sin(yN * Math.PI * 2.8 + shimmerPhase) +
          0.08 * Math.sin(yN * Math.PI * 5.4 - t * 0.62);
        for (let x = 0; x < nw; x++) {
          const i = y * nw + x;
          // Sample with a slight content-ward bias so breakaways look out of line.
          const g = sampleNoise(x + driftX, y + driftY);
          const edgeT = towardContent ? 1 - x / Math.max(1, nw - 1) : x / Math.max(1, nw - 1);
          // Sparse bright cells that "break formation" and poke toward the page.
          const breakGate = sampleNoise(x * 2.7 - t * 0.15, y * 3.1 + t * 0.11);
          const breakaway =
            !reduceMotion && g > 0.68 && breakGate > 0.86 && edgeT < 0.72;
          const escape =
            breakaway
              ? Math.pow(breakGate, 1.6) * escapePull * (0.55 + g * 0.45)
              : 0;
          // Soft falloff; breakaways get a flatter curve so they reach further in.
          const fall = Math.pow(
            Math.max(0, edgeT + escape * (1.15 - edgeT)),
            breakaway ? 0.45 : 1.1,
          );
          let a = Math.min(0.9, (0.14 + g * 0.78) * fall * vWave * pulse);
          // Tiny bright flecks that look like pixels leaving the edge.
          if (breakaway) {
            a = Math.min(0.95, a + 0.22 * g * escape);
          }
          const o = i * 4;
          // Mix primary/secondary brand tint by grain brightness.
          const mix = g * 0.5;
          data[o] = (tint.r * (1 - mix) + tintB.r * mix) | 0;
          data[o + 1] = (tint.g * (1 - mix) + tintB.g * mix) | 0;
          data[o + 2] = (tint.b * (1 - mix) + tintB.b * mix) | 0;
          data[o + 3] = (a * 255) | 0;
        }
      }

      ctx.putImageData(img, 0, 0);

      // Soft brand wash — follows the live tint, stronger at the outer edge.
      const wash = ctx.createLinearGradient(
        towardContent ? 0 : nw,
        0,
        towardContent ? nw : 0,
        0,
      );
      const washPulse = reduceMotion ? 0.5 : 0.42 + 0.16 * Math.sin(t * 0.58);
      wash.addColorStop(0, `rgba(${tint.r | 0}, ${tint.g | 0}, ${tint.b | 0}, ${washPulse})`);
      wash.addColorStop(
        0.28,
        `rgba(${tintB.r | 0}, ${tintB.g | 0}, ${tintB.b | 0}, ${washPulse * 0.45})`,
      );
      wash.addColorStop(0.62, `rgba(${(tint.r * 0.35) | 0}, ${(tint.g * 0.2) | 0}, ${(tint.b * 0.45) | 0}, 0.08)`);
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
