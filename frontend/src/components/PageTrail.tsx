"use client";

import { usePathname, useRouter } from "next/navigation";

export function templateHref(
  templates: { slug: string; name: string }[] | undefined,
  title: string,
) {
  const needle = title.trim().toLowerCase();
  const match = templates?.find((item) => {
    const name = item.name.toLowerCase();
    const slug = item.slug.replace(/-/g, " ");
    return name === needle || slug === needle || name.includes(needle) || needle.includes(name);
  });
  return match ? `/discover/templates/${match.slug}` : null;
}

export function parentPath(pathname: string) {
  const stage = pathname.match(/^(\/discover\/textiles\/families\/[^/]+)\/[^/]+$/);
  if (stage) return stage[1];

  if (/^\/discover\/textiles\/families\/[^/]+$/.test(pathname)) return "/discover/textiles/families";

  const solutionChild = pathname.match(/^(\/discover\/textiles\/solutions\/[^/]+)\/[^/]+$/);
  if (solutionChild) return solutionChild[1];

  if (/^\/discover\/textiles\/solutions\/[^/]+$/.test(pathname)) return "/discover/textiles/solutions";

  if (/^\/discover\/templates\/[^/]+$/.test(pathname)) return "/discover/textiles/templates";
  if (/^\/deploy\/[^/]+$/.test(pathname)) return "/deploy";
  if (/^\/operate\/alerts\/[^/]+$/.test(pathname)) return "/operate/alerts";
  if (pathname.startsWith("/operate")) return "/operate";
  if (pathname.startsWith("/discover")) return "/discover";
  if (pathname.startsWith("/optimize")) return "/optimize";
  return "/discover";
}

export function isSubPage(pathname: string) {
  return (
    /^\/discover\/textiles\/families\/[^/]+$/.test(pathname) ||
    /^\/discover\/textiles\/families\/[^/]+\/[^/]+$/.test(pathname) ||
    /^\/discover\/textiles\/solutions\/[^/]+$/.test(pathname) ||
    /^\/discover\/textiles\/solutions\/[^/]+\/[^/]+$/.test(pathname) ||
    /^\/discover\/templates\/[^/]+$/.test(pathname) ||
    /^\/deploy\/[^/]+$/.test(pathname) ||
    /^\/operate\/alerts\/[^/]+$/.test(pathname)
  );
}

export function BackButton({ fallback }: { fallback?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function goBack() {
    router.replace(fallback ?? parentPath(pathname));
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex items-center text-on-surface-variant hover:text-primary"
      aria-label="Back to previous page"
    >
      <span className="material-symbols-outlined text-[22px]">arrow_back</span>
    </button>
  );
}
