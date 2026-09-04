"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
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
import { ChartTheme, useChartTheme } from "@/lib/chart-theme";

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
    maintenanceCost: number;
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

function tooltipStyle(theme: ChartTheme) {
  return {
    background: theme.surface,
    border: `1px solid ${theme.grid}`,
    borderRadius: 6,
    color: theme.onSurface,
    fontSize: 12,
  };
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
  const axisTick = { fill: theme.axis, fontSize: 11 };

  return (
    <div style={{ height }} className="min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="alertsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.error} stopOpacity={0.3} />
              <stop offset="100%" stopColor={theme.error} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis yAxisId="alerts" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
          {showHealth ? (
            <YAxis yAxisId="health" orientation="right" domain={[60, 100]} tick={axisTick} tickLine={false} axisLine={false} />
          ) : null}
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Legend verticalAlign="top" align="right" height={26} wrapperStyle={{ fontSize: 11 }} />
          <Area yAxisId="alerts" type="monotone" dataKey="alerts" name="Alerts" stroke={theme.error} fill="url(#alertsFill)" strokeWidth={2} />
          {showHealth ? (
            <Area yAxisId="health" type="monotone" dataKey="health" name="Health %" stroke={theme.secondary} fill="transparent" strokeWidth={2} />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
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
  const axisTick = { fill: theme.axis, fontSize: 11 };

  return (
    <div style={{ height }} className="min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, left: 10, bottom: 4 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 5" horizontal={false} />
          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={90} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Bar dataKey={dataKey} name={label} fill={theme.primary} radius={[0, 4, 4, 0]} maxBarSize={24} />
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

  return (
    <div style={{ height }} className="relative min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="none">
            {data.map((entry, index) => <Cell key={entry.name} fill={palette[index % palette.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 text-center">
        <div className="font-headline text-2xl font-bold">{total}</div>
        <div className="font-label-caps text-on-surface-variant">{centerLabel ?? "Total"}</div>
      </div>
    </div>
  );
}

export function HealthGauge({ value, height = 150 }: { value: number; height?: number }) {
  const theme = useChartTheme();
  const fill = value < 80 ? theme.error : value < 90 ? theme.warning : theme.secondary;

  return (
    <div style={{ height }} className="relative min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart data={[{ name: "Health", value, fill }]} innerRadius="72%" outerRadius="100%" startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: theme.track }} cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 top-[48%] text-center">
        <div className="font-headline text-2xl font-bold">{value}%</div>
        <div className="font-label-caps text-on-surface-variant">Health</div>
      </div>
    </div>
  );
}

/**
 * MTBF is an order of magnitude larger than MTTR and downtime, so the short
 * durations share a right-hand axis to stay readable.
 */
export function ReliabilityChart({
  data,
}: {
  data: { name: string; mtbf: number; mttr: number; downtimeHrs: number }[];
}) {
  const theme = useChartTheme();
  const axisTick = { fill: theme.axis, fontSize: 11 };
  const rows = data.map((row) => ({ ...row, name: row.name.replace(/\s*Family$/, "") }));

  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 4, left: -16, bottom: 4 }} barGap={4}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: theme.axis, fontSize: 11 }} tickLine={false} interval={0} />
          <YAxis yAxisId="mtbf" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis yAxisId="short" orientation="right" tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
          <Bar yAxisId="mtbf" dataKey="mtbf" name="MTBF (h)" fill={theme.primary} radius={[3, 3, 0, 0]} maxBarSize={46} />
          <Bar yAxisId="short" dataKey="mttr" name="MTTR (h)" fill={theme.secondary} radius={[3, 3, 0, 0]} maxBarSize={46} />
          <Line yAxisId="short" dataKey="downtimeHrs" name="Downtime (h)" stroke={theme.error} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
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

  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 5" />
          <XAxis type="number" dataKey="health" name="Health" unit="%" domain={[60, 100]} tick={axisTick} />
          <YAxis type="number" dataKey="cost" name="Cost" unit="$" tick={axisTick} />
          <ZAxis type="number" dataKey="alerts" range={[80, 360]} name="Alerts" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle(theme)} />
          <Scatter name="Asset families" data={data} fill={theme.secondary} />
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
  const visible = signals.slice(0, 3);
  const colors = [theme.primary, theme.secondary, theme.error];
  const data = Array.from({ length: 24 }, (_, index) => {
    const point: Record<string, number | string> = { time: `${String(index).padStart(2, "0")}:00` };
    visible.forEach((signal, signalIndex) => {
      point[signal.key] = Number(
        (42 + signalIndex * 18 + Math.sin(index * 0.62 + signalIndex) * (6 + signalIndex * 2) + (index === 17 ? 10 : 0)).toFixed(1),
      );
    });
    return point;
  });

  return (
    <div className="h-64 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: theme.axis, fontSize: 10 }} minTickGap={25} />
          <YAxis tick={axisTick} />
          <Tooltip contentStyle={tooltipStyle(theme)} />
          <Legend verticalAlign="top" height={26} wrapperStyle={{ fontSize: 11 }} />
          {visible.map((signal, index) => (
            <Line
              key={signal.key}
              type="monotone"
              dataKey={signal.key}
              name={`${signal.name} (${signal.unit})`}
              stroke={colors[index]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
