import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarClock, Crown, PlayCircle, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { MONTHS_ES, monthLabel, parseMetrics, type ProCase, type ProMetric, type ProRecording, type ProSession } from "@/lib/pro";

const inputClass =
  "w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

const toInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyMetrics: ProMetric[] = [
  { label: "", before: "", after: "" },
  { label: "", before: "", after: "" },
  { label: "", before: "", after: "" },
];

export function SalaProManager() {
  const [section, setSection] = useState<"session" | "recordings" | "cases">("session");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-1 inline-flex items-center gap-2 text-primary">
          <Crown className="h-4 w-4" strokeWidth={1.5} />
          <h2 className="font-display text-lg font-semibold text-foreground">Sala Pro</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Reunión semanal de implementación, archivo de grabaciones y Caso Real del Mes. Solo lo ven los miembros Academy Pro,
          los admins y los usuarios con "Acceso Pro".
        </p>
      </div>

      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-secondary/50 w-fit">
        {([
          ["session", "Reunión semanal", CalendarClock],
          ["recordings", "Grabaciones", PlayCircle],
          ["cases", "Caso del Mes", Sparkles],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all inline-flex items-center gap-2 ${
              section === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {section === "session" && <SessionForm />}
      {section === "recordings" && <RecordingsCrud />}
      {section === "cases" && <CasesCrud />}
    </div>
  );
}

/* --------------------------- Reunión semanal --------------------------- */

function SessionForm() {
  const [row, setRow] = useState<ProSession | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startsAt: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("pro_sessions")
      .select("*")
      .order("starts_at", { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error(error.message);
        const current = (data?.[0] ?? null) as ProSession | null;
        setRow(current);
        if (current) {
          setForm({
            title: current.title,
            description: current.description ?? "",
            startsAt: toInputValue(current.starts_at),
            url: current.meeting_url ?? "",
          });
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      starts_at: new Date(form.startsAt).toISOString(),
      meeting_url: form.url.trim() || null,
      is_active: true,
    };
    const { data, error } = row
      ? await supabase.from("pro_sessions").update(payload).eq("id", row.id).select("*").maybeSingle()
      : await supabase.from("pro_sessions").insert(payload).select("*").maybeSingle();
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    if (data) setRow(data as ProSession);
    toast.success("Reunión guardada. Ya se muestra en la Sala Pro.");
  }

  async function remove() {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase.from("pro_sessions").delete().eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setRow(null);
    setForm({ title: "", description: "", startsAt: "", url: "" });
    toast.success("Reunión eliminada.");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <form onSubmit={save} className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <label className={labelClass}>Título</label>
        <input required className={inputClass} value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Implementación semanal — Control de CMV" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Fecha y hora (ET)</label>
          <input required type="datetime-local" className={inputClass} value={form.startsAt}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Link de la reunión</label>
          <input className={inputClass} value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://zoom.us/j/..." />
        </div>
      </div>
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea rows={3} className={inputClass} value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Qué vamos a implementar en esta sesión" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}><Save className="w-4 h-4 mr-1" /> Guardar</Button>
        {row && (
          <Button type="button" variant="outline" onClick={remove} disabled={saving}>
            <Trash2 className="w-4 h-4 mr-1" /> Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}

/* ---------------------------- Grabaciones ----------------------------- */

function RecordingsCrud() {
  const [rows, setRows] = useState<ProRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", videoId: "", notes: "", attachmentUrl: "", attachmentName: "" });

  async function load() {
    const { data, error } = await supabase.from("pro_recordings").select("*").order("session_date", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as ProRecording[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("pro_recordings").insert({
      title: form.title.trim(),
      session_date: form.date,
      bunny_video_id: form.videoId.trim() || null,
      notes: form.notes.trim() || null,
      attachment_url: form.attachmentUrl.trim() || null,
      attachment_name: form.attachmentName.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    setForm({ title: "", date: "", videoId: "", notes: "", attachmentUrl: "", attachmentName: "" });
    toast.success("Grabación agregada.");
    void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("pro_recordings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Grabación eliminada.");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-medium">Agregar grabación</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Título</label>
            <input required className={inputClass} value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Fecha</label>
            <input required type="date" className={inputClass} value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Bunny Video ID</label>
            <input className={inputClass} value={form.videoId}
              onChange={(e) => setForm((f) => ({ ...f, videoId: e.target.value }))}
              placeholder="GUID del video en Bunny" />
          </div>
          <div>
            <label className={labelClass}>Nombre del adjunto</label>
            <input className={inputClass} value={form.attachmentName}
              onChange={(e) => setForm((f) => ({ ...f, attachmentName: e.target.value }))}
              placeholder="Resumen de la sesión (PDF)" />
          </div>
        </div>
        <div>
          <label className={labelClass}>URL del adjunto</label>
          <input className={inputClass} value={form.attachmentUrl}
            onChange={(e) => setForm((f) => ({ ...f, attachmentUrl: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Notas</label>
          <textarea rows={3} className={inputClass} value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <Button type="submit" disabled={saving}><Plus className="w-4 h-4 mr-1" /> Agregar</Button>
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Cargando...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Todavía no hay grabaciones.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.session_date}{r.bunny_video_id ? " · video cargado" : " · sin video"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => remove(r.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------- Caso Real del Mes -------------------------- */

function CasesCrud() {
  const now = new Date();
  const [rows, setRows] = useState<ProCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    title: "",
    description: "",
    videoId: "",
    attachmentUrl: "",
    attachmentName: "",
    metrics: emptyMetrics,
  });

  async function load() {
    const { data, error } = await supabase
      .from("pro_cases").select("*")
      .order("year", { ascending: false }).order("month", { ascending: false });
    if (error) toast.error(error.message);
    setRows(((data ?? []) as unknown as ProCase[]).map((c) => ({ ...c, metrics: parseMetrics(c.metrics) })));
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const metrics = form.metrics.filter((m) => m.label.trim());
    const { error } = await supabase.from("pro_cases").insert({
      month: form.month,
      year: form.year,
      title: form.title.trim(),
      description: form.description.trim() || null,
      bunny_video_id: form.videoId.trim() || null,
      attachment_url: form.attachmentUrl.trim() || null,
      attachment_name: form.attachmentName.trim() || null,
      metrics: metrics as unknown as never,
    });
    setSaving(false);
    if (error) return toast.error("No se pudo guardar", { description: error.message });
    setForm({ month: now.getMonth() + 1, year: now.getFullYear(), title: "", description: "", videoId: "", attachmentUrl: "", attachmentName: "", metrics: emptyMetrics });
    toast.success("Caso publicado.");
    void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("pro_cases").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Caso eliminado.");
  }

  function setMetric(i: number, patch: Partial<ProMetric>) {
    setForm((f) => ({ ...f, metrics: f.metrics.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) }));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-medium">Publicar Caso Real del Mes</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Mes</label>
            <select className={inputClass} value={form.month}
              onChange={(e) => setForm((f) => ({ ...f, month: Number(e.target.value) }))}>
              {MONTHS_ES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Año</label>
            <input type="number" className={inputClass} value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={labelClass}>Bunny Video ID (opcional)</label>
            <input className={inputClass} value={form.videoId}
              onChange={(e) => setForm((f) => ({ ...f, videoId: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Título</label>
          <input required className={inputClass} value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea rows={3} className={inputClass} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="space-y-3">
          <p className={labelClass}>Números antes / después</p>
          {form.metrics.map((m, i) => (
            <div key={i} className="grid sm:grid-cols-3 gap-2">
              <input className={inputClass} placeholder="Indicador (ej: CMV)" value={m.label}
                onChange={(e) => setMetric(i, { label: e.target.value })} />
              <input className={inputClass} placeholder="Antes (ej: 42%)" value={m.before}
                onChange={(e) => setMetric(i, { before: e.target.value })} />
              <input className={inputClass} placeholder="Después (ej: 33%)" value={m.after}
                onChange={(e) => setMetric(i, { after: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre del PDF</label>
            <input className={inputClass} value={form.attachmentName}
              onChange={(e) => setForm((f) => ({ ...f, attachmentName: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>URL del PDF</label>
            <input className={inputClass} value={form.attachmentUrl}
              onChange={(e) => setForm((f) => ({ ...f, attachmentUrl: e.target.value }))} />
          </div>
        </div>
        <Button type="submit" disabled={saving}><Plus className="w-4 h-4 mr-1" /> Publicar caso</Button>
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Cargando...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Todavía no hay casos publicados.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {monthLabel(c.month, c.year)} · {c.metrics.length} indicadores
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => remove(c.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
