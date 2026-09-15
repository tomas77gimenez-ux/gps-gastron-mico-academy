import { useEffect, useMemo, useRef, useState } from "react";
import {
  questionnaireSteps,
  REVENUE_STEP,
  OPTIONAL_SOURCE_KINDS,
  salesFieldId,
  cmvFieldId,
  calculateDRE,
  type CustomLine,
  type DREData,
  type QuestionField,
  type QuestionSection,
  type RevenueSource,
  type SourceKind,
} from "@/lib/dre-questions";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  Plus,
  X,
  ChefHat,
  Wine,
  Coffee,
  PartyPopper,
  Bike,
  Utensils,
  Store,
  Home,
  Zap,
  Users,
  Briefcase,
  Landmark,
  Megaphone,
  Wrench,
  CreditCard,
  ShoppingCart,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/lib/i18n";
import { dreT, refLabel } from "@/lib/dre-i18n";
import {
  currencySymbol,
  formatMoneyAuto,
  formatNumber,
  parseCurrencyAmount,
  sanitizeCurrencyInput,
  toCurrencyInputText,
  type CurrencyCode,
} from "@/lib/dre-currency";

const SECTION_ICONS: Record<string, LucideIcon> = {
  kitchen: ChefHat,
  bar: Wine,
  cafeteria: Coffee,
  events: PartyPopper,
  delivery: Bike,
  catering: Utensils,
  custom: Store,
  rent: Home,
  utilities: Zap,
  payroll: Users,
  providers: Briefcase,
  taxes: Landmark,
  marketing: Megaphone,
  maintenance: Wrench,
  financial: CreditCard,
  purchases: ShoppingCart,
  operation: BarChart3,
};

export interface QuestionnairePayload {
  data: DREData;
  sources: RevenueSource[];
  customLines: CustomLine[];
}

/* ------------------------------------------------------------------ */
/* Piezas                                                             */
/* ------------------------------------------------------------------ */

function HelpTip({ text }: { text: string }) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={dreT("dre.ayuda", lang)}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex shrink-0 items-center text-primary-text transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs whitespace-normal text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function FieldLabel({ label, helpKey, optional }: { label: string; helpKey?: string; optional?: boolean }) {
  const { lang } = useI18n();
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
      {label}
      {optional && <span className="text-xs font-normal text-muted-foreground">({dreT("dre.opcional", lang)})</span>}
      {helpKey && <HelpTip text={dreT(helpKey, lang)} />}
    </span>
  );
}

function MoneyInput({
  value,
  currency,
  onChange,
}: {
  value: number;
  currency: CurrencyCode;
  onChange: (v: number) => void;
}) {
  const [display, setDisplay] = useState(() => toCurrencyInputText(value, currency));
  const lastCurrency = useRef(currency);

  useEffect(() => {
    if (lastCurrency.current !== currency) {
      lastCurrency.current = currency;
      setDisplay(toCurrencyInputText(value, currency));
    }
  }, [currency, value]);

  function handle(raw: string) {
    const cleaned = sanitizeCurrencyInput(raw, currency);
    setDisplay(cleaned);
    onChange(parseCurrencyAmount(cleaned, currency));
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencySymbol(currency)}</span>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={(e) => handle(e.target.value)}
        placeholder="0"
        className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    </div>
  );
}

function PlainNumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(value > 0 ? String(value) : "");
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^0-9]/g, "");
        setDisplay(cleaned);
        onChange(cleaned === "" ? 0 : Number(cleaned));
      }}
      placeholder="0"
      className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
    />
  );
}

function FieldRow({
  field,
  label,
  value,
  currency,
  onChange,
}: {
  field: QuestionField;
  label: string;
  value: number;
  currency: CurrencyCode;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <FieldLabel
        label={label}
        helpKey={field.helpKey ?? (field.help ? `field.${field.id}.help` : undefined)}
        optional={field.optional}
      />
      {field.type === "currency" ? (
        <MoneyInput value={value} currency={currency} onChange={onChange} />
      ) : (
        <PlainNumberInput value={value} onChange={onChange} />
      )}
    </label>
  );
}

