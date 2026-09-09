"use client";

import { useEffect, useState } from "react";

const TOKENS = {
  grid: "--spark-outline-variant",
  axis: "--spark-on-surface-variant",
  primary: "--spark-primary",
  onPrimary: "--spark-on-primary",
  secondary: "--spark-secondary",
  error: "--spark-error",
  warning: "--spark-warning",
  track: "--spark-surface-container-high",
  surface: "--spark-surface-container-lowest",
  onSurface: "--spark-on-surface",
} as const;

export type ChartTheme = Record<keyof typeof TOKENS, string>;

const FALLBACK: ChartTheme = {
  grid: "#e5e7eb",
  axis: "#4b5563",
  primary: "#1f2937",
  onPrimary: "#ffffff",
  secondary: "#0f766e",
  error: "#dc2626",
  warning: "#d97706",
  track: "#e5e7eb",
  surface: "#ffffff",
  onSurface: "#111827",
};

/**
 * Recharts writes colors as SVG presentation attributes, where `var()` is not
 * reliably resolved, so tokens are read as computed values and refreshed
 * whenever the theme attribute changes.
 */
export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(FALLBACK);

  useEffect(() => {
    const root = document.documentElement;

    function read() {
      const style = getComputedStyle(root);
      const next = {} as ChartTheme;
      (Object.keys(TOKENS) as (keyof typeof TOKENS)[]).forEach((key) => {
        next[key] = style.getPropertyValue(TOKENS[key]).trim() || FALLBACK[key];
      });
      setTheme(next);
    }

    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
