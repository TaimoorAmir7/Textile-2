import { NextResponse } from "next/server";
import { listAlerts, listAssets, listCases, listPlants } from "@/lib/catalog";

export async function GET() {
  const plants = listPlants();
  const assets = listAssets();
  const alerts = listAlerts();
  const cases = listCases();
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "new").length;
  const openCases = cases.filter((c) => c.status !== "Resolved").length;
  const avgHealth = Math.round(assets.reduce((s, a) => s + a.healthScore, 0) / Math.max(assets.length, 1));

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
