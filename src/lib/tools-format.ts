export function money(v: number): string {
  if (!Number.isFinite(v)) return "$0";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

export function money2(v: number): string {
  if (!Number.isFinite(v)) return "$0.00";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

export function pct(v: number, digits = 1): string {
  if (!Number.isFinite(v)) return "0%";
  return `${v.toFixed(digits)}%`;
}

export function num(v: string | number | null | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined || v === "") return 0;
  const parsed = Number(String(v).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export const UNITS = ["kg", "g", "l", "ml", "un"] as const;
export type Unit = (typeof UNITS)[number];

/** Costo real por unidad de compra, ajustado por el factor de rendimiento. */
export function realCost(purchasePrice: number, yieldFactorPct: number): number {
  const y = yieldFactorPct > 0 ? yieldFactorPct : 100;
  return purchasePrice / (y / 100);
}
