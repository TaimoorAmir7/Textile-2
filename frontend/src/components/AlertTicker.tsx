"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TickerAlert = {
  id: string;
  title: string;
  severity: string;
  status: string;
  asset: { assetCode: string; plant: { name: string } };
};

export function AlertTicker() {
  const [alerts, setAlerts] = useState<TickerAlert[]>([]);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetch("/api/alerts", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : []))
        .then((rows: TickerAlert[]) => {
          if (!cancelled) setAlerts(rows.filter((a) => a.status !== "snoozed"));
        })
        .catch(() => undefined);
    }
    load();
    const timer = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (!alerts.length) return null;

  const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
  const row = [...alerts, ...alerts];

  return (
    <div className="flex items-center gap-3 border-b border-outline-variant bg-inverse-surface px-gutter py-1.5 text-inverse-on-surface">
      <span className="flex shrink-0 items-center gap-2 font-label-caps">
        <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-error text-error" />
        Live alerts · {critical} critical
      </span>
      <div className="ticker-mask min-w-0 flex-1">
        <div className="ticker-track">
          {row.map((a, i) => (
            <Link
              key={`${a.id}-${i}`}
              href={`/operate/alerts/${a.id}`}
              className="mr-8 flex shrink-0 items-center gap-2 text-xs whitespace-nowrap hover:underline"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  a.severity === "CRITICAL" ? "bg-error" : "bg-warning"
                }`}
              />
              <span className="font-data-mono text-inverse-on-surface">{a.asset.assetCode}</span>
              <span className="opacity-80">{a.title}</span>
              <span className="opacity-60">· {a.asset.plant.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <Link href="/operate/alerts" className="font-label-caps shrink-0 text-secondary-fixed hover:underline">
        View all
      </Link>
    </div>
  );
}
