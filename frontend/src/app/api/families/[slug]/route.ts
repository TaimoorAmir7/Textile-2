import { NextResponse } from "next/server";
import { getFamilyBySlug } from "@/lib/catalog";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const family = getFamilyBySlug(slug);
  if (!family) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(family);
}
