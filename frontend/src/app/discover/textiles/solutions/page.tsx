"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { templateHref } from "@/components/PageTrail";
import { apiGet } from "@/lib/api";

type Family = {
  slug: string;
  name: string;
  useCases: { title: string; body: string; tags: string[]; icon: string }[];
  templates: { slug: string; name: string }[];
};

export default function SolutionsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    apiGet<Family[]>("/api/families").then(setFamilies).catch(() => setFamilies([]));
  }, []);

  const visible = families.filter((f) => filter === "all" || f.slug === filter);

  return (
    <div className="space-y-5 p-5">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">Reliability Solutions</h1>
            <p className="mt-1 max-w-3xl text-on-surface-variant">
              Diagnostic use cases packaged with each textile template: what is detected, from which
              signals, and which failure mode it maps to.
            </p>
          </div>
          <div className="flex gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All families
            </FilterChip>
            {families.map((f) => (
              <FilterChip key={f.slug} active={filter === f.slug} onClick={() => setFilter(f.slug)}>
                {f.name.replace(" Family", "")}
              </FilterChip>
            ))}
          </div>
        </div>
      </Reveal>

      {visible.map((f, fi) => (
        <section key={f.slug} className="space-y-3">
          <Reveal delay={fi * 60}>
            <h2 className="font-headline border-b border-outline-variant pb-2 text-lg font-semibold text-primary">
              {f.name}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {f.useCases.map((u, i) => (
              <Reveal key={u.title} delay={i * 80}>
                <div className="lift group relative h-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                  <div className="absolute -top-6 -right-6 h-16 w-16 rounded-xl bg-surface-container-low transition-colors group-hover:bg-secondary-fixed" />
                  <span className="material-symbols-outlined relative mb-2 text-2xl text-secondary">
                    {u.icon}
                  </span>
                  <h3 className="relative font-headline text-base font-semibold text-primary">
                    {u.title}
                  </h3>
                  <p className="relative mt-1 text-xs leading-relaxed text-on-surface-variant">
                    {u.body}
                  </p>
                  <div className="relative mt-3 flex flex-wrap gap-1.5">
                    {u.tags.map((t) => (
                      <span
                        key={t}
                        className="font-data-mono rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[10px] text-outline"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="relative mt-4 flex gap-3 border-t border-outline-variant pt-3">
                    <Link
                      href={`/discover/textiles/families/${f.slug}`}
                      className="font-label-caps text-secondary hover:underline"
                    >
                      Family
                    </Link>
                    {(templateHref(f.templates, u.title) ?? (f.templates[0] ? `/discover/templates/${f.templates[0].slug}` : null)) ? (
                      <Link
                        href={templateHref(f.templates, u.title) ?? `/discover/templates/${f.templates[0].slug}`}
                        className="font-label-caps text-secondary hover:underline"
                      >
                        Template
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-3 py-1.5 font-label-caps transition-colors ${
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-secondary"
      }`}
    >
      {children}
    </button>
  );
}
