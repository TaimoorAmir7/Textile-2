import { NextResponse } from "next/server";
import { listFamilies } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json(listFamilies());
}
