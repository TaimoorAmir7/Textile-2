"use client";

import Link from "next/link";
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
  vibration: Point[];
  temperature: Point[];
  failureModes: { name: string; confidence: number }[];
  rootCauses: string[];
  actions: { title: string; detail: string }[];
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

function schematicFor(alert: Alert) {
  const slug = alert.asset.family?.slug ?? "";
  const title = alert.title.toLowerCase();
  if (slug.includes("spinning") || title.includes("spindle") || title.includes("bearing")) {
    if (title.includes("bearing") || title.includes("alignment") || title.includes("spindle")) {
      return {
        src: "/schematics/spinning-ring-traveller.png",
        alt: "Labeled ring, traveller, and spindle assembly",
        caption: "Ring, traveller, and spindle",
        hotspot: { top: "68%", left: "54%" },
      };
    }
    return {
      src: "/schematics/spinning-sensor-map.png",
      alt: "Ring spinning frame sensor placement",
      caption: "Spinning frame sensor map",
      hotspot: { top: "74%", left: "30%" },
    };
  }
  if (slug.includes("loom") || title.includes("loom") || title.includes("yarn") || title.includes("sley")) {
    return {
      src: "/schematics/loom-sensor-map.png",
      alt: "Air-jet loom with vibration, pressure, and tension sensors",
      caption: "Air-jet loom sensor map",
      hotspot: { top: "32%", left: "48%" },
    };
  }
  return {
    src: "/schematics/dye-pump-hex.png",
    alt: "Jet dyeing pump, heat exchanger, and addition tank",
    caption: "Dye liquor pump and heat exchanger",
    hotspot: { top: "42%", left: "46%" },
  };
}

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
  const diagnostics = payload.vibration?.map((p, i) => ({
    t: p.t,
    vibration: p.v,
    temperature: payload.temperature?.[i]?.v,
  })) ?? [];
  const visibleDiagnostics = range === "1H" ? diagnostics.slice(-6) : diagnostics;
  const drawing = schematicFor(alert);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="font-label-caps text-on-surface-variant">Alert Investigation</p>
          <h2 className="font-headline mt-1 flex flex-wrap items-center gap-3 text-2xl font-bold sm:text-3xl">
            {alert.title}
            <span className="rounded-sm bg-error px-2 py-1 font-label-caps text-[10px] text-on-error">
              {alert.severity}
            </span>
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">factory</span>
            {alert.asset.plant.name}
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
            Create Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 lg:col-span-8">
          <div className="h-[320px] rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-headline text-lg font-semibold">Time-Series Diagnostics</h3>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-on-surface-variant">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: theme.primary }} />Vibration (mm/s)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: theme.secondary }} />Temperature (°C)</span>
              </div>
              <div className="flex rounded border border-outline-variant p-0.5">
                {(["1H", "24H", "7D"] as const).map((item) => (
                  <button key={item} type="button" onClick={() => setRange(item)} className={`rounded px-2 py-1 font-label-caps ${range === item ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={visibleDiagnostics} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={theme.grid} strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: theme.axis, fontSize: 11 }} minTickGap={24} />
                <YAxis yAxisId="vibration" tick={{ fill: theme.axis, fontSize: 11 }} label={{ value: "mm/s", angle: -90, position: "insideLeft", fill: theme.axis, fontSize: 11 }} />
                <YAxis yAxisId="temperature" orientation="right" tick={{ fill: theme.axis, fontSize: 11 }} label={{ value: "°C", angle: 90, position: "insideRight", fill: theme.axis, fontSize: 11 }} />
                <Tooltip content={<InfoTooltip />} wrapperStyle={chartTooltipWrapper} />
                <ReferenceLine yAxisId="vibration" y={4.5} stroke={theme.error} strokeDasharray="5 4" label={{ value: "Alert threshold", fill: theme.error, fontSize: 10, position: "insideBottomRight" }} />
                <Line yAxisId="vibration" type="natural" dataKey="vibration" stroke={theme.primary} strokeWidth={2.6} dot={false} activeDot={{ r: 6 }} name="Vibration (mm/s)" />
                <Line yAxisId="temperature" type="natural" dataKey="temperature" stroke={theme.secondary} strokeWidth={2.6} dot={false} activeDot={{ r: 6 }} name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="mb-4 font-headline text-lg font-semibold">AI Analysis</h3>
              <p className="font-label-caps mb-2 text-on-surface-variant">Likely Failure Modes</p>
              <div className="space-y-3">
                {payload.failureModes?.map((m) => (
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
              <p className="font-label-caps mt-4 mb-2 text-on-surface-variant">Root Cause Indicators</p>
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
          <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="mb-3 font-headline text-lg font-semibold">Component Schematic</h3>
            <div className="overflow-hidden rounded border border-outline-variant bg-white">
              <div className="relative h-72">
                <img src={drawing.src} alt={drawing.alt} className="h-full w-full object-contain p-2" />
                {alert.severity !== "NOMINAL" ? (
                  <>
                    <span
                      className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-error/40"
                      style={drawing.hotspot}
                    />
                    <span
                      className="pulse-dot absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-error"
                      style={drawing.hotspot}
                    />
                  </>
                ) : null}
              </div>
              <p className="border-t border-outline-variant bg-surface-container-low px-3 py-2 font-label-caps text-on-surface-variant">
                {drawing.caption} · {alert.asset.assetCode}
              </p>
            </div>
          </div>
          <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="mb-4 font-headline text-lg font-semibold">Asset Details</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-on-surface-variant">Asset ID</div>
              <div className="font-data-mono text-right">{alert.asset.assetCode}</div>
              <div className="text-on-surface-variant">Model</div>
              <div className="text-right">{alert.asset.model}</div>
              <div className="text-on-surface-variant">Last Service</div>
              <div className="text-right">{alert.asset.lastService}</div>
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
