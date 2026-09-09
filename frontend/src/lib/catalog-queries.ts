import {
  assetsForSearch,
  familiesForOptimize,
  listAlerts,
  listAssets,
  listCases,
  listDeployments,
  listFamilies,
  listPlants,
  templatesForSearch,
} from "./catalog";

export function buildOverview() {
  const plants = listPlants();
  const assets = listAssets();
  const alerts = listAlerts();
  const cases = listCases();
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "new").length;
  const openCases = cases.filter((c) => c.status !== "Resolved").length;
  const avgHealth = Math.round(assets.reduce((s, a) => s + a.healthScore, 0) / Math.max(assets.length, 1));

  const HOURS_PER_FAILURE = 2.5;
  const PLANNED_REPAIR_SHARE = 0.3;
  const riskAlerts = alerts.filter((a) => a.severity !== "NOMINAL");
  const caughtEarly = riskAlerts.filter((a) => a.asset.monitored).length;
  const missed = riskAlerts.filter((a) => !a.asset.monitored).length;
  const potentialHrs = (caughtEarly + missed) * HOURS_PER_FAILURE;
  const actualHrs = caughtEarly * HOURS_PER_FAILURE * PLANNED_REPAIR_SHARE + missed * HOURS_PER_FAILURE;
  const avoidedHrs = potentialHrs - actualHrs;

  return {
    plants,
    kpis: {
      activeAlerts: alerts.filter((a) => a.status !== "snoozed").length,
      criticalAlerts,
      openCases,
      closedCases: cases.filter((c) => c.status === "Resolved").length,
      avgHealth,
      avoidedDowntimePct: potentialHrs ? Math.round((avoidedHrs / potentialHrs) * 100) : 0,
      avoidedDowntimeHrs: Math.round(avoidedHrs * 10) / 10,
      potentialDowntimeHrs: Math.round(potentialHrs * 10) / 10,
      maintCost: 184200,
    },
    recentAlerts: alerts.slice(0, 8),
    assets,
    criticalAlerts,
  };
}

export function buildAnalytics(requested = 30) {
  const days = requested === 7 || requested === 90 ? requested : 30;
  const plants = listPlants();
  const assets = listAssets();
  const alerts = listAlerts();
  const cases = listCases();
  const deployments = listDeployments();

  const baseHealth = assets.reduce((sum, asset) => sum + asset.healthScore, 0) / Math.max(assets.length, 1);
  const series = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));
    const wave = Math.sin(index * 0.72) + Math.cos(index * 0.31) * 0.65;
    const alertVolume = Math.max(0, Math.round(alerts.length / 2 + wave + (index % 9 === 0 ? 2 : 0)));
    return {
      date: date.toISOString(),
      label: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
      alerts: alertVolume,
      critical: Math.min(alertVolume, index % 6 === 0 ? 2 : index % 3 === 0 ? 1 : 0),
      health: Number(Math.max(65, Math.min(99, baseHealth + wave * 1.6 + index * 0.04)).toFixed(1)),
      downtime: Number(Math.max(0.3, alertVolume * 0.7 + Math.abs(wave) * 0.5).toFixed(1)),
      maintenanceCost: Math.round(3200 + alertVolume * 760 + Math.abs(wave) * 540),
    };
  });

  const familyRisk = Array.from(
    assets.reduce((map, asset) => {
      const current = map.get(asset.family.slug) ?? {
        slug: asset.family.slug,
        name: asset.family.name.replace(" Family", ""),
        assets: 0,
        alerts: 0,
        critical: 0,
        healthTotal: 0,
        monitored: 0,
      };
      current.assets += 1;
      current.alerts += asset.alerts.length;
      current.critical += asset.alerts.filter((alert) => alert.severity === "CRITICAL").length;
      current.healthTotal += asset.healthScore;
      current.monitored += asset.monitored ? 1 : 0;
      map.set(asset.family.slug, current);
      return map;
    }, new Map<string, { slug: string; name: string; assets: number; alerts: number; critical: number; healthTotal: number; monitored: number }>())
      .values(),
  ).map((row) => ({
    ...row,
    health: Math.round(row.healthTotal / Math.max(row.assets, 1)),
    coverage: Math.round((row.monitored / Math.max(row.assets, 1)) * 100),
  }));

  const healthBuckets = [
    { range: "Critical", min: 0, max: 59 },
    { range: "At risk", min: 60, max: 79 },
    { range: "Watch", min: 80, max: 89 },
    { range: "Healthy", min: 90, max: 100 },
  ].map((bucket) => ({
    range: bucket.range,
    assets: assets.filter((asset) => asset.healthScore >= bucket.min && asset.healthScore <= bucket.max).length,
  }));

  const countBy = (values: string[], labels: string[]) =>
    labels.map((name) => ({ name, value: values.filter((value) => value.toLowerCase() === name.toLowerCase()).length }));

  return {
    periodDays: days,
    generatedAt: new Date().toISOString(),
    series,
    severity: countBy(
      alerts.map((alert) => alert.severity),
      ["CRITICAL", "WATCH", "NOMINAL"],
    ),
    alertStatus: countBy(
      alerts.map((alert) => alert.status),
      ["new", "acked", "snoozed"],
    ),
    caseStatus: countBy(
      cases.map((item) => item.status),
      ["Open", "In-Progress", "Resolved"],
    ),
    casePriority: countBy(
      cases.map((item) => item.priority),
      ["Critical", "High", "Medium", "Low"],
    ),
    healthBuckets,
    familyRisk,
    facilities: plants.map((plant) => ({
      name: plant.name.replace("Faisalabad Mill — ", ""),
      code: plant.code,
      health: plant.healthScore,
      assets: assets.filter((asset) => asset.plantId === plant.id).length,
      alerts: alerts.filter((alert) => alert.asset.plantId === plant.id).length,
    })),
    deploymentSummary: {
      total: deployments.length,
      liveAssets: deployments.reduce((sum, deployment) => sum + deployment.assets.length, 0),
      latest: deployments.slice(0, 5).map((deployment) => ({
        id: deployment.id,
        status: deployment.status,
        qualityPct: deployment.qualityPct,
        createdAt: deployment.createdAt,
        assets: deployment.assets.length,
      })),
    },
  };
}

