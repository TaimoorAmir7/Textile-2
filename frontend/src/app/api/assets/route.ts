import { NextResponse } from "next/server";
import { listAssets } from "@/lib/catalog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const plant = searchParams.get("plant");
  const family = searchParams.get("family");
  return NextResponse.json(listAssets({ plant, family, q }));
}
