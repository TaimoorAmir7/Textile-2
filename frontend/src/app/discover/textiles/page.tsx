"use client";

import Link from "next/link";
import { useMill } from "@/lib/use-mill";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Reveal } from "@/components/Reveal";
import { AnalyticsData, DonutChart, HorizontalRiskChart, KpiLineChart, TrendChart } from "@/components/AnalyticsCharts";
import { ChartCard } from "@/components/DashboardUI";
import { useChartTheme } from "@/lib/chart-theme";
import { AI_MODULES } from "@/lib/ai-modules";
import { STAGES } from "@/lib/production-data";

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
    avoidedDowntimePct: number;
    avoidedDowntimeHrs: number;
    potentialDowntimeHrs: number;
    maintCost: number;
  };
  plants: { id: string; name: string; code: string; healthScore: number }[];
  assets: { status: string; monitored: boolean; family: { name: string } }[];
};

export default function TextilesOverviewPage() {
  const [families] = useMill<Family[]>("/api/families");
  const [data] = useMill<Overview>("/api/overview");
  const [analytics] = useMill<AnalyticsData>("/api/analytics?days=30");

  const monitored = data.assets.filter((a) => a.monitored).length;
  const totalAssets = data.assets.length;
  const atRisk = data.assets.filter((a) => a.status !== "NOMINAL").length;

  return (
    <div className="grid gap-4 p-5">
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
              Textiles &amp; Apparel Production Reliability
            </h1>
            <p
              className="anim-fade-up mt-1.5 max-w-3xl text-sm text-white/85"
              style={{ animationDelay: "160ms" }}
            >
              Production-quality reliability for Woven and Knit / Hosiery fabric. Follow every lot
              through six controlled stages, investigate fabric disturbances, and coordinate alerts
              and quality actions from one workspace.
            </p>
            <div
              className="anim-fade-up mt-4 flex flex-wrap gap-3"
              style={{ animationDelay: "230ms" }}
            >
              <Link
                href="/discover/textiles/templates"
                className="lift sheen rounded bg-secondary px-4 py-2 font-label-caps text-on-secondary"
              >
                Browse stage templates
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

      <section className="grid grid-cols-2 items-stretch gap-4 xl:grid-cols-4">
        <Reveal delay={0} className="h-full min-w-0">
          <KpiCard
            label="Quality alerts"
            icon="warning"
            tone="error"
            value={data.kpis.activeAlerts}
            caption={`${data.kpis.criticalAlerts} critical now`}
            trend={analytics.series.slice(-7).map((point) => point.alerts)}
            trendLabels={analytics.series.slice(-7).map((point) => point.label)}
            seriesName="Quality alerts"
          />
        </Reveal>
        <Reveal delay={80} className="h-full min-w-0">
          <KpiCard
            label="Controlled stages"
            icon="precision_manufacturing"
            value={monitored}
            caption={`of ${totalAssets} family stages`}
            trend={analytics.series.slice(-7).map((point) => point.health)}
            trendLabels={analytics.series.slice(-7).map((point) => point.label)}
            seriesName="Quality score"
            seriesUnit="%"
          />
        </Reveal>
        <Reveal delay={160} className="h-full min-w-0">
          <KpiCard
            label="Stages at risk"
            icon="crisis_alert"
            tone="warning"
            value={atRisk}
            caption="watch or critical quality"
            trend={analytics.series.slice(-7).map((point) => point.critical)}
            trendLabels={analytics.series.slice(-7).map((point) => point.label)}
            seriesName="Assets at risk"
          />
        </Reveal>
        <Reveal delay={240} className="h-full min-w-0">
          <KpiCard
            label="Protected production"
            icon="savings"
            highlight
            value={data.kpis.avoidedDowntimePct}
            suffix="%"
            caption={`${data.kpis.avoidedDowntimeHrs} h of ${data.kpis.potentialDowntimeHrs} h potential`}
            trend={analytics.series.slice(-7).map((point) => point.health)}
            trendLabels={analytics.series.slice(-7).map((point) => point.label)}
            seriesName="Quality trend"
            seriesUnit="%"
          />
        </Reveal>
      </section>

      {analytics.series.length ? (
        <section className="grid min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          <ChartCard
            title="Quality pulse"
            description="Thirty-day alert volume and average stage quality"
            className="h-full"
          >
            <TrendChart data={analytics.series} height={250} />
          </ChartCard>
          <ChartCard
            title="Risk by fabric family"
            description="Open quality events by fabric construction"
            className="h-full"
          >
            <HorizontalRiskChart data={analytics.familyRisk} height={250} />
          </ChartCard>
          <ChartCard
            title="Alert mix"
            description="Current severity distribution"
            className="h-full"
          >
            <DonutChart data={analytics.severity} height={250} centerLabel="Alerts" />
          </ChartCard>
        </section>
      ) : null}

      <section>
        <Reveal delay={100} className="min-w-0">
          <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest">
            <div className="border-b border-outline-variant px-5 py-4">
              <h2 className="font-headline text-lg font-semibold text-primary">Production Areas</h2>
            </div>
            <div className="grid flex-1 gap-3 p-4 md:grid-cols-3">
              {data.plants.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/operate/assets?plant=${p.code}`}
                  className="lift block rounded border border-outline-variant p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <span className="font-data-mono text-sm">{p.healthScore}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-md bg-surface-variant">
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
            <h2 className="font-headline text-lg font-semibold text-primary">Production Families</h2>
            <Link href="/discover/textiles/families" className="font-label-caps text-secondary hover:underline">
              All families
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
          {families.map((f, i) => (
            <Reveal key={f.slug} delay={i * 90} className="h-full min-w-0">
              <Link
                href={`/discover/textiles/families/${f.slug}`}
                className="lift flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
              >
                <h3 className="font-headline text-lg font-semibold text-primary">{f.name}</h3>
                <p className="mt-2 flex-1 text-sm text-on-surface-variant">{f.description}</p>
                <div className="font-data-mono mt-4 flex justify-between border-t border-outline-variant pt-3 text-xs">
                  <span>{f._count.assets} stages</span>
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
              AI Modules
            </h2>
            <Link href="/discover/textiles/solutions" className="font-label-caps text-secondary hover:underline">
              Explore modules
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AI_MODULES.map((module, i) => {
            const stageLabels = [...new Set(module.coverage
              .map((item) => STAGES.find((stage) => stage.slug === item.stage)?.shortLabel)
              .filter((label): label is string => Boolean(label)))];
            return (
            <Reveal key={module.slug} delay={i * 70} className="h-full min-w-0">
              <Link
                href={`/discover/textiles/solutions/${module.slug}`}
                className="lift block h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
              >
                <span className="material-symbols-outlined mb-2 text-2xl text-secondary">
                  {module.icon}
                </span>
                <p className="font-label-caps text-on-surface-variant">{module.code} · Woven + Knits</p>
                <h3 className="mt-1 text-sm font-bold text-primary">{module.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{module.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {stageLabels.map((label) => (
                    <span
                      key={label}
                      className="font-data-mono rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[10px] text-outline"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </Link>
            </Reveal>
          );})}
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
  trendLabels,
  seriesName,
  seriesUnit = "",
  prefix = "",
  suffix = "",
  tone,
  highlight = false,
}: {
  label: string;
  value: number;
  caption: string;
  icon: string;
  trend: number[];
  trendLabels?: string[];
  seriesName: string;
  seriesUnit?: string;
  prefix?: string;
  suffix?: string;
  tone?: "error" | "warning";
  highlight?: boolean;
}) {
  const theme = useChartTheme();
  const stroke = highlight ? theme.onPrimary : tone === "error" ? theme.error : theme.secondary;
  return (
    <div
      className={`flex h-full flex-col rounded-lg border p-4 ${
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
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
      <p className={`mt-1 text-xs ${highlight ? "text-on-primary/75" : "text-on-surface-variant"}`}>
        {caption}
      </p>
      <div className="mt-auto pt-3">
        <KpiLineChart
          points={trend}
          labels={trendLabels}
          color={stroke}
          name={seriesName}
          unit={seriesUnit}
          height={72}
        />
      </div>
    </div>
  );
}
