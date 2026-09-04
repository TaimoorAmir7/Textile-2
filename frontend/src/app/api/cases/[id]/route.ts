import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await ensureSeeded();
  const { id } = await params;
  const body = (await req.json()) as {
    status?: string;
    assignee?: string;
    workOrderRef?: string;
    priority?: string;
  };
  const updated = await prisma.case.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.assignee !== undefined ? { assignee: body.assignee || null } : {}),
      ...(body.workOrderRef !== undefined ? { workOrderRef: body.workOrderRef || null } : {}),
      ...(body.priority ? { priority: body.priority } : {}),
    },
  });
  return NextResponse.json(updated);
}
