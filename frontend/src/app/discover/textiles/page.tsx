"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Reveal } from "@/components/Reveal";
import { Sparkline } from "@/components/Sparkline";
import { StatusPill } from "@/components/StatusPill";
import { AnalyticsData, DonutChart, HorizontalRiskChart, TrendChart } from "@/components/AnalyticsCharts";
import { ChartCard } from "@/components/DashboardUI";
import { useChartTheme } from "@/lib/chart-theme";
import { apiGet } from "@/lib/api";

const HERO_IMG =
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=60";

type Family = {
  slug: string;
  name: string;
  description: string;
  useCases: { title: string; body: string; tags: string[]; icon: string }[];
  templates: { slug: string; name: string }[];
  _count: { assets: number; templates: number };
};

type Overview = {
  kpis: {
    activeAlerts: number;
    criticalAlerts: number;
    openCases: number;
    closedCases: number;
    avgHealth: number;
    avoidedDowntime: number;
    maintCost: number;
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
  assets: { status: string; monitored: boolean; family: { name: string } }[];
};

const LIFECYCLE = [
  {
    label: "Discover",
    body: "Explore textile asset families and reliability templates.",
    href: "/discover/textiles/families",
    icon: "explore",
  },
  {
    label: "Deploy",
    body: "Map template signals to mill tags and go live.",
    href: "/discover/textiles/templates",
    icon: "rocket_launch",
  },
  {
    label: "Operate",
    body: "Monitor health, investigate alerts, run cases.",
    href: "/operate",
    icon: "settings_remote",
  },
  {
    label: "Optimize",
    body: "Track MTBF, MTTR, and downtime by family.",
    href: "/optimize",
    icon: "query_stats",
  },
];

export default function TextilesOverviewPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [data, setData] = useState<Overview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    apiGet<Family[]>("/api/families").then(setFamilies).catch(() => setFamilies([]));
    apiGet<Overview>("/api/overview").then(setData).catch(() => setData(null));
    apiGet<AnalyticsData>("/api/analytics?days=30").then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  const monitored = data?.assets.filter((a) => a.monitored).length ?? 0;
  const totalAssets = data?.assets.length ?? 0;
  const atRisk = data?.assets.filter((a) => a.status !== "NOMINAL").length ?? 0;
  const solutions = families.flatMap((f) =>
    f.useCases.map((u) => ({ ...u, family: f.name, slug: f.slug })),
  );

  return (
    <div className="space-y-5 p-5">
      <section className="anim-fade-up relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="relative min-h-[260px] sm:min-h-[230px] md:min-h-52">
          <div
            className="zoom-slow absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${HERO_IMG}')` }}
          />
          <div className="absolute inset-0 bg-on-primary-fixed/75" />
          <div className="relative flex h-full flex-col justify-end p-5 text-primary-fixed md:p-6">
            <span className="anim-slide-in font-label-caps mb-2 w-fit rounded bg-secondary px-2 py-0.5 text-on-secondary">
              Featured vertical
            </span>
            <h1
              className="anim-fade-up font-headline text-2xl font-bold md:text-3xl"
              style={{ animationDelay: "90ms" }}
            >
              Textiles &amp; Apparel Reliability
            </h1>
            <p
              className="anim-fade-up mt-1.5 max-w-3xl text-sm text-inverse-on-surface"
              style={{ animationDelay: "160ms" }}
            >
              Predictive reliability for spinning frames, air-jet looms, and dye vats at the
              Faisalabad mill. Deploy a template, then operate alerts, cases, and work orders from a
              single workspace.
            </p>
            <div
              className="anim-fade-up mt-4 flex flex-wrap gap-3"
              style={{ animationDelay: "230ms" }}
            >
              <Link
                href="/discover/textiles/templates"
                className="lift sheen rounded bg-secondary px-4 py-2 font-label-caps text-on-secondary"
              >
                Deploy a template
              </Link>
              <Link
                href="/operate"
                className="lift rounded border border-inverse-on-surface/40 px-4 py-2 font-label-caps text-on-primary"
              >
                Open Operate
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Reveal delay={0}>
          <KpiCard
            label="Active alerts"
            icon="warning"
            tone="error"
            value={data?.kpis.activeAlerts ?? 0}
            caption={`${data?.kpis.criticalAlerts ?? 0} critical now`}
            trend={(analytics?.series ?? []).slice(-7).map((point) => point.alerts)}
          />
        </Reveal>
        <Reveal delay={80}>
          <KpiCard
            label="Monitored assets"
            icon="precision_manufacturing"
            value={monitored}
            caption={`of ${totalAssets} mill assets`}
            trend={(analytics?.series ?? []).slice(-7).map((point) => point.health)}
          />
        </Reveal>
        <Reveal delay={160}>
          <KpiCard
            label="Assets at risk"
            icon="crisis_alert"
            tone="warning"
            value={atRisk}
            caption="watch or critical health"
            trend={(analytics?.series ?? []).slice(-7).map((point) => point.critical)}
          />
        </Reveal>
        <Reveal delay={240}>
          <KpiCard
            label="Avoided downtime"
            icon="savings"
            highlight
            value={data?.kpis.avoidedDowntime ?? 0}
            prefix="$"
            caption="estimated from predictive alerts"
            trend={(analytics?.series ?? []).slice(-7).map((point) => point.maintenanceCost)}
          />
        </Reveal>
      </section>

      {analytics ? (
        <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12">
          <ChartCard
            title="Reliability pulse"
            description="Thirty-day alert volume and average mill health"
            className="xl:col-span-7"
          >
            <TrendChart data={analytics.series} height={250} />
          </ChartCard>
          <ChartCard
            title="Risk by asset family"
            description="Open predictive events by textile process"
            className="xl:col-span-3"
          >
            <HorizontalRiskChart data={analytics.familyRisk} height={250} />
          </ChartCard>
          <ChartCard
            title="Alert mix"
            description="Current severity distribution"
            className="xl:col-span-2"
          >
            <DonutChart data={analytics.severity} height={250} centerLabel="Alerts" />
          </ChartCard>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest">
            <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <h2 className="font-headline flex items-center gap-2 text-lg font-semibold text-primary">
                <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-error text-error" />
                Live Mill Alerts
              </h2>
              <Link href="/discover/textiles/alerts" className="font-label-caps text-secondary hover:underline">
                Alert feed
              </Link>
            </div>
            <ul className="divide-y divide-outline-variant">
              {(data?.recentAlerts ?? []).slice(0, 5).map((a, i) => (
                <li key={a.id} className="anim-slide-in" style={{ animationDelay: `${i * 70}ms` }}>
                  <Link
                    href={`/operate/alerts/${a.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-surface-bright"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-on-surface">{a.title}</p>
                      <p className="font-data-mono mt-0.5 text-xs text-on-surface-variant">
                        {a.asset.assetCode} · {a.asset.plant.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusPill status={a.severity} />
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        chevron_right
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest">
            <div className="border-b border-outline-variant px-5 py-4">
              <h2 className="font-headline text-lg font-semibold text-primary">Mill Facilities</h2>
            </div>
            <div className="space-y-3 p-4">
              {(data?.plants ?? []).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/operate/assets?plant=${p.code}`}
                  className="lift block rounded border border-outline-variant p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <span className="font-data-mono text-sm">{p.healthScore}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-variant">
                    <div
                      className={`bar-grow h-full ${
                        p.healthScore < 80
                          ? "bg-error"
                          : p.healthScore < 90
                            ? "bg-warning"
                            : "bg-secondary"
                      }`}
                      style={{ width: `${p.healthScore}%`, animationDelay: `${i * 120}ms` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <div className="mb-3 flex items-end justify-between border-b border-outline-variant pb-2">
            <h2 className="font-headline text-lg font-semibold text-primary">Asset Families</h2>
            <Link href="/discover/textiles/families" className="font-label-caps text-secondary hover:underline">
              All families
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {families.map((f, i) => (
            <Reveal key={f.slug} delay={i * 90}>
              <Link
                href={`/discover/textiles/families/${f.slug}`}
                className="lift flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
              >
                <h3 className="font-headline text-lg font-semibold text-primary">{f.name}</h3>
                <p className="mt-2 flex-1 text-sm text-on-surface-variant">{f.description}</p>
                <div className="font-data-mono mt-4 flex justify-between border-t border-outline-variant pt-3 text-xs">
                  <span>{f._count.assets} assets</span>
                  <span className="text-secondary">{f.templates[0]?.name ?? "Templates"}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <div className="mb-3 flex items-end justify-between border-b border-outline-variant pb-2">
            <h2 className="font-headline text-lg font-semibold text-primary">
              Reliability Solutions
            </h2>
            <Link href="/discover/textiles/solutions" className="font-label-caps text-secondary hover:underline">
              Full library
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {solutions.slice(0, 6).map((s, i) => (
            <Reveal key={`${s.slug}-${s.title}`} delay={i * 70}>
              <Link
                href={`/discover/textiles/families/${s.slug}`}
                className="lift block h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
              >
                <span className="material-symbols-outlined mb-2 text-2xl text-secondary">
                  {s.icon}
                </span>
                <p className="font-label-caps text-on-surface-variant">{s.family}</p>
                <h3 className="mt-1 text-sm font-bold text-primary">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{s.body}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="font-data-mono rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[10px] text-outline"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <h2 className="font-headline mb-3 border-b border-outline-variant pb-2 text-lg font-semibold text-primary">
            Lifecycle Workflow
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {LIFECYCLE.map((step, i) => (
            <Reveal key={step.label} delay={i * 90}>
              <Link
                href={step.href}
                className="lift relative block h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                  </span>
                  <span className="font-label-caps text-on-surface-variant">Step {i + 1}</span>
                </div>
                <h3 className="font-headline mt-3 text-base font-semibold text-primary">
                  {step.label}
                </h3>
                <p className="mt-1 text-xs text-on-surface-variant">{step.body}</p>
                {i < LIFECYCLE.length - 1 ? (
                  <svg
                    className="absolute top-1/2 -right-3 hidden h-4 w-6 md:block"
                    viewBox="0 0 24 10"
                    aria-hidden
                  >
                    <path
                      d="M0,5 L22,5"
                      className="flow-line stroke-secondary"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                ) : null}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  caption,
  icon,
  trend,
  prefix = "",
  tone,
  highlight = false,
}: {
  label: string;
  value: number;
  caption: string;
  icon: string;
  trend: number[];
  prefix?: string;
  tone?: "error" | "warning";
  highlight?: boolean;
}) {
  const theme = useChartTheme();
  const stroke = highlight ? theme.onPrimary : tone === "error" ? theme.error : theme.secondary;
  return (
    <div
      className={`lift h-full rounded-lg border p-4 ${
        highlight
          ? "border-primary-container bg-primary text-on-primary"
          : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3
          className={`font-label-caps ${highlight ? "text-on-primary/75" : "text-on-surface-variant"}`}
        >
          {label}
        </h3>
        <span
          className={`material-symbols-outlined text-[18px] ${
            highlight
              ? "text-on-primary/75"
              : tone === "error"
                ? "text-error"
                : tone === "warning"
                  ? "text-warning"
                  : "text-secondary"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="font-headline mt-2 text-2xl font-bold">
        <AnimatedNumber value={value} prefix={prefix} />
      </p>
      <p className={`mt-1 text-xs ${highlight ? "text-on-primary/75" : "text-on-surface-variant"}`}>
        {caption}
      </p>
      <div className="mt-2">
        <Sparkline points={trend} stroke={stroke} fill height={28} delay={200} />
      </div>
    </div>
  );
}
