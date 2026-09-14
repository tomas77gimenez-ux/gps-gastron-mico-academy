import { supabase } from "@/integrations/supabase/client";
import { isCurrencyCode, type CurrencyCode } from "./dre-currency";
import { NON_MONETARY_FIELDS, type CustomLine, type DREData, type RevenueSource } from "./dre-questions";
import type { Lang } from "./i18n";

export interface FxNote {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  date: string;
}

export interface DreSheet {
  id: string;
  name: string;
  currency: CurrencyCode;
  periodMonths: number;
  periodStart: string; // "2026-05-01"
  data: DREData;
  sources: RevenueSource[];
  customLines: CustomLine[];
  pinned: boolean;
  fxNote: FxNote | null;
  createdAt: string;
  updatedAt: string;
}

type Row = {
  id: string;
  name: string;
  currency: string;
  period_months: number;
  period_start: string;
  data: unknown;
  revenue_sources: unknown;
  custom_lines: unknown;
  pinned: boolean;
  fx_note: unknown;
  created_at: string;
  updated_at: string;
};

const LOCALE_MAP: Record<Lang, string> = { es: "es-AR", en: "en-US", pt: "pt-BR" };

export function rowToSheet(row: Row): DreSheet {
  const data = (row.data ?? {}) as DREData;
  const sources = Array.isArray(row.revenue_sources) ? (row.revenue_sources as RevenueSource[]) : [];
  const customLines = Array.isArray(row.custom_lines) ? (row.custom_lines as CustomLine[]) : [];
  const fx = row.fx_note as FxNote | null;
  return {
    id: row.id,
    name: row.name,
    currency: isCurrencyCode(row.currency) ? row.currency : "USD",
    periodMonths: row.period_months,
    periodStart: row.period_start,
    data,
    sources,
    customLines,
    pinned: Boolean(row.pinned),
    fxNote: fx && typeof fx === "object" && "rate" in fx ? fx : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const SHEET_COLUMNS =
  "id, name, currency, period_months, period_start, data, revenue_sources, custom_lines, pinned, fx_note, created_at, updated_at";

export async function listSheets(userId: string): Promise<DreSheet[]> {
  const { data, error } = await supabase
    .from("dre_sheets")
    .select(SHEET_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToSheet(r as Row));
}

/** "DRE mayo 2026" o "DRE abr–jun 2026" */
export function defaultSheetName(periodStart: string, periodMonths: number, lang: Lang = "es"): string {
  const locale = LOCALE_MAP[lang];
  const [y, m] = periodStart.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, 1);
  if (periodMonths <= 1) {
    return `DRE ${start.toLocaleDateString(locale, { month: "long", year: "numeric" })}`;
  }
  const end = new Date(y, (m ?? 1) - 1 + periodMonths - 1, 1);
  const a = start.toLocaleDateString(locale, { month: "short" }).replace(".", "");
  const b = end.toLocaleDateString(locale, { month: "short" }).replace(".", "");
  return `DRE ${a}–${b} ${end.getFullYear()}`;
}

/** Etiqueta corta del período, para el tablero del inicio. */
export function sheetPeriodLabel(sheet: DreSheet, lang: Lang = "es"): string {
  const locale = LOCALE_MAP[lang];
  const [y, m] = sheet.periodStart.split("-").map(Number);
  const start = new Date(y, (m ?? 1) - 1, 1);
  if (sheet.periodMonths <= 1) return start.toLocaleDateString(locale, { month: "long" });
  const end = new Date(y, (m ?? 1) - 1 + sheet.periodMonths - 1, 1);
  const a = start.toLocaleDateString(locale, { month: "short" }).replace(".", "");
  const b = end.toLocaleDateString(locale, { month: "short" }).replace(".", "");
  return `${a}–${b}`;
}

export function currentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export interface SheetPayload {
  data: DREData;
  sources: RevenueSource[];
  customLines: CustomLine[];
}

export async function createSheet(
  userId: string,
  input: { name: string; currency: CurrencyCode; periodMonths: number; periodStart: string } & SheetPayload,
): Promise<DreSheet> {
  const { data, error } = await supabase
    .from("dre_sheets")
    .insert({
      user_id: userId,
      name: input.name,
      currency: input.currency,
      period_months: input.periodMonths,
      period_start: input.periodStart,
      data: input.data,
      revenue_sources: input.sources,
      custom_lines: input.customLines,
    })
    .select(SHEET_COLUMNS)
    .single();
  if (error) throw error;
  return rowToSheet(data as Row);
}

export async function updateSheet(
  id: string,
  patch: Partial<{
    name: string;
    currency: CurrencyCode;
    pinned: boolean;
    data: DREData;
    sources: RevenueSource[];
    customLines: CustomLine[];
    fxNote: FxNote | null;
  }>,
): Promise<DreSheet> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.pinned !== undefined) row.pinned = patch.pinned;
  if (patch.data !== undefined) row.data = patch.data;
  if (patch.sources !== undefined) row.revenue_sources = patch.sources;
  if (patch.customLines !== undefined) row.custom_lines = patch.customLines;
  if (patch.fxNote !== undefined) row.fx_note = patch.fxNote;

  const { data, error } = await supabase.from("dre_sheets").update(row).eq("id", id).select(SHEET_COLUMNS).single();
  if (error) throw error;
  return rowToSheet(data as Row);
}

export async function deleteSheet(id: string): Promise<void> {
  const { error } = await supabase.from("dre_sheets").delete().eq("id", id);
  if (error) throw error;
}

/** Deja una sola planilla fijada. */
export async function pinSheet(userId: string, id: string): Promise<void> {
  const { error: clearErr } = await supabase.from("dre_sheets").update({ pinned: false }).eq("user_id", userId).neq("id", id);
  if (clearErr) throw clearErr;
  const { error } = await supabase.from("dre_sheets").update({ pinned: true }).eq("id", id);
  if (error) throw error;
}

export async function unpinSheet(id: string): Promise<void> {
  const { error } = await supabase.from("dre_sheets").update({ pinned: false }).eq("id", id);
  if (error) throw error;
}

/** Multiplica sólo los valores monetarios por la tasa. */
export function convertData(data: DREData, rate: number): DREData {
  const out: DREData = {};
  for (const [key, value] of Object.entries(data)) {
    const n = Number(value) || 0;
    out[key] = NON_MONETARY_FIELDS.includes(key) ? n : Math.round(n * rate * 100) / 100;
  }
  return out;
}
