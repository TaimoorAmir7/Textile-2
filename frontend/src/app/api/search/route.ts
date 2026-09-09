import { NextRequest, NextResponse } from "next/server";
import { buildSearch } from "@/lib/catalog-queries";

export async function GET(request: NextRequest) {
  return NextResponse.json(buildSearch(request.nextUrl.searchParams.get("q") ?? ""));
}
