"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory, subscribeHistory, type HistoryEntry } from "@/lib/session-history";

function RecentRow({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-outline-variant bg-surface-container-high">
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{icon}</span>
      </div>
      <div className="min-w-0">
        <h4 className="truncate text-sm font-medium text-on-surface">{title}</h4>
        <p className="font-label-caps mt-0.5 truncate text-on-surface-variant">{sub}</p>
      </div>
    </div>
  );
}

export function RecentlyViewed() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const read = () => setItems(getHistory());
    read();
    return subscribeHistory(read);
  }, []);

  const visible = expanded ? items : items.slice(0, 3);

  return (
    <div className="sticky top-4 rounded border border-outline-variant bg-surface-container-lowest p-4">
      <h3 className="mb-3 flex items-center gap-2 font-headline text-lg font-semibold text-primary">
        <span className="material-symbols-outlined text-[18px] text-secondary">history</span>
        Recently Viewed
      </h3>
      {visible.length ? (
        <ul className="space-y-2">
          {visible.map((item) => (
            <li key={`${item.href}-${item.at}`}>
              <Link
                href={item.href}
                className="group block rounded border border-outline-variant p-2 hover:border-secondary"
              >
                <RecentRow icon={item.icon} title={item.title} sub={item.sub} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-on-surface-variant">
          Open a family, template, or alert and it will appear here for this session.
        </p>
      )}
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="font-label-caps mt-3 w-full text-center text-on-surface-variant hover:text-primary"
      >
        {expanded ? "Hide history" : "Session history"}
      </button>
    </div>
  );
}
