"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useChartTheme } from "@/lib/chart-theme";

export type AnalyticsData = {
  periodDays: number;
  generatedAt: string;
  series: {
    date: string;
    label: string;
    alerts: number;
    critical: number;
    health: number;
    downtime: number;
  }[];
  severity: { name: string; value: number }[];
  alertStatus: { name: string; value: number }[];
  caseStatus: { name: string; value: number }[];
  casePriority: { name: string; value: number }[];
  healthBuckets: { range: string; assets: number }[];
  familyRisk: {
    slug: string;
    name: string;
    assets: number;
    alerts: number;
    critical: number;
    health: number;
    coverage: number;
  }[];
  facilities: { name: string; code: string; health: number; assets: number; alerts: number }[];
  deploymentSummary: {
    total: number;
    liveAssets: number;
    latest: { id: string; status: string; qualityPct: number; createdAt: string; assets: number }[];
  };
};

type TooltipItem = {
  name?: string;
  value?: unknown;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
};

type ChartMouseState = {
  activeLabel?: string | number;
  activePayload?: TooltipItem[];
};

function hoverFromChartMouse(state: unknown) {
  const event = state as ChartMouseState | null | undefined;
  const item = event?.activePayload?.[0];
  if (!item) return null;
  return {
    label: String(event?.activeLabel ?? item.payload?.label ?? ""),
    value: Number(item.value),
  };
}

