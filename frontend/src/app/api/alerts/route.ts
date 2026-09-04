import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  await ensureSeeded();
  const status = new URL(req.url).searchParams.get("status");
  const alerts = await prisma.alert.findMany({
    where: status ? { status } : undefined,
    include: { asset: { include: { plant: true, family: true } } },
    orderBy: { detectedAt: "desc" },
  });
  return NextResponse.json(alerts);
}
