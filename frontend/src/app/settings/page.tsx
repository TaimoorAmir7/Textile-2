"use client";

import Link from "next/link";
import { PageHeader } from "@/components/DashboardUI";

const PROFILE = {
  name: "John Smith",
  initials: "JS",
  role: "Plant Manager",
  plant: "Faisalabad Mill",
  email: "john.smith@sparktech.example",
  phone: "+92 41 555 2040",
  shift: "Days · 06:00–18:00 PKT",
  lastActive: "Online now",
};

const RESPONSIBILITIES = [
  { label: "Woven Production", detail: "Six-stage route · measured in meters", href: "/discover/textiles/families/woven" },
  { label: "Knit / Hosiery Production", detail: "Six-stage route · measured in kilograms", href: "/discover/textiles/families/knit" },
  { label: "Quality Release", detail: "Cross-stage defects, causality, and disposition", href: "/operate/alerts" },
];

const PREFERENCES = [
  { label: "Alert notifications", value: "Critical and watch" },
  { label: "Default landing page", value: "Operate command center" },
  { label: "Assigned cases", value: "Auto-assign major quality alerts" },
  { label: "Language", value: "English" },
];

export default function SettingsPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <PageHeader
        title="User profile"
        eyebrow="Account"
        description="Signed-in plant manager for the Faisalabad textile reliability workspace."
      />

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-on-primary">
            {PROFILE.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-headline text-2xl font-bold text-primary">{PROFILE.name}</h2>
              <span className="font-label-caps rounded bg-secondary-container px-2 py-0.5 text-on-secondary-container">
                {PROFILE.lastActive}
              </span>
            </div>
            <p className="mt-1 text-on-surface-variant">
              {PROFILE.role} · {PROFILE.plant}
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">{PROFILE.shift}</p>
          </div>
          <Link
            href="/operate"
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-on-primary"
          >
            Open operations
          </Link>
        </div>
        <dl className="grid grid-cols-1 gap-px border-t border-outline-variant bg-outline-variant sm:grid-cols-3">
          <Field label="Email" value={PROFILE.email} />
          <Field label="Phone" value={PROFILE.phone} />
          <Field label="Primary facility" value={PROFILE.plant} />
        </dl>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h3 className="font-headline text-lg font-semibold text-primary">Assigned areas</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Production-quality ownership across the mill. Opening an area takes you to its live route.
          </p>
          <ul className="mt-4 space-y-3">
            {RESPONSIBILITIES.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded border border-outline-variant bg-surface-container-low px-3 py-3 hover:border-secondary"
                >
                  <span>
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-sm text-on-surface-variant">{item.detail}</span>
                  </span>
                  <span className="material-symbols-outlined text-secondary">chevron_right</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <h3 className="font-headline text-lg font-semibold text-primary">Workspace preferences</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            How this profile receives alerts and where the workspace opens.
          </p>
          <dl className="mt-4 space-y-3">
            {PREFERENCES.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 rounded bg-surface-container-low px-3 py-3">
                <dt className="font-label-caps text-on-surface-variant">{item.label}</dt>
                <dd className="text-right text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-lowest px-5 py-4">
      <dt className="font-label-caps text-on-surface-variant">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
