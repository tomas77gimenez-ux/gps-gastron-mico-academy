import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useI18n } from "@/lib/i18n";
import { listSheets, type DreSheet } from "@/lib/dre-sheets";
import { calculateDRE } from "@/lib/dre-questions";
import type { CurrencyCode } from "@/lib/dre-currency";
import type { TranslationKey } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* DRE — indicadores del mes                                           */
/* ------------------------------------------------------------------ */

export type DataQualityId = "noExpenses" | "noPersonal" | "noFijos" | "lowCmv" | "highNet";

export interface DataQualitySignal {
  id: DataQualityId;
  /** Valor asociado, redondeado (porcentaje) cuando aplica. */
  value?: number;
}

export interface DreMonthMetrics {
  month: string; // "2026-05"
  label: string; // "mayo"
  labelLong: string; // "mayo 2026"
  /** Moneda de la planilla. */
  currency: CurrencyCode;
  sales: number;
  cmvPct: number;
  personalPct: number;
  netPct: number;
  breakEven: number;
  /** Señales de carga incompleta, de más grave a menos. */
  signals: DataQualitySignal[];
}


const LOCALE_MAP: Record<Lang, string> = { es: "es-AR", en: "en-US", pt: "pt-BR" };

export function monthLabel(month: string, withYear = false, lang: Lang = "es"): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString(LOCALE_MAP[lang], withYear ? { month: "long", year: "numeric" } : { month: "long" });
}
/**
 * Señales de carga incompleta sobre un mes. Conservador: sin ventas no se evalúa nada.
 * Orden del array = gravedad, de mayor a menor.
 */
export function detectSignals(input: {
  sales: number;
  cmvPct: number;
  netPct: number;
  personal: number;
  fijos: number;
  otros: number;
}): DataQualitySignal[] {
  const { sales, cmvPct, netPct, personal, fijos, otros } = input;
  if (sales <= 0) return [];

  const signals: DataQualitySignal[] = [];
  const expensesTotal = personal + fijos + otros;

  if (expensesTotal <= 0) {
    signals.push({ id: "noExpenses" });
  } else {
    if (personal <= 0) signals.push({ id: "noPersonal" });
    if (fijos <= 0) signals.push({ id: "noFijos" });
  }
  if (cmvPct < 20) signals.push({ id: "lowCmv", value: Math.round(cmvPct) });
  if (netPct > 35) signals.push({ id: "highNet", value: Math.round(netPct) });

  return signals;
}


interface DreState {
  loading: boolean;
  /** Ordenados de más antiguo a más reciente. */
  months: DreMonthMetrics[];
}

export function useDreMetrics(): DreState {
  const { isReady, user } = useAuthSession();
  const [state, setState] = useState<DreState>({ loading: true, months: [] });

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      setState({ loading: false, months: [] });
      return;
    }
    let cancelled = false;

    async function load(userId: string) {
      let sheets: DreSheet[] = [];
      try {
        sheets = await listSheets(userId);
      } catch {
        sheets = [];
      }
      if (sheets.length === 0) {
        if (!cancelled) setState({ loading: false, months: [] });
        return;
      }

      // Más antiguas primero; la fijada queda al final para que sea la elegida por defecto.
      const ordered = [...sheets].reverse();
      const pinnedIdx = ordered.findIndex((s) => s.pinned);
      if (pinnedIdx >= 0) {
        const [pinned] = ordered.splice(pinnedIdx, 1);
        ordered.push(pinned);
      }

      const months: DreMonthMetrics[] = ordered.map((sheet) => {
        const r = calculateDRE(sheet.data, sheet.sources, sheet.customLines);
        const sales = r.netRevenue;
        const personal = r.personalTotal;
        const fijos = r.fijosTotal;
        const otros = Math.max(0, r.otrosTotal);
        return {
          month: sheet.id,
          label: sheet.name,
          labelLong: sheet.name,
          currency: sheet.currency,
          sales,
          cmvPct: r.cmvPercent,
          personalPct: sales > 0 ? (personal / sales) * 100 : 0,
          netPct: r.netProfitPercent,
          breakEven: r.breakEvenPoint,
          signals: detectSignals({ sales, cmvPct: r.cmvPercent, netPct: r.netProfitPercent, personal, fijos, otros }),
        };
      });

      if (!cancelled) setState({ loading: false, months });
    }

    void load(user.id);
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  return state;
}

/* ------------------------------------------------------------------ */
/* Progreso — "Donde quedaste" y "Tu ruta"                             */
/* ------------------------------------------------------------------ */

export interface ResumePoint {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  coverUrl: string | null;
  minutesLeft: number | null;
  modulePct: number;
}

