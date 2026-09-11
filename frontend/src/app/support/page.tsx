import Link from "next/link";
import { PageHeader } from "@/components/DashboardUI";

export default function SupportPage() {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      <PageHeader title="Production Reliability Support" eyebrow="Help center" description="Guided pathways for stage quality, templates, alerts, and investigation workflows." />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SupportCard icon="menu_book" title="Platform walkthrough" detail="Follow the production-quality lifecycle from industry discovery to optimization." href="/discover/textiles" action="Start walkthrough" />
        <SupportCard icon="warning" title="Investigate an alert" detail="Open the live queue, review stage evidence and causality, acknowledge risk, and create a quality case." href="/operate/alerts" action="Open alert center" />
        <SupportCard icon="assignment" title="Quality case queue" detail="Track owners, priorities, linked defects, corrective actions, and disposition." href="/operate/cases" action="View cases" />
      </section>
      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="font-headline text-lg font-semibold text-primary">Presentation support</h2>
        <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">External ticketing and live chat are intentionally not connected in this demonstration. All operational actions available in Discover, Deploy, Operate, and Optimize use the working demo APIs.</p>
      </section>
    </div>
  );
}

function SupportCard({ icon, title, detail, href, action }: { icon: string; title: string; detail: string; href: string; action: string }) {
  return (
    <article className="flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      <span className="material-symbols-outlined w-fit rounded bg-secondary-container p-2 text-on-secondary-container">{icon}</span>
      <h2 className="font-headline mt-4 text-lg font-semibold text-primary">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-on-surface-variant">{detail}</p>
      <Link href={href} className="font-label-caps mt-5 border-t border-outline-variant pt-3 text-secondary hover:underline">{action} →</Link>
    </article>
  );
}
