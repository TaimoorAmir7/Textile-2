"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { apiGet } from "@/lib/api";
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
  const [rows, setRows] = useState<Asset[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("all");
  const q = params.get("q") ?? "";
  const plant = params.get("plant") ?? "";

  useEffect(() => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (plant) qs.set("plant", plant);
    apiGet<Asset[]>(`/api/assets?${qs.toString()}`).then(setRows).catch(() => setRows([]));
    apiGet<AnalyticsData>("/api/analytics").then(setAnalytics).catch(() => setAnalytics(null));
  }, [q, plant]);

  const visible = rows
    .filter((asset) => status === "all" || asset.status === status)
    .filter((asset) => `${asset.assetCode} ${asset.name} ${asset.family.name}`.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.healthScore - b.healthScore);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-5">
      <PageHeader title="Asset Explorer" eyebrow="Operate" description="Health, monitoring coverage, and operational context for textile machinery." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Assets" value={rows.length} icon="precision_manufacturing" />
        <MetricCard label="Monitored" value={rows.filter((asset) => asset.monitored).length} icon="sensors" />
        <MetricCard label="At risk" value={rows.filter((asset) => asset.status !== "NOMINAL").length} icon="crisis_alert" tone="critical" />
        <MetricCard label="Average health" value={Math.round(rows.reduce((sum, asset) => sum + asset.healthScore, 0) / Math.max(rows.length, 1))} suffix="%" icon="monitor_heart" />
      </div>
      {analytics ? (
        <ChartCard title="Asset health distribution" description="Fleet count grouped by reliability condition">
          <HorizontalRiskChart
            data={analytics.healthBuckets.map((bucket) => ({ name: bucket.range, assets: bucket.assets }))}
            dataKey="assets"
            label="Assets"
            height={210}
          />
        </ChartCard>
      ) : null}
      <DataTableShell
        title="Asset registry"
        minWidth={900}
        action={
          <div className="flex flex-wrap gap-2">
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter assets…" className="w-44 rounded border border-outline-variant px-3 py-1.5 text-sm" />
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
              <th className="px-4 py-3">Asset ID</th>
              <th>Name</th>
              <th>Family</th>
              <th>Plant</th>
              <th>Status</th>
              <th>Health</th>
              <th>Monitored</th>
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