export function buildOptimize(requested = 30) {
  const days = requested === 7 || requested === 90 ? requested : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const families = familiesForOptimize();

  const rows = families.map((family) => {
    const assets = family.assets.length;
    const rawAlerts = family.assets.reduce((count, asset) => count + asset.alerts.length, 0);
    const rawCases = family.assets.reduce((count, asset) => count + asset.cases.length, 0);
    const windowAlerts = family.assets.reduce(
      (count, asset) => count + asset.alerts.filter((alert) => alert.detectedAt >= since).length,
      0,
    );
    const windowCases = family.assets.reduce(
      (count, asset) => count + asset.cases.filter((item) => item.createdAt >= since).length,
      0,
    );
    const seed = [...family.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) + days * 3;
    const scale = (days / 30) * (0.88 + (seed % 21) / 100);
    const alerts = windowAlerts === rawAlerts ? Math.max(0, Math.round(rawAlerts * scale)) : windowAlerts;
    const cases = windowCases === rawCases ? Math.max(0, Math.round(rawCases * scale)) : windowCases;
    const healthShift = days === 7 ? 2 : days === 90 ? -3 : 0;
    const avgHealth = Math.max(
      62,
      Math.min(
        98,
        Math.round(family.assets.reduce((sum, asset) => sum + asset.healthScore, 0) / Math.max(assets, 1) + healthShift),
      ),
    );
    const mtbf = Math.max(96, Math.round((420 - alerts * 18) * (days === 7 ? 1.08 : days === 90 ? 0.92 : 1)));
    const mttr = Number((Math.max(1.4, 3.2 + cases * 0.4 + (days === 90 ? 0.5 : days === 7 ? -0.4 : 0))).toFixed(1));
    const downtimeHrs = Number((alerts * 2.5 + cases * 1.1).toFixed(1));
    return {
      slug: family.slug,
      name: family.name,
      assets,
      alerts,
      cases,
      avgHealth,
      mtbf,
      mttr,
      downtimeHrs,
    };
  });

  const riskEvents = rows.reduce((sum, row) => sum + row.alerts, 0);
  const avoidedPct = Math.round(Math.max(54, Math.min(84, 70 + (30 - days) * 0.14 + (riskEvents > 8 ? -2 : 1))));
  return { periodDays: days, avoidedPct, rows };
}

export function buildSearch(query: string) {
  const q = query.trim().toLowerCase();
  const assets = assetsForSearch();
  const families = listFamilies();
  const templates = templatesForSearch();
  const alerts = listAlerts().slice(0, 24);

  type Hit = { title: string; sub: string; href: string; icon: string; group: string };
  const match = (...values: string[]) => values.some((value) => value.toLowerCase().includes(q));

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
    ? hits.filter((hit) => match(hit.title, hit.sub, hit.group, hit.href))
    : hits.filter((hit) => hit.group === "Pages" || hit.group === "Families" || hit.group === "Templates").slice(0, 8);

  const groups = ["Pages", "Families", "Templates", "Assets", "Alerts"]
    .map((group) => ({
      group,
      items: filtered.filter((hit) => hit.group === group).slice(0, 5),
    }))
    .filter((entry) => entry.items.length > 0);

  return { query: q, groups };
}
