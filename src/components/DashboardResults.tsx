import type { ReactNode } from "react";
import {
  CMV_REFERENCE,
  CONTRIBUTION_REFERENCE,
  EXPENSE_SECTIONS,
  type DREResults,
  type StatusInfo,
} from "@/lib/dre-questions";
import { AlertTriangle, BarChart3, CheckCircle, PieChart, Pencil, Target, TrendingDown, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { dreT, refLabel, tChannel, tExpense } from "@/lib/dre-i18n";
import { formatMoney, formatMoneyAuto, type CurrencyCode } from "@/lib/dre-currency";

function pctFmt(v: number, lang: string) {
  const s = v.toFixed(1);
  return `${lang === "en" ? s : s.replace(".", ",")}%`;
}

const STATUS_CLASS: Record<StatusInfo["kind"], string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
};

function StatusPill({ status }: { status: StatusInfo | null }) {
  const { lang } = useI18n();
  if (!status) return null;
  const Icon = status.kind === "success" ? CheckCircle : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[status.kind]}`}>
      <Icon className="h-3 w-3" strokeWidth={2} />
      {dreT(status.key, lang)}
    </span>
  );
}

function KPICard({
  title,
  value,
  subtitle,
  status,
  icon: Icon,
  large,
}: {
  title: string;
  value: string;
  subtitle?: string;
  status?: StatusInfo | null;
  icon: typeof Target;
  large?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <Icon className="h-5 w-5 text-primary-text" strokeWidth={1.5} />
      </div>
      <p className={`font-display font-bold tabular-nums ${large ? "text-3xl" : "text-2xl"}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      {status && (
        <div className="mt-2">
          <StatusPill status={status} />
        </div>
      )}
    </div>
  );
}

