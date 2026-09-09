"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { StatusPill } from "@/components/StatusPill";
import { useMillOrNull } from "@/lib/use-mill";
import { recordVisit } from "@/lib/session-history";

type FamilyDetail = {
  slug: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  challenges: { title: string; body: string; tone: string }[];
  assets: {
    id: string;
    assetCode: string;
    location: string;
    status: string;
    healthScore: number;
  }[];
};

export default function FamilyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [family] = useMillOrNull<FamilyDetail>(`/api/families/${slug}`);

  useEffect(() => {
    if (!family) return;
    recordVisit({
      href: `/discover/textiles/families/${family.slug}`,
      title: family.name,
      sub: "Textiles & Apparel",
      icon: "precision_manufacturing",
    });
  }, [family]);

  if (!family) {
    return <div className="p-6 text-sm text-on-surface-variant">Loading family…</div>;
  }

  return (
    <div className="p-container-margin">
      <Reveal className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-headline mb-1 text-3xl font-bold text-primary">{family.name}</h2>
            <p className="max-w-3xl text-on-surface-variant">{family.description}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/discover/textiles/families"
              className="rounded border border-outline-variant px-4 py-1.5 font-label-caps text-primary hover:border-primary"
            >
              All families
            </Link>
            <Link
              href="/discover/textiles/templates"
              className="sheen flex items-center gap-1.5 rounded bg-secondary px-4 py-1.5 font-label-caps text-on-secondary"
            >
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              Browse templates
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="grid min-h-[calc(100vh-15rem)] grid-cols-12 items-stretch gap-4">
        <Reveal className="col-span-12 flex h-full min-w-0 flex-col gap-4 lg:col-span-5">
          <div className="flex flex-1 flex-col rounded border border-outline-variant bg-surface-container-lowest p-6">
            <h3 className="mb-5 flex items-center gap-2 font-headline text-xl font-semibold text-primary">
              <span className="material-symbols-outlined text-[22px] text-secondary">memory</span>
              Technical Specifications
            </h3>
            <ul className="font-data-mono flex flex-1 flex-col justify-evenly gap-4 text-sm">
              {Object.entries(family.specs).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between border-b border-surface-container pb-3">
                  <span className="text-outline">{k}</span>
                  <span className="text-base font-semibold text-on-surface">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-1 flex-col rounded border border-outline-variant bg-surface-container-lowest p-6">
            <h3 className="mb-5 flex items-center gap-2 font-headline text-xl font-semibold text-primary">
              <span className="material-symbols-outlined text-[22px] text-error">warning</span>
              Key Challenges
            </h3>
            <div className="flex flex-1 flex-col justify-evenly gap-4">
              {family.challenges.map((c) => (
                <div
                  key={c.title}
                  className={
                    c.tone === "error"
                      ? "flex-1 rounded-lg border border-error-container bg-error-container/20 p-4"
                      : "flex-1 rounded-lg border border-outline-variant bg-surface-container-low p-4"
                  }
                >
                  <p className="mb-2 text-base font-bold">{c.title}</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal
          delay={120}
          className="col-span-12 flex h-full min-w-0 flex-col rounded border border-outline-variant bg-surface-container-lowest lg:col-span-7"
        >
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low/50 px-6 py-5">
            <h3 className="flex items-center gap-2 font-headline text-xl font-semibold text-primary">
              <span className="material-symbols-outlined text-[22px] text-secondary">view_list</span>
              Connected Assets in Family
            </h3>
            <span className="rounded bg-primary-container px-3 py-1 font-data-mono text-xs text-on-primary-container">
              Total: {family.assets.length}
            </span>
          </div>
          <div className="max-w-full flex-1 overflow-x-auto">
            <table className="min-w-[620px] w-full text-left text-sm">
              <thead>
                <tr className="font-label-caps border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
                  <th className="px-6 py-4 font-medium">Asset ID</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Health Score</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {family.assets.map((a, i) => (
                  <tr
                    key={a.id}
                    className="anim-slide-in transition-colors hover:bg-surface-bright"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <td className="px-6 py-5 font-data-mono text-base font-bold text-primary">{a.assetCode}</td>
                    <td className="px-6 py-5 text-on-surface-variant">{a.location}</td>
                    <td className="px-6 py-5">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="font-data-mono px-6 py-5 text-base">{a.healthScore}%</td>
                    <td className="px-6 py-5 text-right">
                      <Link href="/operate/assets">
                        <span className="material-symbols-outlined text-[20px] text-outline">chevron_right</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
