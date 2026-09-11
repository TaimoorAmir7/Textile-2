"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { moduleBySlug, moduleCoverageForStage, type ModuleFamilySlug } from "@/lib/ai-modules";
import { FAMILIES, STAGES, type FamilySlug } from "@/lib/production-data";

export default function ProductionStagePage() {
  const { slug, stage: stageSlug } = useParams<{ slug: string; stage: string }>();
  const searchParams = useSearchParams();
  const productionSlug: FamilySlug = slug === "knit" ? "knits-hosiery" : "woven";
  const family = FAMILIES.find((item) => item.slug === productionSlug);
  const stage = STAGES.find((item) => item.slug === stageSlug);

  if (!family || !stage) return <div className="p-6 text-sm text-on-surface-variant">Production stage not found.</div>;

  const profile = stage.profiles[productionSlug];
  const aiModule = moduleBySlug(searchParams.get("module") ?? "");
  const moduleFamily: ModuleFamilySlug = slug === "knit" ? "knit" : "woven";
  const moduleCoverage = aiModule && aiModule.families.includes(moduleFamily)
    ? moduleCoverageForStage(aiModule, stage.slug)
    : null;

  return (
    <div className="space-y-5 p-container-margin">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="font-label-caps mb-1 text-secondary">{family.shortName} · Stage {stage.order} of 6</p><h1 className="font-headline text-3xl font-bold text-primary">{stage.label}</h1><p className="mt-1 max-w-3xl text-on-surface-variant">{stage.whatHappens}</p></div>
          <Link href={`/discover/textiles/families/${slug}`} className="rounded border border-outline-variant px-4 py-2 font-label-caps text-primary hover:border-primary">Back to {family.shortName}</Link>
        </div>
      </Reveal>

      {aiModule && moduleCoverage ? (
        <Reveal delay={40}>
          <section className="flex flex-col gap-4 rounded-lg border border-secondary/60 bg-secondary-container/20 p-5 lg:flex-row lg:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-on-secondary">
              <span className="material-symbols-outlined">{aiModule.icon}</span>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-label-caps text-secondary">{aiModule.code} · AI context</p>
                <span className="font-label-caps rounded bg-surface-container-lowest px-2 py-0.5 text-on-surface-variant">{moduleCoverage.role} · {moduleCoverage.checkpoint}</span>
              </div>
              <h2 className="font-headline mt-1 text-lg font-semibold text-primary">{aiModule.name}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{moduleCoverage.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{aiModule.outputs.slice(0, 4).map((output) => <span key={output} className="rounded border border-outline-variant bg-surface-container-lowest px-2 py-1 text-[11px] text-on-surface-variant">{output}</span>)}</div>
            </div>
            <Link href={`/discover/textiles/solutions/${aiModule.slug}`} className="shrink-0 rounded border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-caps text-primary hover:border-primary">Back to module</Link>
          </section>
        </Reveal>
      ) : null}

      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-2">
        <div className="grid min-w-0 grid-rows-[auto_1fr_1fr] gap-4">
          <Reveal className="h-full">
            <section className="h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
              <p className="font-label-caps text-secondary">Stage machinery and fabric context</p>
              <h2 className="font-headline mt-1 text-xl font-semibold text-primary">{profile.machine}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">{profile.fabricState}</p>
            </section>
          </Reveal>
          <Reveal delay={80} className="h-full">
            <section className="h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5"><h2 className="font-headline flex items-center gap-2 text-lg font-semibold text-primary"><span className="material-symbols-outlined text-secondary">fact_check</span>Stage quality checklist</h2><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{profile.qualityFocus.map((check) => <div key={check} className="flex items-center gap-2 rounded bg-surface-container-low px-3 py-2 text-sm"><span className="material-symbols-outlined text-[17px] text-secondary">check_circle</span>{check}</div>)}</div></section>
          </Reveal>
          <Reveal delay={120} className="h-full">
            <section className="h-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5"><h2 className="font-headline flex items-center gap-2 text-lg font-semibold text-primary"><span className="material-symbols-outlined text-error">warning</span>Typical production risks</h2><ul className="mt-3 space-y-2">{profile.risks.map((risk) => <li key={risk} className="flex items-center justify-between rounded border border-outline-variant px-3 py-2 text-sm"><span>{risk}</span><span className="font-label-caps text-on-surface-variant">Quality</span></li>)}</ul></section>
          </Reveal>
        </div>
        <Reveal delay={80} className="min-w-0">
          <section className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
            <div className="relative min-h-96 flex-1 bg-white"><Image src={profile.image} alt={`${profile.machine} showing ${profile.fabricState.toLowerCase()}`} fill priority sizes="(max-width: 1280px) 100vw, 50vw" className="object-contain p-4" /></div>
            <div className="border-t border-outline-variant px-5 py-4"><p className="font-label-caps text-secondary">Stage visual</p><p className="mt-1 text-sm text-on-surface-variant">{profile.machine}</p></div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
