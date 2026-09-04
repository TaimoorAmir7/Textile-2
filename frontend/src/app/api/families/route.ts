import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await ensureSeeded();
  const families = await prisma.assetFamily.findMany({
    include: { _count: { select: { assets: true, templates: true } }, templates: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(families);
}
