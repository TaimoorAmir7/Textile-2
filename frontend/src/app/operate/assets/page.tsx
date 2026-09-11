"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { useMill } from "@/lib/use-mill";
import { AnalyticsData, HorizontalRiskChart } from "@/components/AnalyticsCharts";
import { ChartCard, DataTableShell, MetricCard, PageHeader } from "@/components/DashboardUI";

type Asset = {
  id: string;
  assetCode: string;
  name: string;
  location: string;
  status: string;
  healthScore: number;
  monitored: boolean;
  plant: { name: string; code: string };
  family: { name: string };
};

function AssetsInner() {
  const params = useSearchParams();
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("all");
  const q = params.get("q") ?? "";
  const plant = params.get("plant") ?? "";
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (plant) qs.set("plant", plant);
  const [rows] = useMill<Asset[]>(`/api/assets?${qs.toString()}`);
  const [analytics] = useMill<AnalyticsData>("/api/analytics");

  const visible = rows
    .filter((asset) => status === "all" || asset.status === status)
    .filter((asset) => `${asset.assetCode} ${asset.name} ${asset.family.name}`.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="w-full space-y-5 p-4 sm:p-5">
      <PageHeader title="Production Stage Explorer" eyebrow="Operate" description="Quality condition, checklist coverage, and operational context for all Woven and Knit stages." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Family stages" value={rows.length} icon="account_tree" />
        <MetricCard label="Checklists active" value={rows.filter((asset) => asset.monitored).length} icon="fact_check" />
        <MetricCard label="At risk" value={rows.filter((asset) => asset.status !== "NOMINAL").length} icon="crisis_alert" tone="critical" />
        <MetricCard label="Average quality" value={Math.round(rows.reduce((sum, asset) => sum + asset.healthScore, 0) / Math.max(rows.length, 1))} suffix="%" icon="monitor_heart" />
      </div>
      {analytics ? (
        <ChartCard title="Stage quality distribution" description="Family-stage count grouped by production condition">
          <HorizontalRiskChart
            data={analytics.healthBuckets.map((bucket) => ({ name: bucket.range, assets: bucket.assets }))}
            dataKey="assets"
            label="Assets"
            height={210}
          />
        </ChartCard>
      ) : null}
      <DataTableShell
        title="Production-stage registry"
        minWidth={900}
        action={
          <div className="flex flex-wrap gap-2">
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter stages…" className="w-44 rounded border border-outline-variant px-3 py-1.5 text-sm" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded border border-outline-variant px-2 py-1.5 text-sm">
              <option value="all">All conditions</option>
              <option value="NOMINAL">Nominal</option>
              <option value="WATCH">Watch</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="font-label-caps bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Stage ID</th>
              <th>Production stage</th>
              <th>Family</th>
              <th>Plant</th>
              <th>Status</th>
              <th>Quality</th>
              <th>Checklist</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} className="border-t border-outline-variant hover:bg-surface-bright">
                <td className="font-data-mono px-4 py-2 font-bold text-primary">{a.assetCode}</td>
                <td>{a.name}</td>
                <td>{a.family.name}</td>
                <td>{a.plant.name}</td>
                <td>
                  <StatusPill status={a.status} />
                </td>
                <td className="font-data-mono">{a.healthScore}%</td>
                <td>{a.monitored ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
      <p className="mt-3 text-sm">
        <Link href="/operate/alerts" className="text-secondary hover:underline">
          Open alerts
        </Link>
      </p>
    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading assets…</div>}>
      <AssetsInner />
    </Suspense>
  );
}
