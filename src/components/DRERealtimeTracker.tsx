import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { calculateDRE, type DREData } from "@/lib/dre-questions";
import { DREQuestionnaire } from "./DREQuestionnaire";
import { DashboardResults } from "./DashboardResults";
import { Calendar, CheckCircle2, Lock, Pencil, Plus, BarChart3, ArrowLeft, History } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Cycle {
  id: string;
  label: string;
  status: string;
  created_at: string;
}

interface Entry {
  id: string;
  cycle_id: string;
  week_number: number;
  data: DREData;
  updated_at: string;
}

function sumData(entries: Entry[]): DREData {
  const acc: DREData = {};
  for (const e of entries) {
    for (const [k, v] of Object.entries(e.data ?? {})) {
      if (typeof v === "number") acc[k] = (acc[k] ?? 0) + v;
    }
  }
  return acc;
}

export function DRERealtimeTracker() {
  const { user, isReady } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Array<{ cycle: Cycle; entries: Entry[] }>>([]);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      setLoading(false);
      return;
    }
    void loadActive();
    void loadHistory();
  }, [isReady, user?.id]);

  async function loadActive() {
    setLoading(true);
    const { data: cycles } = await supabase
      .from("dre_realtime_cycles")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1);
    const c = cycles?.[0] ?? null;
    setCycle(c as Cycle | null);
    if (c) {
      const { data: ents } = await supabase
        .from("dre_realtime_entries")
        .select("*")
        .eq("cycle_id", c.id)
        .order("week_number", { ascending: true });
      setEntries((ents ?? []) as unknown as Entry[]);
    } else {
      setEntries([]);
    }
    setLoading(false);
  }

  async function loadHistory() {
    if (!user) return;
    const { data: cycles } = await supabase
      .from("dre_realtime_cycles")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "closed")
      .order("closed_at", { ascending: false });
    if (!cycles || cycles.length === 0) {
      setHistory([]);
      return;
    }
    const ids = cycles.map(c => c.id);
    const { data: ents } = await supabase
      .from("dre_realtime_entries")
      .select("*")
      .in("cycle_id", ids);
    const grouped = (cycles as Cycle[]).map(c => ({
      cycle: c,
      entries: ((ents ?? []) as unknown as Entry[]).filter(e => e.cycle_id === c.id),
    }));
    setHistory(grouped);
  }

  async function startCycle() {
    if (!user) return;
    const label = `${new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })}`;
    const { data, error } = await supabase
      .from("dre_realtime_cycles")
      .insert({ user_id: user.id, label, status: "open" })
      .select()
      .single();
    if (error) return;
    setCycle(data as Cycle);
    setEntries([]);
  }

  async function saveWeek(week: number, formData: DREData) {
    if (!user || !cycle) return;
    setSaving(true);
    const existing = entries.find(e => e.week_number === week);
    if (existing) {
      const { data } = await supabase
        .from("dre_realtime_entries")
        .update({ data: formData })
        .eq("id", existing.id)
        .select()
        .single();
      if (data) setEntries(prev => prev.map(e => e.id === existing.id ? data as unknown as Entry : e));
    } else {
      const { data } = await supabase
        .from("dre_realtime_entries")
        .insert({ cycle_id: cycle.id, user_id: user.id, week_number: week, data: formData })
        .select()
        .single();
      if (data) setEntries(prev => [...prev, data as unknown as Entry].sort((a, b) => a.week_number - b.week_number));
    }
    setSaving(false);
    setEditingWeek(null);
  }

  async function closeCycle() {
    if (!cycle) return;
    if (!confirm("¿Cerrar el mes actual? Podrás iniciar un nuevo ciclo después.")) return;
    await supabase
      .from("dre_realtime_cycles")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", cycle.id);
    setCycle(null);
    setEntries([]);
    setShowResults(false);
    await loadHistory();
  }

  if (!isReady || loading) {
    return <div className="text-center py-12 text-muted-foreground text-sm">Cargando…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center rounded-2xl border border-border bg-card p-8">
        <Lock className="w-10 h-10 mx-auto text-primary mb-3" />
        <h3 className="font-semibold mb-2">Inicia sesión para usar Tiempo Real</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Tus datos semanales se guardan de forma segura en tu cuenta.
        </p>
        <Link to="/login" className="inline-block px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="max-w-md mx-auto text-center rounded-2xl border border-primary/30 bg-primary/5 p-8">
          <Calendar className="w-10 h-10 mx-auto text-primary mb-3" />
          <h3 className="font-semibold mb-2">Comienza tu seguimiento mensual</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Carga tus números semana a semana y mira cómo se acumulan en tiempo real durante el mes.
          </p>
          <button
            onClick={startCycle}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-orange"
          >
            <Plus className="w-4 h-4" /> Iniciar ciclo de Tiempo Real
          </button>
        </div>
        <HistoryList history={history} onView={setViewingHistoryId} />
      </div>
    );
  }

  const accumulated = sumData(entries);
  const completedWeeks = entries.length;

  if (editingWeek !== null) {
    const existing = entries.find(e => e.week_number === editingWeek);
    return (
      <div>
        <button
          onClick={() => setEditingWeek(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al ciclo
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display">Semana {editingWeek}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {existing ? "Edita los números de esta semana" : "Carga los números de esta semana"}
          </p>
        </div>
        <DREQuestionnaire
          initialData={existing?.data ?? {}}
          submitLabelKey="dre.verDashboard"
          onComplete={(data) => void saveWeek(editingWeek, data)}
        />
        {saving && <p className="text-center text-xs text-muted-foreground mt-4">Guardando…</p>}
      </div>
    );
  }

  if (viewingHistoryId) {
    const item = history.find(h => h.cycle.id === viewingHistoryId);
    if (!item) {
      setViewingHistoryId(null);
      return null;
    }
    return (
      <div>
        <button
          onClick={() => setViewingHistoryId(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al histórico
        </button>
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">Mes cerrado</div>
          <h2 className="text-2xl font-bold font-display capitalize">{item.cycle.label}</h2>
        </div>
        <DashboardResults
          results={calculateDRE(sumData(item.entries))}
          onReset={() => setViewingHistoryId(null)}
        />
      </div>
    );
  }

  if (showResults) {
    return (
      <div>
        <button
          onClick={() => setShowResults(false)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al ciclo
        </button>
        <DashboardResults results={calculateDRE(accumulated)} onReset={() => setShowResults(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-1">Ciclo en curso</div>
          <div className="font-semibold capitalize">{cycle.label}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {completedWeeks} de 4 semanas cargadas
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completedWeeks > 0 && (
            <button
              onClick={() => setShowResults(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <BarChart3 className="w-4 h-4" /> Ver acumulado
            </button>
          )}
          <button
            onClick={closeCycle}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            Cerrar mes
          </button>
        </div>
      </div>

      {completedWeeks < 4 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 mb-6 flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-foreground">
            {completedWeeks === 0
              ? "Aún no cargas ninguna semana. Comienza por la Semana 1 para ver tu acumulado."
              : `Falta${4 - completedWeeks === 1 ? "" : "n"} ${4 - completedWeeks} semana${4 - completedWeeks === 1 ? "" : "s"} para cerrar el ciclo del mes.`}
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 mb-6 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span className="text-foreground font-medium">
            ¡Mes completo! Ya puedes cerrar el ciclo y archivarlo en tu histórico.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[1, 2, 3, 4].map(week => {
          const entry = entries.find(e => e.week_number === week);
          const filled = !!entry;
          return (
            <button
              key={week}
              onClick={() => setEditingWeek(week)}
              className={`text-left rounded-xl border p-5 transition-all ${
                filled
                  ? "border-primary/40 bg-card hover:border-primary"
                  : "border-dashed border-border bg-card/50 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Semana {week}</span>
                {filled ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <Plus className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="font-semibold text-sm mb-1">
                {filled ? "Datos cargados" : "Pendiente"}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Pencil className="w-3 h-3" />
                {filled ? "Editar semana" : "Cargar números"}
              </div>
            </button>
          );
        })}
      </div>

      {completedWeeks > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
            Acumulado del mes
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <Stat label="Facturación" value={
              (accumulated.kitchen_gross_sales ?? 0) +
              (accumulated.bar_gross_sales ?? 0) +
              (accumulated.cafeteria_gross_sales ?? 0) +
              (accumulated.events_gross_sales ?? 0)
            } />
            <Stat label="CMV" value={
              (accumulated.kitchen_cmv ?? 0) +
              (accumulated.bar_cmv ?? 0) +
              (accumulated.cafeteria_cmv ?? 0) +
              (accumulated.events_cmv ?? 0)
            } />
            <Stat label="Semanas" value={completedWeeks} suffix=" / 4" plain />
          </div>
        </div>
      )}

      <HistoryList history={history} onView={setViewingHistoryId} />
    </div>
  );
}

function Stat({ label, value, suffix = "", plain = false }: { label: string; value: number; suffix?: string; plain?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold text-foreground">
        {plain ? value : `$${value.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`}{suffix}
      </div>
    </div>
  );
}

function HistoryList({
  history,
  onView,
}: {
  history: Array<{ cycle: Cycle; entries: Entry[] }>;
  onView: (id: string) => void;
}) {
  if (history.length === 0) return null;
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Meses anteriores
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {history.map(({ cycle, entries }) => {
          const acc = sumData(entries);
          const facturacion =
            (acc.kitchen_gross_sales ?? 0) +
            (acc.bar_gross_sales ?? 0) +
            (acc.cafeteria_gross_sales ?? 0) +
            (acc.events_gross_sales ?? 0);
          const cmv =
            (acc.kitchen_cmv ?? 0) +
            (acc.bar_cmv ?? 0) +
            (acc.cafeteria_cmv ?? 0) +
            (acc.events_cmv ?? 0);
          return (
            <button
              key={cycle.id}
              onClick={() => onView(cycle.id)}
              className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold capitalize">{cycle.label}</span>
                <span className="text-xs text-muted-foreground">{entries.length}/4 sem</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Stat label="Facturación" value={facturacion} />
                <Stat label="CMV" value={cmv} />
              </div>
              <div className="text-xs text-primary mt-3 font-medium">Ver dashboard →</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}