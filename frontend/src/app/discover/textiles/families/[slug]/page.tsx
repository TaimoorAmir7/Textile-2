"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { StatusPill } from "@/components/StatusPill";
import { useMillOrNull } from "@/lib/use-mill";
import { recordVisit } from "@/lib/session-history";
import { STAGES, type FamilySlug } from "@/lib/production-data";

type FamilyDetail = {
  slug: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  challenges: { title: string; body: string; tone: string }[];
  assets: { id: string; assetCode: string; location: string; status: string; healthScore: number }[];
};

export default function FamilyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [family] = useMillOrNull<FamilyDetail>(`/api/families/${slug}`);

  useEffect(() => {
    if (!family) return;
    recordVisit({ href: `/discover/textiles/families/${family.slug}`, title: family.name, sub: "Textiles & Apparel", icon: "precision_manufacturing" });
  }, [family]);

  if (!family) return <div className="p-6 text-sm text-on-surface-variant">Loading family…</div>;

  const productionSlug: FamilySlug = family.slug === "knit" ? "knits-hosiery" : "woven";

  return (
    <div className="p-container-margin">
      <Reveal className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-headline mb-1 text-3xl font-bold text-primary">{family.name}</h2>
            <p className="max-w-3xl text-on-surface-variant">{family.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/discover/textiles/families" className="rounded border border-outline-variant px-4 py-1.5 font-label-caps text-primary hover:border-primary">All families</Link>
            <Link href="/discover/textiles/templates" className="sheen flex items-center gap-1.5 rounded bg-secondary px-4 py-1.5 font-label-caps text-on-secondary"><span className="material-symbols-outlined text-[16px]">travel_explore</span>Browse templates</Link>
          </div>
        </div>
      </Reveal>

      <div className="grid min-h-[calc(100vh-15rem)] grid-cols-12 items-stretch gap-4">
        <Reveal className="col-span-12 flex h-full min-w-0 flex-col gap-4 lg:col-span-5">
          <div className="flex flex-1 flex-col rounded border border-outline-variant bg-surface-container-lowest p-6">
            <h3 className="mb-5 flex items-center gap-2 font-headline text-xl font-semibold text-primary"><span className="material-symbols-outlined text-[22px] text-secondary">straighten</span>Production Specifications</h3>
            <ul className="font-data-mono flex flex-1 flex-col justify-evenly gap-4 text-sm">
              {Object.entries(family.specs).map(([key, value]) => <li key={key} className="flex items-center justify-between gap-4 border-b border-surface-container pb-3"><span className="text-outline">{key}</span><span className="text-right text-base font-semibold text-on-surface">{value}</span></li>)}
            </ul>
          </div>
          <div className="flex flex-1 flex-col rounded border border-outline-variant bg-surface-container-lowest p-6">
            <h3 className="mb-5 flex items-center gap-2 font-headline text-xl font-semibold text-primary"><span className="material-symbols-outlined text-[22px] text-error">warning</span>Key Quality Challenges</h3>
            <div className="flex flex-1 flex-col justify-evenly gap-3">
              {family.challenges.map((challenge) => <div key={challenge.title} className={challenge.tone === "error" ? "rounded-lg border border-error-container bg-error-container/20 p-4" : "rounded-lg border border-outline-variant bg-surface-container-low p-4"}><p className="mb-1 text-base font-bold">{challenge.title}</p><p className="text-sm leading-relaxed text-on-surface-variant">{challenge.body}</p></div>)}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="col-span-12 flex h-full min-w-0 flex-col rounded border border-outline-variant bg-surface-container-lowest lg:col-span-7">
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low/50 px-6 py-5">
            <div>
              <h3 className="flex items-center gap-2 font-headline text-xl font-semibold text-primary"><span className="material-symbols-outlined text-[22px] text-secondary">account_tree</span>Six-Stage Production Route</h3>
              <p className="mt-1 text-xs text-on-surface-variant">Open a stage to view its machinery image, fabric condition, checklist and production risks.</p>
            </div>
            <span className="rounded bg-primary-container px-3 py-1 font-data-mono text-xs text-on-primary-container">6 stages</span>
          </div>
          <div className="grid flex-1 gap-3 p-4 md:grid-cols-2">
            {STAGES.map((stage, index) => {
              const stageAsset = family.assets.find((asset) => asset.assetCode.endsWith(String(stage.order).padStart(2, "0")));
              const profile = stage.profiles[productionSlug];
              return <Link key={stage.slug} href={`/discover/textiles/families/${family.slug}/${stage.slug}`} className="anim-slide-in lift group flex min-h-36 flex-col rounded-lg border border-outline-variant bg-surface-container-low p-4 hover:border-secondary" style={{ animationDelay: `${index * 60}ms` }}>
                <div className="flex items-start justify-between gap-3"><span className="flex h-8 w-8 items-center justify-center rounded bg-primary font-data-mono text-xs font-bold text-on-primary">0{stage.order}</span>{stageAsset ? <StatusPill status={stageAsset.status} /> : null}</div>
                <h4 className="font-headline mt-3 text-lg font-semibold text-primary">{stage.label}</h4>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">{stage.whatHappens}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-3"><span className="font-label-caps truncate text-secondary">{profile.machine}</span><span className="material-symbols-outlined text-[18px] text-outline transition-transform group-hover:translate-x-1">arrow_forward</span></div>
              </Link>;
            })}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
