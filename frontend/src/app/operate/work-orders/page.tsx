"use client";

import Link from "next/link";
import { PriorityPill } from "@/components/StatusPill";
import { useMill } from "@/lib/use-mill";
import { MetricCard, PageHeader } from "@/components/DashboardUI";

type CaseRow = {
  id: string;
  caseCode: string;
  title: string;
  priority: string;
  status: string;
  assignee: string | null;
  workOrderRef: string | null;
  asset: { assetCode: string };
};

function tradeStatus(status: string) {
  if (status === "Resolved") return "Closed";
  if (status === "In-Progress") return "In field";
  return "Released";
}

export default function WorkOrdersPage() {
  const [rows] = useMill<CaseRow[]>("/api/cases");

  const orders = rows.filter((row) => row.workOrderRef);
  const open = orders.filter((row) => row.status !== "Resolved");
  const inField = orders.filter((row) => row.status === "In-Progress");

  return (
    <div className="w-full space-y-5 p-4 sm:p-5">
      <PageHeader
        title="Work Orders"
        eyebrow="Operate"
        description="Maintenance jobs released from reliability cases. A work order is the handoff from the case to the mill floor."
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard label="Released work orders" value={orders.length} icon="handyman" />
        <MetricCard label="In field" value={inField.length} icon="engineering" />
        <MetricCard label="Open" value={open.length} icon="pending_actions" tone="highlight" />
      </div>
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead className="font-label-caps bg-surface-container-high text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Work order</th>
                <th>Case</th>
                <th>Asset</th>
                <th>Priority</th>
                <th>Trade status</th>
                <th>Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => (
                <tr key={row.id} className="border-t border-outline-variant">
                  <td className="font-data-mono px-4 py-3 font-medium text-primary">{row.workOrderRef}</td>
                  <td>
                    <Link href="/operate/cases" className="font-medium text-secondary hover:underline">
                      {row.caseCode}
                    </Link>
                    <p className="text-xs text-on-surface-variant">{row.title}</p>
                  </td>
                  <td className="font-data-mono">{row.asset.assetCode}</td>
                  <td>
                    <PriorityPill priority={row.priority} />
                  </td>
                  <td>{tradeStatus(row.status)}</td>
                  <td>{row.assignee ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 ? (
          <p className="px-4 py-8 text-sm text-on-surface-variant">
            No work orders yet. Open a case and add a work-order reference to release it to the floor.
          </p>
        ) : null}
      </div>
    </div>
  );
}
