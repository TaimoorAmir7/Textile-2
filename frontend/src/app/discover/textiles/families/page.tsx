"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { apiGet } from "@/lib/api";
import { AnalyticsData, HorizontalRiskChart } from "@/components/AnalyticsCharts";
import { ChartCard } from "@/components/DashboardUI";

type Family = {
  slug: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  challenges: { title: string; body: string; tone: string }[];
  templates: { slug: string; name: string }[];
  _count: { assets: number; templates: number };
};

export default function FamiliesIndexPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    apiGet<Family[]>("/api/families").then(setFamilies).catch(() => setFamilies([]));
    apiGet<AnalyticsData>("/api/analytics").then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  return (
    <div className="space-y-5 p-5">
      <Reveal>
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Textile Asset Families</h1>
          <p className="mt-1 max-w-3xl text-on-surface-variant">
            Spinning, weaving, and dyeing equipment groups. Each family carries its own
            specifications, known failure challenges, and reliability templates.
          </p>
        </div>
      </Reveal>

      {analytics ? (
        <ChartCard title="Family risk comparison" description="Predictive alerts requiring attention by production process">
          <HorizontalRiskChart data={analytics.familyRisk} height={190} />
        </ChartCard>
      ) : null}

      <div className="space-y-4">
        {families.map((f, i) => (
          <Reveal key={f.slug} delay={i * 90}>
            <div className="lift rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-headline text-xl font-semibold text-primary">{f.name}</h2>
                  <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">{f.description}</p>
                </div>
                <Link
                  href={`/discover/textiles/families/${f.slug}`}
                  className="shrink-0 rounded bg-secondary px-4 py-1.5 font-label-caps text-on-secondary"
                >
                  Open family
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded border border-outline-variant bg-surface-container-low p-3">
                  <p className="font-label-caps mb-2 text-on-surface-variant">Specifications</p>
                  <ul className="font-data-mono space-y-1 text-xs">
                    {Object.entries(f.specs)
                      .slice(0, 3)
                      .map(([k, v]) => (
                        <li key={k} className="flex justify-between gap-3">
                          <span className="text-outline">{k}</span>
                          <span className="text-right">{v}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="rounded border border-outline-variant bg-surface-container-low p-3">
                  <p className="font-label-caps mb-2 text-on-surface-variant">Key challenges</p>
                  <ul className="space-y-1 text-xs text-on-surface-variant">
                    {f.challenges.map((c) => (
                      <li key={c.title} className="flex items-start gap-1.5">
                        <span
                          className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                            c.tone === "error" ? "bg-error" : "bg-warning"
                          }`}
                        />
                        <span>
                          <span className="font-semibold text-on-surface">{c.title}</span> — {c.body}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded border border-outline-variant bg-surface-container-low p-3">
                  <p className="font-label-caps mb-2 text-on-surface-variant">Coverage</p>
                  <p className="font-headline text-2xl font-bold text-primary">
                    {f._count.assets}
                    <span className="ml-1 text-sm font-normal text-on-surface-variant">assets</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {f.templates.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/discover/templates/${t.slug}`}
                        className="font-data-mono rounded border border-outline-variant bg-surface-container-lowest px-1.5 py-0.5 text-[10px] text-secondary hover:border-secondary"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
