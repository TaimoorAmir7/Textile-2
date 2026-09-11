"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const LAYERS = [
  {
    title: "Greige",
    icon: "texture",
    items: ["Incoming fabric", "Construction", "GSM / width"],
    note: "Raw Woven or Knit fabric is identified and inspected before wet processing.",
  },
  {
    title: "Pre-treatment",
    icon: "water_drop",
    items: ["Desizing", "Scouring", "Bleaching"],
    note: "Absorbency, whiteness and final pH are controlled so later dye uptake remains uniform.",
  },
  {
    title: "Dyeing",
    icon: "palette",
    items: ["Target shade", "Uniformity", "Fixation"],
    note: "The batch is coloured and checked for shade variation, barré, crease marks and fixation.",
  },
  {
    title: "Printing",
    icon: "format_paint",
    items: ["Registration", "Repeat", "Colour yield"],
    note: "Pattern alignment, print sharpness and colour bleed are checked against the approved design.",
  },
  {
    title: "Finishing",
    icon: "auto_fix_high",
    items: ["Shrinkage", "Width / GSM", "Bow / spirality"],
    note: "Fabric is stabilised to its final width, handle and dimensional specification.",
  },
  {
    title: "Folding / Rolling",
    icon: "inventory_2",
    items: ["Final inspection", "Quantity", "Lot label"],
    note: "Finished fabric is measured in its family unit, verified, labelled and released.",
  },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-6 p-5">
      <Reveal>
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary">Production Flow</h1>
          <p className="mt-1 max-w-3xl text-on-surface-variant">
            The shared six-stage fabrication route for Woven and Knit / Hosiery. Every stage feeds
            the existing dashboards and alerts while retaining family-specific quality checks.
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
                    <p className="font-label-caps text-on-surface-variant">Stage {i + 1}</p>
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
              Ready to inspect a production family?
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Open Woven or Knit, select one of its six stages, and review the stage image,
              checklist and fabric risks. Production alerts remain in Operate.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/discover/textiles/templates"
              className="sheen rounded bg-secondary px-4 py-2 font-label-caps text-on-secondary"
            >
              Stage templates
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
