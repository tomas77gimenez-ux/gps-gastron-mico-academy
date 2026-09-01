import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";
import { Wallet, Plus, Trash2, Loader2, ArrowDownRight, ArrowUpRight, Lock, History } from "lucide-react";
import { money, num } from "@/lib/tools-format";
import { Callout, Field, KPI, NumberInput, Pill, ToolCard, ToolSectionTitle, inputClass } from "./ToolUI";
import { useI18n, type Lang } from "@/lib/i18n";

const LOCALE: Record<Lang, string> = { es: "es-MX", en: "en-US", pt: "pt-BR" };

interface Session {
  id: string;
  session_date: string;
  responsible: string;
  opening_fund: number;
  physical_count: number | null;
  status: string;
  closed_at: string | null;
}
interface Movement {
  id: string;
  session_id: string;
  occurred_at: string;
  type: string;
  description: string;
  amount: number;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDate(iso: string, lang: Lang) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(LOCALE[lang], { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(iso: string, lang: Lang) {
  return new Date(iso).toLocaleTimeString(LOCALE[lang], { hour: "2-digit", minute: "2-digit" });
}

export function CashControlTool() {
  const { t, lang } = useI18n();
  const { user, isReady } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [openForm, setOpenForm] = useState({ date: today(), responsible: "", fund: "" });
  const [movForm, setMovForm] = useState<{ type: "entrada" | "salida"; description: string; amount: string }>({
    type: "entrada",
    description: "",
    amount: "",
  });
  const [count, setCount] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("cash_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false });
    const all = (data ?? []) as Session[];
    setSessions(all);
    const open = all.find((s) => s.status === "open") ?? null;
    setActive(open);
    setCount(open?.physical_count === null || open?.physical_count === undefined ? "" : String(open.physical_count));
    if (open) {
      const { data: mv } = await supabase
        .from("cash_movements")
        .select("*")
        .eq("session_id", open.id)
        .order("occurred_at", { ascending: true });
      setMovements((mv ?? []) as Movement[]);
    } else {
      setMovements([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!isReady || !user) return;
    void loadAll();
  }, [isReady, user?.id]);

  async function openSession() {
    if (!user) return;
    if (!openForm.responsible.trim()) {
      toast.error(t("caja.errResponsable"));
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("cash_sessions").insert({
      user_id: user.id,
      session_date: openForm.date,
      responsible: openForm.responsible.trim(),
      opening_fund: num(openForm.fund),
      status: "open",
    });
    setBusy(false);
    if (error) {
      toast.error(t("caja.errAbrir"), { description: error.message });
      return;
    }
    setOpenForm({ date: today(), responsible: "", fund: "" });
    toast.success(t("caja.abierta"));
    void loadAll();
  }

  async function addMovement() {
    if (!user || !active) return;
    if (num(movForm.amount) <= 0) {
      toast.error(t("caja.errMonto"));
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("cash_movements").insert({
      user_id: user.id,
      session_id: active.id,
      type: movForm.type,
      description: movForm.description.trim(),
      amount: num(movForm.amount),
    });
    setBusy(false);
    if (error) {
      toast.error(t("caja.errRegistrar"), { description: error.message });
      return;
    }
    setMovForm({ type: movForm.type, description: "", amount: "" });
    void loadAll();
  }

  async function deleteMovement(id: string) {
    await supabase.from("cash_movements").delete().eq("id", id);
    void loadAll();
  }

  async function closeSession() {
    if (!active) return;
    setBusy(true);
    const { error } = await supabase
      .from("cash_sessions")
      .update({
        physical_count: count === "" ? null : num(count),
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", active.id);
    setBusy(false);
    if (error) {
      toast.error(t("caja.errCerrar"), { description: error.message });
      return;
    }
    toast.success(t("caja.cerrada"));
    void loadAll();
  }

  const totals = useMemo(() => {
    const entradas = movements.filter((m) => m.type === "entrada").reduce((a, m) => a + Number(m.amount), 0);
    const salidas = movements.filter((m) => m.type === "salida").reduce((a, m) => a + Number(m.amount), 0);
    const fund = active ? Number(active.opening_fund) : 0;
    const theoretical = fund + entradas - salidas;
    const physical = count === "" ? null : num(count);
    const diff = physical === null ? null : physical - theoretical;
    return { entradas, salidas, fund, theoretical, physical, diff };
  }, [movements, active, count]);

  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {t("caja.cargando")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!active ? (
        <ToolCard className="max-w-xl">
          <ToolSectionTitle icon={Wallet} hint={t("caja.abrirHint")}>
            {t("caja.abrir")}
          </ToolSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label={t("caja.fecha")}>
              <input
                type="date"
                value={openForm.date}
                onChange={(e) => setOpenForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label={t("caja.responsable")}>
              <input
                type="text"
                value={openForm.responsible}
                onChange={(e) => setOpenForm((f) => ({ ...f, responsible: e.target.value }))}
                placeholder={t("caja.nombre")}
                className={inputClass}
              />
            </Field>
            <Field label={t("caja.fondo")}>
              <NumberInput value={openForm.fund} onChange={(v) => setOpenForm((f) => ({ ...f, fund: v }))} placeholder="0" min={0} />
            </Field>
          </div>
          <button
            onClick={openSession}
            disabled={busy}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />} {t("caja.abrir")}
          </button>
        </ToolCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ToolCard>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div>
                  <h3 className="font-display font-semibold text-lg">{t("caja.tituloDia").replace("{date}", fmtDate(active.session_date, lang))}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("caja.responsableLinea").replace("{name}", active.responsible).replace("{amount}", money(Number(active.opening_fund)))}
                  </p>
                </div>
                <Pill tone="primary">{t("caja.pillAbierta")}</Pill>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_8rem_auto] gap-2 items-end">
                <Field label={t("caja.tipo")}>
                  <select
                    value={movForm.type}
                    onChange={(e) => setMovForm((f) => ({ ...f, type: e.target.value as "entrada" | "salida" }))}
                    className={inputClass}
                  >
                    <option value="entrada">{t("caja.entrada")}</option>
                    <option value="salida">{t("caja.salida")}</option>
                  </select>
                </Field>
                <Field label={t("caja.descripcion")}>
                  <input
                    type="text"
                    value={movForm.description}
                    onChange={(e) => setMovForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={t("caja.descripcionPh")}
                    className={inputClass}
                  />
                </Field>
                <Field label={t("caja.monto")}>
                  <NumberInput value={movForm.amount} onChange={(v) => setMovForm((f) => ({ ...f, amount: v }))} placeholder="0" min={0} />
                </Field>
                <button
                  onClick={addMovement}
                  disabled={busy}
                  className="h-[38px] inline-flex items-center justify-center gap-1.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" /> {t("caja.registrar")}
                </button>
              </div>

              <div className="mt-6 divide-y divide-border">
                {movements.map((m) => {
                  const isIn = m.type === "entrada";
                  return (
                    <div key={m.id} className="flex items-center gap-3 py-2.5">
                      <span className="text-xs text-muted-foreground w-12 shrink-0">{fmtTime(m.occurred_at, lang)}</span>
                      <Pill tone={isIn ? "success" : "danger"}>
                        {isIn ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isIn ? t("caja.entrada") : t("caja.salida")}
                      </Pill>
                      <span className="flex-1 text-sm truncate">{m.description || "—"}</span>
                      <span className={`text-sm font-semibold ${isIn ? "text-success" : "text-destructive"}`}>
                        {isIn ? "+" : "−"} {money(Number(m.amount))}
                      </span>
                      <button
                        onClick={() => deleteMovement(m.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        aria-label={t("caja.eliminarMov")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {movements.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">{t("caja.sinMovimientos")}</p>
                )}
              </div>
            </ToolCard>

            <ToolCard>
              <ToolSectionTitle icon={History}>{t("caja.historial")}</ToolSectionTitle>
              <div className="divide-y divide-border">
                {sessions.filter((s) => s.status === "closed").map((s) => {
                  const diff =
                    s.physical_count === null || s.physical_count === undefined ? null : Number(s.physical_count);
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span>{fmtDate(s.session_date, lang)}</span>
                      <span className="text-muted-foreground text-xs truncate flex-1">{s.responsible}</span>
                      <span className="text-muted-foreground text-xs">
                        {diff === null ? t("caja.sinConteo") : t("caja.conteoAmount").replace("{amount}", money(diff))}
                      </span>
                    </div>
                  );
                })}
                {sessions.filter((s) => s.status === "closed").length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">{t("caja.sinCierres")}</p>
                )}
              </div>
            </ToolCard>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 self-start">
            <KPI title={t("caja.teorica")} value={money(totals.theoretical)} subtitle={t("caja.teoricaSub")} icon={Wallet} tone="primary" />
            <div className="grid grid-cols-2 gap-4">
              <KPI title={t("caja.entradas")} value={money(totals.entradas)} tone="success" />
              <KPI title={t("caja.salidas")} value={money(totals.salidas)} tone="danger" />
            </div>

            <ToolCard>
              <ToolSectionTitle>{t("caja.conciliacion")}</ToolSectionTitle>
              <Field label={t("caja.conteoFisico")}>
                <NumberInput value={count} onChange={setCount} placeholder="0" min={0} />
              </Field>
              <div className="mt-4">
                {totals.diff === null ? (
                  <Callout tone="neutral">{t("caja.ingresaConteo")}</Callout>
                ) : Math.abs(totals.diff) < 0.005 ? (
                  <Callout tone="success">{t("caja.conciliada")}</Callout>
                ) : totals.diff > 0 ? (
                  <Callout tone="warning">
                    {t("caja.sobrante").replace("{amount}", money(totals.diff))}
                  </Callout>
                ) : (
                  <Callout tone="danger">
                    {t("caja.faltante").replace("{amount}", money(Math.abs(totals.diff)))}
                  </Callout>
                )}
              </div>
              <button
                onClick={closeSession}
                disabled={busy}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/70 transition-colors disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} {t("caja.cerrar")}
              </button>
            </ToolCard>
          </div>
        </div>
      )}
    </div>
  );
}
