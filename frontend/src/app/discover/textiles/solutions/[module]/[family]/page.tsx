"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import {
  familyLabel,
  familyUnit,
  moduleBySlug,
  moduleCoverageForStage,
  type ModuleFamilySlug,
} from "@/lib/ai-modules";
import { STAGES, type ProductionStage } from "@/lib/production-data";

export default function ModuleFamilyCoveragePage() {
  const { module: moduleSlug, family: familySlug } = useParams<{ module: string; family: string }>();
  const aiModule = moduleBySlug(moduleSlug);
  const family = familySlug === "woven" || familySlug === "knit" ? familySlug as ModuleFamilySlug : null;

  if (!aiModule || !family || !aiModule.families.includes(family)) {
    return <div className="p-6 text-sm text-on-surface-variant">Module coverage not found.</div>;
  }

  return (
    <div className="space-y-6 p-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-label-caps text-secondary">{aiModule.code} · {familyLabel(family)}</p>
            <h1 className="font-headline mt-1 text-3xl font-bold text-primary">{aiModule.shortName}</h1>
            <p className="mt-2 max-w-3xl text-on-surface-variant">
              Production coverage for {familyLabel(family)}, measured in {familyUnit(family)}.
              Applicable stages are highlighted below; the established six-stage route is unchanged.
            </p>
          </div>
          <Link href={`/discover/textiles/solutions/${aiModule.slug}`} className="rounded border border-outline-variant px-4 py-2 font-label-caps text-primary hover:border-primary">
            Change family
          </Link>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-label-caps text-secondary">Step 2</p>
              <h2 className="font-headline mt-1 text-xl font-semibold text-primary">Production-stage applicability</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-secondary" />Applicable</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-outline-variant" />Not used</span>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {STAGES.map((stage) => (
              <StageCard key={stage.slug} stage={stage} moduleSlug={aiModule.slug} family={family} />
            ))}
          </div>
        </section>
      </Reveal>

      <section>
        <Reveal>
          <div className="mb-3 border-b border-outline-variant pb-2">
            <h2 className="font-headline text-xl font-semibold text-primary">How the module applies</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Select any applicable item to continue to the existing production-stage page.</p>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {aiModule.coverage.map((item, index) => {
            const stage = STAGES.find((candidate) => candidate.slug === item.stage)!;
            return (
              <Reveal key={item.stage} delay={index * 60} className="h-full">
                <Link href={`/discover/textiles/families/${family}/${stage.slug}?module=${aiModule.slug}`} className="lift group flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 hover:border-secondary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-label-caps text-secondary">Stage {stage.order} · {item.checkpoint}</p>
                      <h3 className="font-headline mt-1 text-lg font-semibold text-primary">{stage.label}</h3>
                    </div>
                    <span className="font-label-caps rounded bg-secondary-container px-2 py-1 text-on-secondary-container">{item.role}</span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
                  <span className="font-label-caps mt-4 flex items-center justify-end gap-1 text-secondary">Open production stage<span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span></span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StageCard({ stage, moduleSlug, family }: { stage: ProductionStage; moduleSlug: string; family: ModuleFamilySlug }) {
  const aiModule = moduleBySlug(moduleSlug)!;
  const coverage = moduleCoverageForStage(aiModule, stage.slug);
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded font-data-mono text-[10px] font-bold ${coverage ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"}`}>0{stage.order}</span>
        <span className="material-symbols-outlined text-[17px] text-on-surface-variant">{stage.icon}</span>
      </div>
      <p className={`mt-3 text-sm font-semibold ${coverage ? "text-primary" : "text-on-surface-variant"}`}>{stage.shortLabel}</p>
      <p className="font-label-caps mt-1 text-on-surface-variant">{coverage ? coverage.checkpoint : "Not used"}</p>
    </>
  );

  return coverage ? (
    <Link href={`/discover/textiles/families/${family}/${stage.slug}?module=${aiModule.slug}`} className="rounded border border-secondary bg-secondary-container/20 p-3 transition-colors hover:bg-secondary-container/35">
      {content}
    </Link>
  ) : (
    <div className="rounded border border-outline-variant bg-surface-container-low p-3 opacity-65">{content}</div>
  );
}