function CustomFieldRow({
  line,
  value,
  currency,
  onChangeLabel,
  onChangeValue,
  onRemove,
}: {
  line: CustomLine;
  value: number;
  currency: CurrencyCode;
  onChangeLabel: (label: string) => void;
  onChangeValue: (v: number) => void;
  onRemove: () => void;
}) {
  const { lang } = useI18n();
  return (
    <div className="col-span-1 flex items-start gap-2 sm:col-span-2">
      <input
        type="text"
        value={line.label}
        onChange={(e) => onChangeLabel(e.target.value.slice(0, 100))}
        placeholder={dreT("dre.nombreConcepto", lang)}
        className="flex-1 rounded-lg border border-input bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <div className="w-40">
        <MoneyInput value={value} currency={currency} onChange={onChangeValue} />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={dreT("dre.borrar", lang)}
        className="mt-1.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cuestionario                                                        */
/* ------------------------------------------------------------------ */

export function DREQuestionnaire({
  currency,
  initial,
  onChange,
  onComplete,
  submitLabelKey,
}: {
  currency: CurrencyCode;
  initial?: QuestionnairePayload;
  onChange?: (payload: QuestionnairePayload) => void;
  onComplete: (payload: QuestionnairePayload) => void;
  submitLabelKey?: string;
}) {
  const { lang } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<DREData>(initial?.data ?? {});
  const [sources, setSources] = useState<RevenueSource[]>(initial?.sources ?? []);
  const [customLines, setCustomLines] = useState<CustomLine[]>(initial?.customLines ?? []);

  const step = questionnaireSteps[currentStep];
  const isLast = currentStep === questionnaireSteps.length - 1;
  const isFirst = currentStep === 0;

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onChange?.({ data, sources, customLines });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sources, customLines]);

  function updateField(id: string, value: number) {
    setData((prev) => ({ ...prev, [id]: value }));
  }

  function addCustomLine(sectionId: string) {
    setCustomLines((prev) => [...prev, { id: `custom_${sectionId}_${Date.now()}`, sectionId, label: "" }]);
  }

  function removeCustomLine(id: string) {
    setCustomLines((prev) => prev.filter((l) => l.id !== id));
    setData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function addSource(kind: SourceKind) {
    const id = kind === "custom" ? `src_custom_${Date.now()}` : kind;
    if (sources.some((s) => s.id === id)) return;
    setSources((prev) => [...prev, { id, kind, ...(kind === "custom" ? { name: "" } : {}) }]);
  }

  function removeSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setData((prev) => {
      const next = { ...prev };
      delete next[salesFieldId(id)];
      delete next[cmvFieldId(id)];
      return next;
    });
  }

  function renameSource(id: string, name: string) {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }

  const results = useMemo(() => calculateDRE(data, sources, customLines), [data, sources, customLines]);

  function sectionCard(section: QuestionSection, opts?: { title?: string; desc?: string; iconKey?: string; onRemove?: () => void; header?: React.ReactNode }) {
    const Icon = SECTION_ICONS[opts?.iconKey ?? section.id] ?? BarChart3;
    const lines = customLines.filter((l) => l.sectionId === section.id);
    const groups = section.groups ?? [];
    const ungrouped = section.fields.filter((f) => !f.group);

    return (
      <div key={section.id} className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-text" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-semibold">{opts?.title ?? dreT(`section.${section.id}.title`, lang)}</h3>
              <p className="text-xs text-muted-foreground">{opts?.desc ?? dreT(`section.${section.id}.desc`, lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {section.reference && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-text">
                {refLabel(section.reference, lang)}
              </span>
            )}
            {opts?.onRemove && (
              <button
                type="button"
                onClick={opts.onRemove}
                aria-label={dreT("dre.borrar", lang)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {opts?.header}

        {groups.length > 0 ? (
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g}>
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-primary-text">{dreT(`group.${g}`, lang)}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {section.fields
                    .filter((f) => f.group === g)
                    .map((f) => (
                      <FieldRow
                        key={f.id}
                        field={f}
                        label={f.label ?? dreT(`field.${f.id}`, lang)}
                        value={data[f.id] ?? 0}
                        currency={currency}
                        onChange={(v) => updateField(f.id, v)}
                      />
                    ))}
                </div>
              </div>
            ))}
            {ungrouped.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ungrouped.map((f) => (
                  <FieldRow
                    key={f.id}
                    field={f}
                    label={f.label ?? dreT(`field.${f.id}`, lang)}
                    value={data[f.id] ?? 0}
                    currency={currency}
                    onChange={(v) => updateField(f.id, v)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map((f) => (
              <FieldRow
                key={f.id}
                field={f}
                label={f.label ?? dreT(`field.${f.id}`, lang)}
                value={data[f.id] ?? 0}
                currency={currency}
                onChange={(v) => updateField(f.id, v)}
              />
            ))}
            {lines.map((l) => (
              <CustomFieldRow
                key={l.id}
                line={l}
                value={data[l.id] ?? 0}
                currency={currency}
                onChangeLabel={(label) => setCustomLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, label } : x)))}
                onChangeValue={(v) => updateField(l.id, v)}
                onRemove={() => removeCustomLine(l.id)}
              />
            ))}
          </div>
        )}

        {section.groups && lines.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {lines.map((l) => (
              <CustomFieldRow
                key={l.id}
                line={l}
                value={data[l.id] ?? 0}
                currency={currency}
                onChangeLabel={(label) => setCustomLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, label } : x)))}
                onChangeValue={(v) => updateField(l.id, v)}
                onRemove={() => removeCustomLine(l.id)}
              />
            ))}
          </div>
        )}

        {section.allowCustom && (
          <button
            type="button"
            onClick={() => addCustomLine(section.id)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary-text"
          >
            <Plus className="h-4 w-4" /> {dreT("dre.otro", lang)}
          </button>
        )}
      </div>
    );
  }

  const calc = [
    { label: dreT("dre.clientesMes", lang), value: results.customersPerMonth === null ? "—" : formatNumber(results.customersPerMonth, currency) },
    { label: dreT("dre.clientesDia", lang), value: results.customersPerDay === null ? "—" : formatNumber(results.customersPerDay, currency) },
    { label: dreT("dre.ventaDia", lang), value: results.salesPerDay === null ? "—" : formatMoneyAuto(results.salesPerDay, currency) },
    {
      label: dreT("dre.clientesEquilibrio", lang),
      value: results.customersForBreakEven === null ? "—" : formatNumber(results.customersForBreakEven, currency),
    },
    { label: dreT("dre.rotacion", lang), value: results.tableTurns === null ? "—" : formatNumber(results.tableTurns, currency, 1) },
  ];

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-3xl">
        {/* Progreso */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {questionnaireSteps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                i === currentStep
                  ? "bg-primary text-primary-foreground"
                  : i < currentStep
                    ? "bg-primary/20 text-primary-text"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < currentStep ? <CheckCircle className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{dreT(`step.${s.id}.title`, lang)}</span>
            </button>
          ))}
        </div>

        <p className="mb-6 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          {dreT("dre.mensualNota", lang)}
        </p>

        {/* Encabezado del paso */}
        <div className="mb-6">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            {dreT(`step.${step.id}.title`, lang)}
            {step.help && <HelpTip text={dreT(`step.${step.id}.help`, lang)} />}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{dreT(`step.${step.id}.subtitle`, lang)}</p>
        </div>

        <div className="space-y-6">
          {step.id === "revenue" ? (
            <>
              {REVENUE_STEP.sections.map((s) => sectionCard(s))}

              {sources.map((s) => {
                const section: QuestionSection = {
                  id: s.id,
                  fields: [
                    {
                      id: salesFieldId(s.id),
                      type: "currency",
                      label: sourceFieldLabel("net_sales", s.kind, lang, s.name),
                      helpKey: "field.kitchen_net_sales.help",
                    },
                    {
                      id: cmvFieldId(s.id),
                      type: "currency",
                      label: sourceFieldLabel("cmv", s.kind, lang, s.name),
                      helpKey: "field.kitchen_cmv.help",
                    },
                  ],
                };
                const title = s.kind === "custom" ? (s.name || dreT("section.custom.title", lang)) : dreT(`section.${s.kind}.title`, lang);
                return (
                  <div key={s.id}>
                    {sectionCard(section, {
                      title,
                      desc: dreT(`section.${s.kind}.desc`, lang),
                      iconKey: s.kind,
                      onRemove: () => removeSource(s.id),
                      header:
                        s.kind === "custom" ? (
                          <input
                            type="text"
                            value={s.name ?? ""}
                            onChange={(e) => renameSource(s.id, e.target.value.slice(0, 60))}
                            placeholder={dreT("dre.nombreFuente", lang)}
                            className="mb-4 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        ) : null,
                    })}
                  </div>
                );
              })}

              <div className="rounded-xl border border-dashed border-border p-5">
                <p className="text-sm font-medium">{dreT("dre.otraFuente", lang)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OPTIONAL_SOURCE_KINDS.map((kind) => {
                    const already = kind !== "custom" && sources.some((s) => s.id === kind);
                    return (
                      <button
                        key={kind}
                        type="button"
                        disabled={already}
                        onClick={() => addSource(kind)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary-text disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" /> {dreT(`section.${kind}.title`, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            step.sections.map((s) =>
              s.id === "operation"
                ? sectionCard(s, {
                    header: null,
                  })
                : sectionCard(s),
            )
          )}

          {step.id === "averages" && (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-wider text-primary-text">
                {dreT("dre.calculados", lang)}
              </p>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {calc.map((c) => (
                  <div key={c.label} className="flex items-center justify-between gap-3 border-b border-border pb-2">
                    <dt className="text-sm text-muted-foreground">{c.label}</dt>
                    <dd className="font-display text-base font-semibold tabular-nums">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Navegación */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => !isFirst && setCurrentStep((s) => s - 1)}
            disabled={isFirst}
            className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> {dreT("dre.anterior", lang)}
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onComplete({ data, sources, customLines }) : setCurrentStep((s) => s + 1))}
            className="glow-orange flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isLast ? dreT(submitLabelKey ?? "dre.verDashboard", lang) : dreT("dre.siguiente", lang)}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
}
