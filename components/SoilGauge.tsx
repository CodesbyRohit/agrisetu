// Shared soil-health dial: a semicircle gauge like a field moisture meter.
// Colored by score: leaf green (healthy) → harvest gold (moderate) → soil red (at risk).
interface Props {
  score: number;
  className?: string;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

export default function SoilGauge({ score, className }: Props) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const cx = 100;
  const cy = 98;
  const r = 82;
  const start = polar(cx, cy, r, 180);
  const end = polar(cx, cy, r, 0);
  const angle = 180 - (s / 100) * 180;
  const tip = polar(cx, cy, r - 18, angle);
  const color = s >= 65 ? "#3f8342" : s >= 45 ? "#d98e2b" : "#cf5a3c";

  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label={`Soil health score ${s} out of 100`}>
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        stroke="#e0cdb4"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${tip.x} ${tip.y}`}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#3b2e22" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#3b2e22" />
      <text x={cx} y={cy + 26} textAnchor="middle" fontSize="22" fontWeight="700" fill="#3b2e22">
        {s}
      </text>
      <text x={cx} y={cy + 41} textAnchor="middle" fontSize="9" letterSpacing="2" fill="#8a6f5b">
        / 100
      </text>
    </svg>
  );
}
