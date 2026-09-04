"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Reveal } from "@/components/Reveal";
import { Sparkline } from "@/components/Sparkline";
import { StatusPill } from "@/components/StatusPill";
import { apiGet, apiSend } from "@/lib/api";
import { AnalyticsData, DonutChart, TrendChart } from "@/components/AnalyticsCharts";
import { ChartCard } from "@/components/DashboardUI";
import { useChartTheme } from "@/lib/chart-theme";

type Alert = {
  id: string;
  title: string;
  severity: string;
  status: string;
  detectedAt: string;
  payload: {
    vibration?: { t: number; v: number }[];
    failureModes?: { name: string; confidence: number }[];
  };
  asset: {
    assetCode: string;
    name: string;
    plant: { name: string };
    family: { name: string };
  };
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "CRITICAL", label: "Critical" },
  { id: "WATCH", label: "Watch" },
  { id: "new", label: "Unacknowledged" },
];

export default function TextileAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const theme = useChartTheme();

  function load() {
    apiGet<Alert[]>("/api/alerts").then(setAlerts).catch(() => setAlerts([]));
  }

  useEffect(() => {
    load();
    apiGet<AnalyticsData>("/api/analytics?days=30").then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  async function acknowledge(id: string) {
    setBusy(id);
    try {
      await apiSend(`/api/alerts/${id}`, "PATCH", { status: "acked" });
      load();
    } finally {
      setBusy(null);
    }
  }

  const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
  const watch = alerts.filter((a) => a.severity === "WATCH").length;
  const unacked = alerts.filter((a) => a.status === "new").length;

  const visible = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "new") return a.status === "new";
    return a.severity === filter;
  });

  return (
    <div className="space-y-5 p-5">
      <Reveal>
        <div>
          <h1 className="font-headline flex items-center gap-3 text-3xl font-bold text-primary">
            <span className="pulse-dot inline-block h-2.5 w-2.5 rounded-full bg-error text-error" />
            Mill Alert Feed
          </h1>
          <p className="mt-1 max-w-3xl text-on-surface-variant">
            Predictive alerts raised by deployed textile templates across spinning, weaving, and
            dyeing. Acknowledge here or open the full investigation.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Reveal>
          <SummaryCard label="Critical" value={critical} tone="error" icon="e911_emergency" />
        </Reveal>
        <Reveal delay={80}>
          <SummaryCard label="Watch" value={watch} tone="warning" icon="visibility" />
        </Reveal>
        <Reveal delay={160}>
          <SummaryCard label="Unacknowledged" value={unacked} tone="neutral" icon="notifications_active" />
        </Reveal>
      </div>

      {analytics ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard
            title="Alert volume"
            description="Predictive events raised over the last 30 days"
            className="lg:col-span-2"
          >
            <TrendChart data={analytics.series} height={220} showHealth={false} />
          </ChartCard>
          <ChartCard title="Severity mix" description="Current active and acknowledged alerts">
            <DonutChart data={analytics.severity} height={220} centerLabel="Alerts" />
          </ChartCard>
        </div>
      ) : null}

      <Reveal>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded border px-3 py-1.5 font-label-caps transition-colors ${
                filter === f.id
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-secondary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="space-y-3">
        {visible.map((a, i) => (
          <Reveal key={a.id} delay={i * 70}>
            <div
              className={`lift rounded-lg border bg-surface-container-lowest p-4 ${
                a.severity === "CRITICAL" ? "border-l-4 border-l-error border-outline-variant" : "border-outline-variant"
              }`}
            >
              <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_160px_auto] lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill status={a.severity} />
                    <h2 className="font-headline text-base font-semibold text-primary">{a.title}</h2>
                    <span className="font-label-caps rounded bg-surface-container px-1.5 py-0.5 text-on-surface-variant">
                      {a.status}
                    </span>
                  </div>
                  <p className="font-data-mono mt-1 text-xs text-on-surface-variant">
                    {a.asset.assetCode} · {a.asset.family.name} · {a.asset.plant.name} ·{" "}
                    {new Date(a.detectedAt).toLocaleString()}
                  </p>
                  {a.payload.failureModes?.length ? (
                    <div className="mt-3 max-w-md space-y-2">
                      {a.payload.failureModes.slice(0, 2).map((m, mi) => (
                        <div key={m.name}>
                          <div className="flex justify-between text-xs">
                            <span>{m.name}</span>
                            <span className="font-data-mono font-bold text-error">
                              {m.confidence}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-variant">
                            <div
                              className="bar-grow h-full bg-error"
                              style={{
                                width: `${m.confidence}%`,
                                animationDelay: `${i * 70 + mi * 120}ms`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="w-full max-w-48 lg:w-40">
                  <Sparkline
                    points={(a.payload.vibration ?? []).map((p) => p.v)}
                    stroke={a.severity === "CRITICAL" ? theme.error : theme.secondary}
                    fill
                    height={44}
                    delay={i * 70}
                  />
                  <p className="font-label-caps mt-1 text-center text-on-surface-variant">
                    Vibration 24h
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {a.status === "new" ? (
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() => acknowledge(a.id)}
                      className="rounded border border-primary px-3 py-1.5 font-label-caps text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
                    >
                      {busy === a.id ? "Saving…" : "Acknowledge"}
                    </button>
                  ) : null}
                  <Link
                    href={`/operate/alerts/${a.id}`}
                    className="rounded bg-primary px-3 py-1.5 font-label-caps text-on-primary"
                  >
                    Investigate
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "error" | "warning" | "neutral";
  icon: string;
}) {
  const color =
    tone === "error" ? "text-error" : tone === "warning" ? "text-warning" : "text-secondary";
  return (
    <div className="lift rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-label-caps text-on-surface-variant">{label}</h3>
        <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
      </div>
      <p className={`font-headline mt-3 text-3xl font-bold ${tone === "error" ? "text-error" : ""}`}>
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}
