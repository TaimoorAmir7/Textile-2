"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { AnalyticsData, CostHealthScatter, HorizontalRiskChart, ReliabilityChart } from "@/components/AnalyticsCharts";
import { ChartCard, DataTableShell, MetricCard, PageHeader } from "@/components/DashboardUI";

type Row = {
  slug: string;
  name: string;
  assets: number;
  alerts: number;
  cases: number;
  avgHealth: number;
  mtbf: number;
  mttr: number;
  downtimeHrs: number;
};

export default function OptimizePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  useEffect(() => {
    apiGet<Row[]>("/api/optimize").then(setRows).catch(() => setRows([]));
    apiGet<AnalyticsData>(`/api/analytics?days=${days}`).then(setAnalytics).catch(() => setAnalytics(null));
  }, [days]);

  function exportCsv() {
    const header = "Family,Assets,Alerts,Cases,Health,MTBF_h,MTTR_h,Downtime_h\n";
    const body = rows
      .map(
        (r) =>
          `${r.name},${r.assets},${r.alerts},${r.cases},${r.avgHealth},${r.mtbf},${r.mttr},${r.downtimeHrs}`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimize-textile.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-5">
      <PageHeader
        title="Reliability Optimization"
        eyebrow="Optimize"
        description="Benchmark reliability, maintenance effort, and production exposure by textile asset family."
        actions={
          <>
            <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded border border-outline-variant px-3 py-2 text-sm">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button type="button" onClick={exportCsv} className="rounded bg-primary px-4 py-2 text-sm text-on-primary">Export CSV</button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard label="Average MTBF" value={Math.round(rows.reduce((sum, row) => sum + row.mtbf, 0) / Math.max(rows.length, 1))} suffix=" h" icon="schedule" />
        <MetricCard label="Average MTTR" value={Number((rows.reduce((sum, row) => sum + row.mttr, 0) / Math.max(rows.length, 1)).toFixed(1))} suffix=" h" icon="build" />
        <MetricCard label="Downtime" value={Number(rows.reduce((sum, row) => sum + row.downtimeHrs, 0).toFixed(1))} suffix=" h" icon="factory" tone="critical" />
        <MetricCard label="Average health" value={Math.round(rows.reduce((sum, row) => sum + row.avgHealth, 0) / Math.max(rows.length, 1))} suffix="%" icon="monitor_heart" tone="highlight" />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="MTBF, MTTR, and downtime" description="Reliability and repair performance by family">
          <ReliabilityChart data={rows} />
        </ChartCard>
        <ChartCard title="Health versus maintenance cost" description="Bubble size represents alert exposure">
          <CostHealthScatter data={rows.map((row) => ({ name: row.name, health: row.avgHealth, cost: Math.round(row.downtimeHrs * 4200 + row.cases * 1800), alerts: row.alerts }))} />
        </ChartCard>
      </div>
      {analytics ? (
        <ChartCard title="Downtime Pareto" description={`Estimated production interruption over ${analytics.periodDays} days`}>
          <HorizontalRiskChart data={rows.map((row) => ({ name: row.name.replace(" Family", ""), downtime: row.downtimeHrs }))} dataKey="downtime" label="Downtime hours" height={220} />
        </ChartCard>
      ) : null}
      <DataTableShell title="Family reliability benchmark" minWidth={900}>
        <table className="w-full text-left text-sm">
          <thead className="font-label-caps bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Family</th>
              <th>Assets</th>
              <th>Alerts</th>
              <th>Cases</th>
              <th>Avg health</th>
              <th>MTBF (h)</th>
              <th>MTTR (h)</th>
              <th>Downtime (h)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-t border-outline-variant">
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="font-data-mono">{r.assets}</td>
                <td className="font-data-mono">{r.alerts}</td>
                <td className="font-data-mono">{r.cases}</td>
                <td className="font-data-mono">{r.avgHealth}%</td>
                <td className="font-data-mono">{r.mtbf}</td>
                <td className="font-data-mono">{r.mttr}</td>
                <td className="font-data-mono">{r.downtimeHrs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