export interface RouteCourse {
  id: string;
  title: string;
  lessonCount: number;
  completedCount: number;
  state: "done" | "active" | "pending";
}

interface ProgressState {
  loading: boolean;
  resume: ResumePoint | null;
  route: RouteCourse[];
}

export function useMemberProgress(): ProgressState {
  const { isReady, user } = useAuthSession();
  const [state, setState] = useState<ProgressState>({ loading: true, resume: null, route: [] });

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    async function load(userId: string | null) {
      const [{ data: courses }, { data: lessons }] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, module_number, sort_order")
          .eq("status", "published")
          .order("module_number", { ascending: true })
          .order("sort_order", { ascending: true }),
        supabase.from("lessons").select("id, course_id, title, cover_url, poster_url, duration, sort_order"),
      ]);

      const progressRows = userId
        ? (
            await supabase
              .from("lesson_progress")
              .select("lesson_id, course_id, completed, progress_seconds, duration_seconds, last_watched_at")
              .eq("user_id", userId)
              .order("last_watched_at", { ascending: false })
          ).data ?? []
        : [];

      const lessonList = lessons ?? [];
      const courseList = courses ?? [];

      const completedByCourse = new Map<string, number>();
      for (const p of progressRows) {
        if (p.completed) completedByCourse.set(p.course_id, (completedByCourse.get(p.course_id) ?? 0) + 1);
      }

      const route: RouteCourse[] = courseList.map((c) => {
        const lessonCount = lessonList.filter((l) => l.course_id === c.id).length;
        const completedCount = completedByCourse.get(c.id) ?? 0;
        const st: RouteCourse["state"] =
          lessonCount > 0 && completedCount >= lessonCount ? "done" : completedCount > 0 ? "active" : "pending";
        return { id: c.id, title: c.title, lessonCount, completedCount, state: st };
      });

      // Donde quedaste: última clase vista sin terminar; si no hay, la última vista.
      const latest = progressRows.find((p) => !p.completed) ?? progressRows[0] ?? null;
      let resume: ResumePoint | null = null;
      if (latest) {
        const lesson = lessonList.find((l) => l.id === latest.lesson_id);
        const course = courseList.find((c) => c.id === latest.course_id);
        if (lesson && course) {
          const total = latest.duration_seconds ?? 0;
          const left = total > 0 ? Math.max(0, total - Number(latest.progress_seconds ?? 0)) : null;
          const lessonCount = lessonList.filter((l) => l.course_id === course.id).length;
          const completedCount = completedByCourse.get(course.id) ?? 0;
          resume = {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            courseId: course.id,
            courseTitle: course.title,
            coverUrl: lesson.cover_url ?? lesson.poster_url ?? null,
            minutesLeft: left === null ? null : Math.max(1, Math.round(left / 60)),
            modulePct: lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0,
          };
        }
      }

      if (!cancelled) setState({ loading: false, resume, route });
    }

    void load(user?.id ?? null);
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  return state;
}

/* ------------------------------------------------------------------ */
/* Estado de las herramientas                                          */
/* ------------------------------------------------------------------ */

export type ToolStatusKind = "ok" | "pending" | "late" | "unused";

export interface ToolStatusRow {
  key: string;
  name: string;
  to:
    | "/herramientas/dre"
    | "/herramientas/dre-mensual"
    | "/herramientas/monitor-cmv"
    | "/herramientas/control-caja"
    | "/herramientas/punto-equilibrio"
    | "/herramientas/fichas-tecnicas";
  status: ToolStatusKind;
  detail: string;
}

export function toolStatusLabel(status: ToolStatusKind, t: (key: TranslationKey) => string): string {
  return t(`dash.status.${status}` as TranslationKey);
}

