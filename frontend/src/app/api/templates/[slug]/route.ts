import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const template = await prisma.reliabilityTemplate.findUnique({
    where: { slug },
    include: { family: { include: { assets: { include: { plant: true } } } } },
  });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}
