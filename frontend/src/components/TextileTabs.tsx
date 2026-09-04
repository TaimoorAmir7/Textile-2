"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/discover/textiles", label: "Overview", icon: "dashboard" },
  { href: "/discover/textiles/families", label: "Asset Families", icon: "precision_manufacturing" },
  { href: "/discover/textiles/solutions", label: "Reliability Solutions", icon: "schema" },
  { href: "/discover/textiles/templates", label: "Template Library", icon: "inventory_2" },
  { href: "/discover/textiles/alerts", label: "Alerts", icon: "warning" },
  { href: "/discover/textiles/architecture", label: "Reference Architecture", icon: "account_tree" },
];

export function TextileTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 overflow-x-auto">
      {TABS.map((tab) => {
        const active =
          tab.href === "/discover/textiles"
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            data-active={active}
                className={`tab-link flex items-center gap-1.5 py-2.5 text-sm whitespace-nowrap ${
              active ? "font-semibold text-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${active ? "icon-filled" : ""}`}>
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
