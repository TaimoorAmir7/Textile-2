"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { AI_MODULES, USTAAD_MODULE } from "@/lib/ai-modules";
import { STAGES } from "@/lib/production-data";
import { openUstaad } from "@/lib/ustaad";

function stageLabel(slug: string) {
  return STAGES.find((stage) => stage.slug === slug)?.shortLabel ?? slug;
}

export default function AIModulesPage() {
  return (
    <div className="space-y-6 p-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-label-caps text-secondary">Textile intelligence layer</p>
            <h1 className="font-headline mt-1 text-3xl font-bold text-primary">AI Modules</h1>
            <p className="mt-1 max-w-3xl text-on-surface-variant">
              Select an AI capability, choose Woven or Knits / Hosiery, and continue to the
              production stage or checkpoint where that capability applies.
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-right">
            <p className="font-data-mono text-2xl font-bold text-primary">07</p>
            <p className="font-label-caps text-on-surface-variant">Active modules</p>
          </div>
        </div>
      </Reveal>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AI_MODULES.map((module, index) => {
          const stages = [...new Set(module.coverage.map((item) => item.stage))];
          return (
            <Reveal key={module.slug} delay={index * 70} className="h-full">
              <Link
                href={`/discover/textiles/solutions/${module.slug}`}
                className="lift group flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 hover:border-secondary"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                    <span className="material-symbols-outlined text-[24px]">{module.icon}</span>
                  </span>
                  <span className="font-data-mono rounded bg-surface-container px-2 py-1 text-[10px] text-on-surface-variant">
                    {module.code}
                  </span>
                </div>
                <h2 className="font-headline mt-4 text-lg font-semibold text-primary">{module.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{module.summary}</p>
                <p className="mt-3 flex-1 text-sm font-medium text-on-surface">{module.outcome}</p>
                <div className="mt-4 border-t border-outline-variant pt-3">
                  <p className="font-label-caps mb-2 text-on-surface-variant">Production coverage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stages.map((stage) => (
                      <span key={stage} className="rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-[11px] text-on-surface-variant">
                        {stageLabel(stage)}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-label-caps mt-4 flex items-center justify-end gap-1 text-secondary">
                  Select family
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </span>
              </Link>
            </Reveal>
          );
        })}
        <Reveal delay={AI_MODULES.length * 70} className="h-full">
          <button
            type="button"
            onClick={openUstaad}
            className="lift group flex h-full w-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-left hover:border-secondary"
          >
            <div className="flex w-full items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-[24px]">{USTAAD_MODULE.icon}</span>
              </span>
              <span className="font-data-mono rounded bg-surface-container px-2 py-1 text-[10px] text-on-surface-variant">
                {USTAAD_MODULE.code}
              </span>
            </div>
            <h2 className="font-headline mt-4 text-lg font-semibold text-primary">{USTAAD_MODULE.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{USTAAD_MODULE.summary}</p>
            <p className="mt-3 flex-1 text-sm font-medium text-on-surface">{USTAAD_MODULE.outcome}</p>
            <div className="mt-4 w-full border-t border-outline-variant pt-3">
              <p className="font-label-caps mb-2 text-on-surface-variant">Knowledge coverage</p>
              <div className="flex flex-wrap gap-1.5">
                {USTAAD_MODULE.coverage.map((item) => (
                  <span key={item} className="rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-[11px] text-on-surface-variant">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <span className="font-label-caps mt-4 flex w-full items-center justify-end gap-1 text-secondary">
              Open Ustaad
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">forum</span>
            </span>
          </button>
        </Reveal>
      </section>
    </div>
  );
}
