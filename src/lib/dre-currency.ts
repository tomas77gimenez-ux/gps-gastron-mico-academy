/* Monedas soportadas por la herramienta de DRE, con su locale de formato. */

export const CURRENCIES = ["USD", "ARS", "BRL", "MXN", "COP", "CLP", "PEN", "UYU", "EUR"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  USD: "en-US",
  ARS: "es-AR",
  BRL: "pt-BR",
  MXN: "es-MX",
  COP: "es-CO",
  CLP: "es-CL",
  PEN: "es-PE",
  UYU: "es-UY",
  EUR: "es-ES",
};

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}

export function currencyDecimals(currency: CurrencyCode): number {
  return currency === "CLP" ? 0 : 2;
}

/** Formato con símbolo y separadores propios de la moneda. */
export function formatMoney(value: number, currency: CurrencyCode, withCents = false): string {
  const v = Number.isFinite(value) ? value : 0;
  const max = currencyDecimals(currency);
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: withCents ? max : 0,
    maximumFractionDigits: withCents ? max : 0,
  }).format(v);
}

/** Formato con centavos cuando el valor los tiene. */
export function formatMoneyAuto(value: number, currency: CurrencyCode): string {
  const v = Number.isFinite(value) ? value : 0;
  const hasCents = Math.abs(v % 1) > 0.0001 && currencyDecimals(currency) > 0;
  return formatMoney(v, currency, hasCents);
}

export interface Separators {
  group: string;
  decimal: string;
}

const SEP_CACHE = new Map<CurrencyCode, Separators>();

export function currencySeparators(currency: CurrencyCode): Separators {
  const cached = SEP_CACHE.get(currency);
  if (cached) return cached;
  const parts = new Intl.NumberFormat(CURRENCY_LOCALE[currency], { minimumFractionDigits: 2 }).formatToParts(12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const seps = { group, decimal };
  SEP_CACHE.set(currency, seps);
  return seps;
}

export function currencySymbol(currency: CurrencyCode): string {
  const parts = new Intl.NumberFormat(CURRENCY_LOCALE[currency], { style: "currency", currency }).formatToParts(1);
  return parts.find((p) => p.type === "currency")?.value ?? currency;
}

/** Deja pasar solo dígitos y los separadores válidos de la moneda. */
export function sanitizeCurrencyInput(raw: string, currency: CurrencyCode): string {
  const { group, decimal } = currencySeparators(currency);
  let out = "";
  let decimalSeen = false;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if (ch === group) out += ch;
    else if (ch === decimal && !decimalSeen) {
      out += ch;
      decimalSeen = true;
    }
  }
  return out;
}

/** Interpreta lo escrito según los separadores de la moneda: "1.500,50" en ARS → 1500.5 */
export function parseCurrencyAmount(raw: string, currency: CurrencyCode): number {
  const { group, decimal } = currencySeparators(currency);
  if (!raw) return 0;
  const cleaned = sanitizeCurrencyInput(raw, currency)
    .split(group)
    .join("")
    .replace(decimal, ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Valor numérico → texto editable con los separadores de la moneda. */
export function toCurrencyInputText(value: number, currency: CurrencyCode): string {
  if (!Number.isFinite(value) || value === 0) return "";
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    minimumFractionDigits: 0,
    maximumFractionDigits: currencyDecimals(currency),
    useGrouping: true,
  }).format(value);
}

/** Formato de números sin moneda (clientes, rotación). */
export function formatNumber(value: number, currency: CurrencyCode, decimals = 0): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
