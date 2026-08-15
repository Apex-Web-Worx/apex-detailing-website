/** Second-outermost photo hex — flat-top, measured from hero-tunnel-scene.jpg */
function markedHexPath() {
  const cx = 768;
  const cy = 518;
  const rx = 670;
  const ry = 430;
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    pts.push(`${(cx + Math.cos(a) * rx).toFixed(2)},${(cy + Math.sin(a) * ry).toFixed(2)}`);
  }
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
}

export default function MarkedHexFlash() {
  return (
    <div className="apex-marked-hex" aria-hidden="true">
      <svg viewBox="0 0 1536 1024" preserveAspectRatio="none">
        <path d={markedHexPath()} />
      </svg>
    </div>
  );
}
