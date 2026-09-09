import {
  buildMillSnapshot,
  type AlertRow,
  type AssetRow,
  type CaseRow,
  type MillSnapshot,
} from "./mill-data";

type Store = MillSnapshot;

const globalForCatalog = globalThis as unknown as { millCatalog?: Store };

function store(): Store {
  if (!globalForCatalog.millCatalog) {
    globalForCatalog.millCatalog = structuredClone(buildMillSnapshot());
  }
  return globalForCatalog.millCatalog;
}

function plantById(id: string) {
  return store().plants.find((row) => row.id === id)!;
}

function familyById(id: string) {
  return store().families.find((row) => row.id === id)!;
}

function templateById(id: string) {
  return store().templates.find((row) => row.id === id) ?? null;
}

function assetById(id: string) {
  return store().assets.find((row) => row.id === id)!;
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function listPlants() {
  return [...store().plants].sort((a, b) => a.name.localeCompare(b.name));
}

export function listAssets(filters?: { plant?: string | null; family?: string | null; q?: string }) {
  let rows = store().assets.map((asset) => ({
    ...asset,
    plant: plantById(asset.plantId),
    family: familyById(asset.familyId),
    template: asset.templateId ? templateById(asset.templateId) : null,
    alerts: store().alerts.filter((alert) => alert.assetId === asset.id),
    cases: store().cases.filter((item) => item.assetId === asset.id),
  }));
  if (filters?.plant) rows = rows.filter((asset) => asset.plant.code === filters.plant);
  if (filters?.family) rows = rows.filter((asset) => asset.family.slug === filters.family);
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (asset) =>
        asset.assetCode.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.location.toLowerCase().includes(q),
    );
  }
  return rows.sort((a, b) => a.assetCode.localeCompare(b.assetCode));
}

export function listFamilies() {
  return [...store().families]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((family) => {
      const assets = store().assets.filter((asset) => asset.familyId === family.id);
      const templates = store().templates.filter((template) => template.familyId === family.id);
      return {
        ...family,
        assets: assets.map((asset) => ({ ...asset, plant: plantById(asset.plantId) })),
        templates,
        _count: { assets: assets.length, templates: templates.length },
      };
    });
}

export function getFamilyBySlug(slug: string) {
  return listFamilies().find((family) => family.slug === slug) ?? null;
}

export function listTemplates() {
  return [...store().templates]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((template) => {
      const family = familyById(template.familyId);
      const familyAssets = store().assets.filter((asset) => asset.familyId === family.id);
      const assigned = store().assets.filter((asset) => asset.templateId === template.id);
      return {
        ...template,
        family: { ...family, assets: familyAssets },
        _count: { assets: assigned.length },
      };
    });
}

export function getTemplateBySlug(slug: string) {
  const template = store().templates.find((row) => row.slug === slug);
  if (!template) return null;
  const family = familyById(template.familyId);
  return {
    ...template,
    family: {
      ...family,
      assets: store().assets
        .filter((asset) => asset.familyId === family.id)
        .map((asset) => ({ ...asset, plant: plantById(asset.plantId) })),
    },
  };
}

export function getTemplateById(id: string) {
  const template = store().templates.find((row) => row.id === id);
  if (!template) return null;
  return getTemplateBySlug(template.slug);
}

export function listAlerts(status?: string | null) {
  return store()
    .alerts.filter((alert) => (status ? alert.status === status : true))
    .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
    .map((alert) => {
      const asset = assetById(alert.assetId);
      return {
        ...alert,
        asset: {
          ...asset,
          plant: plantById(asset.plantId),
          family: familyById(asset.familyId),
        },
      };
    });
}

export function getAlertById(id: string) {
  const alert = store().alerts.find((row) => row.id === id);
  if (!alert) return null;
  const asset = assetById(alert.assetId);
  return {
    ...alert,
    asset: {
      ...asset,
      plant: plantById(asset.plantId),
      family: familyById(asset.familyId),
    },
    cases: store()
      .caseAlerts.filter((link) => link.alertId === alert.id)
      .map((link) => ({
        ...link,
        case: store().cases.find((item) => item.id === link.caseId)!,
      })),
  };
}