export function InfoTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const heading =
    (typeof row?.name === "string" ? row.name : undefined) ??
    (typeof row?.label === "string" ? row.label : undefined) ??
    (typeof row?.range === "string" ? row.range : undefined) ??
    (typeof row?.time === "string" ? row.time : undefined) ??
    (label != null && String(label) !== "" ? String(label) : "Detail");

  return (
    <div className="min-w-[168px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface shadow-lg">
      <p className="font-label-caps mb-1.5 text-[10px] text-on-surface-variant">{String(heading)}</p>
      <ul className="space-y-1">
        {payload.map((item) => (
          <li key={String(item.dataKey ?? item.name)} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: item.color }} />
              {item.name ?? String(item.dataKey ?? "Value")}
            </span>
            <span className="font-data-mono font-bold">{formatExact(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const chartTooltipWrapper = { zIndex: 10000, outline: "none" } as const;

function cursorPopupStyle(x: number, y: number) {
  const width = 188;
  const height = 78;
  const pad = 12;
  const viewW = typeof window === "undefined" ? 1200 : window.innerWidth;
  const viewH = typeof window === "undefined" ? 800 : window.innerHeight;
  let left = x + 16;
  let top = y - height - 12;
  if (left + width > viewW - pad) left = x - width - 16;
  if (top < pad) top = y + 18;
  if (top + height > viewH - pad) top = Math.max(pad, viewH - height - pad);
  return { left, top };
}

export function ChartCursorPopup({
  x,
  y,
  label,
  items,
}: {
  x: number;
  y: number;
  label: string;
  items: { name: string; value: string; color?: string }[];
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="pointer-events-none fixed min-w-[168px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface shadow-[0_18px_40px_-16px_rgba(26,18,48,0.45)]"
      style={{ ...cursorPopupStyle(x, y), zIndex: 10000 }}
    >
      <p className="font-label-caps mb-1.5 text-[10px] text-on-surface-variant">{label}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              {item.color ? <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: item.color }} /> : null}
              {item.name}
            </span>
            <span className="font-data-mono font-bold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function curveThrough(points: number[], axis: string[]) {
  if (points.length < 2) return points.map((value, i) => ({ label: axis[i] ?? "", value }));
  const steps = 10;
  const out: { label: string; value: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push({
        label: t < 0.5 ? axis[i] : axis[i + 1],
        value: Number(catmullRom(p0, p1, p2, p3, t).toFixed(3)),
      });
    }
  }
  out.push({ label: axis[points.length - 1], value: points[points.length - 1] });
  return out;
}

export function KpiLineChart({
  points,
  labels,
  color,
  name,
  unit = "",
  height = 72,
}: {
  points: number[];
  labels?: string[];
  color: string;
  name: string;
  unit?: string;
  height?: number;
}) {
  const fillId = useId().replace(/:/g, "");
  const [hover, setHover] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const data = useMemo(() => {
    const axis =
      labels && labels.length === points.length
        ? labels
        : points.length === 7
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : points.map((_, i) => `Period ${i + 1}`);
    return curveThrough(points, axis);
  }, [labels, points]);
  const yDomain = useMemo<[number, number]>(() => {
    const vals = data.map((row) => row.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min;
    const pad = span < 0.4 ? Math.max(Math.abs(max) * 0.12, 2.4) : Math.max(span * 0.45, 0.8);
    return [min - pad, max + pad];
  }, [data]);

  if (!points.length) return null;

  return (
    <div
      className="w-full"
      style={{ height }}
      onPointerMove={(e) => {
        setHover((current) =>
          current
            ? { ...current, x: e.clientX, y: e.clientY }
            : { x: e.clientX, y: e.clientY, label: data[0]?.label ?? "", value: data[0]?.value ?? 0 },
        );
      }}
      onPointerLeave={() => setHover(null)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: 8, bottom: 4 }}
          onMouseMove={(state) => {
            const next = hoverFromChartMouse(state);
            if (!next) return;
            setHover((current) => ({
              x: current?.x ?? 0,
              y: current?.y ?? 0,
              label: next.label,
              value: next.value,
            }));
          }}
        >
          <defs>
            <linearGradient id={`kpiFill-${fillId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.38} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide axisLine={false} tickLine={false} />
          <YAxis hide domain={yDomain} axisLine={false} tickLine={false} width={0} />
          <Tooltip content={() => null} cursor={false} />
          <Area
            type="natural"
            dataKey="value"
            name={name}
            stroke={color}
            fill={`url(#kpiFill-${fillId})`}
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
      {hover ? (
        <ChartCursorPopup
          x={hover.x}
          y={hover.y}
          label={hover.label}
          items={[
            {
              name,
              color,
              value: `${hover.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ""}`,
            },
          ]}
        />
      ) : null}
    </div>
  );
}

function formatExact(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(value ?? "—");
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function useGrowingSeries<T>(data: T[], stepMs = 90) {
  const [count, setCount] = useState(1);
  const signature = `${data.length}:${JSON.stringify(data[0])}:${JSON.stringify(data[data.length - 1])}`;

  useEffect(() => {
    setCount(data.length ? 1 : 0);
    if (data.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setCount((current) => {
        if (current >= data.length) {
          window.clearInterval(id);
          return data.length;
        }
        return current + 1;
      });
    }, stepMs);
    return () => window.clearInterval(id);
  }, [signature, stepMs, data.length]);

  return data.slice(0, Math.max(count, data.length ? 1 : 0));
}

function ChartLegend({ items, align = "end" }: { items: { color: string; label: string }[]; align?: "end" | "center" }) {
  return (
    <ul className={`mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 ${align === "center" ? "justify-center" : "justify-end"}`}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function familyShortName(name: string) {
  return name.replace(/\s*Family$/i, "").trim();
}

export function TrendChart({
  data,
  height = 260,
  showHealth = true,
}: {
  data: AnalyticsData["series"];
  height?: number;
  showHealth?: boolean;
}) {
  const theme = useChartTheme();
  const fillId = useId().replace(/:/g, "");
  const visible = useGrowingSeries(data, 80);
  const axisTick = { fill: theme.axis, fontSize: 11 };
  const live = visible.length === data.length && data.length > 0;

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-3">
        {live ? <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-secondary" /> : <span />}
        <ChartLegend
          items={[
            { color: theme.error, label: "Alerts" },
            ...(showHealth ? [{ color: theme.secondary, label: "Health %" }] : []),
          ]}
        />
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visible} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={`alertsFill-${fillId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.error} stopOpacity={0.38} />
                <stop offset="100%" stopColor={theme.error} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={`healthFill-${fillId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.secondary} stopOpacity={0.22} />
                <stop offset="100%" stopColor={theme.secondary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={theme.grid} strokeDasharray="4 8" vertical={false} />
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={28} />
            <YAxis yAxisId="alerts" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
            {showHealth ? (
              <YAxis yAxisId="health" orientation="right" domain={[60, 100]} tick={axisTick} tickLine={false} axisLine={false} />
            ) : null}
            <Tooltip
              content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper}
              cursor={{ stroke: theme.primary, strokeWidth: 1, strokeDasharray: "4 6" }}
            />
            <Area
              yAxisId="alerts"
              type="natural"
              dataKey="alerts"
              name="Alerts"
              stroke={theme.error}
              fill={`url(#alertsFill-${fillId})`}
              strokeWidth={2.6}
              animationDuration={700}
              activeDot={{ r: 6, strokeWidth: 2, stroke: theme.surface }}
            />
            {showHealth ? (
              <Area
                yAxisId="health"
                type="natural"
                dataKey="health"
                name="Health %"
                stroke={theme.secondary}
                fill={`url(#healthFill-${fillId})`}
                strokeWidth={2.6}
                animationDuration={700}
                activeDot={{ r: 6, strokeWidth: 2, stroke: theme.surface }}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HorizontalRiskChart({
  data,
  height = 230,
  dataKey = "alerts",
  label = "Alerts",
}: {
  data: object[];
  height?: number;
  dataKey?: string;
  label?: string;
}) {
  const theme = useChartTheme();
  const visible = useGrowingSeries(data, 120);
  const axisTick = { fill: theme.axis, fontSize: 11 };

  return (
    <div style={{ height }} className="min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={visible} layout="vertical" margin={{ top: 4, right: 18, left: 10, bottom: 4 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="4 8" horizontal={false} />
          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={90} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} cursor={{ fill: "rgba(17, 24, 39, 0.06)" }} />
          <Bar
            dataKey={dataKey}
            name={label}
            fill={theme.primary}
            radius={[0, 8, 8, 0]}
            maxBarSize={22}
            animationDuration={800}
            animationBegin={80}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  height = 220,
  centerLabel,
}: {
  data: { name: string; value: number }[];
  height?: number;
  centerLabel?: string;
}) {
  const theme = useChartTheme();
  const palette = [theme.error, theme.warning, theme.secondary, theme.primary];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [active, setActive] = useState<number | null>(null);
  const shown = active != null ? data[active]?.value ?? total : total;
  const shownLabel = active != null ? data[active]?.name ?? centerLabel : centerLabel;

  return (
    <div className="min-w-0">
      <div style={{ height: height - 28 }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius={active != null ? "86%" : "82%"}
              paddingAngle={4}
              stroke="none"
              cornerRadius={6}
              animationDuration={900}
              onMouseEnter={(_, index) => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onMouseDown={(_, __, event) => event.preventDefault()}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={palette[index % palette.length]}
                  opacity={active == null || active === index ? 1 : 0.45}
                />
              ))}
            </Pie>
            <Tooltip content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
          <div className="font-headline text-2xl font-bold">{shown}</div>
          <div className="font-label-caps text-on-surface-variant">{shownLabel ?? "Total"}</div>
        </div>
      </div>
      <ChartLegend align="center" items={data.map((entry, index) => ({ color: palette[index % palette.length], label: entry.name }))} />
    </div>
  );
}

export function HealthGauge({ value, height = 150 }: { value: number; height?: number }) {
  const theme = useChartTheme();
  const fill = value < 80 ? theme.error : value < 90 ? theme.warning : theme.secondary;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    const start = performance.now();
    let frame = 0;
    function tick(now: number) {
      const progress = Math.min((now - start) / 900, 1);
      setShown(Number((value * (1 - Math.pow(1 - progress, 3))).toFixed(1)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div style={{ height }} className="relative min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart data={[{ name: "Health", value: shown, fill }]} innerRadius="72%" outerRadius="100%" startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <Tooltip content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} />
          <RadialBar dataKey="value" name="Health %" background={{ fill: theme.track }} cornerRadius={8} animationDuration={900} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 top-[48%] text-center">
        <div className="font-headline text-2xl font-bold">{formatExact(shown)}%</div>
        <div className="font-label-caps text-on-surface-variant">Quality</div>
      </div>
    </div>
  );
}

/**
 * First-pass quality is larger than defect and hold rates, so the shorter
 * percentages share a right-hand axis to stay readable.
 */
export function ReliabilityChart({
  data,
}: {
  data: { name: string; mtbf: number; mttr: number; downtimeHrs: number }[];
}) {
  const theme = useChartTheme();
  const axisTick = { fill: theme.axis, fontSize: 11 };
  const rows = useMemo(() => data.map((row) => ({ ...row, name: familyShortName(row.name) })), [data]);
  const visible = useGrowingSeries(rows, 140);

  return (
    <div className="min-w-0">
      <ChartLegend
        items={[
          { color: theme.primary, label: "First-pass quality (%)" },
          { color: theme.secondary, label: "Defect rate (%)" },
          { color: theme.error, label: "Hold rate (%)" },
        ]}
      />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visible} margin={{ top: 8, right: 8, left: -8, bottom: 8 }} barGap={6}>
            <CartesianGrid stroke={theme.grid} strokeDasharray="4 8" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: theme.axis, fontSize: 12 }} tickLine={false} interval={0} />
            <YAxis yAxisId="mtbf" tick={axisTick} tickLine={false} axisLine={false} />
            <YAxis yAxisId="short" orientation="right" tick={axisTick} tickLine={false} axisLine={false} />
            <Tooltip content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} cursor={{ fill: "rgba(17, 24, 39, 0.06)" }} />
            <Bar yAxisId="mtbf" dataKey="mtbf" name="First-pass quality (%)" fill={theme.primary} radius={[8, 8, 8, 8]} maxBarSize={40} animationDuration={800} />
            <Bar yAxisId="short" dataKey="mttr" name="Defect rate (%)" fill={theme.secondary} radius={[8, 8, 8, 8]} maxBarSize={40} animationDuration={800} />
            <Line
              yAxisId="short"
              type="natural"
              dataKey="downtimeHrs"
              name="Hold rate (%)"
              stroke={theme.error}
              strokeWidth={2.6}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CostHealthScatter({
  data,
}: {
  data: { name: string; health: number; cost: number; alerts: number }[];
}) {
  const theme = useChartTheme();
  const axisTick = { fill: theme.axis, fontSize: 11 };
  const visible = useGrowingSeries(data, 160);

  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="4 8" />
          <XAxis type="number" dataKey="health" name="Quality" unit="%" domain={[60, 100]} tick={axisTick} />
          <YAxis type="number" dataKey="cost" name="Alert share" unit="%" tick={axisTick} />
          <ZAxis type="number" dataKey="alerts" range={[80, 360]} name="Alerts" />
          <Tooltip cursor={{ strokeDasharray: "4 6" }} content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} />
          <Scatter name="Fabric families" data={visible} fill={theme.secondary} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SignalPreviewChart({
  signals,
}: {
  signals: { key: string; name: string; unit: string }[];
}) {
  const theme = useChartTheme();
  const axisTick = { fill: theme.axis, fontSize: 11 };
  const visibleSignals = signals.slice(0, 3);
  const colors = [theme.primary, theme.secondary, theme.error];
  const data = useMemo(() => {
    const keys = signals.slice(0, 3);
    return Array.from({ length: 24 }, (_, index) => {
      const point: Record<string, number | string> = { time: `${String(index).padStart(2, "0")}:00` };
      keys.forEach((signal, signalIndex) => {
        point[signal.key] = Number(
          (42 + signalIndex * 18 + Math.sin(index * 0.62 + signalIndex) * (6 + signalIndex * 2) + (index === 17 ? 10 : 0)).toFixed(1),
        );
      });
      return point;
    });
  }, [signals]);
  const visible = useGrowingSeries(data, 70);

  return (
    <div className="min-w-0">
      <ChartLegend items={visibleSignals.map((signal, index) => ({ color: colors[index], label: `${signal.name} (${signal.unit})` }))} />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visible} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={theme.grid} strokeDasharray="4 8" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: theme.axis, fontSize: 10 }} minTickGap={25} />
            <YAxis tick={axisTick} />
            <Tooltip content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} />
            {visibleSignals.map((signal, index) => (
              <Line
                key={signal.key}
                type="natural"
                dataKey={signal.key}
                name={`${signal.name} (${signal.unit})`}
                stroke={colors[index]}
                strokeWidth={2.6}
                dot={false}
                activeDot={{ r: 6 }}
                animationDuration={700}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
