"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackButton, isSubPage } from "@/components/PageTrail";
import { SearchBox } from "@/components/SearchBox";
import { UstaadChat } from "@/components/UstaadChat";
import { useMill } from "@/lib/use-mill";
import { headerCrumbs, subscribeHeaderCrumbs } from "@/lib/header-path";
import { describePath, recordVisit } from "@/lib/session-history";

const NAV = [
  { href: "/discover", label: "Discover", icon: "explore" },
  { href: "/deploy", label: "Deploy", icon: "rocket_launch" },
  { href: "/operate", label: "Operate", icon: "settings_remote" },
  { href: "/optimize", label: "Optimize", icon: "query_stats" },
];

function isActive(pathname: string, href: string) {
  if (href === "/discover") {
    return pathname === "/discover" || pathname.startsWith("/discover/");
  }
  if (href === "/deploy") {
    return pathname === "/deploy" || pathname.startsWith("/deploy/");
  }
  if (href === "/operate") {
    return pathname === "/operate" || pathname.startsWith("/operate/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [overview] = useMill<{
    criticalAlerts?: number;
    kpis?: { criticalAlerts: number };
    plants: { id: string; name: string; code: string }[];
  }>("/api/overview");
  const criticalCount = overview.kpis?.criticalAlerts ?? overview.criticalAlerts ?? 0;
  const plants = overview.plants;
  const [plant, setPlant] = useState("all");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    const visit = describePath(pathname);
    if (visit) recordVisit(visit);
  }, [pathname]);

  const [, setCrumbTick] = useState(0);
  useEffect(() => subscribeHeaderCrumbs(() => setCrumbTick((n) => n + 1)), []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("spark-theme", next);
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest/90 px-6 backdrop-blur-md sm:h-[4.5rem] sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/discover" className="shrink-0 leading-none" aria-label="Production Reliability Platform">
              <span className="font-headline block text-[11px] font-extrabold tracking-[0.18em] text-primary uppercase sm:text-xs">
                Production Reliability
              </span>
              <span className="mt-1 block text-[10px] font-semibold tracking-[0.28em] text-on-surface-variant uppercase">
                Platform
              </span>
            </Link>
            <nav aria-label="Breadcrumb" className="font-data-mono hidden min-w-0 items-center gap-1 overflow-hidden text-outline sm:flex">
              {headerCrumbs(pathname).map((crumb, index, crumbs) => {
                const last = index === crumbs.length - 1;
                return (
                  <span key={`${crumb.label}-${index}`} className={`items-center gap-1 ${last ? "flex shrink-0" : "hidden min-w-0 xl:flex"}`}>
                    {index > 0 ? (
                      <span className="material-symbols-outlined hidden text-[12px] xl:inline">chevron_right</span>
                    ) : null}
                    {last || !crumb.href ? (
                      <span className="whitespace-nowrap font-bold text-primary" title={crumb.label}>{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} title={crumb.label} className="block min-w-0 max-w-28 truncate hover:text-primary lg:max-w-36 xl:max-w-44">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <SearchBox />
            <select
              value={plant}
              onChange={(e) => {
                setPlant(e.target.value);
                router.push(
                  e.target.value === "all"
                    ? "/operate"
                    : `/operate/assets?plant=${encodeURIComponent(e.target.value)}`,
                );
              }}
              className="hidden max-w-[180px] rounded-lg border border-transparent bg-transparent py-2 text-sm text-on-surface-variant xl:block"
            >
              <option value="all">Plant Selection</option>
              {plants.map((p) => (
                <option key={p.id} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <Link href="/operate/alerts" className="relative rounded p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary">
              <span className="material-symbols-outlined">notifications</span>
              {criticalCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error" />
              ) : null}
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span className="material-symbols-outlined">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <Link href="/settings" className="rounded p-2 text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          </div>
        </header>
        <main key={pathname} className="anim-fade-up pop-scope min-w-0 w-full flex-1 bg-transparent px-6 pb-24 sm:px-8 lg:px-10">
          {isSubPage(pathname) ? (
            <div className="pt-4">
              <BackButton />
            </div>
          ) : null}
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-white/10 bg-surface-container-lowest/25 px-2 py-1.5 shadow-none backdrop-blur-xl">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface-container-low/70 text-secondary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${active ? "icon-filled" : ""}`}>
                  {item.icon}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <UstaadChat />
    </div>
  );
}
