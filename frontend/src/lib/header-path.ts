export type HeaderCrumb = {
  label: string;
  href?: string;
};

const HEADER_EVENT = "spark-header-crumbs";
let crumbOverride: HeaderCrumb[] | null = null;

export function setHeaderCrumbsOverride(crumbs: HeaderCrumb[] | null) {
  crumbOverride = crumbs;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HEADER_EVENT));
  }
}

export function subscribeHeaderCrumbs(onChange: () => void) {
  window.addEventListener(HEADER_EVENT, onChange);
  return () => window.removeEventListener(HEADER_EVENT, onChange);
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function headerCrumbs(pathname: string): HeaderCrumb[] {
  if (crumbOverride?.length) return crumbOverride;

  if (pathname === "/" || pathname === "/discover") {
    return [{ label: "Discover" }];
  }

  if (pathname.startsWith("/discover")) {
    const textiles: HeaderCrumb[] = [
      { label: "Discover", href: "/discover" },
      { label: "Textiles & Apparel", href: "/discover/textiles" },
    ];
    if (pathname === "/discover/textiles") return textiles;

    const family = pathname.match(/^\/discover\/textiles\/families\/([^/]+)$/);
    if (family) {
      return [
        ...textiles,
        { label: "Asset Families", href: "/discover/textiles/families" },
        { label: `${titleFromSlug(family[1])} Family` },
      ];
    }

    const template = pathname.match(/^\/discover\/templates\/([^/]+)$/);
    if (template) {
      return [
        ...textiles,
        { label: "Template Library", href: "/discover/textiles/templates" },
        { label: titleFromSlug(template[1]) },
      ];
    }

    const textileTab: Record<string, string> = {
      "/discover/textiles/families": "Asset Families",
      "/discover/textiles/solutions": "Reliability Solutions",
      "/discover/textiles/templates": "Template Library",
      "/discover/textiles/alerts": "Alerts",
      "/discover/textiles/architecture": "Reference Architecture",
    };
    const tab = textileTab[pathname];
    if (tab) return [...textiles, { label: tab }];
    return textiles;
  }

  if (pathname === "/deploy") return [{ label: "Deploy" }];
  if (pathname.startsWith("/deploy/")) {
    return [
      { label: "Deploy", href: "/deploy" },
      { label: "Template wizard" },
    ];
  }

  if (pathname.startsWith("/operate")) {
    const root: HeaderCrumb[] = [{ label: "Operate", href: "/operate" }];
    if (pathname === "/operate") return [{ label: "Operate" }];

    const alert = pathname.match(/^\/operate\/alerts\/([^/]+)$/);
    if (alert) {
      return [...root, { label: "Alerts", href: "/operate/alerts" }, { label: "Investigation" }];
    }

    const operateTab: Record<string, string> = {
      "/operate/alerts": "Alerts",
      "/operate/cases": "Cases",
      "/operate/work-orders": "Work Orders",
      "/operate/assets": "Assets",
    };
    const tab = operateTab[pathname];
    if (tab) return [...root, { label: tab }];
    return root;
  }

  if (pathname.startsWith("/optimize")) return [{ label: "Optimize" }];
  if (pathname.startsWith("/settings")) return [{ label: "Settings" }];
  if (pathname.startsWith("/support")) return [{ label: "Support" }];
  return [{ label: "Discover", href: "/discover" }];
}
