"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PriorityPill } from "@/components/StatusPill";
import { apiSend } from "@/lib/api";
import { useMill } from "@/lib/use-mill";
import { AnalyticsData, DonutChart, TrendChart } from "@/components/AnalyticsCharts";
import { ChartCard } from "@/components/DashboardUI";

type CaseRow = {
  id: string;
  caseCode: string;
  title: string;
  priority: string;
  status: string;
  assignee: string | null;
  workOrderRef: string | null;
  alerts: unknown[];
  asset: { id: string; assetCode: string };
};

function CasesInner() {
  const params = useSearchParams();
  const router = useRouter();
  const showNew = params.get("new") === "1";
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [openForm, setOpenForm] = useState(showNew);
  const [form, setForm] = useState({ title: "", assetId: "", priority: "High", assignee: "", workOrderRef: "" });
  const [toast, setToast] = useState<CaseRow | null>(null);
  const [releasing, setReleasing] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const qs = new URLSearchParams();
  if (status !== "all") qs.set("status", status);
  if (priority !== "all") qs.set("priority", priority);
  const [rows, reload] = useMill<CaseRow[]>(`/api/cases?${qs.toString()}`);
  const [assets] = useMill<{ id: string; assetCode: string; name: string }[]>("/api/assets");
  const [analytics] = useMill<AnalyticsData>("/api/analytics?days=30");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 14000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function createCase(e: React.FormEvent) {
    e.preventDefault();
    await apiSend("/api/cases", "POST", form);
    setOpenForm(false);
    setForm({ title: "", assetId: "", priority: "High", assignee: "", workOrderRef: "" });
    reload();
  }

  async function closeCase(row: CaseRow) {
    await apiSend(`/api/cases/${row.id}`, "PATCH", { status: "Resolved" });
    setToast(row);
    reload();
  }

  async function startWorkOrder() {
    if (!toast) return;
    setReleasing(true);
    try {
      const ref = toast.workOrderRef ?? `WO-${44000 + Math.floor(Math.random() * 900)}`;
      if (!toast.workOrderRef) {
        await apiSend(`/api/cases/${toast.id}`, "PATCH", { workOrderRef: ref });
      }
      setToast(null);
      router.push("/operate/work-orders");
    } finally {
      setReleasing(false);
    }
  }

  const open = rows.filter((r) => r.status !== "Resolved").length;
  const critical = rows.filter((r) => r.priority === "Critical" && r.status !== "Resolved").length;

  function exportCsv() {
    const header = "Case ID,Title,Priority,Status,Assignee,Work Order\n";
    const body = rows
      .map(
        (r) =>
          `${r.caseCode},"${r.title}",${r.priority},${r.status},${r.assignee ?? ""},${r.workOrderRef ?? ""}`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cases.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex w-full flex-col gap-6 px-5 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline text-3xl font-bold">Quality Case Management</h2>
          <p className="text-sm text-on-surface-variant">
            Track, investigate, contain, and resolve production-quality cases.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpenForm((open) => {
              const next = !open;
              if (next) {
                window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              }
              return next;
            });
          }}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-on-primary"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {openForm ? "Close form" : "New Case"}
        </button>
      </div>

      {openForm ? (
        <form
          ref={formRef}
          onSubmit={createCase}
          className="grid grid-cols-1 gap-3 rounded border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-2"
        >
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded border border-outline-variant px-3 py-2 text-sm"
          />
          <select
            required
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            className="rounded border border-outline-variant px-3 py-2 text-sm"
          >
            <option value="">Select production stage</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.assetCode} — {a.name}
              </option>
            ))}
          </select>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="rounded border border-outline-variant px-3 py-2 text-sm"
          >
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <input
            placeholder="Assignee"
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            className="rounded border border-outline-variant px-3 py-2 text-sm"
          />
          <input
            placeholder="Work order ref"
            value={form.workOrderRef}
            onChange={(e) => setForm({ ...form, workOrderRef: e.target.value })}
            className="rounded border border-outline-variant px-3 py-2 text-sm md:col-span-2"
          />
          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-on-primary">
              Save case
            </button>
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="rounded border border-outline-variant px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {analytics ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Case pipeline" description="Quality containment workflow status">
            <DonutChart data={analytics.caseStatus} height={220} centerLabel="Cases" />
          </ChartCard>
          <ChartCard title="Priority mix" description="Current production-quality exposure">
            <DonutChart data={analytics.casePriority} height={220} centerLabel="Cases" />
          </ChartCard>
          <ChartCard title="Resolution pressure" description="Quality-event volume associated with production stages">
            <TrendChart data={analytics.series} height={220} showHealth={false} />
          </ChartCard>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
          <span className="font-label-caps text-on-surface-variant">Total Open Cases</span>
          <p className="font-headline mt-4 text-3xl">{open}</p>
        </div>
        <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
          <span className="font-label-caps text-on-surface-variant">Avg Time to Resolution</span>
          <p className="font-headline mt-4 text-3xl">
            3.2 <span className="text-base font-normal text-on-surface-variant">days</span>
          </p>
        </div>
        <div className="rounded border border-outline-variant bg-surface-container-lowest p-4">
          <span className="font-label-caps text-on-surface-variant">Critical Priority</span>
          <p className="font-headline mt-4 text-3xl text-error">{critical}</p>
        </div>
      </div>

      <div className="rounded border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-bright p-4">
          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border border-outline-variant px-3 py-1.5 text-sm"
            >
              <option value="all">Status: All Open</option>
              <option value="Open">Open</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded border border-outline-variant px-3 py-1.5 text-sm"
            >
              <option value="all">Priority: All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <button type="button" onClick={exportCsv} className="rounded border border-outline-variant p-1.5" title="Export">
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
        </div>
        <div className="max-w-full overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead>
            <tr className="font-label-caps border-b border-outline-variant bg-surface-container-high text-on-surface-variant">
              <th className="px-4 py-3">Case ID</th>
              <th>Title &amp; Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Work Order</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-outline-variant hover:bg-surface-bright">
                <td className="font-data-mono px-4 py-2 text-primary">{c.caseCode}</td>
                <td className="py-2">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-on-surface-variant">{c.alerts.length} Linked Alerts · {c.asset.assetCode}</div>
                </td>
                <td>
                  <PriorityPill priority={c.priority} />
                </td>
                <td>{c.status}</td>
                <td>{c.assignee ?? "Unassigned"}</td>
                <td className="font-data-mono text-xs">{c.workOrderRef ?? "—"}</td>
                <td className="px-4 text-right">
                  {c.status !== "Resolved" ? (
                    <button type="button" onClick={() => closeCase(c)} className="text-xs text-secondary hover:underline">
                      Resolve
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {toast ? (
        <div className="fixed right-4 bottom-4 z-50 w-[min(100%-2rem,360px)] rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-label-caps text-secondary">Case resolved</p>
              <p className="mt-1 text-sm font-medium">{toast.caseCode}</p>
              <p className="text-xs text-on-surface-variant">{toast.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded p-1 text-on-surface-variant hover:bg-surface-container"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">
            {toast.workOrderRef
              ? `Work order ${toast.workOrderRef} is already on this case.`
              : "Release a work order so the mill floor can pick up the job."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startWorkOrder}
              disabled={releasing}
              className="rounded bg-primary px-3 py-1.5 text-sm text-on-primary disabled:opacity-50"
            >
              {releasing ? "Starting…" : toast.workOrderRef ? "Open work order" : "Start work order"}
            </button>
            <Link href="/operate/work-orders" className="rounded border border-outline-variant px-3 py-1.5 text-sm">
              Work orders
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading cases…</div>}>
      <CasesInner />
    </Suspense>
  );
}
