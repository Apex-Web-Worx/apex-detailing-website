import { useEffect, useRef } from "react";

type Side = "left" | "right";

type PixelProcessorRailProps = {
  side: Side;
  className?: string;
};

/**
 * Homepage-only SoC edge — soft film-grain / live-pixel strip like a phone
 * processor glow along the viewport edge. Matches the reference: full-height
 * tinted noise that fades into the page, never blocking copy.
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
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let dpr = 1;
    let cssW = 1;
    let cssH = 1;
    // Persistent grain field (0..1), refreshed cheaply each frame.
    let grain: Float32Array = new Float32Array(0);
    let gw = 0;
    let gh = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // ~2px cells — fine grain like the reference edge texture.
      gw = Math.max(8, Math.floor(cssW / 2));
      gh = Math.max(40, Math.floor(cssH / 2));
      grain = new Float32Array(gw * gh);
      for (let i = 0; i < grain.length; i++) {
        grain[i] = Math.random();
      }
    };

    const paint = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, cssW, cssH);

      const time = t * 0.001;
      const cellW = cssW / gw;
      const cellH = cssH / gh;
      const towardContent = side === "left" ? 1 : -1;

      // Slow vertical drift + sparse sparkle (processor “alive”).
      const drift = Math.floor(time * 9) % gh;
      if (!reduceMotion && Math.random() < 0.45) {
        const i = Math.floor(Math.random() * grain.length);
        grain[i] = Math.min(1, grain[i]! + 0.55);
      }

      for (let y = 0; y < gh; y++) {
        const sy = (y + drift) % gh;
        for (let x = 0; x < gw; x++) {
          const g = grain[sy * gw + x]!;
          // Stronger on the outer edge, soft falloff toward content.
          const edge =
            side === "left" ? 1 - x / (gw - 1) : x / (gw - 1);
          const fall = Math.pow(Math.max(0, edge), 1.35);
          let a = (0.04 + g * 0.22) * fall;
          if (a < 0.02) continue;

          // Magenta/rose grain (reference) with rare cyan flecks.
          const cyan = ((x * 19 + y * 7 + Math.floor(time * 3)) % 29) === 0;
          const pulse =
            0.85 +
            0.15 * Math.sin(time * 2.1 + y * 0.08 * towardContent + x * 0.2);
          a = Math.min(0.55, a * pulse);

          ctx.fillStyle = cyan
            ? `rgba(0, 229, 255, ${a * 0.75})`
            : `rgba(255, 40, 120, ${a})`;
          ctx.fillRect(x * cellW, y * cellH, cellW + 0.4, cellH + 0.4);
        }
      }

      // Soft vertical wash so it reads as one edge glow, not a grid.
      const wash = ctx.createLinearGradient(
        side === "left" ? 0 : cssW,
        0,
        side === "left" ? cssW : 0,
        0,
      );
      wash.addColorStop(0, "rgba(180, 20, 60, 0.18)");
      wash.addColorStop(0.45, "rgba(120, 10, 40, 0.06)");
      wash.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, cssW, cssH);

      if (!reduceMotion) {
        // Cool a few grains so sparkle stays alive.
        for (let k = 0; k < 12; k++) {
          const i = Math.floor(Math.random() * grain.length);
          grain[i] = grain[i]! * 0.92;
        }
        raf = requestAnimationFrame(paint);
      }
    };

    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(paint);

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
