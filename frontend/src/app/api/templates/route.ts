import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureSeeded();
  const templates = await prisma.reliabilityTemplate.findMany({
    include: { family: { include: { assets: true } }, _count: { select: { assets: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(templates);
}
