import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  await ensureSeeded();
  const requested = Number(request.nextUrl.searchParams.get("days") ?? 30);
  const days = requested === 7 || requested === 90 ? requested : 30;
  const [plants, assets, alerts, cases, deployments] = await Promise.all([
    prisma.plant.findMany({ orderBy: { name: "asc" } }),
    prisma.asset.findMany({ include: { family: true, alerts: true, cases: true } }),
    prisma.alert.findMany({ include: { asset: { include: { family: true, plant: true } } } }),
    prisma.case.findMany(),
    prisma.deployment.findMany({ include: { assets: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const baseHealth = assets.reduce((sum, asset) => sum + asset.healthScore, 0) / Math.max(assets.length, 1);
  const series = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));
    const wave = Math.sin(index * 0.72) + Math.cos(index * 0.31) * 0.65;
    const alertVolume = Math.max(0, Math.round(alerts.length / 2 + wave + (index % 9 === 0 ? 2 : 0)));
    return {
      date: date.toISOString(),
      label: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
      alerts: alertVolume,
      critical: Math.min(alertVolume, index % 6 === 0 ? 2 : index % 3 === 0 ? 1 : 0),
      health: Number(Math.max(65, Math.min(99, baseHealth + wave * 1.6 + index * 0.04)).toFixed(1)),
      downtime: Number(Math.max(0.3, alertVolume * 0.7 + Math.abs(wave) * 0.5).toFixed(1)),
      maintenanceCost: Math.round(3200 + alertVolume * 760 + Math.abs(wave) * 540),
    };
  });

  const familyRisk = Array.from(
    assets.reduce((map, asset) => {
      const current = map.get(asset.family.slug) ?? {
        slug: asset.family.slug,
        name: asset.family.name.replace(" Family", ""),
        assets: 0,
        alerts: 0,
        critical: 0,
        healthTotal: 0,
        monitored: 0,
      };
      current.assets += 1;
      current.alerts += asset.alerts.length;
      current.critical += asset.alerts.filter((alert) => alert.severity === "CRITICAL").length;
      current.healthTotal += asset.healthScore;
      current.monitored += asset.monitored ? 1 : 0;
      map.set(asset.family.slug, current);
      return map;
    }, new Map<string, { slug: string; name: string; assets: number; alerts: number; critical: number; healthTotal: number; monitored: number }>())
      .values(),
  ).map((row) => ({
    ...row,
    health: Math.round(row.healthTotal / Math.max(row.assets, 1)),
    coverage: Math.round((row.monitored / Math.max(row.assets, 1)) * 100),
  }));

  const healthBuckets = [
    { range: "Critical", min: 0, max: 59 },
    { range: "At risk", min: 60, max: 79 },
    { range: "Watch", min: 80, max: 89 },
    { range: "Healthy", min: 90, max: 100 },
  ].map((bucket) => ({
    range: bucket.range,
    assets: assets.filter((asset) => asset.healthScore >= bucket.min && asset.healthScore <= bucket.max).length,
  }));

  const countBy = (values: string[], labels: string[]) =>
    labels.map((name) => ({ name, value: values.filter((value) => value.toLowerCase() === name.toLowerCase()).length }));

  return NextResponse.json({
    periodDays: days,
    generatedAt: new Date().toISOString(),
    series,
    severity: countBy(alerts.map((alert) => alert.severity), ["CRITICAL", "WATCH"]),
    alertStatus: countBy(alerts.map((alert) => alert.status), ["new", "acked", "snoozed"]),
    caseStatus: countBy(cases.map((item) => item.status), ["Open", "In-Progress", "Resolved"]),
    casePriority: countBy(cases.map((item) => item.priority), ["Critical", "High", "Medium", "Low"]),
    healthBuckets,
    familyRisk,
    facilities: plants.map((plant) => ({
      name: plant.name.replace("Faisalabad Mill — ", ""),
      code: plant.code,
      health: plant.healthScore,
      assets: assets.filter((asset) => asset.plantId === plant.id).length,
      alerts: alerts.filter((alert) => alert.asset.plantId === plant.id).length,
    })),
    deploymentSummary: {
      total: deployments.length,
      liveAssets: deployments.reduce((sum, deployment) => sum + deployment.assets.length, 0),
      latest: deployments.slice(0, 5).map((deployment) => ({
        id: deployment.id,
        status: deployment.status,
        qualityPct: deployment.qualityPct,
        createdAt: deployment.createdAt,
        assets: deployment.assets.length,
      })),
    },
  });
}
