"use client";

import Link from "next/link";
import { useMill } from "@/lib/use-mill";
import { MetricCard, PageHeader } from "@/components/DashboardUI";

type Template = { id: string; slug: string; name: string; overview: string; version: string; family: { name: string; slug: string; assets: { monitored: boolean }[] } };

const STAGE_ORDER = ["greige", "pre-treatment", "dyeing", "printing", "finishing", "folding-rolling"];
const FAMILY_SECTIONS = [
  { slug: "woven", title: "Woven", detail: "Meter-based production route" },
  { slug: "knit", title: "Knits / Hosiery", detail: "Kilogram-based production route" },
];

function orderByStage(templates: Template[]) {
  return [...templates].sort((a, b) => {
    const rank = (template: Template) => STAGE_ORDER.findIndex((stage) => template.slug.includes(`-${stage}-quality-gate`));
    return rank(a) - rank(b);
  });
}

export default function DeployIndexPage() {
  const [templates] = useMill<Template[]>("/api/templates");

  return (
    <div className="w-full space-y-5 p-4 sm:p-5">
      <PageHeader title="Template Deployment" eyebrow="Deploy" description="Apply proven stage-quality templates to Woven and Knit production and validate checklist coverage." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Available templates" value={12} icon="inventory_2" />
        <MetricCard label="Deployments" value={18} icon="rocket_launch" />
        <MetricCard label="Controlled stages" value={12} icon="fact_check" />
        <MetricCard label="Data quality" value={99} suffix="%" icon="verified" tone="highlight" />
      </div>
      <div className="space-y-7">
        {FAMILY_SECTIONS.map((section, sectionIndex) => (
          <section key={section.slug} className={sectionIndex ? "border-t border-outline-variant pt-7" : ""}>
            <div className="mb-4 flex items-end gap-4">
              <div>
                <p className="font-label-caps text-secondary">Production family {sectionIndex + 1} of 2</p>
                <h2 className="font-headline mt-1 text-2xl font-semibold text-primary">{section.title}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{section.detail} · six stages in production sequence</p>
              </div>
              <div className="mb-2 h-px flex-1 bg-outline-variant" />
              <span className="font-data-mono mb-1 text-xs text-on-surface-variant">6 templates</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {orderByStage(templates.filter((template) => template.family.slug === section.slug)).map((t, stageIndex) => {
          const assets = t.family.assets ?? [];
          const monitored = assets.filter((asset) => asset.monitored).length;
          const coverage = Math.round((monitored / Math.max(assets.length, 1)) * 100);
          return (
          <Link
            key={t.id}
            href={`/deploy/${t.id}`}
            className="lift flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 hover:border-secondary"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-label-caps text-secondary">Stage {stageIndex + 1} of 6</p>
              <span className="font-data-mono rounded bg-surface-container px-2 py-0.5 text-[10px]">v{t.version}</span>
            </div>
            <h3 className="mt-1 font-headline text-lg font-semibold text-primary">{t.name}</h3>
            <p className="mt-2 flex-1 text-sm text-on-surface-variant">{t.overview}</p>
            <div className="mt-4 border-t border-outline-variant pt-3">
              <div className="flex justify-between text-xs"><span>Stage coverage</span><span className="font-data-mono">{coverage}%</span></div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-md bg-surface-container-high"><div className="h-full bg-secondary" style={{ width: `${coverage}%` }} /></div>
              <p className="font-label-caps mt-3 text-right text-secondary">Configure deployment →</p>
            </div>
          </Link>
        )})}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
