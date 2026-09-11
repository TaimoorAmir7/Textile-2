"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { KpiLineChart } from "@/components/AnalyticsCharts";
import { apiSend } from "@/lib/api";
import { useMill } from "@/lib/use-mill";
import { useChartTheme } from "@/lib/chart-theme";
import { setHeaderCrumbsOverride } from "@/lib/header-path";

type Signal = { key: string; name: string; unit: string; defaultTag: string };
type Template = {
  id: string;
  name: string;
  slug: string;
  version?: string;
  overview?: string;
  signals: Signal[];
  family: {
    name?: string;
    slug: string;
    assets: { id: string; assetCode: string; name: string; location: string; monitored: boolean }[];
  };
};

const STEPS = [
  { label: "Select stages", detail: "Choose family stages" },
  { label: "Map checks", detail: "Bind quality fields" },
  { label: "Thresholds", detail: "Set quality limits" },
  { label: "Preview & deploy", detail: "Confirm and go live" },
];

export default function DeployWizardPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();
  const theme = useChartTheme();
  const [step, setStep] = useState(0);
  const [templates] = useMill<Template[]>("/api/templates");
  const [selected, setSelected] = useState<string[]>([]);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [thresholds, setThresholds] = useState({ qualityScore: 75, processCompliance: 80, dataQuality: 96 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const tpl = useMemo(
    () => templates.find((t) => t.id === templateId) ?? templates.find((t) => t.slug === templateId),
    [templates, templateId],
  );

  useEffect(() => {
    if (!tpl) return;
    const next: Record<string, string> = {};
    tpl.signals.forEach((s) => {
      next[s.key] = s.defaultTag;
    });
    setTags(next);
  }, [tpl]);

  useEffect(() => {
    if (!tpl) return;
    setHeaderCrumbsOverride([
      { label: "Deploy", href: "/deploy" },
      { label: tpl.name },
      { label: `Step ${step + 1}` },
    ]);
    return () => setHeaderCrumbsOverride(null);
  }, [tpl, step]);

  if (!tpl) {
    return <div className="p-4 text-sm text-on-surface-variant">Loading wizard…</div>;
  }

  const assets = tpl.family.assets ?? [];
  const monitored = assets.filter((asset) => asset.monitored).length;
  const coverage = Math.round((selected.length / Math.max(assets.length, 1)) * 100);
  const canContinue =
    (step !== 0 || selected.length > 0) &&
    (step !== 1 || Object.values(tags).every((tag) => tag.trim().length > 0));

  async function deploy() {
    setBusy(true);
    setError("");
    try {
      const current = tpl;
      if (!current) return;
      const mappings = selected.flatMap((assetId) =>
        Object.entries(tags).map(([signalKey, tagName]) => ({ assetId, signalKey, tagName })),
      );
      await apiSend("/api/deployments", "POST", {
        templateId: current.id,
        assetIds: selected,
        mappings,
        parameters: thresholds,
      });
      router.push("/operate");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setBusy(false);
    }
  }

  function toggleAll(on: boolean) {
    setSelected(on ? assets.map((asset) => asset.id) : []);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-3 md:flex">
        <p className="font-label-caps text-on-surface-variant">Deployment</p>
        <h1 className="font-headline mt-1 truncate text-base font-semibold text-primary">{tpl.name}</h1>
        <p className="truncate text-xs text-on-surface-variant">{tpl.family.name ?? "Textile family"}</p>
        <ol className="mt-4 space-y-3">
          {STEPS.map((item, i) => (
            <li key={item.label} className="flex items-start gap-2.5">
              <span
                className={
                  i < step
                    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs text-on-secondary"
                    : i === step
                      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs text-on-primary"
                      : "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-xs text-on-surface-variant"
                }
              >
                {i < step ? "✓" : i + 1}
              </span>
              <div className="min-w-0">
                <p className={`truncate text-sm ${i === step ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
                  {item.label}
                </p>
                <p className="truncate text-[11px] text-on-surface-variant">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>

      <section className="flex min-w-0 flex-col rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-outline-variant px-4 py-2.5">
          <div className="min-w-0">
            <h2 className="font-headline truncate text-lg font-bold text-primary">Deploy {tpl.name}</h2>
            <p className="text-xs text-on-surface-variant">
              Step {step + 1} of {STEPS.length} · {STEPS[step].label}
            </p>
          </div>
          <span className="font-data-mono shrink-0 rounded bg-surface-container px-2 py-0.5 text-[10px]">
            v{tpl.version ?? "2.4.0"}
          </span>
        </div>

        <div className="grid grid-cols-1 items-start gap-3 p-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.8fr)]">
          <div className="min-w-0">
            {step === 0 && (
              <>
                <div className="mb-2 flex shrink-0 items-center justify-between">
                  <p className="text-xs text-on-surface-variant">
                    {selected.length} of {assets.length} stages selected
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleAll(selected.length !== assets.length)}
                    className="font-label-caps text-secondary hover:underline"
                  >
                    {selected.length === assets.length ? "Clear all" : "Select all"}
                  </button>
                </div>
                <div className="space-y-3">
                  {assets.map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-2.5 rounded-lg border border-outline-variant px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(a.id)}
                        onChange={(e) =>
                          setSelected((prev) =>
                            e.target.checked ? [...prev, a.id] : prev.filter((id) => id !== a.id),
                          )
                        }
                      />
                      <span className="font-data-mono text-sm font-bold text-primary">{a.assetCode}</span>
                      <span className="min-w-0 truncate text-sm">{a.name}</span>
                      <span className="ml-auto hidden truncate text-xs text-on-surface-variant xl:inline">{a.location}</span>
                      {a.monitored ? (
                        <span className="font-label-caps shrink-0 rounded bg-secondary/15 px-1.5 py-0.5 text-secondary">Live</span>
                      ) : (
                        <span className="font-label-caps shrink-0 rounded bg-surface-container px-1.5 py-0.5 text-on-surface-variant">
                          Ready
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <div className="space-y-2">
                {tpl.signals.map((s) => (
                  <label key={s.key} className="block rounded-lg border border-outline-variant px-3 py-2">
                    <span className="text-sm font-semibold">
                      {s.name} ({s.unit})
                    </span>
                    <input
                      className="mt-1.5 w-full rounded border border-outline-variant px-3 py-1.5 font-data-mono text-sm"
                      value={tags[s.key] ?? ""}
                      onChange={(e) => setTags((t) => ({ ...t, [s.key]: e.target.value }))}
                    />
                  </label>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="block rounded-lg border border-outline-variant px-3 py-2">
                  <span className="text-sm font-semibold">Quality score alert threshold</span>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={1}
                    value={thresholds.qualityScore}
                    onChange={(e) => setThresholds((t) => ({ ...t, qualityScore: Number(e.target.value) }))}
                    className="mt-2 w-full"
                  />
                  <span className="font-data-mono text-sm">{thresholds.qualityScore}%</span>
                </label>
                <label className="block rounded-lg border border-outline-variant px-3 py-2">
                  <span className="text-sm font-semibold">Process compliance threshold (%)</span>
                  <input
                    type="number"
                    value={thresholds.processCompliance}
                    onChange={(e) => setThresholds((t) => ({ ...t, processCompliance: Number(e.target.value) }))}
                    className="mt-1.5 w-full rounded border border-outline-variant px-3 py-1.5"
                  />
                </label>
                <p className="text-xs text-on-surface-variant">
                  Data quality: <span className="font-data-mono font-bold text-secondary">{thresholds.dataQuality}%</span>
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-outline-variant p-3">
                  <p className="font-label-caps text-on-surface-variant">Stages</p>
                  <p className="font-headline mt-1 text-2xl font-bold text-primary">{selected.length}</p>
                </div>
                <div className="rounded-lg border border-outline-variant p-3">
                  <p className="font-label-caps text-on-surface-variant">Quality checks</p>
                  <p className="font-headline mt-1 text-2xl font-bold text-primary">{tpl.signals.length}</p>
                </div>
                <div className="rounded-lg border border-outline-variant p-3 sm:col-span-2">
                  <p className="font-label-caps text-on-surface-variant">Thresholds</p>
                  <p className="mt-1 text-sm">
                    Quality score {thresholds.qualityScore}% · Process compliance {thresholds.processCompliance}% · Data quality {thresholds.dataQuality}%
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden flex-col rounded-lg border border-outline-variant bg-surface-container-low p-3 lg:flex">
            <p className="font-label-caps text-on-surface-variant">Template coverage</p>
            <p className="font-headline mt-1 text-2xl font-bold text-primary">{coverage}%</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {selected.length} selected · {monitored} already live
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-md bg-surface-container-high">
              <div className="h-full bg-secondary" style={{ width: `${coverage}%` }} />
            </div>
            <div className="mt-3">
              <p className="font-label-caps mb-1 text-on-surface-variant">Selection trend</p>
              <KpiLineChart
                points={[monitored, Math.max(monitored, 1), selected.length || monitored, selected.length || 1]}
                labels={["Live", "Ready", "Picked", "Now"]}
                color={theme.primary}
                name="Stages"
                height={72}
              />
            </div>
          </aside>
        </div>

        {error ? <p className="shrink-0 px-4 text-xs text-error">{error}</p> : null}

        <div className="flex shrink-0 justify-between border-t border-outline-variant px-4 py-2.5">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="rounded border border-outline-variant px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="rounded bg-primary px-3 py-1.5 text-sm text-on-primary disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || selected.length === 0}
              onClick={deploy}
              className="rounded bg-secondary px-3 py-1.5 text-sm text-on-secondary disabled:opacity-40"
            >
              {busy ? "Deploying…" : "Deploy"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
