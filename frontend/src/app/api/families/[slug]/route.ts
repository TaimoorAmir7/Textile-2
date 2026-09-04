import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureSeeded();
  const { slug } = await params;
  const family = await prisma.assetFamily.findUnique({
    where: { slug },
    include: {
      assets: { include: { plant: true } },
      templates: true,
    },
  });
  if (!family) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(family);
}
