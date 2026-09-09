"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { StatusPill } from "@/components/StatusPill";
import { apiGet } from "@/lib/api";
import { AnalyticsData, DonutChart, HealthGauge, HorizontalRiskChart, KpiLineChart, TrendChart } from "@/components/AnalyticsCharts";
import { ChartCard, DataTableShell, LoadingState, PageHeader } from "@/components/DashboardUI";
import { useChartTheme } from "@/lib/chart-theme";

type Overview = {
  kpis: {
    activeAlerts: number;
    criticalAlerts: number;
    openCases: number;
    closedCases: number;
    avoidedDowntimePct: number;
    avoidedDowntimeHrs: number;
    potentialDowntimeHrs: number;
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

  const theme = useChartTheme();
  const recent = (analytics?.series ?? []).slice(-7);
  const labels = recent.map((point) => point.label);

  if (!data) return <div className="p-5"><LoadingState label="Loading operations dashboard…" /></div>;

  return (
    <div className="w-full space-y-5 p-4 sm:p-5">
      <PageHeader
        title="Operations Dashboard"
        eyebrow="Operate"
        description="Mill posture first, then alerts, cases, and work orders in that order."
      />
      <section className="grid grid-cols-2 items-stretch gap-4 xl:grid-cols-4">
        <KpiChartCard label="Active alerts" caption={`${data.kpis.criticalAlerts} critical`} icon="warning" tone="critical">
          <KpiLineChart
            points={recent.length ? recent.map((point) => point.alerts) : [data.kpis.activeAlerts]}
            labels={labels}
            color={theme.error}
            name="Active alerts"
            height={88}
          />
        </KpiChartCard>
        <KpiChartCard label="Average health" caption="Across monitored assets" icon="monitor_heart">
          <HealthGauge value={data.kpis.avgHealth} height={120} />
        </KpiChartCard>
        <KpiChartCard
          label="Avoided downtime"
          caption={`${data.kpis.avoidedDowntimeHrs} h saved of ${data.kpis.potentialDowntimeHrs} h potential`}
          icon="savings"
          tone="highlight"
        >
          <KpiLineChart
            points={recent.length ? recent.map((point) => point.health) : [data.kpis.avoidedDowntimePct]}
            labels={labels}
            color={theme.onPrimary}
            name="Avoided downtime"
            unit="%"
            height={88}
          />
        </KpiChartCard>
        <KpiChartCard label="Open cases" caption={`${data.kpis.closedCases} resolved`} icon="assignment">
          <DonutChart
            data={[
              { name: "Open", value: data.kpis.openCases },
              { name: "Resolved", value: data.kpis.closedCases },
            ]}
            height={150}
            centerLabel="Cases"
          />
        </KpiChartCard>
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

function KpiChartCard({
  label,
  caption,
  icon,
  tone = "default",
  children,
}: {
  label: string;
  caption: string;
  icon: string;
  tone?: "default" | "critical" | "highlight";
  children: ReactNode;
}) {
  const styles =
    tone === "highlight"
      ? "border-primary-container bg-primary text-on-primary"
      : tone === "critical"
        ? "border-error/40 bg-error-container/40"
        : "border-outline-variant bg-surface-container-lowest";
  return (
    <div className={`flex h-full min-w-0 flex-col rounded-2xl border p-4 ${styles}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-label-caps ${tone === "highlight" ? "text-on-primary/75" : "text-on-surface-variant"}`}>{label}</p>
        <span
          className={`material-symbols-outlined text-[18px] ${
            tone === "critical" ? "text-error" : tone === "highlight" ? "text-on-primary/75" : "text-secondary"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className={`mt-1 text-xs ${tone === "highlight" ? "text-on-primary/75" : "text-on-surface-variant"}`}>{caption}</p>
      <div className="mt-2 min-w-0 flex-1">{children}</div>
    </div>
  );
}
