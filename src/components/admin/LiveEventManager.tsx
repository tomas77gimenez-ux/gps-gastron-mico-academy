import { useEffect, useState } from "react";
import { Radio, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface LiveEventRow {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  url: string | null;
  is_active: boolean;
}

const toInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputClass =
  "w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

export function LiveEventManager() {
  const [row, setRow] = useState<LiveEventRow | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startsAt: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("live_events")
      .select("id, title, description, starts_at, url, is_active")
      .order("starts_at", { ascending: true })
      .limit(1)
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        const current = data?.[0] ?? null;
        setRow(current);
        if (current) {
          setForm({
            title: current.title,
            description: current.description ?? "",
            startsAt: toInputValue(current.starts_at),
            url: current.url ?? "",
          });
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      starts_at: new Date(form.startsAt).toISOString(),
      url: form.url.trim() || null,
      is_active: true,
    };

    const { data, error: err } = row
      ? await supabase.from("live_events").update(payload).eq("id", row.id).select("id, title, description, starts_at, url, is_active").maybeSingle()
      : await supabase.from("live_events").insert(payload).select("id, title, description, starts_at, url, is_active").maybeSingle();

    if (err) setError(err.message);
    else {
      if (data) setRow(data);
      setMessage("Anuncio guardado. Ya se muestra en Inicio.");
    }
    setSaving(false);
  }

  async function handleClear() {
    if (!row) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    const { error: err } = await supabase.from("live_events").delete().eq("id", row.id);
    if (err) setError(err.message);
    else {
      setRow(null);
      setForm({ title: "", description: "", startsAt: "", url: "" });
      setMessage("Anuncio eliminado. La tarjeta queda oculta.");
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1 inline-flex items-center gap-2 text-primary">
        <Radio className="h-4 w-4" strokeWidth={1.5} />
        <h2 className="font-display text-lg font-semibold text-foreground">Próximo en vivo</h2>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Configurá la masterclass mensual en vivo. Si borrás el anuncio, la tarjeta se oculta de Inicio.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">{message}</div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Título</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Masterclass en vivo: Control de CMV"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Fecha y hora</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={form.startsAt}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Ingresá el horario en hora del Este (ET). Se muestra con la referencia "hora ET".</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <textarea
            className={`${inputClass} min-h-[90px]`}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="De qué vamos a hablar en esta clase en vivo."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Enlace (URL)</label>
          <input
            type="url"
            className={inputClass}
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://meet.google.com/..."
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Guardando..." : "Guardar anuncio"}
          </Button>
          {row && (
            <Button type="button" variant="outline" onClick={handleClear} disabled={saving}>
              <Trash2 className="mr-2 h-4 w-4" /> Borrar anuncio
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
