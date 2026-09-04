import { AnimatedNumber } from "@/components/AnimatedNumber";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="font-label-caps mb-1 text-secondary">{eyebrow}</p> : null}
        <h1 className="font-headline text-2xl font-bold text-primary sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-on-surface-variant sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  caption,
  icon,
  tone = "default",
  children,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  caption?: string;
  icon?: string;
  tone?: "default" | "critical" | "positive" | "highlight";
  children?: React.ReactNode;
}) {
  const styles =
    tone === "highlight"
      ? "border-primary-container bg-primary text-on-primary"
      : tone === "critical"
        ? "border-error/40 bg-error-container/40"
        : "border-outline-variant bg-surface-container-lowest";
  return (
    <div className={`min-w-0 rounded-lg border p-4 ${styles}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`font-label-caps ${tone === "highlight" ? "text-on-primary/75" : "text-on-surface-variant"}`}>{label}</p>
        {icon ? (
          <span className={`material-symbols-outlined text-[18px] ${tone === "critical" ? "text-error" : tone === "highlight" ? "text-on-primary/75" : "text-secondary"}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="font-headline mt-2 text-2xl font-bold sm:text-3xl">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
      {caption ? <p className={`mt-1 text-xs ${tone === "highlight" ? "text-on-primary/75" : "text-on-surface-variant"}`}>{caption}</p> : null}
      {children}
    </div>
  );
}

export function ChartCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <div>
          <h2 className="font-headline text-base font-semibold text-primary sm:text-lg">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="min-w-0 p-4">{children}</div>
    </section>
  );
}

export function DataTableShell({
  children,
  title,
  action,
  minWidth = 720,
}: {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      {title || action ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
          {title ? <h2 className="font-headline text-lg font-semibold text-primary">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      <div className="max-w-full overflow-x-auto">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </section>
  );
}

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface-variant">
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-outline-variant border-t-secondary" />
      {label}
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant p-6 text-center">
      <span className="material-symbols-outlined mb-2 text-3xl text-outline">monitoring</span>
      <p className="font-semibold">{title}</p>
      {detail ? <p className="mt-1 max-w-md text-sm text-on-surface-variant">{detail}</p> : null}
    </div>
  );
}
