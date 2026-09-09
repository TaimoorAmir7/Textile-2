import { NextResponse } from "next/server";
import { getAlertById, updateAlertStatus } from "@/lib/catalog";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alert = getAlertById(id);
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(alert);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as { status: string };
  const alert = updateAlertStatus(id, body.status);
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(alert);
}
