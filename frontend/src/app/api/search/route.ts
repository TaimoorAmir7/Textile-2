import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/ensure-seed";
import { prisma } from "@/lib/prisma";

type Hit = { title: string; sub: string; href: string; icon: string; group: string };

function match(query: string, ...values: string[]) {
  return values.some((value) => value.toLowerCase().includes(query));
}

export async function GET(request: NextRequest) {
  await ensureSeeded();
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  const [assets, families, templates, alerts] = await Promise.all([
    prisma.asset.findMany({ include: { plant: true, family: true } }),
    prisma.assetFamily.findMany({ include: { templates: true } }),
    prisma.reliabilityTemplate.findMany({ include: { family: true } }),
    prisma.alert.findMany({ include: { asset: true }, take: 24, orderBy: { detectedAt: "desc" } }),
  ]);

  const pages: Hit[] = [
    { title: "Textiles & Apparel", sub: "Industry catalog", href: "/discover/textiles", icon: "apparel", group: "Pages" },
    { title: "Asset Families", sub: "Discover", href: "/discover/textiles/families", icon: "precision_manufacturing", group: "Pages" },
    { title: "Template Library", sub: "Discover", href: "/discover/textiles/templates", icon: "inventory_2", group: "Pages" },
    { title: "Live Alerts", sub: "Textiles", href: "/discover/textiles/alerts", icon: "warning", group: "Pages" },
    { title: "Case Management", sub: "Operate", href: "/operate/cases", icon: "assignment", group: "Pages" },
    { title: "Work Orders", sub: "Operate", href: "/operate/work-orders", icon: "engineering", group: "Pages" },
    { title: "Plant assets", sub: "Operate", href: "/operate/assets", icon: "factory", group: "Pages" },
    { title: "Reliability Optimization", sub: "Optimize", href: "/optimize", icon: "query_stats", group: "Pages" },
  ];

  const hits: Hit[] = [
    ...pages,
    ...families.map((family) => ({
      title: family.name,
      sub: "Asset family",
      href: `/discover/textiles/families/${family.slug}`,
      icon: "precision_manufacturing",
      group: "Families",
    })),
    ...templates.map((template) => ({
      title: template.name,
      sub: template.family.name,
      href: `/discover/templates/${template.slug}`,
      icon: "inventory_2",
      group: "Templates",
    })),
    ...assets.map((asset) => ({
      title: `${asset.assetCode} · ${asset.name}`,
      sub: `${asset.plant.name} — ${asset.location}`,
      href: `/operate/assets?q=${encodeURIComponent(asset.assetCode)}`,
      icon: "memory",
      group: "Assets",
    })),
    ...alerts.map((alert) => ({
      title: alert.title,
      sub: alert.asset.assetCode,
      href: `/operate/alerts/${alert.id}`,
      icon: "warning",
      group: "Alerts",
    })),
  ];

  const filtered = q
    ? hits.filter((hit) => match(q, hit.title, hit.sub, hit.group, hit.href))
    : hits.filter((hit) => hit.group === "Pages" || hit.group === "Families" || hit.group === "Templates").slice(0, 8);

  const groups = ["Pages", "Families", "Templates", "Assets", "Alerts"]
    .map((group) => ({
      group,
      items: filtered.filter((hit) => hit.group === group).slice(0, 5),
    }))
    .filter((entry) => entry.items.length > 0);

  return NextResponse.json({ query: q, groups });
}
