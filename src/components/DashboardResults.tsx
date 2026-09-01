import { type DREResults } from "@/lib/dre-questions";
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { dreT, tChannel, tExpense } from "@/lib/dre-i18n";

function fmt(v: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
}

function pctFmt(v: number) {
  return `${v.toFixed(1)}%`;
}

function StatusBadge({ value, min, max }: { value: number; min: number; max: number }) {
  const { t } = useI18n();
  const isGood = value >= min && value <= max;
  const isLow = value < min;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
      isGood ? "bg-green-500/15 text-green-400" : isLow ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400"
    }`}>
      {isGood ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {isGood ? t("results.enRango") : isLow ? t("results.bajo") : t("results.alto")}
    </span>
  );
}

function KPICard({ title, value, subtitle, icon: Icon, variant }: {
  title: string; value: string; subtitle?: string; icon: typeof DollarSign; variant: "primary" | "success" | "warning" | "danger"
}) {
  const colors = {
    primary: "border-primary/30 bg-primary/5",
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    danger: "border-red-500/30 bg-red-500/5",
  };
  const iconColors = {
    primary: "text-primary-text",
    success: "text-green-400",
    warning: "text-yellow-400",
    danger: "text-red-400",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Icon className={`w-5 h-5 ${iconColors[variant]}`} />
      </div>
      <p className="text-2xl font-bold font-display">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function DashboardResults({ results, onReset }: { results: DREResults; onReset: () => void }) {
  const { t, lang } = useI18n();
  const maxExpense = Math.max(...results.expensesByCategory.map(e => e.value));
  const maxRevenue = Math.max(...results.revenueByChannel.map(r => r.value));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display">{t("results.titulo")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("results.desc")}</p>
        </div>
        <button onClick={onReset} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">
          {t("results.editar")}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t("results.ventaBruta")} value={fmt(results.grossRevenue)} icon={DollarSign} variant="primary" />
        <KPICard
          title={t("results.cmvTotal")}
          value={fmt(results.totalCMV)}
          subtitle={`${pctFmt(results.cmvPercent)} — ${dreT("results.refCmv", lang)}`}
          icon={PieChart}
          variant={results.cmvPercent <= 32 ? "success" : "danger"}
        />
        <KPICard
          title={t("results.gop")}
          value={fmt(results.grossOperatingProfit)}
          subtitle={pctFmt(results.gopPercent)}
          icon={results.grossOperatingProfit >= 0 ? TrendingUp : TrendingDown}
          variant={results.gopPercent >= 10 ? "success" : results.gopPercent >= 0 ? "warning" : "danger"}
        />
        <KPICard
          title={t("results.puntoEquilibrio")}
          value={fmt(results.breakEvenPoint)}
          subtitle={t("results.ventaMinima")}
          icon={Target}
          variant={results.grossRevenue >= results.breakEvenPoint ? "success" : "danger"}
        />
      </div>

      {/* Revenue by Channel */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-text" /> {t("results.facturacionCanal")}
        </h3>
        <div className="space-y-4">
          {results.revenueByChannel.filter(r => r.value > 0).map((channel) => (
            <div key={channel.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{tChannel(channel.name, lang)}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">CMV: {pctFmt(channel.cmvPercent)}</span>
                  <span className="font-semibold">{fmt(channel.value)}</span>
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${maxRevenue > 0 ? (channel.value / maxRevenue) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
          {results.revenueByChannel.every(r => r.value === 0) && (
            <p className="text-muted-foreground text-sm">{t("results.sinVentas")}</p>
          )}
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary-text" /> {t("results.desgloseGastos")}
        </h3>
        <div className="space-y-3">
          {results.expensesByCategory.filter(e => e.value > 0).map((expense) => {
            const refMatch = expense.reference.match(/(\d+)[/-](\d+)/);
            return (
              <div key={expense.name} className="flex items-center gap-4">
                <div className="w-28 shrink-0 text-sm">{tExpense(expense.name, lang)}</div>
                <div className="flex-1">
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${maxExpense > 0 ? (expense.value / maxExpense) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right text-sm font-medium">{pctFmt(expense.percent)}</div>
                <div className="w-16 text-right text-xs text-muted-foreground">{expense.reference}</div>
                {refMatch && (
                  <div className="w-20">
                    <StatusBadge value={expense.percent} min={parseFloat(refMatch[1])} max={parseFloat(refMatch[2])} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="font-semibold">{t("results.totalOpex")}</span>
          <div className="text-right">
            <span className="font-bold text-lg">{fmt(results.totalOPEX)}</span>
            <span className="text-muted-foreground text-sm ml-2">({pctFmt(results.opexPercent)})</span>
          </div>
        </div>
      </div>

      {/* Profit Summary */}
      <div className={`rounded-xl border p-6 ${results.netProfit >= 0 ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
        <h3 className="font-display font-semibold text-lg mb-2">
          {results.netProfit >= 0 ? "✅" : "🚨"} {t("results.resultadoNeto")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("results.margenContribucion")}</p>
            <p className="text-xl font-bold">{fmt(results.contributionMargin)}</p>
            <p className="text-xs text-muted-foreground">{pctFmt(results.contributionMarginPercent)} — {dreT("results.refMargen", lang)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("results.lucroNeto")}</p>
            <p className={`text-xl font-bold ${results.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {fmt(results.netProfit)}
            </p>
            <p className="text-xs text-muted-foreground">{pctFmt(results.netProfitPercent)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("results.ticketMedio")}</p>
            <p className="text-xl font-bold">{results.avgTicket > 0 ? fmt(results.avgTicket) : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
