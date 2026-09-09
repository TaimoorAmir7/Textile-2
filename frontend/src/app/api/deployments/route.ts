import { NextResponse } from "next/server";
import { createDeployment, listDeployments } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json(listDeployments());
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    templateId: string;
    assetIds: string[];
    mappings: { assetId: string; signalKey: string; tagName: string }[];
    parameters: Record<string, number>;
  };
  return NextResponse.json(createDeployment(body));
}
