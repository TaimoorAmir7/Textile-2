import { NextResponse } from "next/server";
import { updateCase } from "@/lib/catalog";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as {
    status?: string;
    assignee?: string;
    workOrderRef?: string;
    priority?: string;
  };
  const updated = updateCase(id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
