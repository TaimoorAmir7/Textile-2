"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/discover/textiles", label: "Overview", icon: "dashboard" },
  { href: "/discover/textiles/families", label: "Production Families", icon: "precision_manufacturing" },
  { href: "/discover/textiles/solutions", label: "AI Modules", icon: "neurology" },
  { href: "/discover/textiles/templates", label: "Stage Templates", icon: "inventory_2" },
  { href: "/discover/textiles/architecture", label: "Production Flow", icon: "account_tree" },
];

export function TextileTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center pb-2.5">
      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-surface-container-lowest/25 px-2 py-1.5 backdrop-blur-xl">
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
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm whitespace-nowrap ${
                active
                  ? "bg-surface-container-low/70 font-semibold text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${active ? "icon-filled" : ""}`}>
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
