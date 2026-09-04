"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const LAYERS = [
  {
    title: "Mill Machinery",
    icon: "precision_manufacturing",
    items: ["Ring spinning frames", "Air-jet looms", "Jet dyeing machines"],
    note: "Vibration, temperature, current, tension, and pressure sensors on rotating and thermal equipment.",
  },
  {
    title: "Edge Infrastructure",
    icon: "router",
    items: ["Edge gateways", "Local buffering", "Protocol adapters"],
    note: "Shop-floor collection at 1–100 Hz with store-and-forward when the link to the plant network drops.",
  },
  {
    title: "Unified Data Model",
    icon: "database",
    items: ["Plants & assets", "Asset families", "Signal mappings"],
    note: "Template signals map to mill tags so one template serves every frame, loom, and vat of that type.",
  },
  {
    title: "Analytics & Templates",
    icon: "model_training",
    items: ["Envelope analysis", "Thermal envelopes", "Failure-mode library"],
    note: "Deployed templates score each asset and raise watch or critical alerts with confidence per failure mode.",
  },
  {
    title: "Reliability Workspace",
    icon: "dashboard",
    items: ["Operate dashboard", "Alert investigation", "Cases & work orders"],
    note: "Engineers acknowledge alerts, open cases, and hand off work orders to maintenance.",
  },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-6 p-5">
      <Reveal>
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Reference Architecture</h1>
          <p className="mt-1 max-w-3xl text-on-surface-variant">
            How mill telemetry becomes a reliability decision: sensors on textile machinery flow
            through edge collection into a unified asset model, get scored by deployed templates,
            and surface as alerts, cases, and work orders.
          </p>
        </div>
      </Reveal>

      <div className="space-y-3">
        {LAYERS.map((layer, i) => (
          <Reveal key={layer.title} delay={i * 90}>
            <div className="relative">
              <div className="lift flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 md:flex-row md:items-center">
                <div className="flex items-center gap-3 md:w-64">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">{layer.icon}</span>
                  </span>
                  <div>
                    <p className="font-label-caps text-on-surface-variant">Layer {i + 1}</p>
                    <h2 className="font-headline text-lg font-semibold text-primary">
                      {layer.title}
                    </h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:w-80">
                  {layer.items.map((item) => (
                    <span
                      key={item}
                      className="font-data-mono rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-[11px] text-on-surface-variant"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="flex-1 text-sm text-on-surface-variant">{layer.note}</p>
              </div>
              {i < LAYERS.length - 1 ? (
                <svg className="mx-auto h-6 w-6" viewBox="0 0 10 24" aria-hidden>
                  <path
                    d="M5,0 L5,22"
                    className="flow-line stroke-secondary"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="flex flex-wrap gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-5">
          <div className="flex-1">
            <h2 className="font-headline text-lg font-semibold text-primary">
              Ready to connect a mill asset?
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Pick a template, map its signals to your tags, and the asset starts reporting into
              Operate immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/discover/textiles/templates"
              className="sheen rounded bg-secondary px-4 py-2 font-label-caps text-on-secondary"
            >
              Template library
            </Link>
            <Link
              href="/operate"
              className="rounded border border-outline-variant px-4 py-2 font-label-caps text-primary hover:border-primary"
            >
              Operate
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
