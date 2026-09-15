import { useEffect, useRef } from "react";

type Side = "left" | "right";

type PixelProcessorRailProps = {
  side: Side;
  className?: string;
};

/**
 * Live LED / SoC-style pixel matrix rail — simulated phone-processor activity
 * (scan waves, core blocks, sparse spark activity) for desktop side atmosphere.
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
    // Persistent heat field for soft trails.
    let heat: Float32Array = new Float32Array(0);
    // Sparse "core" blocks (like SoC islands).
    const cores: Array<{ c: number; r: number; w: number; h: number; phase: number }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = cssW >= 56 ? 5 : 4;
      cols = Math.max(6, Math.floor(cssW / cell));
      rows = Math.max(20, Math.floor(cssH / cell));
      heat = new Float32Array(cols * rows);

      cores.length = 0;
      const coreCount = 4 + Math.floor(rows / 40);
      for (let i = 0; i < coreCount; i++) {
        const w = 2 + Math.floor(Math.random() * 3);
        const h = 3 + Math.floor(Math.random() * 5);
        cores.push({
          c: 1 + Math.floor(Math.random() * Math.max(1, cols - w - 1)),
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
          if (n < 0.55) continue;
          const pink = n > 0.78;
          ctx.fillStyle = pink
            ? `rgba(255, 26, 216, ${0.18 + n * 0.25})`
            : `rgba(0, 229, 255, ${0.12 + n * 0.2})`;
          ctx.fillRect(c * cell + 0.5, r * cell + 0.5, cell - 1, cell - 1);
        }
      }
    };

    const tick = (t: number) => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const time = t * 0.001;
      const scan = ((time * 22) % (rows + 18)) - 8;
      const drift = side === "left" ? 1 : -1;

      // Cool heat + inject activity.
      for (let i = 0; i < heat.length; i++) heat[i]! *= 0.92;

      // Vertical scan / bus wave.
      for (let c = 0; c < cols; c++) {
        const rr = Math.floor(scan + Math.sin(time * 2.2 + c * 0.35 * drift) * 1.5);
        if (rr >= 0 && rr < rows) {
          heat[rr * cols + c]! = Math.min(1, heat[rr * cols + c]! + 0.55);
        }
        const rr2 = rr - 1;
        if (rr2 >= 0 && rr2 < rows) {
          heat[rr2 * cols + c]! = Math.min(1, heat[rr2 * cols + c]! + 0.22);
        }
      }

      // SoC core blocks pulse.
      for (const core of cores) {
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.6 + core.phase));
        for (let y = 0; y < core.h; y++) {
          for (let x = 0; x < core.w; x++) {
            const c = core.c + x;
            const r = core.r + y;
            if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
            const idx = r * cols + c;
            heat[idx]! = Math.min(1, heat[idx]! + pulse * 0.45);
          }
        }
      }

      // Sparse spark traffic (instruction-like blips).
      if (Math.random() < 0.35) {
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        heat[r * cols + c]! = 1;
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = heat[r * cols + c]!;
          const base = ((c * 13 + r * 7) % 9) === 0 ? 0.08 : 0.02;
          const a = Math.min(1, base + v * 0.95);
          if (a < 0.05) continue;

          // Cyan traces vs magenta cores — phone die vibe.
          const inCore = cores.some(
            (core) =>
              c >= core.c &&
              c < core.c + core.w &&
              r >= core.r &&
              r < core.r + core.h,
          );
          const pinkBias = inCore || (c + r + Math.floor(time * 3)) % 11 === 0;
          ctx.fillStyle = pinkBias
            ? `rgba(255, 26, 216, ${a})`
            : `rgba(0, 229, 255, ${a * 0.92})`;
          ctx.fillRect(c * cell + 0.6, r * cell + 0.6, cell - 1.2, cell - 1.2);
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
      <div className="apex-pixel-rail__die">
        <span className="apex-pixel-rail__label">SoC</span>
        <canvas ref={canvasRef} className="apex-pixel-rail__canvas" />
        <span className="apex-pixel-rail__pins" />
      </div>
    </div>
  );
}
