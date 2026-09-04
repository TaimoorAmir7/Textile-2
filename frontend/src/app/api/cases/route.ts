import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const cases = await prisma.case.findMany({
    where: {
      ...(status && status !== "all" ? { status } : {}),
      ...(priority && priority !== "all" ? { priority } : {}),
    },
    include: { asset: true, alerts: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(cases);
}

export async function POST(req: Request) {
  await ensureSeeded();
  const body = (await req.json()) as {
    title: string;
    description?: string;
    assetId: string;
    alertId?: string;
    priority?: string;
    assignee?: string;
    workOrderRef?: string;
  };
  const count = await prisma.case.count();
  const caseCode = `CASE-${9000 + count + 1}`;
  const created = await prisma.case.create({
    data: {
      caseCode,
      title: body.title,
      description: body.description ?? "",
      assetId: body.assetId,
      priority: body.priority ?? "High",
      status: "Open",
      assignee: body.assignee || null,
      workOrderRef: body.workOrderRef || null,
      alerts: body.alertId ? { create: [{ alertId: body.alertId }] } : undefined,
    },
    include: { asset: true, alerts: true },
  });
  if (body.alertId) {
    await prisma.alert.update({ where: { id: body.alertId }, data: { status: "acked" } });
  }
  return NextResponse.json(created);
}
