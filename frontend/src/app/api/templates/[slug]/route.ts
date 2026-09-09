import { NextResponse } from "next/server";
import { getTemplateById, getTemplateBySlug } from "@/lib/catalog";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug) ?? getTemplateById(slug);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}
