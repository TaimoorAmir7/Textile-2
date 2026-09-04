"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const FEATURED_IMG =
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=60";
const MFG_IMG =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=60";
const OG_IMG =
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=60";
const PWR_IMG =
  "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=60";

export default function DiscoverPage() {
  return (
    <div className="p-4">
      <div className="mx-auto max-w-[1600px] space-y-4">
        <div className="anim-fade-up">
          <h2 className="font-headline text-[32px] leading-10 font-bold text-primary">
            Discover Industries
          </h2>
          <p className="mt-1 max-w-3xl text-base text-on-surface-variant">
            Explore asset reliability templates and optimization strategies tailored by industry.
            Select a vertical to begin deployment planning.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 space-y-4 xl:col-span-9">
            <section className="anim-fade-up" style={{ animationDelay: "80ms" }}>
              <h3 className="mb-2 font-headline text-lg font-semibold text-on-surface">
                Highlighted Vertical
              </h3>
              <Link
                href="/discover/textiles"
                className="lift group relative flex flex-col overflow-hidden rounded border border-outline-variant bg-surface-container-lowest md:flex-row"
              >
                <div className="relative h-40 overflow-hidden border-r border-outline-variant md:h-auto md:w-1/3">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${FEATURED_IMG}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/50 to-transparent md:bg-gradient-to-r" />
                  <div className="absolute bottom-3 left-3 md:top-4 md:bottom-auto md:left-4">
                    <div className="mb-1 inline-block rounded bg-secondary px-2 py-0.5 font-label-caps text-on-secondary">
                      Featured
                    </div>
                    <h4 className="font-headline text-2xl font-bold text-primary">
                      Textiles &amp; Apparel
                    </h4>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <p className="mb-4 text-sm text-on-surface-variant">
                      Advanced monitoring templates for high-speed spinning machines, industrial
                      looms, and dye vats to minimize yarn breakage and ensure continuous production
                      flow.
                    </p>
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="rounded border border-outline-variant bg-surface-bright p-2">
                        <span className="font-label-caps mb-1 block text-on-surface-variant">
                          Total asset types
                        </span>
                        <span className="font-data-mono text-base text-primary">142</span>
                      </div>
                      <div className="rounded border border-outline-variant bg-surface-bright p-2">
                        <span className="font-label-caps mb-1 block text-on-surface-variant">
                          Common templates
                        </span>
                        <span className="font-data-mono text-base text-primary">Spinning Mchn V2</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-3">
                    <div>
                      <span className="font-label-caps mr-1 text-on-surface-variant">
                        Popular solutions:
                      </span>
                      <span className="text-sm font-medium text-primary">
                        Loom Vibration Analysis
                      </span>
                    </div>
                    <span className="font-label-caps flex items-center gap-1 text-secondary group-hover:underline">
                      View catalog
                      <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </section>

            <section>
              <div className="mb-2 flex items-end justify-between border-b border-outline-variant pb-1.5">
                <h3 className="font-headline text-lg font-semibold text-on-surface">
                  Industry Catalog
                </h3>
                <span className="font-label-caps text-on-surface-variant">Industry solutions catalog</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Reveal delay={0}>
                  <CatalogCard
                    image={MFG_IMG}
                    title="Manufacturing"
                    body="Discrete manufacturing assets including CNC machines, robotics, and assembly lines."
                    templates="850+"
                    topAsset="CNC Lathe G4"
                  />
                </Reveal>
                <Reveal delay={90}>
                  <CatalogCard
                    image={OG_IMG}
                    title="Oil & Gas"
                    body="Upstream, midstream, and downstream heavy equipment, pumps, and compressors."
                    templates="1,204"
                    topAsset="Centrifugal Pump"
                  />
                </Reveal>
                <Reveal delay={180}>
                  <CatalogCard
                    image={PWR_IMG}
                    title="Power Generation"
                    body="Turbines, generators, and grid infrastructure for renewable and traditional plants."
                    templates="432"
                    topAsset="Gas Turbine X9"
                  />
                </Reveal>
              </div>
            </section>
          </div>

          <aside className="col-span-12 hidden space-y-4 pl-2 xl:col-span-3 xl:block">
            <div className="sticky top-4 rounded border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="mb-3 flex items-center gap-2 font-headline text-lg font-semibold text-primary">
                <span className="material-symbols-outlined text-[18px] text-secondary">history</span>
                Recently Viewed
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/discover/textiles/families/air-jet-looms"
                    className="group block rounded border border-outline-variant p-2 hover:border-secondary"
                  >
                    <RecentRow icon="precision_manufacturing" title="High-Speed Loom T-200" sub="Textiles & Apparel" />
                  </Link>
                </li>
                <li>
                  <div className="rounded border border-outline-variant p-2 opacity-80">
                    <RecentRow icon="water_drop" title="Centrifugal Pump C-Series" sub="Oil & Gas" />
                  </div>
                </li>
                <li>
                  <div className="rounded border border-outline-variant p-2 opacity-80">
                    <RecentRow icon="hvac" title="Industrial Chiller Unit" sub="Facilities" />
                  </div>
                </li>
              </ul>
              <p className="font-label-caps mt-3 text-center text-on-surface-variant">Session history</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({
  image,
  title,
  body,
  templates,
  topAsset,
}: {
  image: string;
  title: string;
  body: string;
  templates: string;
  topAsset: string;
}) {
  return (
    <div className="flex cursor-default flex-col rounded border border-outline-variant bg-surface-container-lowest">
      <div className="relative h-24 overflow-hidden border-b border-outline-variant bg-surface-variant">
        <div className="h-full w-full bg-cover bg-center opacity-80" style={{ backgroundImage: `url('${image}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h4 className="mb-1 font-headline text-lg font-semibold text-primary">{title}</h4>
        <p className="mb-3 line-clamp-2 text-xs text-on-surface-variant">{body}</p>
        <div className="mt-auto border-t border-outline-variant pt-3">
          <div className="mb-1 flex justify-between">
            <span className="font-label-caps text-on-surface-variant">Templates</span>
            <span className="font-data-mono text-primary">{templates}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-label-caps text-on-surface-variant">Top asset</span>
            <span className="font-data-mono ml-2 truncate text-on-surface">{topAsset}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
