"use client";

import { useState } from "react";
import { useMill } from "@/lib/use-mill";
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
  const [days, setDays] = useState(30);
  const [optimize] = useMill<{ rows: Row[]; avoidedPct: number }>(`/api/optimize?days=${days}`);
  const [analytics] = useMill<AnalyticsData>(`/api/analytics?days=${days}`);
  const rows = optimize.rows;
  const avoidedPct = optimize.avoidedPct;

  function exportCsv() {
    const header = "Family,Stages,Alerts,Cases,Quality,First_Pass_Quality_pct,Defect_Rate_pct,Hold_Rate_pct\n";
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
    <div className="w-full space-y-5 p-4 sm:p-5">
      <PageHeader
        title="Production Quality Optimization"
        eyebrow="Optimize"
        description="Benchmark quality performance, alert load, and production exposure by fabric family."
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
        <MetricCard label="First-pass quality" value={Math.round(rows.reduce((sum, row) => sum + row.mtbf, 0) / Math.max(rows.length, 1))} suffix="%" icon="verified" />
        <MetricCard label="Average defect rate" value={Number((rows.reduce((sum, row) => sum + row.mttr, 0) / Math.max(rows.length, 1)).toFixed(1))} suffix="%" icon="report_problem" />
        <MetricCard label="Combined hold rate" value={Number(rows.reduce((sum, row) => sum + row.downtimeHrs, 0).toFixed(1))} suffix="%" icon="front_hand" tone="critical" />
        <MetricCard
          label="Protected production"
          value={avoidedPct}
          suffix="%"
          caption="Share of potential quality loss contained"
          icon="savings"
          tone="highlight"
        />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Quality, defect, and hold rates" description="Production-quality performance by family">
          <ReliabilityChart data={rows} />
        </ChartCard>
        <ChartCard title="Quality versus alert share" description="Bubble size is alert count; vertical axis is each family's share of quality events">
          <CostHealthScatter data={rows.map((row) => {
            const totalAlerts = rows.reduce((sum, item) => sum + item.alerts, 0) || 1;
            return { name: row.name.replace(/\s*Family$/i, ""), health: row.avgHealth, cost: Math.round((row.alerts / totalAlerts) * 100), alerts: row.alerts };
          })} />
        </ChartCard>
      </div>
      {analytics ? (
        <ChartCard title="Quality hold Pareto" description={`Estimated production hold rate over ${analytics.periodDays} days`}>
          <HorizontalRiskChart data={rows.map((row) => ({ name: row.name.replace(" Family", ""), downtime: row.downtimeHrs }))} dataKey="downtime" label="Hold rate (%)" height={220} />
        </ChartCard>
      ) : null}
      <DataTableShell title="Family quality benchmark" minWidth={900}>
        <table className="w-full text-left text-sm">
          <thead className="font-label-caps bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Family</th>
              <th>Stages</th>
              <th>Alerts</th>
              <th>Cases</th>
              <th>Avg quality</th>
              <th>First pass</th>
              <th>Defect rate</th>
              <th>Hold rate</th>
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
                <td className="font-data-mono">{r.mtbf}%</td>
                <td className="font-data-mono">{r.mttr}%</td>
                <td className="font-data-mono">{r.downtimeHrs}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
