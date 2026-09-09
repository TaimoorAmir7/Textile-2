import {
  createCase,
  createDeployment,
  getAlertById,
  getFamilyBySlug,
  getTemplateById,
  getTemplateBySlug,
  listAlerts,
  listAssets,
  listCases,
  listDeployments,
  listFamilies,
  listTemplates,
  updateAlertStatus,
  updateCase,
} from "./catalog";
import { buildAnalytics, buildOptimize, buildOverview, buildSearch } from "./catalog-queries";

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parse(path: string) {
  return new URL(path, "http://local.catalog");
}

export function readCatalog<T>(path: string): T {
  const url = parse(path);
  const route = url.pathname;
  const q = url.searchParams;

  if (route === "/api/overview") return copy(buildOverview()) as T;
  if (route === "/api/analytics") return copy(buildAnalytics(Number(q.get("days") ?? 30))) as T;
  if (route === "/api/optimize") return copy(buildOptimize(Number(q.get("days") ?? 30))) as T;
  if (route === "/api/search") return copy(buildSearch(q.get("q") ?? "")) as T;
  if (route === "/api/templates") return copy(listTemplates()) as T;
  if (route === "/api/families") return copy(listFamilies()) as T;
  if (route === "/api/assets") {
    return copy(listAssets({ plant: q.get("plant"), family: q.get("family"), q: q.get("q")?.toLowerCase() ?? "" })) as T;
  }
  if (route === "/api/alerts") return copy(listAlerts(q.get("status"))) as T;
  if (route === "/api/cases") return copy(listCases({ status: q.get("status"), priority: q.get("priority") })) as T;
  if (route === "/api/deployments") return copy(listDeployments()) as T;

  const template = route.match(/^\/api\/templates\/([^/]+)$/);
  if (template) {
    const row = getTemplateBySlug(decodeURIComponent(template[1])) ?? getTemplateById(decodeURIComponent(template[1]));
    if (!row) throw new Error(`GET ${path} failed (404)`);
    return copy(row) as T;
  }

  const family = route.match(/^\/api\/families\/([^/]+)$/);
  if (family) {
    const row = getFamilyBySlug(decodeURIComponent(family[1]));
    if (!row) throw new Error(`GET ${path} failed (404)`);
    return copy(row) as T;
  }

  const alert = route.match(/^\/api\/alerts\/([^/]+)$/);
  if (alert) {
    const row = getAlertById(decodeURIComponent(alert[1]));
    if (!row) throw new Error(`GET ${path} failed (404)`);
    return copy(row) as T;
  }

  throw new Error(`GET ${path} failed (404)`);
}

export async function apiGet<T>(path: string): Promise<T> {
  return readCatalog<T>(path);
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH",
  body?: unknown,
): Promise<T> {
  const route = parse(path).pathname;

  if (method === "POST" && route === "/api/cases") {
    return copy(createCase(body as Parameters<typeof createCase>[0])) as T;
  }
  if (method === "POST" && route === "/api/deployments") {
    return copy(createDeployment(body as Parameters<typeof createDeployment>[0])) as T;
  }

  const alert = route.match(/^\/api\/alerts\/([^/]+)$/);
  if (method === "PATCH" && alert) {
    const row = updateAlertStatus(decodeURIComponent(alert[1]), (body as { status: string }).status);
    if (!row) throw new Error(`PATCH ${path} failed (404)`);
    return copy(row) as T;
  }

  const item = route.match(/^\/api\/cases\/([^/]+)$/);
  if (method === "PATCH" && item) {
    const row = updateCase(decodeURIComponent(item[1]), body as Parameters<typeof updateCase>[1]);
    if (!row) throw new Error(`PATCH ${path} failed (404)`);
    return copy(row) as T;
  }

  throw new Error(`${method} ${path} failed`);
}
