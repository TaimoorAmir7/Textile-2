import { NextRequest, NextResponse } from "next/server";
import { buildOptimize } from "@/lib/catalog-queries";

export async function GET(request: NextRequest) {
  return NextResponse.json(buildOptimize(Number(request.nextUrl.searchParams.get("days") ?? 30)));
}
