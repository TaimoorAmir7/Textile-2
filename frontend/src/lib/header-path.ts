import { familyLabel, moduleBySlug, type ModuleFamilySlug } from "./ai-modules";

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

function familyTitle(slug: string) {
  return slug === "knit" ? "Knit / Hosiery" : slug === "woven" ? "Woven" : titleFromSlug(slug);
}

function stageTitle(slug: string) {
  const labels: Record<string, string> = {
    greige: "Greige inspection",
    "pre-treatment": "Pre-treatment",
    dyeing: "Dyeing",
    printing: "Printing",
    finishing: "Finishing",
    "folding-rolling": "Folding / Rolling",
  };
  return labels[slug] ?? titleFromSlug(slug);
}

export function headerCrumbs(pathname: string): HeaderCrumb[] {
  if (crumbOverride?.length) return crumbOverride;

  if (pathname === "/" || pathname === "/discover") {
    return [{ label: "Discover" }];
  }

  if (pathname.startsWith("/discover")) {
    const textiles: HeaderCrumb[] = [
      { label: "Discover", href: "/discover" },
      { label: "Textiles", href: "/discover/textiles" },
    ];
    if (pathname === "/discover/textiles") return textiles;

    const stage = pathname.match(/^\/discover\/textiles\/families\/([^/]+)\/([^/]+)$/);
    if (stage) {
      return [
        ...textiles,
        { label: familyTitle(stage[1]), href: `/discover/textiles/families/${stage[1]}` },
        { label: stageTitle(stage[2]) },
      ];
    }

    const family = pathname.match(/^\/discover\/textiles\/families\/([^/]+)$/);
    if (family) {
      return [
        ...textiles,
        { label: familyTitle(family[1]) },
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

    const moduleFamily = pathname.match(/^\/discover\/textiles\/solutions\/([^/]+)\/([^/]+)$/);
    if (moduleFamily) {
      const aiModule = moduleBySlug(moduleFamily[1]);
      const family = moduleFamily[2] === "woven" || moduleFamily[2] === "knit"
        ? familyLabel(moduleFamily[2] as ModuleFamilySlug)
        : titleFromSlug(moduleFamily[2]);
      return [
        ...textiles,
        { label: "AI Modules", href: "/discover/textiles/solutions" },
        { label: aiModule?.shortName ?? titleFromSlug(moduleFamily[1]), href: `/discover/textiles/solutions/${moduleFamily[1]}` },
        { label: family },
      ];
    }

    const modulePage = pathname.match(/^\/discover\/textiles\/solutions\/([^/]+)$/);
    if (modulePage) {
      const aiModule = moduleBySlug(modulePage[1]);
      return [
        ...textiles,
        { label: "AI Modules", href: "/discover/textiles/solutions" },
        { label: aiModule?.shortName ?? titleFromSlug(modulePage[1]) },
      ];
    }

    const textileTab: Record<string, string> = {
      "/discover/textiles/families": "Production Families",
      "/discover/textiles/solutions": "AI Modules",
      "/discover/textiles/templates": "Stage Templates",
      "/discover/textiles/architecture": "Production Flow",
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
      return [...root, { label: "Alerts", href: "/operate/alerts" }, { label: "Stage Investigation" }];
    }

    const operateTab: Record<string, string> = {
      "/operate/alerts": "Alerts",
      "/operate/cases": "Quality Cases",
      "/operate/work-orders": "Quality Actions",
      "/operate/assets": "Stages",
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
