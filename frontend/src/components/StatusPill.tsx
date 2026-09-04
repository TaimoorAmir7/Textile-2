export function StatusPill({ status }: { status: string }) {
  const key = status.toUpperCase();
  if (key === "CRITICAL") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-error/30 bg-error-container px-1.5 py-0.5 font-label-caps text-[9px] text-on-error-container">
        <span className="h-1.5 w-1.5 rounded-full bg-error" />
        CRITICAL
      </span>
    );
  }
  if (key === "WATCH" || key === "WARNING" || key === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-warning/30 bg-warning-soft px-1.5 py-0.5 font-label-caps text-[9px] text-warning-text">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        {key === "HIGH" ? "HIGH" : "WATCH"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded border border-secondary/30 bg-success-soft px-1.5 py-0.5 font-label-caps text-[9px] text-success-text">
      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
      NOMINAL
    </span>
  );
}

export function PriorityPill({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  if (p === "critical") {
    return (
      <span className="inline-flex items-center rounded border border-error/20 bg-error-container px-2 py-0.5 text-xs font-medium text-on-error-container">
        Critical
      </span>
    );
  }
  if (p === "high") {
    return (
      <span className="inline-flex items-center rounded border border-tertiary/20 bg-tertiary-container px-2 py-0.5 text-xs font-medium text-on-tertiary-container">
        High
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded border border-outline-variant bg-surface-variant px-2 py-0.5 text-xs font-medium text-on-surface-variant">
      {priority}
    </span>
  );
}
