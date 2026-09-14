import { createServerFn } from "@tanstack/react-start";
import { CURRENCIES, type CurrencyCode } from "./dre-currency";

export interface FxRateResult {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  date: string;
}

/**
 * Cotización del día. Fuente: ExchangeRate-API (open access, sin clave,
 * actualización diaria). No devuelve datos de la persona: sólo la tasa pública.
 */
export const getFxRate = createServerFn({ method: "POST" })
  .inputValidator((data: { from: string; to: string }) => {
    const list = CURRENCIES as readonly string[];
    if (!list.includes(data.from) || !list.includes(data.to)) {
      throw new Error("unsupported_currency");
    }
    return { from: data.from as CurrencyCode, to: data.to as CurrencyCode };
  })
  .handler(async ({ data }): Promise<FxRateResult> => {
    const today = new Date().toISOString();
    if (data.from === data.to) return { from: data.from, to: data.to, rate: 1, date: today };

    const res = await fetch(`https://open.er-api.com/v6/latest/${data.from}`);
    if (!res.ok) throw new Error("fx_unavailable");
    const json = (await res.json()) as { rates?: Record<string, number>; time_last_update_utc?: string };
    const rate = json.rates?.[data.to];
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) throw new Error("fx_unavailable");

    const date = json.time_last_update_utc ? new Date(json.time_last_update_utc).toISOString() : today;
    return { from: data.from, to: data.to, rate, date };
  });
