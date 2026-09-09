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
    return { href: pathname, title: "Asset Families", sub: "Textiles & Apparel", icon: "precision_manufacturing" };
  }
  const family = pathname.match(/^\/discover\/textiles\/families\/([^/]+)$/);
  if (family) {
    return { href: pathname, title: `${titleFromSlug(family[1])} Family`, sub: "Textiles & Apparel", icon: "precision_manufacturing" };
  }
  if (pathname === "/discover/textiles/solutions") {
    return { href: pathname, title: "Reliability Solutions", sub: "Textiles & Apparel", icon: "schema" };
  }
  if (pathname === "/discover/textiles/templates") {
    return { href: pathname, title: "Template Library", sub: "Textiles & Apparel", icon: "inventory_2" };
  }
  if (pathname === "/discover/textiles/alerts") {
    return { href: pathname, title: "Live Alerts", sub: "Textiles & Apparel", icon: "warning" };
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
    return { href: pathname, title: "Plant assets", sub: "Operate", icon: "precision_manufacturing" };
  }
  if (pathname === "/optimize") {
    return { href: pathname, title: "Reliability Optimization", sub: "Optimize", icon: "query_stats" };
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
