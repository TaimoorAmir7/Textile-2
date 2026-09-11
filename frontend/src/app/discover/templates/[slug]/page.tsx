"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useMillOrNull } from "@/lib/use-mill";
import { recordVisit } from "@/lib/session-history";
import { SignalPreviewChart } from "@/components/AnalyticsCharts";

type Signal = { key: string; name: string; unit: string; defaultTag: string };
type Mode = { name: string; description: string };
type Template = {
  id: string;
  slug: string;
  name: string;
  version: string;
  overview: string;
  signals: Signal[];
  failureModes: Mode[];
  family: { name: string; slug: string };
};

export default function TemplatePage() {
  const { slug } = useParams<{ slug: string }>();
  const [tpl] = useMillOrNull<Template>(`/api/templates/${slug}`);

  useEffect(() => {
    if (!tpl) return;
    recordVisit({
      href: `/discover/templates/${tpl.slug}`,
      title: tpl.name,
      sub: tpl.family.name,
      icon: "inventory_2",
    });
  }, [tpl]);

  if (!tpl) return <div className="p-6 text-sm text-on-surface-variant">Loading template…</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-3xl font-bold text-primary">{tpl.name}</h2>
          <p className="mt-1 max-w-3xl text-on-surface-variant">{tpl.overview}</p>
          <p className="font-data-mono mt-2 text-xs text-outline">Version {tpl.version}</p>
        </div>
        <Link
          href={`/deploy/${tpl.id}`}
          className="rounded bg-secondary px-4 py-2 font-label-caps text-on-secondary"
        >
          Deploy this template
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="mb-3 font-headline text-lg font-semibold text-primary">Quality checks &amp; data</h3>
          <div className="max-w-full overflow-x-auto">
          <table className="min-w-[460px] w-full text-left text-sm">
            <thead>
              <tr className="font-label-caps text-on-surface-variant">
                <th className="py-2">Signal</th>
                <th>Unit</th>
                <th>Default tag</th>
              </tr>
            </thead>
            <tbody>
              {tpl.signals.map((s) => (
                <tr key={s.key} className="border-t border-outline-variant">
                  <td className="py-2">{s.name}</td>
                  <td className="font-data-mono">{s.unit}</td>
                  <td className="font-data-mono text-xs">{s.defaultTag}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="mb-3 font-headline text-lg font-semibold text-primary">Production defect risks</h3>
          <ul className="space-y-3">
            {tpl.failureModes.map((m) => (
              <li key={m.name} className="rounded border border-outline-variant p-3">
                <p className="text-sm font-semibold text-primary">{m.name}</p>
                <p className="text-xs text-on-surface-variant">{m.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
        <h3 className="mb-3 font-headline text-lg font-semibold text-primary">Dashboard preview</h3>
        <p className="mb-3 text-sm text-on-surface-variant">
          Representative 24-hour signal behavior for {tpl.family.name}. The production view uses
          mapped mill telemetry after deployment.
        </p>
        <SignalPreviewChart signals={tpl.signals} />
      </div>
    </div>
  );
}
