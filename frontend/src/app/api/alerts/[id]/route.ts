import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: { asset: { include: { plant: true, family: true } }, cases: { include: { case: true } } },
  });
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(alert);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  const body = (await req.json()) as { status: string };
  const alert = await prisma.alert.update({
    where: { id },
    data: { status: body.status },
  });
  return NextResponse.json(alert);
}