function currentMonthKey(offset = 0): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function useToolsStatus() {
  const { isReady, user } = useAuthSession();
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<ToolStatusRow[] | null>(null);

  const load = useCallback(async (userId: string) => {
    const [dre, cmv, cash, be, dishes, ingredients] = await Promise.all([
      supabase.from("dre_sheets").select("updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1),
      supabase.from("cmv_weeks").select("month, week").eq("user_id", userId).order("month", { ascending: false }),
      supabase.from("cash_sessions").select("session_date, status").eq("user_id", userId).order("session_date", { ascending: false }).limit(1),
      supabase.from("breakeven_inputs").select("updated_at, fixed_costs").eq("user_id", userId).maybeSingle(),
      supabase.from("dishes").select("id").eq("user_id", userId).limit(1),
      supabase.from("ingredients").select("id").eq("user_id", userId).limit(1),
    ]);

    const out: ToolStatusRow[] = [];

    // DRE — planillas guardadas (dre_sheets), la más reciente por updated_at
    const dreName = t("dash.tool.dre");
    const lastUpdated = dre.data?.[0]?.updated_at ?? null;
    const lastDre = lastUpdated ? lastUpdated.slice(0, 7) : null;
    if (!lastDre) {
      out.push({ key: "dre", name: dreName, to: "/herramientas/dre", status: "unused", detail: t("dash.dre.empty") });
    } else if (lastDre === currentMonthKey(0) || lastDre === currentMonthKey(1)) {
      out.push({ key: "dre", name: dreName, to: "/herramientas/dre", status: "ok", detail: t("dash.dre.ok").replace("{month}", monthLabel(lastDre, true, lang)) });
    } else {
      out.push({ key: "dre", name: dreName, to: "/herramientas/dre", status: "late", detail: t("dash.dre.late").replace("{month}", monthLabel(lastDre, true, lang)) });
    }

    // Monitor de CMV — cmv_weeks
    const cmvName = t("dash.tool.cmv");
    const cmvRows = cmv.data ?? [];
    if (cmvRows.length === 0) {
      out.push({ key: "cmv", name: cmvName, to: "/herramientas/monitor-cmv", status: "unused", detail: t("dash.cmv.empty") });
    } else {
      const lastMonth = cmvRows[0].month;
      const weeks = new Set(cmvRows.filter((r) => r.month === lastMonth).map((r) => r.week));
      const missing = [1, 2, 3, 4].filter((w) => !weeks.has(w));
      if (missing.length === 0) {
        out.push({ key: "cmv", name: cmvName, to: "/herramientas/monitor-cmv", status: "ok", detail: t("dash.cmv.ok").replace("{month}", monthLabel(lastMonth, false, lang)) });
      } else {
        out.push({
          key: "cmv",
          name: cmvName,
          to: "/herramientas/monitor-cmv",
          status: "pending",
          detail: t("dash.cmv.pending").replace("{weeks}", missing.join(", ")).replace("{month}", monthLabel(lastMonth, false, lang)),
        });
      }
    }

    // Control de caja — cash_sessions
    const cajaName = t("dash.tool.caja");
    const lastCash = cash.data?.[0] ?? null;
    if (!lastCash) {
      out.push({ key: "caja", name: cajaName, to: "/herramientas/control-caja", status: "unused", detail: t("dash.caja.empty") });
    } else {
      const d = daysSince(lastCash.session_date);
      if (lastCash.status === "open") {
        out.push({ key: "caja", name: cajaName, to: "/herramientas/control-caja", status: "pending", detail: t("dash.caja.pending") });
      } else if (d <= 1) {
        out.push({ key: "caja", name: cajaName, to: "/herramientas/control-caja", status: "ok", detail: t("dash.caja.ok") });
      } else {
        out.push({ key: "caja", name: cajaName, to: "/herramientas/control-caja", status: "late", detail: t("dash.caja.late").replace("{d}", String(d)) });
      }
    }

    // Punto de equilibrio — breakeven_inputs
    const beName = t("dash.tool.be");
    const beRow = be.data ?? null;
    if (!beRow) {
      out.push({ key: "be", name: beName, to: "/herramientas/punto-equilibrio", status: "unused", detail: t("dash.be.empty") });
    } else {
      const d = daysSince(beRow.updated_at);
      out.push(
        d > 90
          ? { key: "be", name: beName, to: "/herramientas/punto-equilibrio", status: "pending", detail: t("dash.be.pending").replace("{d}", String(d)) }
          : { key: "be", name: beName, to: "/herramientas/punto-equilibrio", status: "ok", detail: t("dash.be.ok") },
      );
    }

    // Fichas técnicas — dishes / ingredients
    const fichasName = t("dash.tool.fichas");
    const hasDish = (dishes.data ?? []).length > 0;
    const hasIng = (ingredients.data ?? []).length > 0;
    if (!hasDish && !hasIng) {
      out.push({ key: "fichas", name: fichasName, to: "/herramientas/fichas-tecnicas", status: "unused", detail: t("dash.fichas.empty") });
    } else if (!hasDish) {
      out.push({ key: "fichas", name: fichasName, to: "/herramientas/fichas-tecnicas", status: "pending", detail: t("dash.fichas.pending") });
    } else {
      out.push({ key: "fichas", name: fichasName, to: "/herramientas/fichas-tecnicas", status: "ok", detail: t("dash.fichas.ok") });
    }

    return out;
  }, [t, lang]);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      setRows([]);
      return;
    }
    let cancelled = false;
    void load(user.id).then((r) => {
      if (!cancelled) setRows(r);
    });
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id, load]);

  return { loading: rows === null, rows: rows ?? [] };
}
