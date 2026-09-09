import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json(listTemplates());
}
