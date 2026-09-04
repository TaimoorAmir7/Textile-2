import { PageHeader } from "@/components/DashboardUI";

const INTEGRATIONS = [
  { icon: "database", title: "Textile historian", detail: "OPC UA and time-series ingestion", status: "Demo connected" },
  { icon: "assignment", title: "CMMS work orders", detail: "Maintenance handoff and status sync", status: "Presentation mode" },
  { icon: "shield_person", title: "Identity & access", detail: "SSO, roles, and plant permissions", status: "Planned" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <PageHeader title="Client Configuration" eyebrow="Administration" description="Integration readiness and presentation environment status for the textile reliability workspace." />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {INTEGRATIONS.map((item) => (
          <article key={item.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <span className="material-symbols-outlined rounded bg-surface-container p-2 text-secondary">{item.icon}</span>
            <h2 className="font-headline mt-4 text-lg font-semibold text-primary">{item.title}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{item.detail}</p>
            <div className="mt-5 border-t border-outline-variant pt-3">
              <span className="font-label-caps rounded bg-surface-container px-2 py-1 text-on-surface-variant">{item.status}</span>
            </div>
          </article>
        ))}
      </section>
      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="font-headline text-lg font-semibold text-primary">Demo environment</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <Config label="Industry scope" value="Textiles & Apparel" />
          <Config label="Primary facility" value="Faisalabad Mill" />
          <Config label="Data mode" value="Deterministic mock telemetry" />
        </div>
      </section>
    </div>
  );
}

function Config({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-outline-variant bg-surface-container-low p-3"><p className="font-label-caps text-on-surface-variant">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}
