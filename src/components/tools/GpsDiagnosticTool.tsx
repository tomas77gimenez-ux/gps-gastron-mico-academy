import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Calendar, Check, Pencil, Pin, PinOff, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { DREQuestionnaire, type QuestionnairePayload } from "@/components/DREQuestionnaire";
import { DashboardResults } from "@/components/DashboardResults";
import { DRERealtimeTracker } from "@/components/DRERealtimeTracker";
import { calculateDRE } from "@/lib/dre-questions";
import { useI18n } from "@/lib/i18n";
import { dreT } from "@/lib/dre-i18n";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  convertData,
  createSheet,
  currentMonthStart,
  defaultSheetName,
  deleteSheet,
  listSheets,
  pinSheet,
  unpinSheet,
  updateSheet,
  type DreSheet,
} from "@/lib/dre-sheets";
import { CURRENCIES, formatNumber, type CurrencyCode } from "@/lib/dre-currency";
import { getFxRate } from "@/lib/fx.functions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Mode = "create" | "edit" | "results";
type SaveState = "idle" | "saving" | "saved";

const PERIOD_MONTHS: Record<string, number> = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };

export function GpsDiagnosticTool() {
  const { t, lang } = useI18n();
  const { isReady, user } = useAuthSession();
  const fxRate = useServerFn(getFxRate);

  const [sheets, setSheets] = useState<DreSheet[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("create");
  const [period, setPeriod] = useState("realtime");
  const [draftCurrency, setDraftCurrency] = useState<CurrencyCode>("USD");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertTo, setConvertTo] = useState<CurrencyCode>("USD");
  const [converting, setConverting] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetSheetId = useRef<string | null>(null);
  const creatingRef = useRef(false);
  const latestPayload = useRef<QuestionnairePayload | null>(null);

  const PERIOD_OPTIONS = [
    { value: "realtime", label: t("period.realtime") },
    { value: "1m", label: t("period.1m") },
    { value: "3m", label: t("period.3m") },
    { value: "6m", label: t("period.6m") },
    { value: "1y", label: t("period.1y") },
  ];

  useEffect(() => {
    if (!isReady || !user) return;
    let cancelled = false;
    void listSheets(user.id)
      .then((rows) => {
        if (cancelled) return;
        setSheets(rows);
        if (rows.length > 0) {
          const pinned = rows.find((r) => r.pinned) ?? rows[0];
          setActiveId(pinned.id);
          setMode("results");
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  const active = useMemo(() => sheets.find((s) => s.id === activeId) ?? null, [sheets, activeId]);

  function replaceSheet(sheet: DreSheet) {
    setSheets((prev) => {
      const rest = prev.filter((s) => s.id !== sheet.id);
      return [sheet, ...rest];
    });
  }

  const persist = useCallback(
    async (payload: QuestionnairePayload) => {
      if (!user) return;
      setSaveState("saving");
      try {
        const id = targetSheetId.current;
        if (id) {
          const s = await updateSheet(id, { data: payload.data, sources: payload.sources, customLines: payload.customLines });
          replaceSheet(s);
        } else if (!creatingRef.current) {
          creatingRef.current = true;
          const periodStart = currentMonthStart();
          const months = PERIOD_MONTHS[period] ?? 1;
          const s = await createSheet(user.id, {
            name: defaultSheetName(periodStart, months, lang),
            currency: draftCurrency,
            periodMonths: months,
            periodStart,
            data: payload.data,
            sources: payload.sources,
            customLines: payload.customLines,
          });
          creatingRef.current = false;
          targetSheetId.current = s.id;
          setActiveId(s.id);
          replaceSheet(s);
        }
        setSaveState("saved");
      } catch {
        creatingRef.current = false;
        setSaveState("idle");
        toast.error(dreT("dre.errorGuardar", lang));
      }
    },
    [user?.id, period, draftCurrency, lang],
  );

  function scheduleSave(payload: QuestionnairePayload) {
    latestPayload.current = payload;
    const hasValue = Object.values(payload.data).some((v) => Number(v) > 0);
    if (!hasValue || !user) return;
    if (timer.current) clearTimeout(timer.current);
    setSaveState("saving");
    timer.current = setTimeout(() => void persist(payload), 1500);
  }

  async function saveNow() {
    if (timer.current) clearTimeout(timer.current);
    const payload = latestPayload.current;
    if (!payload) return;
    await persist(payload);
    toast.success(dreT("dre.guardado", lang));
  }

  function startNew() {
    if (timer.current) clearTimeout(timer.current);
    targetSheetId.current = null;
    latestPayload.current = null;
    creatingRef.current = false;
    setSaveState("idle");
    setActiveId(null);
    setMode("create");
  }

  function openSheet(sheet: DreSheet) {
    if (timer.current) clearTimeout(timer.current);
    targetSheetId.current = null;
    latestPayload.current = null;
    setSaveState("idle");
    setActiveId(sheet.id);
    setMode("results");
  }

  function editSheet(sheet: DreSheet) {
    if (timer.current) clearTimeout(timer.current);
    targetSheetId.current = sheet.id;
    latestPayload.current = { data: sheet.data, sources: sheet.sources, customLines: sheet.customLines };
    setSaveState("idle");
    setActiveId(sheet.id);
    setDraftCurrency(sheet.currency);
    setMode("edit");
  }

  async function commitRename(sheet: DreSheet) {
    const name = renameValue.trim();
    setRenamingId(null);
    if (!name || name === sheet.name) return;
    try {
      replaceSheet(await updateSheet(sheet.id, { name }));
      toast.success(dreT("dre.guardado", lang));
    } catch {
      toast.error(dreT("dre.errorGuardar", lang));
    }
  }

  async function togglePin(sheet: DreSheet) {
    if (!user) return;
    try {
      if (sheet.pinned) await unpinSheet(sheet.id);
      else await pinSheet(user.id, sheet.id);
      setSheets((prev) => prev.map((s) => ({ ...s, pinned: s.id === sheet.id ? !sheet.pinned : false })));
    } catch {
      toast.error(dreT("dre.errorGuardar", lang));
    }
  }

  async function removeSheet(sheet: DreSheet) {
    if (!window.confirm(dreT("dre.borrarConfirm", lang))) return;
    try {
      await deleteSheet(sheet.id);
      const rest = sheets.filter((s) => s.id !== sheet.id);
      setSheets(rest);
      if (activeId === sheet.id) {
        if (rest.length > 0) openSheet(rest[0]);
        else startNew();
      }
    } catch {
      toast.error(dreT("dre.errorGuardar", lang));
    }
  }

  async function doConvert(sheet: DreSheet) {
    if (convertTo === sheet.currency) {
      setConvertOpen(false);
      return;
    }
    setConverting(true);
    try {
      const res = await fxRate({ data: { from: sheet.currency, to: convertTo } });
      const updated = await updateSheet(sheet.id, {
        currency: convertTo,
        data: convertData(sheet.data, res.rate),
        fxNote: { from: sheet.currency, to: convertTo, rate: res.rate, date: res.date },
      });
      replaceSheet(updated);
      setConvertOpen(false);
      toast.success(dreT("dre.convertirOk", lang));
    } catch {
      toast.error(dreT("dre.convertirError", lang));
    } finally {
      setConverting(false);
    }
  }

  /* ---------------- Lista de planillas ---------------- */

  const sheetList = sheets.length > 0 && (
    <div className="mb-6">
      <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">{dreT("dre.planillas", lang)}</p>
      <div className="flex flex-wrap items-center gap-2">
        {sheets.map((s) => {
          const isActive = s.id === activeId && mode !== "create";
          return (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
                isActive ? "border-primary bg-primary/10 text-primary-text" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {renamingId === s.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value.slice(0, 80))}
                  onBlur={() => void commitRename(s)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void commitRename(s);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="w-40 rounded border border-input bg-secondary/60 px-2 py-1 text-sm text-foreground focus:outline-none"
                />
              ) : (
                <button type="button" onClick={() => openSheet(s)} className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {s.name}
                  <span className="text-xs opacity-70">{s.currency}</span>
                </button>
              )}
              <button
                type="button"
                aria-label={dreT("dre.renombrar", lang)}
                title={dreT("dre.renombrar", lang)}
                onClick={() => {
                  setRenamingId(s.id);
                  setRenameValue(s.name);
                }}
                className="rounded p-1 hover:text-primary-text"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={s.pinned ? dreT("dre.fijada", lang) : dreT("dre.fijar", lang)}
                title={s.pinned ? dreT("dre.fijada", lang) : dreT("dre.fijar", lang)}
                onClick={() => void togglePin(s)}
                className={`rounded p-1 ${s.pinned ? "text-primary-text" : "hover:text-primary-text"}`}
              >
                {s.pinned ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                aria-label={dreT("dre.borrar", lang)}
                title={dreT("dre.borrar", lang)}
                onClick={() => void removeSheet(s)}
                className="rounded p-1 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={startNew}
          className={`flex items-center gap-1.5 rounded-lg border border-dashed px-4 py-2 text-sm font-medium transition-all ${
            mode === "create" ? "border-primary bg-primary/10 text-primary-text" : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary-text"
          }`}
        >
          <Plus className="h-3.5 w-3.5" /> {dreT("dre.nuevaPlanilla", lang)}
        </button>
      </div>
    </div>
  );

  const saveBar = (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">
        {saveState === "saving" ? dreT("dre.guardando", lang) : saveState === "saved" ? dreT("dre.guardado", lang) : ""}
      </span>
      <button
        type="button"
        onClick={() => void saveNow()}
        disabled={!user}
        className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary-text disabled:opacity-40"
      >
        <Check className="h-4 w-4" /> {dreT("dre.guardar", lang)}
      </button>
    </div>
  );

  /* ---------------- Render ---------------- */

  if (mode === "results" && active) {
    const results = calculateDRE(active.data, active.sources, active.customLines);
    const inverse = active.fxNote ? 1 / active.fxNote.rate : 0;
    return (
      <TooltipProvider>
        <div>
          {sheetList}
          <DashboardResults
            results={results}
            currency={active.currency}
            onEdit={() => editSheet(active)}
            header={
              <div className="mt-2 space-y-2">
                <p className="font-display text-lg font-semibold text-foreground">{active.name}</p>
                {active.fxNote && (
                  <p className="text-xs text-muted-foreground">
                    {dreT("dre.fxNota", lang)
                      .replace(/\{from\}/g, active.fxNote.from)
                      .replace(/\{to\}/g, active.fxNote.to)
                      .replace("{rate}", formatNumber(inverse, active.fxNote.from, 2))
                      .replace("{date}", new Date(active.fxNote.date).toLocaleDateString())}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setConvertTo(active.currency === "USD" ? "ARS" : "USD");
                          setConvertOpen((o) => !o);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:text-primary-text"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" /> {dreT("dre.convertir", lang)}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs whitespace-normal text-xs">{dreT("dre.convertirTooltip", lang)}</TooltipContent>
                  </Tooltip>
                  <a
                    href="https://www.exchangerate-api.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground underline decoration-dotted hover:text-primary-text"
                  >
                    {dreT("dre.fxAtribucion", lang)}
                  </a>
                </div>
                {convertOpen && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
                    <label className="text-xs text-muted-foreground">{dreT("dre.convertirA", lang)}</label>
                    <select
                      value={convertTo}
                      onChange={(e) => setConvertTo(e.target.value as CurrencyCode)}
                      className="rounded-lg border border-input bg-secondary/60 px-2 py-1.5 text-sm"
                    >
                      {CURRENCIES.filter((c) => c !== active.currency).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={converting}
                      onClick={() => void doConvert(active)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      {dreT("dre.convertirAccion", lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConvertOpen(false)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
                      aria-label={dreT("dre.convertirCancelar", lang)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            }
          />
        </div>
      </TooltipProvider>
    );
  }

  if (mode === "edit" && active) {
    return (
      <div>
        {sheetList}
        {saveBar}
        <DREQuestionnaire
          currency={active.currency}
          initial={{ data: active.data, sources: active.sources, customLines: active.customLines }}
          onChange={scheduleSave}
          submitLabelKey="dre.guardarCambios"
          onComplete={async (payload) => {
            if (timer.current) clearTimeout(timer.current);
            await persist(payload);
            setMode("results");
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {sheetList}

      <div className="mx-auto mb-8 max-w-3xl">
        <label className="mb-3 block text-sm font-medium">{t("dashboard.periodo")}</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                period === opt.value
                  ? "glow-orange border-primary bg-primary/10 text-primary-text"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>

        {period !== "realtime" && (
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium" htmlFor="dre-currency">
              {dreT("dre.moneda", lang)}
            </label>
            <select
              id="dre-currency"
              value={draftCurrency}
              onChange={(e) => setDraftCurrency(e.target.value as CurrencyCode)}
              className="w-full rounded-lg border border-input bg-secondary/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 sm:w-56"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {!user && <p className="mt-2 text-xs text-warning">{dreT("dre.necesitaCuenta", lang)}</p>}
          </div>
        )}
      </div>

      {period === "realtime" ? (
        <DRERealtimeTracker />
      ) : (
        <>
          {saveBar}
          <DREQuestionnaire
            currency={draftCurrency}
            onChange={scheduleSave}
            onComplete={async (payload) => {
              if (timer.current) clearTimeout(timer.current);
              await persist(payload);
              setMode("results");
            }}
          />
        </>
      )}
    </div>
  );
}
