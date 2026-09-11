export const USTAAD_OPEN_EVENT = "spark:ustaad-open";

export function openUstaad() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USTAAD_OPEN_EVENT));
  }
}
