import { useEffect, useState } from "react";
import { Mail, Loader2, RefreshCw, Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchUnannouncedNovedades, KIND_LABEL_ES, type PendingNovedad } from "@/lib/novedades";

export function NovedadesSender() {
  const [items, setItems] = useState<PendingNovedad[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setItems(await fetchUnannouncedNovedades());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function send() {
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Sesión expirada"); return; }
      const res = await fetch("/api/public/novedades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ mode: "manual" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json?.error ?? "No se pudo enviar");
        return;
      }
      if (json.items === 0) toast.info("No hay novedades pendientes para anunciar");
      else toast.success(`Novedades enviadas a ${json.sent} de ${json.recipients} destinatarios`);
      setConfirming(false);
      await load();
    } catch (err) {
      console.error("[novedades] send error", err);
      toast.error("Error al enviar novedades");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-8 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold inline-flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> Novedades por correo
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            El envío automático corre todos los días a las 10:00 ET con el contenido de las últimas 24 h.
            Acá podés enviar ahora todo lo que aún no fue anunciado.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Actualizar
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando pendientes...</p>
        ) : !items || items.length === 0 ? (
          <p className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
            No hay contenido pendiente de anunciar.
          </p>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {items.length} ítem{items.length === 1 ? "" : "s"} se incluirían en el correo
            </p>
            <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                    {KIND_LABEL_ES[item.kind]}
                  </span>
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.pro && (
                    <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[0.6rem] font-bold text-primary">
                      <Crown className="h-3 w-3" /> PRO
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {confirming ? (
              <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
                <p className="text-sm">
                  Se enviará <strong>un correo consolidado</strong> con estos {items.length} ítems a todos los
                  suscriptores activos y usuarios con acceso otorgado que tengan las novedades habilitadas.
                  Los ítems quedarán marcados como anunciados.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => void send()} disabled={sending}>
                    {sending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Mail className="mr-2 h-3.5 w-3.5" />}
                    Confirmar envío
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirming(false)} disabled={sending}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="mt-4" size="sm" onClick={() => setConfirming(true)}>
                <Mail className="mr-2 h-3.5 w-3.5" /> Enviar novedades ahora
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
