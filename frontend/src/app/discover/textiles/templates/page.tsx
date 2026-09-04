"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { apiGet } from "@/lib/api";

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

export default function TemplateLibraryPage() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    apiGet<Template[]>("/api/templates").then(setTemplates).catch(() => setTemplates([]));
  }, []);

  return (
    <div className="space-y-5 p-5">
      <Reveal>
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Template Library</h1>
          <p className="mt-1 max-w-3xl text-on-surface-variant">
            Versioned reliability templates for textile assets. Each one ships signals, failure
            modes, and a dashboard preview, and can be deployed onto mill assets in four steps.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {templates.map((t, i) => {
          const assets = t.family.assets ?? [];
          const monitored = assets.filter((a) => a.monitored).length;
          const coverage = assets.length ? Math.round((monitored / assets.length) * 100) : 0;
          return (
            <Reveal key={t.id} delay={i * 90}>
              <div className="lift flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-label-caps text-secondary">{t.family.name}</p>
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
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-variant">
                    <div
                      className="bar-grow h-full bg-secondary"
                      style={{ width: `${coverage}%`, animationDelay: `${i * 120}ms` }}
                    />
                  </div>
                  <p className="font-data-mono mt-1 text-xs text-on-surface-variant">
                    {monitored}/{assets.length} assets monitored
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant pt-3 text-xs">
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Signals</p>
                    <p className="font-data-mono mt-1">{t.signals.length}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Failure modes</p>
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
    </div>
  );
}
