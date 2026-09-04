"use client";

import { useEffect, useState } from "react";

const TOKENS = {
  grid: "--color-outline-variant",
  axis: "--color-on-surface-variant",
  primary: "--color-primary",
  onPrimary: "--color-on-primary",
  secondary: "--color-secondary",
  error: "--color-error",
  warning: "--color-warning",
  track: "--color-surface-container-high",
  surface: "--color-surface-container-lowest",
  onSurface: "--color-on-surface",
} as const;

export type ChartTheme = Record<keyof typeof TOKENS, string>;

const FALLBACK: ChartTheme = {
  grid: "#c4c6cf",
  axis: "#44474e",
  primary: "#002046",
  onPrimary: "#ffffff",
  secondary: "#006a6a",
  error: "#ba1a1a",
  warning: "#ffa000",
  track: "#e5e9eb",
  surface: "#ffffff",
  onSurface: "#181c1e",
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
