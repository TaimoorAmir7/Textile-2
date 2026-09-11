"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { familyLabel, familyUnit, moduleBySlug, type ModuleFamilySlug } from "@/lib/ai-modules";
import { STAGES } from "@/lib/production-data";

const FAMILIES: ModuleFamilySlug[] = ["woven", "knit"];

export default function AIModulePage() {
  const { module: moduleSlug } = useParams<{ module: string }>();
  const aiModule = moduleBySlug(moduleSlug);

  if (!aiModule) return <div className="p-6 text-sm text-on-surface-variant">AI module not found.</div>;

  return (
    <div className="space-y-6 p-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-label-caps text-secondary">{aiModule.code} · AI module</p>
            <h1 className="font-headline mt-1 text-3xl font-bold text-primary">{aiModule.name}</h1>
            <p className="mt-2 max-w-3xl text-on-surface-variant">{aiModule.summary}</p>
          </div>
          <Link href="/discover/textiles/solutions" className="rounded border border-outline-variant px-4 py-2 font-label-caps text-primary hover:border-primary">
            All AI modules
          </Link>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <section className="grid gap-px overflow-hidden rounded-lg border border-outline-variant bg-outline-variant md:grid-cols-3">
          <SummaryCell label="Business outcome" value={aiModule.outcome} />
          <SummaryCell label="Production scope" value={`${aiModule.coverage.length} stage ${aiModule.coverage.length === 1 ? "application" : "applications"}`} />
          <SummaryCell label="Supported families" value="Woven and Knits / Hosiery" />
        </section>
      </Reveal>

      <section>
        <Reveal>
          <div className="mb-3 border-b border-outline-variant pb-2">
            <p className="font-label-caps text-secondary">Step 1</p>
            <h2 className="font-headline mt-1 text-xl font-semibold text-primary">Select a production family</h2>
            <p className="mt-1 text-sm text-on-surface-variant">The module will continue to the relevant stage or family route.</p>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {FAMILIES.map((family, index) => {
            const singleStage = aiModule.coverage.length === 1 ? aiModule.coverage[0].stage : null;
            const href = singleStage
              ? `/discover/textiles/families/${family}/${singleStage}?module=${aiModule.slug}`
              : `/discover/textiles/solutions/${aiModule.slug}/${family}`;
            const stageName = singleStage ? STAGES.find((stage) => stage.slug === singleStage)?.label : null;
            return (
              <Reveal key={family} delay={index * 80} className="h-full">
                <Link href={href} className="lift group flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-6 hover:border-secondary">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary">
                      <span className="material-symbols-outlined">{family === "woven" ? "view_week" : "texture"}</span>
                    </span>
                    <span className="font-label-caps rounded bg-surface-container px-2 py-1 text-on-surface-variant">Measured in {familyUnit(family)}</span>
                  </div>
                  <h3 className="font-headline mt-4 text-2xl font-semibold text-primary">{familyLabel(family)}</h3>
                  <p className="mt-2 flex-1 text-sm text-on-surface-variant">
                    {singleStage
                      ? `Continue directly to ${stageName}, the active production stage for this module.`
                      : `Review the six-stage route with ${aiModule.coverage.length} applicable module positions highlighted.`}
                  </p>
                  <span className="font-label-caps mt-5 flex items-center justify-end gap-1 text-secondary">
                    {singleStage ? `Open ${stageName}` : "View stage coverage"}
                    <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <DetailList title="Required inputs" icon="input" items={aiModule.inputs} />
        <DetailList title="Module outputs" icon="output" items={aiModule.outputs} />
        <DetailList title="Measured outcomes" icon="query_stats" items={aiModule.kpis} />
      </section>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return <div className="bg-surface-container-lowest p-4"><p className="font-label-caps text-on-surface-variant">{label}</p><p className="mt-1 text-sm font-semibold text-primary">{value}</p></div>;
}

function DetailList({ title, icon, items }: { title: string; icon: string; items: string[] }) {
  return (
    <Reveal className="h-full">
      <section className="h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="font-headline flex items-center gap-2 text-lg font-semibold text-primary"><span className="material-symbols-outlined text-secondary">{icon}</span>{title}</h2>
        <ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-sm text-on-surface-variant"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />{item}</li>)}</ul>
      </section>
    </Reveal>
  );
}
