"use client";

export function Sparkline({
  points,
  stroke = "currentColor",
  fill = false,
  height = 48,
  delay = 0,
}: {
  points: number[];
  stroke?: string;
  fill?: boolean;
  height?: number;
  delay?: number;
}) {
  if (!points.length) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = 100 / Math.max(points.length - 1, 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = 100 - ((p - min) / span) * 100;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height }}
      className="w-full"
      role="img"
      aria-label="Trend sparkline"
    >
      {fill ? (
        <path
          d={`${path} L100,100 L0,100 Z`}
          fill={stroke}
          opacity={0.09}
          className="anim-fade-up"
          style={{ animationDelay: `${delay}ms` }}
        />
      ) : null}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        className="draw-line"
        style={{ animationDelay: `${delay}ms` }}
      />
    </svg>
  );
}