export function DashboardResults({
  results,
  currency = "USD",
  onEdit,
  header,
}: {
  results: DREResults;
  currency?: CurrencyCode;
  onEdit: () => void;
  header?: ReactNode;
}) {
  const { lang } = useI18n();
  const fmt = (v: number) => formatMoney(v, currency);
  const p = (v: number) => pctFmt(v, lang);

  const visibleExpenses = results.expensesByCategory.filter((e) => e.value > 0);
  const maxExpense = Math.max(1, ...visibleExpenses.map((e) => e.value));
  const visibleChannels = results.revenueByChannel.filter((c) => c.value > 0);
  const maxRevenue = Math.max(1, ...visibleChannels.map((c) => c.value));

  const editButton = (
    <button
      type="button"
      onClick={onEdit}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <Pencil className="h-4 w-4" strokeWidth={2} /> {dreT("dre.editarDatos", lang)}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold">{dreT("results.titulo", lang)}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary-text">{currency}</span>
          </div>
          {header}
        </div>
        <div className="shrink-0">{editButton}</div>
      </div>

      {/* Tres números principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title={dreT("results.ventaNeta", lang)} value={fmt(results.netRevenue)} icon={TrendingUp} large />
        <KPICard
          title={dreT("results.cmvTotal", lang)}
          value={fmt(results.totalCMV)}
          subtitle={dreT("results.tuPct", lang)
            .replace("{pct}", p(results.cmvPercent))
            .replace("{min}", String(CMV_REFERENCE[0]))
            .replace("{max}", String(CMV_REFERENCE[1]))}
          status={results.cmvStatus}
          icon={PieChart}
          large
        />
        <KPICard
          title={dreT("results.margenContribucion", lang)}
          value={fmt(results.contributionMargin)}
          subtitle={dreT("results.tuPct", lang)
            .replace("{pct}", p(results.contributionMarginPercent))
            .replace("{min}", String(CONTRIBUTION_REFERENCE[0]))
            .replace("{max}", String(CONTRIBUTION_REFERENCE[1]))}
          status={results.contributionStatus}
          icon={Target}
          large
        />
      </div>

      {/* Punto de equilibrio y gastos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KPICard
          title={dreT("results.puntoEquilibrio", lang)}
          value={fmt(results.breakEvenPoint)}
          subtitle={dreT("results.ventaMinima", lang)}
          status={results.breakEvenStatus}
          icon={Target}
        />
        <KPICard
          title={dreT("results.totalGastos", lang)}
          value={fmt(results.totalOPEX)}
          subtitle={p(results.opexPercent)}
          icon={TrendingDown}
        />
      </div>

      {/* Facturación por canal */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <BarChart3 className="h-5 w-5 text-primary-text" strokeWidth={1.5} /> {dreT("results.facturacionCanal", lang)}
        </h3>
        <div className="space-y-4">
          {visibleChannels.map((channel) => (
            <div key={channel.id}>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{channel.customName || tChannel(channel.kind, lang)}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">CMV: {p(channel.cmvPercent)}</span>
                  <span className="font-semibold tabular-nums">{fmt(channel.value)}</span>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(channel.value / maxRevenue) * 100}%` }} />
              </div>
            </div>
          ))}
          {visibleChannels.length === 0 && <p className="text-sm text-muted-foreground">{dreT("results.sinVentas", lang)}</p>}
        </div>
      </div>

      {/* Desglose de gastos */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
          <PieChart className="h-5 w-5 text-primary-text" strokeWidth={1.5} /> {dreT("results.desgloseGastos", lang)}
        </h3>
        <div className="space-y-4">
          {visibleExpenses.map((expense) => (
            <div key={expense.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="w-full shrink-0 text-sm sm:w-44">{tExpense(expense.id, lang)}</div>
              <div className="flex-1">
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary/70 transition-all duration-500" style={{ width: `${(expense.value / maxExpense) * 100}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:w-72 sm:justify-end">
                <span className="text-xs font-semibold text-primary-text">
                  {expense.reference
                    ? dreT("results.tuPct", lang)
                        .replace("{pct}", p(expense.percent))
                        .replace("{min}", String(expense.reference[0]))
                        .replace("{max}", String(expense.reference[1]))
                    : p(expense.percent)}
                </span>
                <StatusPill status={expense.status} />
              </div>
            </div>
          ))}
          {visibleExpenses.length === 0 && <p className="text-sm text-muted-foreground">{dreT("results.sinVentas", lang)}</p>}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-semibold">{dreT("results.totalGastos", lang)}</span>
          <div className="text-right">
            <span className="font-display text-lg font-bold tabular-nums">{fmt(results.totalOPEX)}</span>
            <span className="ml-2 text-sm text-muted-foreground">({p(results.opexPercent)})</span>
          </div>
        </div>
      </div>

      {/* Ganancia */}
      <div
        className={`rounded-xl border p-6 ${
          results.netProfit >= 0 ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
        }`}
      >
        <h3 className="font-display text-lg font-semibold">{dreT("results.ganancia", lang)}</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{dreT("results.gananciaNeta", lang)}</p>
            <p className={`font-display text-2xl font-bold tabular-nums ${results.netProfit >= 0 ? "text-success" : "text-destructive"}`}>
              {fmt(results.netProfit)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{p(results.netProfitPercent)}</p>
            <div className="mt-2">
              <StatusPill status={results.netStatus} />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{dreT("results.ticketMedio", lang)}</p>
            <p className="font-display text-2xl font-bold tabular-nums">
              {results.avgTicket > 0 ? formatMoneyAuto(results.avgTicket, currency) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Referencias del método */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">{dreT("results.referencias", lang)}</h3>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <li className="flex items-center justify-between border-b border-border pb-1.5 text-sm">
            <span>{dreT("results.cmvTotal", lang)}</span>
            <span className="font-semibold text-primary-text">{refLabel(CMV_REFERENCE, lang)}</span>
          </li>
          <li className="flex items-center justify-between border-b border-border pb-1.5 text-sm">
            <span>{dreT("results.margenContribucion", lang)}</span>
            <span className="font-semibold text-primary-text">{refLabel(CONTRIBUTION_REFERENCE, lang)}</span>
          </li>
          {EXPENSE_SECTIONS.filter((s) => s.reference).map((s) => (
            <li key={s.id} className="flex items-center justify-between border-b border-border pb-1.5 text-sm">
              <span>{tExpense(s.id, lang)}</span>
              <span className="font-semibold text-primary-text">{refLabel(s.reference!, lang)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center pb-4">{editButton}</div>
    </div>
  );
}
