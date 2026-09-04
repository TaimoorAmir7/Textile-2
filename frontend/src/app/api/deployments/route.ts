import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureSeeded();
  const rows = await prisma.deployment.findMany({
    include: { template: true, assets: { include: { asset: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await ensureSeeded();
  const body = (await req.json()) as {
    templateId: string;
    assetIds: string[];
    mappings: { assetId: string; signalKey: string; tagName: string }[];
    parameters: Record<string, number>;
  };
  const deployment = await prisma.deployment.create({
    data: {
      templateId: body.templateId,
      status: "deployed",
      qualityPct: 96,
      parameters: body.parameters ?? {},
      assets: {
        create: body.assetIds.map((assetId) => ({ assetId })),
      },
    },
  });
  await prisma.asset.updateMany({
    where: { id: { in: body.assetIds } },
    data: { monitored: true, templateId: body.templateId },
  });
  if (body.mappings?.length) {
    await prisma.signalMapping.createMany({ data: body.mappings });
  }
  return NextResponse.json(deployment);
}
