import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureSeeded();
  const [plants, assets, alerts, cases] = await Promise.all([
    prisma.plant.findMany({ orderBy: { name: "asc" } }),
    prisma.asset.findMany({ include: { family: true } }),
    prisma.alert.findMany({ include: { asset: { include: { plant: true } } }, orderBy: { detectedAt: "desc" } }),
    prisma.case.findMany(),
  ]);
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "new").length;
  const openCases = cases.filter((c) => c.status !== "Resolved").length;
  const avgHealth = Math.round(assets.reduce((s, a) => s + a.healthScore, 0) / Math.max(assets.length, 1));
  return NextResponse.json({
    plants,
    kpis: {
      activeAlerts: alerts.filter((a) => a.status !== "snoozed").length,
      criticalAlerts,
      openCases,
      closedCases: cases.filter((c) => c.status === "Resolved").length,
      avgHealth,
      avoidedDowntime: 987363,
      maintCost: 184200,
    },
    recentAlerts: alerts.slice(0, 8),
    assets,
  });
}
