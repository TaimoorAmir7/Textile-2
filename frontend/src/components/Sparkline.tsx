"use client";

import { useMemo, useState } from "react";
import { ChartCursorPopup } from "@/components/AnalyticsCharts";

function defaultLabels(count: number) {
  if (count === 24) {
    return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
  }
  if (count === 7) {
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }
  return Array.from({ length: count }, (_, i) => `Period ${i + 1}`);
}

export function Sparkline({
  points,
  stroke = "currentColor",
  fill = false,
  height = 48,
  delay = 0,
  labels,
  name = "Value",
  unit = "",
}: {
  points: number[];
  stroke?: string;
  fill?: boolean;
  height?: number;
  delay?: number;
  labels?: string[];
  name?: string;
  unit?: string;
}) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  const { coords, path } = useMemo(() => {
    if (!points.length) return { coords: [] as { x: number; y: number; value: number }[], path: "" };
    const max = Math.max(...points);
    const min = Math.min(...points);
    const span = max - min || 1;
    const next = points.map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * 100;
      const y = 12 + (100 - ((p - min) / span) * 100) * 0.76;
      return { x, y, value: p };
    });
    const d = next
      .map((point, i) => {
        if (i === 0) return `M${point.x.toFixed(1)},${point.y.toFixed(1)}`;
        const prev = next[i - 1];
        const cpx = ((prev.x + point.x) / 2).toFixed(1);
        return `C${cpx},${prev.y.toFixed(1)} ${cpx},${point.y.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      })
      .join(" ");
    return { coords: next, path: d };
  }, [points]);

  const axis = labels && labels.length === points.length ? labels : defaultLabels(points.length);

  if (!points.length) return null;

  function nearestIndex(clientX: number, target: SVGSVGElement) {
    const rect = target.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    let best = 0;
    let dist = Infinity;
    coords.forEach((point, i) => {
      const d = Math.abs(point.x - x);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  }

  const active = hover ? coords[hover.i] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height }}
        className="w-full cursor-crosshair"
        role="img"
        aria-label={`${name} trend`}
        onPointerMove={(e) => {
          const i = nearestIndex(e.clientX, e.currentTarget);
          setHover({ i, x: e.clientX, y: e.clientY });
        }}
        onPointerLeave={() => setHover(null)}
      >
        {fill ? (
          <path
            d={`${path} L100,100 L0,100 Z`}
            fill={stroke}
            opacity={0.22}
            className="anim-fade-up"
            style={{ animationDelay: `${delay}ms` }}
          />
        ) : null}
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="draw-line"
          style={{ animationDelay: `${delay}ms` }}
        />
        {active ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={0}
              y2={100}
              stroke={stroke}
              strokeWidth={1}
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
              opacity={0.55}
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={2.4}
              fill={stroke}
              stroke="white"
              strokeWidth={0.8}
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>
      {hover && active ? (
        <ChartCursorPopup
          x={hover.x}
          y={hover.y}
          label={axis[hover.i]}
          items={[
            {
              name,
              color: stroke,
              value: `${points[hover.i].toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}`,
            },
          ]}
        />
      ) : null}
    </div>
  );
}
