import { useEffect, useRef } from "react";

type Side = "left" | "right";

type PixelProcessorRailProps = {
  side: Side;
  className?: string;
};

/**
 * Minimal LED / SoC-style pixel rail — thin side atmosphere on desktop.
 * Soft contrast + CSS edge fade so it never blocks hero copy/CTAs.
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
    let cols = 0;
    let rows = 0;
    let cell = 0;
    let dpr = 1;
    let heat: Float32Array = new Float32Array(0);
    const cores: Array<{ c: number; r: number; w: number; h: number; phase: number }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = 3;
      cols = Math.max(4, Math.floor(cssW / cell));
      rows = Math.max(20, Math.floor(cssH / cell));
      heat = new Float32Array(cols * rows);

      cores.length = 0;
      const coreCount = 2 + Math.floor(rows / 55);
      for (let i = 0; i < coreCount; i++) {
        const w = 1 + Math.floor(Math.random() * 2);
        const h = 2 + Math.floor(Math.random() * 3);
        cores.push({
          c: Math.floor(Math.random() * Math.max(1, cols - w)),
          r: 2 + Math.floor(Math.random() * Math.max(1, rows - h - 4)),
          w,
          h,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const paintStatic = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n = ((c * 17 + r * 31) % 10) / 10;
          if (n < 0.7) continue;
          const pink = n > 0.85;
          ctx.fillStyle = pink
            ? `rgba(255, 26, 216, ${0.1 + n * 0.12})`
            : `rgba(0, 229, 255, ${0.08 + n * 0.1})`;
          ctx.fillRect(c * cell + 0.4, r * cell + 0.4, cell - 0.8, cell - 0.8);
        }
      }
    };

    const tick = (t: number) => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const time = t * 0.001;
      const scan = ((time * 16) % (rows + 18)) - 8;
      const drift = side === "left" ? 1 : -1;

      for (let i = 0; i < heat.length; i++) heat[i]! *= 0.9;

      for (let c = 0; c < cols; c++) {
        const rr = Math.floor(scan + Math.sin(time * 1.8 + c * 0.4 * drift) * 1.2);
        if (rr >= 0 && rr < rows) {
          heat[rr * cols + c]! = Math.min(1, heat[rr * cols + c]! + 0.32);
        }
        const rr2 = rr - 1;
        if (rr2 >= 0 && rr2 < rows) {
          heat[rr2 * cols + c]! = Math.min(1, heat[rr2 * cols + c]! + 0.12);
        }
      }

      for (const core of cores) {
        const pulse = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * 1.4 + core.phase));
        for (let y = 0; y < core.h; y++) {
          for (let x = 0; x < core.w; x++) {
            const c = core.c + x;
            const r = core.r + y;
            if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
            const idx = r * cols + c;
            heat[idx]! = Math.min(1, heat[idx]! + pulse * 0.28);
          }
        }
      }

      if (Math.random() < 0.18) {
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        heat[r * cols + c]! = 0.75;
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = heat[r * cols + c]!;
          const base = ((c * 13 + r * 7) % 11) === 0 ? 0.045 : 0.01;
          const a = Math.min(0.55, base + v * 0.5);
          if (a < 0.04) continue;

          const inCore = cores.some(
            (core) =>
              c >= core.c &&
              c < core.c + core.w &&
              r >= core.r &&
              r < core.r + core.h,
          );
          const pinkBias = inCore || (c + r + Math.floor(time * 2)) % 13 === 0;
          ctx.fillStyle = pinkBias
            ? `rgba(255, 26, 216, ${a})`
            : `rgba(0, 229, 255, ${a * 0.9})`;
          ctx.fillRect(c * cell + 0.4, r * cell + 0.4, cell - 0.8, cell - 0.8);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    if (reduceMotion) {
      paintStatic();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [side]);

  return (
    <div
      className={`apex-pixel-rail apex-pixel-rail--${side} ${className}`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="apex-pixel-rail__canvas" />
    </div>
  );
}
