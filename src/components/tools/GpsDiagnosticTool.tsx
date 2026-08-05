import { useState } from "react";
import { DREQuestionnaire } from "@/components/DREQuestionnaire";
import { DashboardResults } from "@/components/DashboardResults";
import { DRERealtimeTracker } from "@/components/DRERealtimeTracker";
import { MonthlyDreTool } from "@/components/tools/MonthlyDreTool";
import { calculateDRE, type DREData, type DREResults } from "@/lib/dre-questions";
import { Plus, X, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Diagnostic {
  id: string;
  label: string;
  period: string;
  results: DREResults;
  formData: DREData;
  createdAt: Date;
}

export function GpsDiagnosticTool() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("realtime");
  const { t } = useI18n();

  const PERIOD_OPTIONS = [
    { value: "realtime", label: t("period.realtime") },
    { value: "1m", label: t("period.1m") },
    { value: "3m", label: t("period.3m") },
    { value: "6m", label: t("period.6m") },
    { value: "1y", label: t("period.1y") },
  ];

  function handleComplete(data: DREData) {
    const id = `diag_${Date.now()}`;
    const periodLabel = PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)?.label ?? selectedPeriod;
    const newDiag: Diagnostic = {
      id,
      label: `DRE ${periodLabel} — ${new Date().toLocaleDateString("es-MX", { month: "short", year: "numeric" })}`,
      period: selectedPeriod,
      results: calculateDRE(data),
      formData: data,
      createdAt: new Date(),
    };
    setDiagnostics((prev) => [...prev, newDiag]);
    setActiveTab(id);
    setIsCreating(false);
  }

  function handleDelete(id: string) {
    setDiagnostics((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (activeTab === id) {
        setActiveTab(next.length > 0 ? next[next.length - 1].id : null);
        if (next.length === 0) setIsCreating(true);
      }
      return next;
    });
  }

  function startNew() {
    setIsCreating(true);
    setActiveTab(null);
  }

  const activeDiag = diagnostics.find((d) => d.id === activeTab);

  return (
    <div>
      {diagnostics.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {diagnostics.map((d) => {
            const periodOpt = PERIOD_OPTIONS.find((p) => p.value === d.period);
            return (
              <button
                key={d.id}
                onClick={() => {
                  setActiveTab(d.id);
                  setIsCreating(false);
                }}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === d.id && !isCreating
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{periodOpt?.label}</span>
                <span className="text-xs opacity-70">
                  {d.createdAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(d.id);
                  }}
                  className="ml-1 p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            );
          })}
          <button
            onClick={startNew}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-dashed transition-all ${
              isCreating
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> {t("dashboard.nuevoDiag")}
          </button>
        </div>
      )}

      {isCreating ? (
        <>
          <div className="max-w-3xl mx-auto mb-8">
            <label className="block text-sm font-medium mb-3">{t("dashboard.periodo")}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedPeriod(opt.value)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedPeriod === opt.value
                      ? "border-primary bg-primary/10 text-primary glow-orange"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {selectedPeriod === "realtime" ? (
            <DRERealtimeTracker />
          ) : selectedPeriod === "1m" ? (
            <MonthlyDreTool />
          ) : (
            <DREQuestionnaire onComplete={handleComplete} />
          )}
        </>
      ) : activeDiag ? (
        <DashboardResults results={activeDiag.results} onReset={startNew} />
      ) : null}
    </div>
  );
}