export function updateAlertStatus(id: string, status: string): AlertRow | null {
  const alert = store().alerts.find((row) => row.id === id);
  if (!alert) return null;
  alert.status = status;
  return { ...alert };
}

export function listCases(filters?: { status?: string | null; priority?: string | null }) {
  return store()
    .cases.filter((item) => {
      if (filters?.status && filters.status !== "all" && item.status !== filters.status) return false;
      if (filters?.priority && filters.priority !== "all" && item.priority !== filters.priority) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((item) => ({
      ...item,
      asset: assetById(item.assetId),
      alerts: store().caseAlerts.filter((link) => link.caseId === item.id),
    }));
}

export function createCase(body: {
  title: string;
  description?: string;
  assetId: string;
  alertId?: string;
  priority?: string;
  assignee?: string;
  workOrderRef?: string;
}) {
  const created: CaseRow = {
    id: nextId("case"),
    caseCode: `CASE-${9000 + store().cases.length + 1}`,
    title: body.title,
    description: body.description ?? "",
    assetId: body.assetId,
    priority: body.priority ?? "High",
    status: "Open",
    assignee: body.assignee || null,
    workOrderRef: body.workOrderRef || null,
    createdAt: new Date(),
  };
  store().cases.push(created);
  if (body.alertId) {
    store().caseAlerts.push({ caseId: created.id, alertId: body.alertId });
    updateAlertStatus(body.alertId, "acked");
  }
  return {
    ...created,
    asset: assetById(created.assetId),
    alerts: store().caseAlerts.filter((link) => link.caseId === created.id),
  };
}

export function updateCase(
  id: string,
  body: { status?: string; assignee?: string; workOrderRef?: string; priority?: string },
): CaseRow | null {
  const item = store().cases.find((row) => row.id === id);
  if (!item) return null;
  if (body.status) item.status = body.status;
  if (body.assignee !== undefined) item.assignee = body.assignee || null;
  if (body.workOrderRef !== undefined) item.workOrderRef = body.workOrderRef || null;
  if (body.priority) item.priority = body.priority;
  return { ...item };
}

export function listDeployments() {
  return [...store().deployments]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((deployment) => ({
      ...deployment,
      template: templateById(deployment.templateId),
      assets: store()
        .deploymentAssets.filter((link) => link.deploymentId === deployment.id)
        .map((link) => ({ ...link, asset: assetById(link.assetId) })),
    }));
}

export function createDeployment(body: {
  templateId: string;
  assetIds: string[];
  mappings: { assetId: string; signalKey: string; tagName: string }[];
  parameters: Record<string, number>;
}) {
  const deployment = {
    id: nextId("dep"),
    templateId: body.templateId,
    status: "deployed",
    qualityPct: 96,
    parameters: body.parameters ?? {},
    createdAt: new Date(),
  };
  store().deployments.push(deployment);
  for (const assetId of body.assetIds) {
    store().deploymentAssets.push({ deploymentId: deployment.id, assetId });
    const asset = store().assets.find((row) => row.id === assetId);
    if (asset) {
      asset.monitored = true;
      asset.templateId = body.templateId;
    }
  }
  for (const mapping of body.mappings ?? []) {
    store().mappings.push({ id: nextId("map"), ...mapping });
  }
  return deployment;
}

export function familiesForOptimize() {
  return store().families.map((family) => ({
    ...family,
    assets: store()
      .assets.filter((asset) => asset.familyId === family.id)
      .map((asset) => ({
        ...asset,
        alerts: store().alerts.filter((alert) => alert.assetId === asset.id),
        cases: store().cases.filter((item) => item.assetId === asset.id),
      })),
  }));
}

export function assetsForSearch() {
  return store().assets.map((asset) => ({
    ...asset,
    plant: plantById(asset.plantId),
    family: familyById(asset.familyId),
  }));
}

export function templatesForSearch() {
  return store().templates.map((template) => ({
    ...template,
    family: familyById(template.familyId),
  }));
}

export type { AssetRow, AlertRow, CaseRow };
