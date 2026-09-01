import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Calculator, Users, Percent, Target, TrendingUp, Check, Loader2 } from "lucide-react";
import { money, num, pct } from "@/lib/tools-format";
import { Bar, Callout, Field, KPI, NumberInput, ToolCard, ToolSectionTitle } from "./ToolUI";
import { useI18n } from "@/lib/i18n";

interface Inputs {
  fixed: string;
  cv: string;
  ticket: string;
  days: string;
  sales: string;
}

const localeOf = (lang: "es" | "en" | "pt") => (lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : "es-MX");

const EMPTY: Inputs = { fixed: "", cv: "", ticket: "", days: "30", sales: "" };

export function BreakEvenTool() {
  const { t, lang } = useI18n();
  const { user, isReady } = useAuthSession();
  const [inputs, setInputs] = useState<Inputs>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [ticketUp, setTicketUp] = useState(0);
  const [cvDown, setCvDown] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isReady || !user) return;
    let cancelled = false;
    supabase
      .from("breakeven_inputs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setInputs({
            fixed: String(data.fixed_costs ?? ""),
            cv: String(data.variable_cost_pct ?? ""),
            ticket: String(data.avg_ticket ?? ""),
            days: String(data.operating_days ?? 30),
            sales: data.current_sales === null || data.current_sales === undefined ? "" : String(data.current_sales),
          });
        }
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  // Autoguardado
  useEffect(() => {
    if (!loaded || !user) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from("breakeven_inputs").upsert(
        {
          user_id: user.id,
          fixed_costs: num(inputs.fixed),
          variable_cost_pct: num(inputs.cv),
          avg_ticket: num(inputs.ticket),
          operating_days: num(inputs.days) || 30,
          current_sales: inputs.sales === "" ? null : num(inputs.sales),
        },
        { onConflict: "user_id" },
      );
      setSaving(false);
      setSavedAt(Date.now());
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [inputs, loaded, user?.id]);

  const r = useMemo(() => {
    const fixed = num(inputs.fixed);
    const cv = Math.min(99.9, Math.max(0, num(inputs.cv)));
    const ticket = num(inputs.ticket);
    const days = num(inputs.days) || 30;
    const sales = num(inputs.sales);
    const cm = 1 - cv / 100;
    const pe = cm > 0 ? fixed / cm : 0;
    const clientsMonth = ticket > 0 ? pe / ticket : 0;
    const newCv = Math.max(0, cv - cvDown);
    const newTicket = ticket * (1 + ticketUp / 100);
    const newCm = 1 - newCv / 100;
    const newPe = newCm > 0 ? fixed / newCm : 0;
    return {
      fixed,
      cv,
      ticket,
      days,
      sales,
      pe,
      clientsMonth,
      clientsDay: clientsMonth / days,
      cmPct: cm * 100,
      progress: pe > 0 ? (sales / pe) * 100 : 0,
      gap: pe - sales,
      newPe,
      newCv,
      newTicket,
      newClientsMonth: newTicket > 0 ? newPe / newTicket : 0,
      savings: pe - newPe,
    };
  }, [inputs, ticketUp, cvDown]);

  const set = (k: keyof Inputs) => (v: string) => setInputs((s) => ({ ...s, [k]: v }));
  const above = r.sales > 0 && r.sales >= r.pe;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolCard>
          <ToolSectionTitle icon={Calculator}>{t("pe.tusNumeros")}</ToolSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t("pe.gastosFijos")}>
              <NumberInput value={inputs.fixed} onChange={set("fixed")} placeholder="0" min={0} />
            </Field>
            <Field label={t("pe.costoVariable")} hint={t("pe.costoVariableHint")}>
              <NumberInput value={inputs.cv} onChange={set("cv")} placeholder="0" min={0} />
            </Field>
            <Field label={t("pe.ticketMedio")}>
              <NumberInput value={inputs.ticket} onChange={set("ticket")} placeholder="0" min={0} />
            </Field>
            <Field label={t("pe.diasOperacion")}>
              <NumberInput value={inputs.days} onChange={set("days")} placeholder="30" min={1} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t("pe.ventasActuales")}>
                <NumberInput value={inputs.sales} onChange={set("sales")} placeholder="0" min={0} />
              </Field>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 flex items-center gap-1.5">
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> {t("pe.guardando")}
              </>
            ) : savedAt ? (
              <>
                <Check className="w-3 h-3 text-success" /> {t("pe.guardadoAuto")}
              </>
            ) : (
              t("pe.guardanSolos")
            )}
          </p>
        </ToolCard>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KPI title={t("pe.kpiPe")} value={money(r.pe)} subtitle={t("pe.kpiPeSub")} icon={Target} tone="primary" />
            <KPI title={t("pe.kpiCm")} value={pct(r.cmPct)} subtitle={t("pe.kpiCmSub")} icon={Percent} tone={r.cmPct >= 60 ? "success" : r.cmPct >= 45 ? "warning" : "danger"} />
            <KPI title={t("pe.clientesMes")} value={Math.ceil(r.clientsMonth).toLocaleString(localeOf(lang))} icon={Users} tone="neutral" />
            <KPI title={t("pe.clientesDia")} value={Math.ceil(r.clientsDay).toLocaleString(localeOf(lang))} icon={Users} tone="neutral" />
          </div>

          <ToolCard>
            <ToolSectionTitle>{t("pe.ventasVsPe")}</ToolSectionTitle>
            <Bar value={r.progress} tone={above ? "success" : "danger"} />
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-muted-foreground">{money(r.sales)} de {money(r.pe)}</span>
              <span className={above ? "text-success font-semibold" : "text-destructive font-semibold"}>
                {r.pe <= 0
                  ? t("pe.completaDatos")
                  : above
                    ? t("pe.sobrePe").replace("{pct}", pct(r.progress - 100))
                    : t("pe.faltan").replace("{amount}", money(Math.max(0, r.gap)))}
              </span>
            </div>
          </ToolCard>
        </div>
      </div>

      <ToolCard>
        <ToolSectionTitle icon={TrendingUp} hint={t("pe.simuladorHint")}>
          {t("pe.simulador")}
        </ToolSectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">{t("pe.aumentoTicket")}</span>
                <span className="text-primary-text font-semibold">+{ticketUp}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={ticketUp}
                onChange={(e) => setTicketUp(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label={t("pe.aumentoTicket")}
              />
              <p className="text-xs text-muted-foreground mt-1">{t("pe.nuevoTicket").replace("{amount}", money(r.newTicket))}</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">{t("pe.reduccionCv")}</span>
                <span className="text-primary-text font-semibold">−{cvDown} {t("pe.pts")}</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={1}
                value={cvDown}
                onChange={(e) => setCvDown(Number(e.target.value))}
                className="w-full accent-primary"
                aria-label={t("pe.reduccionCv")}
              />
              <p className="text-xs text-muted-foreground mt-1">{t("pe.nuevoCv").replace("{pct}", pct(r.newCv))}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <KPI title={t("pe.nuevoPe")} value={money(r.newPe)} tone="success" />
              <KPI title={t("pe.clientesMes")} value={Math.ceil(r.newClientsMonth).toLocaleString(localeOf(lang))} tone="neutral" />
            </div>
            <Callout tone={r.savings > 0 ? "success" : "neutral"}>
              {r.savings > 0
                ? t("pe.ahorro").replace("{amount}", money(r.savings))
                : t("pe.movePalancas")}
            </Callout>
          </div>
        </div>
      </ToolCard>
    </div>
  );
}
