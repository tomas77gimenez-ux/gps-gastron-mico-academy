import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";
import { Calendar, Plus, Trash2, Save, Loader2, Activity, FileSpreadsheet } from "lucide-react";
import { money, num, pct } from "@/lib/tools-format";
import { Bar, Field, NumberInput, ToolCard, ToolSectionTitle, inputClass } from "./ToolUI";
import { useI18n, type Lang, type TranslationKey } from "@/lib/i18n";

const LOCALE: Record<Lang, string> = { es: "es-MX", en: "en-US", pt: "pt-BR" };

type Category = "personal" | "fijos" | "otros";

const CATEGORIES: { key: Category; labelKey: TranslationKey }[] = [
  { key: "personal", labelKey: "dre.catPersonal" },
  { key: "fijos", labelKey: "dre.catFijos" },
  { key: "otros", labelKey: "dre.catOtros" },
];

interface Line {
  description: string;
  amount: string;
}

function monthOptions(lang: Lang): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      value,
      label: d.toLocaleDateString(LOCALE[lang], { month: "long", year: "numeric" }),
    });
  }
  return out;
}

export function MonthlyDreTool() {
  const { t, lang } = useI18n();
  const { user, isReady } = useAuthSession();
  const months = useMemo(() => monthOptions(lang), [lang]);
  const [month, setMonth] = useState(months[0].value);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sales, setSales] = useState("");
  const [cmv, setCmv] = useState("");
  const [lines, setLines] = useState<Record<Category, Line[]>>({ personal: [], fijos: [], otros: [] });

  async function load(m: string) {
    if (!user) return;
    setLoading(true);
    const { data: monthRow } = await supabase
      .from("dre_months")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", m)
      .maybeSingle();

    if (!monthRow) {
      setSales("");
      setCmv("");
      setLines({ personal: [], fijos: [], otros: [] });
      setLoading(false);
      return;
    }
    setSales(String(monthRow.sales ?? ""));
    setCmv(String(monthRow.cmv_purchases ?? ""));
    const { data: exp } = await supabase
      .from("dre_expenses")
      .select("*")
      .eq("dre_month_id", monthRow.id)
      .order("created_at");
    const next: Record<Category, Line[]> = { personal: [], fijos: [], otros: [] };
    for (const e of exp ?? []) {
      const cat = (e.category as Category) ?? "otros";
      if (!next[cat]) continue;
      next[cat].push({ description: e.description ?? "", amount: String(e.amount ?? "") });
    }
    setLines(next);
    setLoading(false);
  }

  useEffect(() => {
    if (!isReady || !user) return;
    void load(month);
  }, [isReady, user?.id, month]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { data: saved, error } = await supabase
      .from("dre_months")
      .upsert(
        { user_id: user.id, month, sales: num(sales), cmv_purchases: num(cmv) },
        { onConflict: "user_id,month" },
      )
      .select("id")
      .single();
    if (error || !saved) {
      setSaving(false);
      toast.error(t("dre.errGuardar"), { description: error?.message });
      return;
    }
    await supabase.from("dre_expenses").delete().eq("dre_month_id", saved.id);
    const rows = CATEGORIES.flatMap(({ key }) =>
      lines[key]
        .filter((l) => l.description.trim() !== "" || num(l.amount) !== 0)
        .map((l) => ({
          user_id: user.id,
          dre_month_id: saved.id,
          category: key,
          description: l.description,
          amount: num(l.amount),
        })),
    );
    if (rows.length > 0) await supabase.from("dre_expenses").insert(rows);
    setSaving(false);
    toast.success(t("dre.guardado"));
  }

  const subtotal = (c: Category) => lines[c].reduce((a, l) => a + num(l.amount), 0);

  const r = useMemo(() => {
    const s = num(sales);
    const c = num(cmv);
    const personal = subtotal("personal");
    const fijos = subtotal("fijos");
    const otros = subtotal("otros");
    const opex = personal + fijos + otros;
    const cmvPct = s > 0 ? (c / s) * 100 : 0;
    const contribution = s - c;
    const contributionPct = s > 0 ? (contribution / s) * 100 : 0;
    const operating = contribution - opex;
    const netPct = s > 0 ? (operating / s) * 100 : 0;
    const cm = 1 - cmvPct / 100;
    return {
      s, c, personal, fijos, otros, opex, cmvPct, contribution, contributionPct, operating, netPct,
      personalPct: s > 0 ? (personal / s) * 100 : 0,
      breakEven: cm > 0 ? opex / cm : 0,
    };
  }, [sales, cmv, lines]);

  const cmvTone = r.cmvPct === 0 ? "neutral" : r.cmvPct >= 28 && r.cmvPct <= 35 ? "success" : r.cmvPct <= 42 ? "warning" : "danger";
  const personalTone = r.personalPct === 0 ? "neutral" : r.personalPct >= 25 && r.personalPct <= 32 ? "success" : r.personalPct <= 38 ? "warning" : "danger";
  const netTone = r.netPct >= 10 ? "success" : r.netPct >= 3 ? "warning" : "danger";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ToolCard>
          <ToolSectionTitle icon={Calendar}>{t("dre.mesReferencia")}</ToolSectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label={t("dre.mes")}>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass}>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>
            <Field label={t("dre.ventasMes")}>
              <NumberInput value={sales} onChange={setSales} placeholder="0" min={0} />
            </Field>
            <Field label={t("dre.cmvCompras")}>
              <NumberInput value={cmv} onChange={setCmv} placeholder="0" min={0} />
            </Field>
          </div>
          {loading && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> {t("dre.cargandoMes")}
            </p>
          )}
        </ToolCard>

        {CATEGORIES.map(({ key, labelKey }) => (
          <ToolCard key={key}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">{t(labelKey)}</h3>
              <button
                onClick={() => setLines((l) => ({ ...l, [key]: [...l[key], { description: "", amount: "" }] }))}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {t("dre.agregarLinea")}
              </button>
            </div>
            <div className="space-y-2">
              {lines[key].map((l, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={l.description}
                    onChange={(e) =>
                      setLines((ls) => ({
                        ...ls,
                        [key]: ls[key].map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)),
                      }))
                    }
                    placeholder={t("dre.concepto")}
                    className={`${inputClass} flex-1`}
                  />
                  <div className="w-32">
                    <NumberInput
                      value={l.amount}
                      onChange={(v) =>
                        setLines((ls) => ({
                          ...ls,
                          [key]: ls[key].map((x, i) => (i === idx ? { ...x, amount: v } : x)),
                        }))
                      }
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <button
                    onClick={() => setLines((ls) => ({ ...ls, [key]: ls[key].filter((_, i) => i !== idx) }))}
                    className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
                    aria-label={t("dre.quitarLinea")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {lines[key].length === 0 && (
                <p className="text-sm text-muted-foreground">{t("dre.sinLineas")}</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("dre.subtotal").replace("{cat}", t(labelKey).toLowerCase())}</span>
              <span className="font-semibold">
                {money(subtotal(key))}
                {r.s > 0 && <span className="text-muted-foreground text-xs ml-2">({pct((subtotal(key) / r.s) * 100)})</span>}
              </span>
            </div>
          </ToolCard>
        ))}

        <button
          onClick={save}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("dre.guardarMes")}
        </button>
      </div>

      <div className="lg:sticky lg:top-24 self-start space-y-4">
        <ToolCard>
          <ToolSectionTitle icon={FileSpreadsheet}>{t("dre.resultadoMes")}</ToolSectionTitle>
          <dl className="space-y-2.5 text-sm">
            <Row label={t("dre.ventas")} value={money(r.s)} strong />
            <Row label={t("dre.cmvLinea").replace("{pct}", pct(r.cmvPct))} value={`− ${money(r.c)}`} />
            <Row label={t("dre.margenContrib").replace("{pct}", pct(r.contributionPct))} value={money(r.contribution)} strong />
            {CATEGORIES.map(({ key, labelKey }) => (
              <Row key={key} label={`− ${t(labelKey)}`} value={`− ${money(subtotal(key))}`} />
            ))}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t("dre.resultadoOperativo")}</span>
                <span className={`font-bold text-lg ${r.operating >= 0 ? "text-success" : "text-destructive"}`}>
                  {money(r.operating)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{t("dre.margenNeto")}</span>
                <span>{pct(r.netPct)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{t("dre.puntoEquilibrio")}</span>
                <span>{money(r.breakEven)}</span>
              </div>
            </div>
          </dl>
        </ToolCard>

        <ToolCard>
          <ToolSectionTitle icon={Activity} hint={t("dre.diagHint")}>
            {t("dre.diagTitulo")}
          </ToolSectionTitle>
          <div className="space-y-4">
            <HealthRow label={t("dre.cmv")} value={r.cmvPct} reference={t("dre.idealCmv")} tone={cmvTone} max={50} />
            <HealthRow label={t("dre.personal")} value={r.personalPct} reference={t("dre.idealPersonal")} tone={personalTone} max={50} />
            <HealthRow label={t("dre.margenNeto")} value={r.netPct} reference={t("dre.idealNeto")} tone={netTone} max={25} />
          </div>
        </ToolCard>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}

function HealthRow({
  label,
  value,
  reference,
  tone,
  max,
}: {
  label: string;
  value: number;
  reference: string;
  tone: "success" | "warning" | "danger" | "neutral";
  max: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-medium">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{reference}</span>
          <span className="font-semibold">{pct(value)}</span>
        </span>
      </div>
      <Bar value={(Math.max(0, value) / max) * 100} tone={tone} />
    </div>
  );
}
