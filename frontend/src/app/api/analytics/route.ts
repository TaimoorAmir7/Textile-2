import { NextRequest, NextResponse } from "next/server";
import { buildAnalytics } from "@/lib/catalog-queries";

export async function GET(request: NextRequest) {
  return NextResponse.json(buildAnalytics(Number(request.nextUrl.searchParams.get("days") ?? 30)));
}
