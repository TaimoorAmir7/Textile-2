import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureSeeded();
  const [plants, assets, alerts, cases] = await Promise.all([
    prisma.plant.findMany({ orderBy: { name: "asc" } }),
    prisma.asset.findMany({ include: { family: true } }),
    prisma.alert.findMany({
      include: { asset: { include: { plant: true } } },
      orderBy: { detectedAt: "desc" },
    }),
    prisma.case.findMany(),
  ]);
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "new").length;
  const openCases = cases.filter((c) => c.status !== "Resolved").length;
  const avgHealth = Math.round(assets.reduce((s, a) => s + a.healthScore, 0) / Math.max(assets.length, 1));

  // An unplanned stop costs the full downtime window; catching the same failure
  // early turns it into a scheduled repair during a planned stop, which costs a
  // fraction of that. Hours per failure matches the model used by /api/optimize.
  const HOURS_PER_FAILURE = 2.5;
  const PLANNED_REPAIR_SHARE = 0.3;
  const riskAlerts = alerts.filter((a) => a.severity !== "NOMINAL");
  const caughtEarly = riskAlerts.filter((a) => a.asset.monitored).length;
  const missed = riskAlerts.filter((a) => !a.asset.monitored).length;
  const potentialHrs = (caughtEarly + missed) * HOURS_PER_FAILURE;
  const actualHrs = caughtEarly * HOURS_PER_FAILURE * PLANNED_REPAIR_SHARE + missed * HOURS_PER_FAILURE;
  const avoidedHrs = potentialHrs - actualHrs;

  return NextResponse.json({
    plants,
    kpis: {
      activeAlerts: alerts.filter((a) => a.status !== "snoozed").length,
      criticalAlerts,
      openCases,
      closedCases: cases.filter((c) => c.status === "Resolved").length,
      avgHealth,
      avoidedDowntimePct: potentialHrs ? Math.round((avoidedHrs / potentialHrs) * 100) : 0,
      avoidedDowntimeHrs: Math.round(avoidedHrs * 10) / 10,
      potentialDowntimeHrs: Math.round(potentialHrs * 10) / 10,
      maintCost: 184200,
    },
    recentAlerts: alerts.slice(0, 8),
    assets,
  });
}
