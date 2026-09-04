import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureSeeded();
  const families = await prisma.assetFamily.findMany({
    include: { assets: { include: { alerts: true, cases: true } } },
  });
  const rows = families.map((f) => {
    const assets = f.assets.length;
    const alerts = f.assets.reduce((n, a) => n + a.alerts.length, 0);
    const cases = f.assets.reduce((n, a) => n + a.cases.length, 0);
    const avgHealth = Math.round(
      f.assets.reduce((n, a) => n + a.healthScore, 0) / Math.max(assets, 1),
    );
    const mtbf = Math.round(420 - alerts * 18);
    const mttr = Math.round(3.2 + cases * 0.4);
    const downtimeHrs = alerts * 2.5 + cases * 1.1;
    return { slug: f.slug, name: f.name, assets, alerts, cases, avgHealth, mtbf, mttr, downtimeHrs };
  });
  return NextResponse.json(rows);
}
