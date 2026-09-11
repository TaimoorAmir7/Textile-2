"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartTooltipWrapper, InfoTooltip } from "@/components/AnalyticsCharts";
import { apiSend } from "@/lib/api";
import { useMillOrNull } from "@/lib/use-mill";
import { useChartTheme } from "@/lib/chart-theme";
import { recordVisit } from "@/lib/session-history";

type Point = { t: number; v: number };
type Payload = {
  qualityScoreSeries: Point[];
  processComplianceSeries: Point[];
  causality: { name: string; confidence: number }[];
  rootCauses: string[];
  actions: { title: string; detail: string }[];
  stageSlug?: string;
  stageLabel?: string;
  suspectedStageLabel?: string;
  image?: string;
  machine?: string;
  fabricState?: string;
  batchCode?: string;
  affectedQuantity?: number;
  unit?: string;
  observation?: string;
  disposition?: string;
};
type Alert = {
  id: string;
  title: string;
  severity: string;
  status: string;
  detectedAt: string;
  payload: Payload;
  asset: {
    id: string;
    assetCode: string;
    model: string;
    lastService: string;
    plant: { name: string };
    family: { slug: string; name: string };
  };
};

export default function InvestigationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [alert, reload] = useMillOrNull<Alert>(`/api/alerts/${id}`);
  const [msg, setMsg] = useState("");
  const [range, setRange] = useState<"1H" | "24H" | "7D">("24H");
  const theme = useChartTheme();

  useEffect(() => {
    if (!alert) return;
    recordVisit({
      href: `/operate/alerts/${alert.id}`,
      title: alert.title,
      sub: alert.asset.assetCode,
      icon: "troubleshoot",
    });
  }, [alert]);

  async function setStatus(status: string) {
    await apiSend(`/api/alerts/${id}`, "PATCH", { status });
    setMsg(status === "acked" ? "Acknowledged" : "Snoozed");
    reload();
  }

  async function createCase() {
    if (!alert) return;
    await apiSend("/api/cases", "POST", {
      title: alert.title,
      assetId: alert.asset.id,
      alertId: alert.id,
      priority: alert.severity === "CRITICAL" ? "Critical" : alert.severity === "WATCH" ? "High" : "Low",
    });
    router.push("/operate/cases");
  }

  if (!alert) return <div className="p-6 text-sm text-on-surface-variant">Loading investigation…</div>;

  const payload = alert.payload;
  const diagnostics = payload.qualityScoreSeries?.map((p, i) => ({
    t: p.t,
    qualityScore: p.v,
    processCompliance: payload.processComplianceSeries?.[i]?.v,
  })) ?? [];
  const visibleDiagnostics = range === "1H" ? diagnostics.slice(-6) : diagnostics;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="font-label-caps text-on-surface-variant">Production Quality Alert</p>
          <h2 className="font-headline mt-1 flex flex-wrap items-center gap-3 text-2xl font-bold sm:text-3xl">
            {alert.title}
            <span className="rounded-sm bg-error px-2 py-1 font-label-caps text-[10px] text-on-error">
              {alert.severity}
            </span>
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            {payload.batchCode} · {alert.asset.family.name} · {payload.stageLabel}
            <span>|</span>
            Detected: {new Date(alert.detectedAt).toLocaleString()}
          </p>
          {msg ? <p className="mt-2 text-sm text-secondary">{msg}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setStatus("snoozed")}
            className="rounded border border-outline-variant px-4 py-2 text-sm"
          >
            Snooze
          </button>
          <button
            type="button"
            onClick={() => setStatus("acked")}
            className="rounded border border-primary px-4 py-2 text-sm font-medium text-primary"
          >
            Acknowledge
          </button>
          <button
            type="button"
            onClick={createCase}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-on-primary"
          >
            <span className="material-symbols-outlined text-sm">assignment_add</span>
            Create Quality Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <div
            data-testid="quality-trend-card"
            className="flex h-[420px] flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-headline text-lg font-semibold">Quality Evidence Trend</h3>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-on-surface-variant">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: theme.primary }} />Quality score</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: theme.secondary }} />Process compliance</span>
              </div>
              <div className="flex rounded border border-outline-variant p-0.5">
                {(["1H", "24H", "7D"] as const).map((item) => (
                  <button key={item} type="button" onClick={() => setRange(item)} className={`rounded px-2 py-1 font-label-caps ${range === item ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleDiagnostics} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={theme.grid} strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: theme.axis, fontSize: 11 }} minTickGap={24} />
                  <YAxis yAxisId="quality" domain={[60, 100]} tick={{ fill: theme.axis, fontSize: 11 }} label={{ value: "score", angle: -90, position: "insideLeft", fill: theme.axis, fontSize: 11 }} />
                  <YAxis yAxisId="compliance" domain={[60, 100]} orientation="right" tick={{ fill: theme.axis, fontSize: 11 }} label={{ value: "%", angle: 90, position: "insideRight", fill: theme.axis, fontSize: 11 }} />
                  <Tooltip content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} />
                  <ReferenceLine yAxisId="quality" y={75} stroke={theme.error} strokeDasharray="5 4" label={{ value: "Quality threshold", fill: theme.error, fontSize: 10, position: "insideBottomRight" }} />
                  <Line yAxisId="quality" type="natural" dataKey="qualityScore" stroke={theme.primary} strokeWidth={2.6} dot={false} activeDot={{ r: 6 }} name="Quality score" />
                  <Line yAxisId="compliance" type="natural" dataKey="processCompliance" stroke={theme.secondary} strokeWidth={2.6} dot={false} activeDot={{ r: 6 }} name="Process compliance" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="mb-4 font-headline text-lg font-semibold">Stage Causality</h3>
              <p className="font-label-caps mb-2 text-on-surface-variant">Suspected Source Stage</p>
              <div className="space-y-3">
                {payload.causality?.map((m) => (
                  <div key={m.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{m.name}</span>
                      <span className="font-data-mono font-bold text-error">{m.confidence}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-md bg-surface-variant">
                      <div className="h-full bg-error" style={{ width: `${m.confidence}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-label-caps mt-4 mb-2 text-on-surface-variant">Quality Evidence</p>
              <ul className="list-inside list-disc text-sm">
                {payload.rootCauses?.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="mb-4 font-headline text-lg font-semibold">Recommended Actions</h3>
              <div className="space-y-3">
                {payload.actions?.map((a, i) => (
                  <div key={a.title} className="flex gap-3 rounded border border-outline-variant p-3">
                    <span className="font-data-mono text-primary">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-sm text-on-surface-variant">{a.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="space-y-4">
          <div
            data-testid="stage-image-card"
            className="flex h-[420px] flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-4"
          >
            <h3 className="mb-3 font-headline text-lg font-semibold">Stage Image</h3>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-outline-variant bg-white">
              <div className="relative min-h-0 flex-1">
                {payload.image ? <Image src={payload.image} alt={`${payload.machine ?? payload.stageLabel} at ${payload.stageLabel}`} fill priority sizes="(max-width: 1024px) 100vw, 33vw" className="object-contain p-2" /> : null}
              </div>
              <p className="border-t border-outline-variant bg-surface-container-low px-3 py-2 font-label-caps text-on-surface-variant">
                {payload.machine} · {alert.asset.assetCode}
              </p>
            </div>
          </div>
          <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="mb-4 font-headline text-lg font-semibold">Production Context</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-on-surface-variant">Stage ID</div>
              <div className="font-data-mono text-right">{alert.asset.assetCode}</div>
              <div className="text-on-surface-variant">Detected at</div>
              <div className="text-right">{payload.stageLabel}</div>
              <div className="text-on-surface-variant">Suspected source</div>
              <div className="text-right">{payload.suspectedStageLabel}</div>
              <div className="text-on-surface-variant">Affected</div>
              <div className="font-data-mono text-right">{payload.affectedQuantity?.toLocaleString()} {payload.unit}</div>
              <div className="text-on-surface-variant">Disposition</div>
              <div className="text-right">{payload.disposition}</div>
              <div className="text-on-surface-variant">Status</div>
              <div className="text-right capitalize">{alert.status}</div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
