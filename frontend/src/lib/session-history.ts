import { familyLabel, moduleBySlug, type ModuleFamilySlug } from "./ai-modules";

export type HistoryEntry = {
  href: string;
  title: string;
  sub: string;
  icon: string;
  at: number;
};

const KEY = "spark-session-history";
const EVENT = "spark-history";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function describePath(pathname: string): Omit<HistoryEntry, "at"> | null {
  if (pathname === "/discover") return null;
  if (pathname === "/discover/textiles") {
    return { href: pathname, title: "Textiles & Apparel", sub: "Discover", icon: "apparel" };
  }
  if (pathname === "/discover/textiles/families") {
    return { href: pathname, title: "Production Families", sub: "Textiles & Apparel", icon: "precision_manufacturing" };
  }
  const stage = pathname.match(/^\/discover\/textiles\/families\/([^/]+)\/([^/]+)$/);
  if (stage) {
    return { href: pathname, title: titleFromSlug(stage[2]), sub: `${titleFromSlug(stage[1])} Family`, icon: "account_tree" };
  }
  const family = pathname.match(/^\/discover\/textiles\/families\/([^/]+)$/);
  if (family) {
    return { href: pathname, title: `${titleFromSlug(family[1])} Family`, sub: "Textiles & Apparel", icon: "precision_manufacturing" };
  }
  if (pathname === "/discover/textiles/solutions") {
    return { href: pathname, title: "AI Modules", sub: "Textiles & Apparel", icon: "neurology" };
  }
  const moduleFamily = pathname.match(/^\/discover\/textiles\/solutions\/([^/]+)\/([^/]+)$/);
  if (moduleFamily) {
    const aiModule = moduleBySlug(moduleFamily[1]);
    const family = moduleFamily[2] === "woven" || moduleFamily[2] === "knit"
      ? familyLabel(moduleFamily[2] as ModuleFamilySlug)
      : titleFromSlug(moduleFamily[2]);
    return { href: pathname, title: aiModule?.shortName ?? titleFromSlug(moduleFamily[1]), sub: family, icon: aiModule?.icon ?? "neurology" };
  }
  const modulePage = pathname.match(/^\/discover\/textiles\/solutions\/([^/]+)$/);
  if (modulePage) {
    const aiModule = moduleBySlug(modulePage[1]);
    return { href: pathname, title: aiModule?.shortName ?? titleFromSlug(modulePage[1]), sub: "AI Modules", icon: aiModule?.icon ?? "neurology" };
  }
  if (pathname === "/discover/textiles/templates") {
    return { href: pathname, title: "Template Library", sub: "Textiles & Apparel", icon: "inventory_2" };
  }
  if (pathname === "/discover/textiles/architecture") {
    return { href: pathname, title: "Reference Architecture", sub: "Textiles & Apparel", icon: "account_tree" };
  }
  const template = pathname.match(/^\/discover\/templates\/([^/]+)$/);
  if (template) {
    return { href: pathname, title: titleFromSlug(template[1]), sub: "Template Library", icon: "inventory_2" };
  }
  if (pathname === "/deploy") {
    return { href: pathname, title: "Deployments", sub: "Deploy", icon: "rocket_launch" };
  }
  if (pathname.startsWith("/deploy/")) {
    return { href: pathname, title: "Deploy wizard", sub: "Deploy", icon: "rocket_launch" };
  }
  if (pathname === "/operate") {
    return { href: pathname, title: "Operations dashboard", sub: "Operate", icon: "settings_remote" };
  }
  if (pathname === "/operate/alerts") {
    return { href: pathname, title: "Alert queue", sub: "Operate", icon: "warning" };
  }
  const alert = pathname.match(/^\/operate\/alerts\/([^/]+)$/);
  if (alert) {
    return { href: pathname, title: "Alert investigation", sub: "Operate", icon: "troubleshoot" };
  }
  if (pathname === "/operate/cases") {
    return { href: pathname, title: "Case Management", sub: "Operate", icon: "assignment" };
  }
  if (pathname === "/operate/work-orders") {
    return { href: pathname, title: "Work Orders", sub: "Operate", icon: "engineering" };
  }
  if (pathname === "/operate/assets") {
    return { href: pathname, title: "Production Stages", sub: "Operate", icon: "precision_manufacturing" };
  }
  if (pathname === "/optimize") {
    return { href: pathname, title: "Production Quality Optimization", sub: "Optimize", icon: "query_stats" };
  }
  if (pathname === "/settings") {
    return { href: pathname, title: "Profile", sub: "Account", icon: "account_circle" };
  }
  return null;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordVisit(entry: Omit<HistoryEntry, "at">) {
  try {
    const next = [{ ...entry, at: Date.now() }, ...getHistory().filter((item) => item.href !== entry.href)].slice(0, 12);
    sessionStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function subscribeHistory(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
