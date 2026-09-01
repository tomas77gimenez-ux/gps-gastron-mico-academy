import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";
import { LineChart, Save, Loader2, Settings2, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { money, num, pct } from "@/lib/tools-format";
import { Callout, Field, KPI, NumberInput, Pill, ToolCard, ToolSectionTitle, inputClass } from "./ToolUI";

interface WeekRow {
  purchases: string;
  sales: string;
}

const WEEKS = [1, 2, 3, 4];

function monthOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
    });
  }
  return out;
}

export function CmvMonitorTool() {
  const { user, isReady } = useAuthSession();
  const months = useMemo(monthOptions, []);
  const [month, setMonth] = useState(months[0].value);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState("32");
  const [tolerance, setTolerance] = useState("3");
  const [rows, setRows] = useState<Record<number, WeekRow>>({
    1: { purchases: "", sales: "" },
    2: { purchases: "", sales: "" },
    3: { purchases: "", sales: "" },
    4: { purchases: "", sales: "" },
  });

  useEffect(() => {
    if (!isReady || !user) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("cmv_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("cmv_weeks").select("*").eq("user_id", user.id).eq("month", month),
    ]).then(([st, wk]) => {
      if (cancelled) return;
      if (st.data) {
        setTarget(String(st.data.target_pct ?? 32));
        setTolerance(String(st.data.tolerance_pts ?? 3));
      }
      const next: Record<number, WeekRow> = {
        1: { purchases: "", sales: "" },
        2: { purchases: "", sales: "" },
        3: { purchases: "", sales: "" },
        4: { purchases: "", sales: "" },
      };
      for (const w of wk.data ?? []) {
        if (next[w.week]) next[w.week] = { purchases: String(w.purchases ?? ""), sales: String(w.sales ?? "") };
      }
      setRows(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id, month]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const meta = num(target) || 32;
    const tol = num(tolerance);
    const [s1, s2] = await Promise.all([
      supabase.from("cmv_settings").upsert(
        { user_id: user.id, target_pct: meta, tolerance_pts: tol },
        { onConflict: "user_id" },
      ),
      supabase.from("cmv_weeks").upsert(
        WEEKS.map((w) => ({
          user_id: user.id,
          month,
          week: w,
          purchases: num(rows[w].purchases),
          sales: num(rows[w].sales),
        })),
        { onConflict: "user_id,month,week" },
      ),
    ]);
    setSaving(false);
    if (s1.error || s2.error) {
      toast.error("No se pudo guardar", { description: s1.error?.message ?? s2.error?.message });
      return;
    }
    toast.success("Monitor guardado");
  }

  const meta = num(target) || 32;
  const tol = num(tolerance);

  const weekly = WEEKS.map((w) => {
    const purchases = num(rows[w].purchases);
    const sales = num(rows[w].sales);
    const cmv = sales > 0 ? (purchases / sales) * 100 : 0;
    const tone: "success" | "warning" | "danger" | "neutral" =
      sales <= 0 ? "neutral" : cmv <= meta ? "success" : cmv <= meta + tol ? "warning" : "danger";
    return { week: w, purchases, sales, cmv, tone };
  });

  const totals = weekly.reduce((a, w) => ({ purchases: a.purchases + w.purchases, sales: a.sales + w.sales }), {
    purchases: 0,
    sales: 0,
  });
  const cmvAcc = totals.sales > 0 ? (totals.purchases / totals.sales) * 100 : 0;
  const deviation = cmvAcc - meta;
  const impact = totals.sales > 0 ? (totals.sales * deviation) / 100 : 0;
  const maxCmv = Math.max(meta + tol + 5, ...weekly.map((w) => w.cmv));

  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Cargando monitor...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToolCard>
        <ToolSectionTitle icon={Settings2}>Configuración</ToolSectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Mes">
            <select value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass}>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Meta de CMV %">
            <NumberInput value={target} onChange={setTarget} placeholder="32" min={1} />
          </Field>
          <Field label="Tolerancia (puntos)">
            <NumberInput value={tolerance} onChange={setTolerance} placeholder="3" min={0} />
          </Field>
        </div>
      </ToolCard>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPI title="CMV acumulado" value={pct(cmvAcc)} subtitle={`Compras ${money(totals.purchases)} · Ventas ${money(totals.sales)}`} icon={LineChart} tone={cmvAcc === 0 ? "neutral" : cmvAcc <= meta ? "success" : cmvAcc <= meta + tol ? "warning" : "danger"} />
        <KPI title="Meta" value={pct(meta)} subtitle={`Tolerancia ± ${tol} pts`} icon={Calendar} tone="primary" />
        <KPI
          title="Desvío"
          value={`${deviation >= 0 ? "+" : ""}${deviation.toFixed(1)} pts`}
          subtitle={deviation > 0 ? "Por encima de la meta" : "Dentro o por debajo de la meta"}
          icon={deviation > tol ? AlertTriangle : CheckCircle2}
          tone={cmvAcc === 0 ? "neutral" : deviation <= 0 ? "success" : deviation <= tol ? "warning" : "danger"}
        />
      </div>

      <ToolCard className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Semana</th>
              <th className="text-left px-4 py-3 font-medium">Compras</th>
              <th className="text-left px-4 py-3 font-medium">Ventas</th>
              <th className="text-right px-4 py-3 font-medium">CMV</th>
              <th className="text-right px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {weekly.map((w) => (
              <tr key={w.week}>
                <td className="px-4 py-3 font-medium whitespace-nowrap">Semana {w.week}</td>
                <td className="px-4 py-3">
                  <NumberInput
                    value={rows[w.week].purchases}
                    onChange={(v) => setRows((r) => ({ ...r, [w.week]: { ...r[w.week], purchases: v } }))}
                    placeholder="0"
                    min={0}
                  />
                </td>
                <td className="px-4 py-3">
                  <NumberInput
                    value={rows[w.week].sales}
                    onChange={(v) => setRows((r) => ({ ...r, [w.week]: { ...r[w.week], sales: v } }))}
                    placeholder="0"
                    min={0}
                  />
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${
                  w.tone === "success" ? "text-success" : w.tone === "warning" ? "text-warning" : w.tone === "danger" ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {w.sales > 0 ? pct(w.cmv) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {w.sales > 0 && (
                    <Pill tone={w.tone}>
                      {w.tone === "success" ? "En meta" : w.tone === "warning" ? "Atención" : "Fuera de meta"}
                    </Pill>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ToolCard>

      <ToolCard>
        <ToolSectionTitle icon={LineChart} hint={`La línea punteada marca la meta de ${pct(meta)}.`}>
          CMV semanal
        </ToolSectionTitle>
        <div className="relative h-52 flex items-end gap-4 pt-4">
          <div
            className="absolute left-0 right-0 border-t border-dashed border-primary/70"
            style={{ bottom: `${(meta / maxCmv) * 100}%` }}
          >
            <span className="absolute -top-5 right-0 text-[10px] text-primary-text">Meta {pct(meta, 0)}</span>
          </div>
          {weekly.map((w) => (
            <div key={w.week} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-xs font-medium">{w.sales > 0 ? pct(w.cmv) : "—"}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  w.tone === "success" ? "bg-success" : w.tone === "warning" ? "bg-warning" : w.tone === "danger" ? "bg-destructive" : "bg-secondary"
                }`}
                style={{ height: `${Math.max(2, Math.min(100, (w.cmv / maxCmv) * 100))}%` }}
              />
              <span className="text-xs text-muted-foreground">S{w.week}</span>
            </div>
          ))}
        </div>
      </ToolCard>

      {totals.sales > 0 && (
        <Callout tone={deviation <= 0 ? "success" : deviation <= tol ? "warning" : "danger"}>
          {deviation <= 0
            ? `Vas dentro de la meta. Cada punto por debajo son ${money(totals.sales / 100)} extra de margen al mes.`
            : `El desvío ya le costó aproximadamente ${money(Math.abs(impact))} este mes. Audite fichas técnicas, proveedores y control de porciones.`}
        </Callout>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar monitor
      </button>
    </div>
  );
}
