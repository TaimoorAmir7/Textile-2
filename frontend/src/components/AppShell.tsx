"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertTicker } from "@/components/AlertTicker";

const NAV = [
  { href: "/discover", label: "Discover", icon: "explore" },
  { href: "/deploy", label: "Deploy", icon: "rocket_launch" },
  { href: "/operate", label: "Operate", icon: "settings_remote" },
  { href: "/optimize", label: "Optimize", icon: "query_stats" },
];

const FOOTER = [
  { href: "/discover/textiles", label: "Template Library", icon: "inventory_2" },
  { href: "/settings", label: "Client Config", icon: "settings" },
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
  const [query, setQuery] = useState("");
  const [criticalCount, setCriticalCount] = useState(0);
  const [plants, setPlants] = useState<{ id: string; name: string; code: string }[]>([]);
  const [plant, setPlant] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    fetch("/api/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.criticalAlerts != null) setCriticalCount(d.criticalAlerts);
        if (d?.plants) setPlants(d.plants);
      })
      .catch(() => undefined);
  }, [pathname]);

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setRailOpen(false);
  }, [pathname]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/operate/assets?q=${encodeURIComponent(q)}`);
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("spark-theme", next);
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside
        data-open={railOpen}
        onMouseEnter={() => setRailOpen(true)}
        onMouseLeave={() => setRailOpen(false)}
        onFocus={() => setRailOpen(true)}
        onBlur={() => setRailOpen(false)}
        className="fixed top-0 left-0 z-40 hidden h-screen w-[72px] flex-col overflow-hidden border-r border-outline-variant bg-surface-container-lowest py-4 shadow-xl transition-[width] duration-200 data-[open=true]:w-[260px] md:flex"
      >
        <SidebarNavigation
          pathname={pathname}
          collapsible
          expanded={railOpen}
          onNavigate={(event) => {
            setRailOpen(false);
            event.currentTarget.blur();
          }}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,280px)] flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-lowest py-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 rounded p-2 text-on-surface-variant hover:bg-surface-container"
              aria-label="Close navigation"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <SidebarNavigation pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-col md:ml-[72px]">
        <header className="sticky top-0 z-30 flex h-14 min-w-0 items-center justify-between gap-2 border-b border-outline-variant bg-surface-container-lowest px-3 sm:px-gutter">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded p-2 text-on-surface-variant hover:bg-surface-container md:hidden"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link href="/discover" className="font-headline truncate text-sm font-bold text-primary sm:hidden">
              Spark
            </Link>
            <form onSubmit={onSearch} className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-sm text-on-surface-variant">
                search
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search industries, assets..."
                className="w-44 rounded border border-outline-variant bg-surface-container-low py-1.5 pr-3 pl-9 text-sm outline-none focus:border-primary lg:w-64 xl:w-72"
              />
            </form>
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
              className="hidden max-w-[180px] rounded border border-transparent bg-transparent py-2 text-sm text-on-surface-variant lg:block"
            >
              <option value="all">Plant Selection</option>
              {plants.map((p) => (
                <option key={p.id} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <Link
              href="/operate/alerts"
              className="hidden h-14 items-center text-sm text-on-surface-variant hover:text-primary lg:flex"
            >
              Alerts
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/operate/cases?new=1"
              className="hidden items-center rounded bg-primary px-3 py-1.5 font-label-caps text-on-primary hover:bg-primary-container sm:flex"
            >
              Create Case
            </Link>
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
        <AlertTicker />
        <main key={pathname} className="anim-fade-up min-w-0 flex-1 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarNavigation({
  pathname,
  collapsible = false,
  expanded = true,
  onNavigate,
}: {
  pathname: string;
  collapsible?: boolean;
  expanded?: boolean;
  onNavigate?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const hideLabels = collapsible && !expanded;
  const labelClass = `whitespace-nowrap transition-opacity duration-150 ${hideLabels ? "opacity-0" : "opacity-100"}`;
  const tooltip = (label: string) => (hideLabels ? label : undefined);

  return (
    <>
      <Link
        href="/discover"
        onClick={onNavigate}
        className="mb-6 flex h-9 min-w-[228px] items-center gap-3 px-5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
          <span className="material-symbols-outlined icon-filled text-sm">bolt</span>
        </span>
        <span className={labelClass}>
          <span className="block font-headline text-base font-bold leading-tight text-primary">
            Spark Technologies
          </span>
          <span className="block font-label-caps text-on-surface-variant">Reliability Platform</span>
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={tooltip(item.label)}
              className={`flex min-w-[228px] items-center gap-3 rounded px-3 py-2.5 ${
                active
                  ? "border-l-4 border-secondary bg-surface-container-low pl-2 text-secondary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined w-6 shrink-0 text-center ${active ? "icon-filled" : ""}`}>
                {item.icon}
              </span>
              <span className={`text-sm font-medium ${labelClass}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto min-w-[228px] border-t border-outline-variant px-3 pt-3">
        {[...FOOTER, { href: "/support", label: "Support", icon: "help" }].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={tooltip(item.label)}
            className="flex items-center gap-3 rounded px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"
          >
            <span className="material-symbols-outlined w-6 shrink-0 text-center">{item.icon}</span>
            <span className={`text-sm ${labelClass}`}>{item.label}</span>
          </Link>
        ))}
        <div className="mt-2 flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
            JS
          </div>
          <div className={labelClass}>
            <p className="text-sm font-medium">John Smith</p>
            <p className="font-label-caps text-on-surface-variant">Plant Manager</p>
          </div>
        </div>
      </div>
    </>
  );
}
