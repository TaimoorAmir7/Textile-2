"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useMill } from "@/lib/use-mill";

type Template = {
  id: string;
  slug: string;
  name: string;
  version: string;
  overview: string;
  signals: { key: string; name: string; unit: string }[];
  failureModes: { name: string; description: string }[];
  family: { name: string; slug: string; assets: { id: string; monitored: boolean }[] };
};

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

export default function TemplateLibraryPage() {
  const [templates] = useMill<Template[]>("/api/templates");

  return (
    <div className="space-y-5 p-5">
      <Reveal>
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Template Library</h1>
          <p className="mt-1 max-w-3xl text-on-surface-variant">
            Versioned quality-gate templates for all six Woven and Knit production stages. Each
            carries stage checks, defect risks, and the same established deployment workflow.
          </p>
        </div>
      </Reveal>

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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {orderByStage(templates.filter((template) => template.family.slug === section.slug)).map((t, stageIndex) => {
          const assets = t.family.assets ?? [];
          const monitored = assets.filter((a) => a.monitored).length;
          const coverage = assets.length ? Math.round((monitored / assets.length) * 100) : 0;
          return (
            <Reveal key={t.id} delay={stageIndex * 70}>
              <div className="lift flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-label-caps text-secondary">Stage {stageIndex + 1} of 6</p>
                    <h2 className="font-headline mt-1 text-lg font-semibold text-primary">
                      {t.name}
                    </h2>
                  </div>
                  <span className="font-data-mono rounded bg-primary-container px-2 py-0.5 text-[10px] text-on-primary-container">
                    v{t.version}
                  </span>
                </div>
                <p className="mt-2 flex-1 text-sm text-on-surface-variant">{t.overview}</p>

                <div className="mt-4">
                  <p className="font-label-caps mb-1 text-on-surface-variant">
                    Deployment coverage
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-md bg-surface-variant">
                    <div
                      className="bar-grow h-full bg-secondary"
                      style={{ width: `${coverage}%`, animationDelay: `${stageIndex * 100}ms` }}
                    />
                  </div>
                  <p className="font-data-mono mt-1 text-xs text-on-surface-variant">
                    {monitored}/{assets.length} family stages covered
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant pt-3 text-xs">
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Quality checks</p>
                    <p className="font-data-mono mt-1">{t.signals.length}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Defect risks</p>
                    <p className="font-data-mono mt-1">{t.failureModes.length}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/discover/templates/${t.slug}`}
                    className="flex-1 rounded border border-outline-variant px-3 py-2 text-center font-label-caps text-primary hover:border-primary"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/deploy/${t.id}`}
                    className="sheen flex-1 rounded bg-secondary px-3 py-2 text-center font-label-caps text-on-secondary"
                  >
                    Deploy
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
