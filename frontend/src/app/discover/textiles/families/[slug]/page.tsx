"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { StatusPill } from "@/components/StatusPill";
import { apiGet } from "@/lib/api";

type FamilyDetail = {
  slug: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  challenges: { title: string; body: string; tone: string }[];
  useCases: { title: string; body: string; tags: string[]; icon: string }[];
  templates: { slug: string; name: string }[];
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
  const [family, setFamily] = useState<FamilyDetail | null>(null);

  useEffect(() => {
    apiGet<FamilyDetail>(`/api/families/${slug}`).then(setFamily).catch(() => setFamily(null));
  }, [slug]);

  if (!family) {
    return <div className="p-6 text-sm text-on-surface-variant">Loading family…</div>;
  }

  const browse = family.templates[0]?.slug ?? "spinning-machine-v2";

  return (
    <div className="p-container-margin">
      <Reveal className="mb-4">
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
              href={`/discover/templates/${browse}`}
              className="sheen flex items-center gap-1.5 rounded bg-secondary px-4 py-1.5 font-label-caps text-on-secondary"
            >
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
              Browse templates
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-12 gap-4">
        <Reveal className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="lift rounded border border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="mb-3 flex items-center gap-2 font-headline text-lg font-semibold text-primary">
              <span className="material-symbols-outlined text-[18px] text-secondary">memory</span>
              Technical Specifications
            </h3>
            <ul className="font-data-mono space-y-2 text-xs">
              {Object.entries(family.specs).map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-surface-container pb-1.5">
                  <span className="text-outline">{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lift rounded border border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="mb-3 flex items-center gap-2 font-headline text-lg font-semibold text-primary">
              <span className="material-symbols-outlined text-[18px] text-error">warning</span>
              Key Challenges
            </h3>
            <div className="space-y-3">
              {family.challenges.map((c) => (
                <div
                  key={c.title}
                  className={
                    c.tone === "error"
                      ? "rounded border border-error-container bg-error-container/20 p-2"
                      : "rounded border border-outline-variant bg-surface-container-low p-2"
                  }
                >
                  <p className="mb-0.5 text-xs font-bold">{c.title}</p>
                  <p className="text-[11px] leading-tight text-on-surface-variant">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal
          delay={120}
          className="col-span-12 rounded border border-outline-variant bg-surface-container-lowest lg:col-span-8"
        >
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low/50 p-3">
            <h3 className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
              <span className="material-symbols-outlined text-[18px] text-secondary">view_list</span>
              Connected Assets in Family
            </h3>
            <span className="rounded bg-primary-container px-2 py-0.5 font-data-mono text-[10px] text-on-primary-container">
              Total: {family.assets.length}
            </span>
          </div>
          <div className="max-w-full overflow-x-auto">
          <table className="min-w-[620px] w-full text-left text-xs">
            <thead>
              <tr className="font-label-caps border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
                <th className="p-2 font-medium">Asset ID</th>
                <th className="p-2 font-medium">Location</th>
                <th className="p-2 font-medium">Status</th>
                <th className="p-2 font-medium">Health Score</th>
                <th className="p-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {family.assets.map((a, i) => (
                <tr
                  key={a.id}
                  className="anim-slide-in transition-colors hover:bg-surface-bright"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <td className="p-2 font-data-mono font-bold text-primary">{a.assetCode}</td>
                  <td className="p-2 text-on-surface-variant">{a.location}</td>
                  <td className="p-2">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="font-data-mono p-2">{a.healthScore}%</td>
                  <td className="p-2 text-right">
                    <Link href="/operate/assets">
                      <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Reveal>

        <div className="col-span-12 mt-2">
          <h3 className="mb-3 flex items-center gap-2 font-headline text-lg font-semibold text-primary">
            <span className="material-symbols-outlined text-[18px] text-secondary">schema</span>
            Diagnostic Diagrams &amp; Use Cases
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {family.useCases.map((u, i) => (
              <Reveal
                key={u.title}
                delay={i * 90}
                className="lift rounded border border-outline-variant bg-surface-container-lowest p-4"
              >
                <span className="material-symbols-outlined mb-2 text-2xl text-secondary">{u.icon}</span>
                <h4 className="mb-1 text-sm font-bold text-primary">{u.title}</h4>
                <p className="mb-3 text-xs leading-relaxed text-on-surface-variant">{u.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {u.tags.map((t) => (
                    <span key={t} className="font-data-mono rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[10px] text-outline">
                      {t}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
