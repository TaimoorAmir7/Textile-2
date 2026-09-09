"use client";

import { usePathname, useRouter } from "next/navigation";

const PREV_KEY = "spark-prev-path";
const HERE_KEY = "spark-here-path";

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

export function isSubPage(pathname: string) {
  return (
    /^\/discover\/textiles\/families\/[^/]+$/.test(pathname) ||
    /^\/discover\/templates\/[^/]+$/.test(pathname) ||
    /^\/deploy\/[^/]+$/.test(pathname) ||
    /^\/operate\/alerts\/[^/]+$/.test(pathname)
  );
}

export function rememberPath(pathname: string) {
  try {
    const here = sessionStorage.getItem(HERE_KEY);
    if (here && here !== pathname) {
      sessionStorage.setItem(PREV_KEY, here);
    }
    sessionStorage.setItem(HERE_KEY, pathname);
  } catch {
    /* ignore */
  }
}

function fallbackFor(pathname: string) {
  if (pathname.startsWith("/operate")) return "/operate";
  if (pathname.startsWith("/deploy/")) return "/deploy";
  if (pathname.startsWith("/discover")) return "/discover";
  if (pathname.startsWith("/optimize")) return "/optimize";
  return "/discover";
}

export function BackButton({ fallback }: { fallback?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function goBack() {
    try {
      const prev = sessionStorage.getItem(PREV_KEY);
      if (prev && prev !== pathname) {
        router.push(prev);
        return;
      }
    } catch {
      /* use history */
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback ?? fallbackFor(pathname));
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
