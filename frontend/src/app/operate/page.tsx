"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { apiGet } from "@/lib/api";
import { AnalyticsData, HealthGauge, HorizontalRiskChart, TrendChart } from "@/components/AnalyticsCharts";
import { ChartCard, DataTableShell, LoadingState, MetricCard, PageHeader } from "@/components/DashboardUI";

type Overview = {
  kpis: {
    activeAlerts: number;
    criticalAlerts: number;
    openCases: number;
    closedCases: number;
    avoidedDowntime: number;
    maintCost: number;
    avgHealth: number;
  };
  plants: { id: string; name: string; code: string; healthScore: number }[];
  recentAlerts: {
    id: string;
    title: string;
    severity: string;
    status: string;
    detectedAt: string;
    asset: { assetCode: string; plant: { name: string } };
  }[];
  assets: { family: { name: string }; status: string }[];
};

export default function OperatePage() {
  const [data, setData] = useState<Overview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  useEffect(() => {
    apiGet<Overview>("/api/overview").then(setData).catch(() => setData(null));
    apiGet<AnalyticsData>("/api/analytics?days=30").then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  if (!data) return <div className="p-5"><LoadingState label="Loading operations dashboard…" /></div>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-5">
      <PageHeader
        title="Operations Command Center"
        eyebrow="Textile reliability"
        description="Live reliability posture across spinning, weaving, and dyeing facilities."
      />
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard label="Active alerts" value={data.kpis.activeAlerts} caption={`${data.kpis.criticalAlerts} critical`} icon="warning" tone="critical" />
        <MetricCard label="Average health" value={data.kpis.avgHealth} suffix="%" caption="Across monitored assets" icon="monitor_heart" />
        <MetricCard label="Maintenance cost" value={data.kpis.maintCost} prefix="$" caption="Current reporting period" icon="payments" />
        <MetricCard label="Avoided downtime" value={data.kpis.avoidedDowntime} prefix="$" caption="Estimated production value" icon="savings" tone="highlight" />
      </section>

      {analytics ? (
        <>
          <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
            <ChartCard title="Reliability trend" description="Asset health against predictive alert volume" className="xl:col-span-2">
              <TrendChart data={analytics.series} height={270} />
            </ChartCard>
            <ChartCard title="Risk by asset family" description="Open predictive events">
              <HorizontalRiskChart data={analytics.familyRisk} height={270} />
            </ChartCard>
          </section>
          <ChartCard
            title="Facility health"
            description="Current health score and active alert load by production area"
            action={<Link href="/operate/assets" className="text-sm text-secondary hover:underline">View assets</Link>}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {analytics.facilities.map((facility) => (
                <Link key={facility.code} href={`/operate/assets?plant=${facility.code}`} className="rounded border border-outline-variant p-3 hover:border-secondary">
                  <HealthGauge value={facility.health} height={130} />
                  <div className="text-center">
                    <p className="text-sm font-semibold">{facility.name}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{facility.assets} assets · {facility.alerts} alerts</p>
                  </div>
                </Link>
              ))}
            </div>
          </ChartCard>
        </>
      ) : null}

      <DataTableShell
        title="Most Recent Alerts"
        action={<Link href="/operate/alerts" className="text-sm text-secondary hover:underline">All alerts</Link>}
        minWidth={760}
      >
        <table className="w-full text-left text-sm">
          <thead className="font-label-caps bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-6 py-3">Alert</th>
              <th>Asset</th>
              <th>Facility</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentAlerts.map((a) => (
              <tr key={a.id} className="border-t border-outline-variant">
                <td className="px-6 py-3">
                  <Link href={`/operate/alerts/${a.id}`} className="font-medium text-secondary hover:underline">
                    {a.title}
                  </Link>
                </td>
                <td className="font-data-mono">{a.asset.assetCode}</td>
                <td>{a.asset.plant.name}</td>
                <td>
                  <StatusPill status={a.severity} />
                </td>
                <td className="capitalize">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
