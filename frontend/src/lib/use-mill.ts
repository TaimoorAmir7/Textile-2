"use client";

import { useMemo, useState } from "react";
import { readCatalog } from "./api";

export function useMill<T>(path: string): [T, () => void] {
  const [tick, setTick] = useState(0);
  const data = useMemo(() => {
    void tick;
    return readCatalog<T>(path);
  }, [path, tick]);
  return [data, () => setTick((n) => n + 1)];
}

export function useMillOrNull<T>(path: string): [T | null, () => void] {
  const [tick, setTick] = useState(0);
  const data = useMemo(() => {
    void tick;
    try {
      return readCatalog<T>(path);
    } catch {
      return null;
    }
  }, [path, tick]);
  return [data, () => setTick((n) => n + 1)];
}
