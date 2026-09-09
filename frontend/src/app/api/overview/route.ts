import { NextResponse } from "next/server";
import { buildOverview } from "@/lib/catalog-queries";

export async function GET() {
  return NextResponse.json(buildOverview());
}
