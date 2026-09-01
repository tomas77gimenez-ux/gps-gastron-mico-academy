import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

/* ------------------------------------------------------------------ */
/* DRE — indicadores del mes                                           */
/* ------------------------------------------------------------------ */

export interface DreMonthMetrics {
  month: string; // "2026-05"
  label: string; // "mayo"
  labelLong: string; // "mayo 2026"
  sales: number;
  cmvPct: number;
  personalPct: number;
  netPct: number;
  breakEven: number;
}

export function monthLabel(month: string, withYear = false): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("es-AR", withYear ? { month: "long", year: "numeric" } : { month: "long" });
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
      const { data: monthRows } = await supabase
        .from("dre_months")
        .select("id, month, sales, cmv_purchases")
        .eq("user_id", userId)
        .order("month", { ascending: true });

      const rows = monthRows ?? [];
      if (rows.length === 0) {
        if (!cancelled) setState({ loading: false, months: [] });
        return;
      }

      const { data: expenses } = await supabase
        .from("dre_expenses")
        .select("dre_month_id, category, amount")
        .in("dre_month_id", rows.map((r) => r.id));

      const byMonth = new Map<string, { personal: number; opex: number }>();
      for (const e of expenses ?? []) {
        const acc = byMonth.get(e.dre_month_id) ?? { personal: 0, opex: 0 };
        const amount = Number(e.amount ?? 0);
        acc.opex += amount;
        if (e.category === "personal") acc.personal += amount;
        byMonth.set(e.dre_month_id, acc);
      }

      const months: DreMonthMetrics[] = rows.map((r) => {
        const sales = Number(r.sales ?? 0);
        const cmv = Number(r.cmv_purchases ?? 0);
        const { personal, opex } = byMonth.get(r.id) ?? { personal: 0, opex: 0 };
        const cmvPct = sales > 0 ? (cmv / sales) * 100 : 0;
        const contributionRatio = 1 - cmvPct / 100;
        return {
          month: r.month,
          label: monthLabel(r.month),
          labelLong: monthLabel(r.month, true),
          sales,
          cmvPct,
          personalPct: sales > 0 ? (personal / sales) * 100 : 0,
          netPct: sales > 0 ? ((sales - cmv - opex) / sales) * 100 : 0,
          breakEven: contributionRatio > 0 ? opex / contributionRatio : 0,
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
    | "/herramientas/dre-mensual"
    | "/herramientas/monitor-cmv"
    | "/herramientas/control-caja"
    | "/herramientas/punto-equilibrio"
    | "/herramientas/fichas-tecnicas";
  status: ToolStatusKind;
  detail: string;
}

export const TOOL_STATUS_LABEL: Record<ToolStatusKind, string> = {
  ok: "Al día",
  pending: "Falta cargar",
  late: "Atrasado",
  unused: "Sin usar",
};

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
  const [rows, setRows] = useState<ToolStatusRow[] | null>(null);

  const load = useCallback(async (userId: string) => {
    const [dre, cmv, cash, be, dishes, ingredients] = await Promise.all([
      supabase.from("dre_months").select("month").eq("user_id", userId).order("month", { ascending: false }).limit(1),
      supabase.from("cmv_weeks").select("month, week").eq("user_id", userId).order("month", { ascending: false }),
      supabase.from("cash_sessions").select("session_date, status").eq("user_id", userId).order("session_date", { ascending: false }).limit(1),
      supabase.from("breakeven_inputs").select("updated_at, fixed_costs").eq("user_id", userId).maybeSingle(),
      supabase.from("dishes").select("id").eq("user_id", userId).limit(1),
      supabase.from("ingredients").select("id").eq("user_id", userId).limit(1),
    ]);

    const out: ToolStatusRow[] = [];

    // DRE mensual — dre_months
    const lastDre = dre.data?.[0]?.month ?? null;
    if (!lastDre) {
      out.push({ key: "dre", name: "DRE mensual", to: "/herramientas/dre-mensual", status: "unused", detail: "Todavía no cargaste ningún mes" });
    } else if (lastDre === currentMonthKey(0) || lastDre === currentMonthKey(1)) {
      out.push({ key: "dre", name: "DRE mensual", to: "/herramientas/dre-mensual", status: "ok", detail: `Último mes cargado: ${monthLabel(lastDre, true)}` });
    } else {
      out.push({ key: "dre", name: "DRE mensual", to: "/herramientas/dre-mensual", status: "late", detail: `El último mes cargado es ${monthLabel(lastDre, true)}` });
    }

    // Monitor de CMV — cmv_weeks
    const cmvRows = cmv.data ?? [];
    if (cmvRows.length === 0) {
      out.push({ key: "cmv", name: "Monitor de CMV", to: "/herramientas/monitor-cmv", status: "unused", detail: "Todavía no cargaste ninguna semana" });
    } else {
      const lastMonth = cmvRows[0].month;
      const weeks = new Set(cmvRows.filter((r) => r.month === lastMonth).map((r) => r.week));
      const missing = [1, 2, 3, 4].filter((w) => !weeks.has(w));
      if (missing.length === 0) {
        out.push({ key: "cmv", name: "Monitor de CMV", to: "/herramientas/monitor-cmv", status: "ok", detail: `Las 4 semanas de ${monthLabel(lastMonth)} están cargadas` });
      } else {
        out.push({
          key: "cmv",
          name: "Monitor de CMV",
          to: "/herramientas/monitor-cmv",
          status: "pending",
          detail: `No cargaste la semana ${missing.join(", ")} de ${monthLabel(lastMonth)}`,
        });
      }
    }

    // Control de caja — cash_sessions
    const lastCash = cash.data?.[0] ?? null;
    if (!lastCash) {
      out.push({ key: "caja", name: "Control de caja", to: "/herramientas/control-caja", status: "unused", detail: "Todavía no abriste ninguna caja" });
    } else {
      const d = daysSince(lastCash.session_date);
      if (lastCash.status === "open") {
        out.push({ key: "caja", name: "Control de caja", to: "/herramientas/control-caja", status: "pending", detail: "Tenés una caja abierta sin cerrar" });
      } else if (d <= 1) {
        out.push({ key: "caja", name: "Control de caja", to: "/herramientas/control-caja", status: "ok", detail: "Caja cerrada al día" });
      } else {
        out.push({ key: "caja", name: "Control de caja", to: "/herramientas/control-caja", status: "late", detail: `Sin movimientos hace ${d} días` });
      }
    }

    // Punto de equilibrio — breakeven_inputs
    const beRow = be.data ?? null;
    if (!beRow) {
      out.push({ key: "be", name: "Punto de equilibrio", to: "/herramientas/punto-equilibrio", status: "unused", detail: "Todavía no calculaste tu punto de equilibrio" });
    } else {
      const d = daysSince(beRow.updated_at);
      out.push(
        d > 90
          ? { key: "be", name: "Punto de equilibrio", to: "/herramientas/punto-equilibrio", status: "pending", detail: `Sin actualizar hace ${d} días` }
          : { key: "be", name: "Punto de equilibrio", to: "/herramientas/punto-equilibrio", status: "ok", detail: "Cálculo actualizado" },
      );
    }

    // Fichas técnicas — dishes / ingredients
    const hasDish = (dishes.data ?? []).length > 0;
    const hasIng = (ingredients.data ?? []).length > 0;
    if (!hasDish && !hasIng) {
      out.push({ key: "fichas", name: "Fichas técnicas", to: "/herramientas/fichas-tecnicas", status: "unused", detail: "Todavía no cargaste ingredientes ni platos" });
    } else if (!hasDish) {
      out.push({ key: "fichas", name: "Fichas técnicas", to: "/herramientas/fichas-tecnicas", status: "pending", detail: "Cargaste ingredientes pero ningún plato" });
    } else {
      out.push({ key: "fichas", name: "Fichas técnicas", to: "/herramientas/fichas-tecnicas", status: "ok", detail: "Ingredientes y platos cargados" });
    }

    return out;
  }, []);

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
