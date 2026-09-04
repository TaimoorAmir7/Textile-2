import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  await ensureSeeded();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const plant = searchParams.get("plant");
  const family = searchParams.get("family");
  const assets = await prisma.asset.findMany({
    where: {
      ...(plant ? { plant: { code: plant } } : {}),
      ...(family ? { family: { slug: family } } : {}),
    },
    include: { plant: true, family: true, template: true },
    orderBy: { assetCode: "asc" },
  });
  const filtered = q
    ? assets.filter(
        (a) =>
          a.assetCode.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q),
      )
    : assets;
  return NextResponse.json(filtered);
}
