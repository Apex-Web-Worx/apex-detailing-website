/**
 * The hex ring that stays on-screen in the mobile crop
 * (second ring in from the photo edge — top bar at y≈237).
 */
function markedHexPath() {
  const cx = 767;
  const cy = 528;
  const rx = 523;
  const ry = 336;
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    pts.push(`${(cx + Math.cos(a) * rx).toFixed(2)},${(cy + Math.sin(a) * ry).toFixed(2)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
}

export default function MarkedHexFlash() {
  const d = markedHexPath();
  return (
    <div className="apex-marked-hex" aria-hidden="true">
      <svg viewBox="0 0 1536 1024" preserveAspectRatio="none">
        <path className="apex-marked-hex-glow" d={d} />
        <path className="apex-marked-hex-core" d={d} />
      </svg>
    </div>
  );
}
