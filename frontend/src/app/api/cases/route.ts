import { NextResponse } from "next/server";
import { createCase, listCases } from "@/lib/catalog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  return NextResponse.json(listCases({ status, priority }));
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title: string;
    description?: string;
    assetId: string;
    alertId?: string;
    priority?: string;
    assignee?: string;
    workOrderRef?: string;
  };
  return NextResponse.json(createCase(body));
}
