"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import { apiGet } from "@/lib/api";
import { AnalyticsData, DonutChart, TrendChart } from "@/components/AnalyticsCharts";
import { ChartCard, DataTableShell, MetricCard, PageHeader } from "@/components/DashboardUI";

type Alert = {
  id: string;
  title: string;
  severity: string;
  status: string;
  detectedAt: string;
  asset: { assetCode: string; plant: { name: string } };
};

export default function AlertsPage() {
  const [rows, setRows] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  useEffect(() => {
    apiGet<Alert[]>("/api/alerts").then(setRows).catch(() => setRows([]));
    apiGet<AnalyticsData>("/api/analytics?days=30").then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  const visible = rows.filter((alert) =>
    (severity === "all" || alert.severity === severity) &&
    (status === "all" || alert.status === status),
  );
  const critical = rows.filter((alert) => alert.severity === "CRITICAL").length;
  const unacked = rows.filter((alert) => alert.status === "new").length;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-5">
      <PageHeader title="Alert Center" eyebrow="Operate" description="Prioritize, acknowledge, and investigate predictive reliability events." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total alerts" value={rows.length} icon="notifications_active" />
        <MetricCard label="Critical" value={critical} icon="e911_emergency" tone="critical" />
        <MetricCard label="Unacknowledged" value={unacked} icon="mark_email_unread" />
        <MetricCard label="Acknowledged" value={rows.filter((alert) => alert.status === "acked").length} icon="task_alt" tone="positive" />
      </div>
      {analytics ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Alert volume" description="Thirty-day event trend" className="lg:col-span-2">
            <TrendChart data={analytics.series} height={220} showHealth={false} />
          </ChartCard>
          <ChartCard title="Severity mix" description="Current alert population">
            <DonutChart data={analytics.severity} height={220} centerLabel="Alerts" />
          </ChartCard>
        </div>
      ) : null}
      <DataTableShell
        title="Alert queue"
        minWidth={820}
        action={
          <div className="flex flex-wrap gap-2">
            <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="rounded border border-outline-variant px-2 py-1.5 text-sm">
              <option value="all">All severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WATCH">Watch</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded border border-outline-variant px-2 py-1.5 text-sm">
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="acked">Acknowledged</option>
              <option value="snoozed">Snoozed</option>
            </select>
          </div>
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="font-label-caps bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Alert</th>
              <th>Asset</th>
              <th>Facility</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Detected</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} className="border-t border-outline-variant">
                <td className="px-4 py-2">
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
                <td className="text-xs">{new Date(a.detectedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}
