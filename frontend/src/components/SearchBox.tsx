"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type Hit = { title: string; sub: string; href: string; icon: string };
type Group = { group: string; items: Hit[] };

export function SearchBox() {
  const router = useRouter();
  const root = useRef<HTMLFormElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((response) => (response.ok ? response.json() : { groups: [] }))
        .then((data) => {
          setGroups(data.groups ?? []);
          setActive(0);
        })
        .catch(() => setGroups([]));
    }, 120);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const flat = groups.flatMap((group) => group.items);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (flat[active]) {
      go(flat[active].href);
      return;
    }
    const q = query.trim();
    if (!q) return;
    go(`/operate/assets?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, Math.max(flat.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Escape") setOpen(false);
  }

  let cursor = -1;

  return (
    <form ref={root} onSubmit={onSubmit} className="relative hidden md:block">
      <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-on-surface-variant">
        search
      </span>
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search industries, assets..."
        className="w-44 rounded-lg border border-outline-variant bg-surface-container-low py-1.5 pr-3 pl-9 text-sm outline-none focus:border-primary lg:w-64 xl:w-80"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open ? (
        <div className="absolute top-[calc(100%+8px)] right-0 z-50 w-[min(100vw-2rem,360px)] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_18px_40px_-20px_rgba(16,20,22,0.35)]">
          {groups.length ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {groups.map((group) => (
                <li key={group.group}>
                  <p className="font-label-caps px-3 pt-2 pb-1 text-on-surface-variant">{group.group}</p>
                  {group.items.map((item) => {
                    cursor += 1;
                    const index = cursor;
                    return (
                      <button
                        key={item.href + item.title}
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(item.href)}
                        className={`flex w-full items-start gap-2 px-3 py-2 text-left ${
                          index === active ? "bg-surface-container-low text-primary" : "text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined mt-0.5 text-[18px] text-secondary">{item.icon}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{item.title}</span>
                          <span className="block truncate text-xs text-on-surface-variant">{item.sub}</span>
                        </span>
                      </button>
                    );
                  })}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-on-surface-variant">
              {query.trim() ? `No matches for “${query}”.` : "Start typing to search pages, assets, and alerts."}
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
