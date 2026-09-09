import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/catalog";

export async function GET(req: Request) {
  const status = new URL(req.url).searchParams.get("status");
  return NextResponse.json(listAlerts(status));
}
