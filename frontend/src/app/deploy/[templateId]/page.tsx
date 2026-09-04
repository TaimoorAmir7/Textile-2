"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { SignalPreviewChart } from "@/components/AnalyticsCharts";

type Signal = { key: string; name: string; unit: string; defaultTag: string };
type Template = {
  id: string;
  name: string;
  slug: string;
  signals: Signal[];
  family: { slug: string; assets: { id: string; assetCode: string; name: string; location: string; monitored: boolean }[] };
};

const STEPS = ["Select assets", "Map signals", "Thresholds", "Preview & deploy"];

export default function DeployWizardPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [tags, setTags] = useState<Record<string, string>>({});
  const [thresholds, setThresholds] = useState({ vibration: 4.5, temperature: 80, quality: 96 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Template[]>("/api/templates").then((rows) => {
      const mapped = rows.map((t) => t as unknown as Template);
      setTemplates(mapped);
    });
  }, []);

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

  if (!tpl) {
    return <div className="p-6 text-sm text-on-surface-variant">Loading wizard…</div>;
  }

  const assets = tpl.family.assets ?? [];
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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 p-4 sm:p-5 md:flex-row">
      <ol className="flex w-full shrink-0 gap-2 overflow-x-auto pb-1 md:w-48 md:flex-col md:space-y-1 md:overflow-visible">
        {STEPS.map((label, i) => (
          <li key={label} className="flex min-w-fit items-center gap-2 text-sm">
            <span
              className={
                i < step
                  ? "flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary"
                  : i === step
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary"
                    : "flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant"
              }
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={i === step ? "font-semibold text-primary" : "text-on-surface-variant"}>
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:p-6">
        <h2 className="font-headline text-2xl font-bold text-primary">Deploy {tpl.name}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Step {step + 1} of {STEPS.length}</p>

        {step === 0 && (
          <div className="mt-6 space-y-2">
            {assets.map((a) => (
              <label key={a.id} className="flex flex-wrap items-center gap-3 rounded border border-outline-variant p-3">
                <input
                  type="checkbox"
                  checked={selected.includes(a.id)}
                  onChange={(e) =>
                    setSelected((prev) =>
                      e.target.checked ? [...prev, a.id] : prev.filter((id) => id !== a.id),
                    )
                  }
                />
                <span className="font-data-mono font-bold text-primary">{a.assetCode}</span>
                <span className="text-sm">{a.name}</span>
                <span className="text-xs text-on-surface-variant">{a.location}</span>
              </label>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-3">
            {tpl.signals.map((s) => (
              <label key={s.key} className="block">
                <span className="text-sm font-semibold">
                  {s.name} ({s.unit})
                </span>
                <input
                  className="mt-1 w-full rounded border border-outline-variant px-3 py-2 font-data-mono text-sm"
                  value={tags[s.key] ?? ""}
                  onChange={(e) => setTags((t) => ({ ...t, [s.key]: e.target.value }))}
                />
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Vibration alert (mm/s)</span>
              <input
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={thresholds.vibration}
                onChange={(e) => setThresholds((t) => ({ ...t, vibration: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="font-data-mono text-sm">{thresholds.vibration}</span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Temperature alert (°C)</span>
              <input
                type="number"
                value={thresholds.temperature}
                onChange={(e) => setThresholds((t) => ({ ...t, temperature: Number(e.target.value) }))}
                className="mt-1 w-full rounded border border-outline-variant px-3 py-2"
              />
            </label>
            <p className="text-sm text-on-surface-variant">
              Data quality check: <span className="font-data-mono font-bold text-secondary">{thresholds.quality}%</span>{" "}
              validated signal coverage
            </p>
            </div>
            <div className="min-w-0 rounded border border-outline-variant bg-surface-container-low p-3">
              <p className="font-label-caps mb-2 text-on-surface-variant">Threshold preview</p>
              <SignalPreviewChart signals={tpl.signals} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-3 text-sm">
            <p>
              <strong>{selected.length}</strong> assets will be monitored with {tpl.name}.
            </p>
            <p>Thresholds: vibration {thresholds.vibration} mm/s, temperature {thresholds.temperature} °C.</p>
            <p>Mapped tags: {Object.values(tags).join(", ")}</p>
          </div>
        )}

        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="rounded border border-outline-variant px-4 py-2 text-sm disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="rounded bg-primary px-4 py-2 text-sm text-on-primary disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || selected.length === 0}
              onClick={deploy}
              className="rounded bg-secondary px-4 py-2 text-sm text-on-secondary disabled:opacity-40"
            >
              {busy ? "Deploying…" : "Deploy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
