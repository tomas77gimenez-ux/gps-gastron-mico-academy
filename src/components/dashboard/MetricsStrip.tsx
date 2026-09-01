import { Link } from "@tanstack/react-router";
import { FileSpreadsheet } from "lucide-react";
import type { DreMonthMetrics } from "@/hooks/useMemberDashboard";
import { money, pct } from "@/lib/tools-format";

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) {
    return <div className="h-8 text-[0.65rem] text-muted-foreground">Sin histórico todavía</div>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 120;
  const h = 32;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-8 w-full ${className ?? ""}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface MetricDef {
  name: string;
  value: string;
  /** Variación en puntos contra el mes anterior (null si no hay mes previo). */
  deltaPoints: number | null;
  /** true si bajar es mejor (CMV, Personal, Punto de equilibrio). */
  lowerIsBetter: boolean;
  plain: string;
  ideal: string;
  trend: number[];
}

function VariationTag({ deltaPoints, lowerIsBetter }: { deltaPoints: number | null; lowerIsBetter: boolean }) {
  if (deltaPoints === null) {
    return (
      <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
        Primer mes cargado
      </span>
    );
  }
  const abs = Math.abs(deltaPoints);
  if (abs < 0.05) {
    return (
      <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground">
        = Se mantuvo igual
      </span>
    );
  }
  const improved = lowerIsBetter ? deltaPoints < 0 : deltaPoints > 0;
  const arrow = deltaPoints > 0 ? "▲" : "▼";
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[0.7rem] font-semibold ${
        improved ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
      }`}
    >
      {arrow} {improved ? "Mejoró" : "Empeoró"} {abs.toFixed(1)} puntos
    </span>
  );
}

export function MetricsStrip({ months, selected }: { months: DreMonthMetrics[]; selected: DreMonthMetrics }) {
  const idx = months.findIndex((m) => m.month === selected.month);
  const prev = idx > 0 ? months[idx - 1] : null;
  const upTo = months.slice(0, idx + 1);

  const cmvGone = Math.round(selected.cmvPct);
  const personalGone = Math.round(selected.personalPct);

  const metrics: MetricDef[] = [
    {
      name: "CMV",
      value: pct(selected.cmvPct),
      deltaPoints: prev ? selected.cmvPct - prev.cmvPct : null,
      lowerIsBetter: true,
      plain: `De cada $100 que vendés, $${cmvGone} se van en compras`,
      ideal: "Lo ideal es entre 28% y 35%",
      trend: upTo.map((m) => m.cmvPct),
    },
    {
      name: "Personal",
      value: pct(selected.personalPct),
      deltaPoints: prev ? selected.personalPct - prev.personalPct : null,
      lowerIsBetter: true,
      plain: `De cada $100 que vendés, $${personalGone} se van en sueldos`,
      ideal: "Lo ideal es entre 25% y 32%",
      trend: upTo.map((m) => m.personalPct),
    },
    {
      name: "Margen neto",
      value: pct(selected.netPct),
      deltaPoints: prev ? selected.netPct - prev.netPct : null,
      lowerIsBetter: false,
      plain:
        selected.netPct >= 0
          ? `Te quedaron ${money((selected.sales * selected.netPct) / 100)} limpios en el mes`
          : `Perdiste ${money(Math.abs((selected.sales * selected.netPct) / 100))} en el mes`,
      ideal: "Lo ideal es 10% o más",
      trend: upTo.map((m) => m.netPct),
    },
    {
      name: "Punto de equilibrio",
      value: money(selected.breakEven),
      deltaPoints: null,
      lowerIsBetter: true,
      plain:
        selected.sales >= selected.breakEven
          ? `Vendiste ${money(selected.sales - selected.breakEven)} por encima de lo que necesitás para no perder`
          : `Te faltaron ${money(selected.breakEven - selected.sales)} de venta para no perder plata`,
      ideal: "Lo ideal es superarlo antes de la última semana del mes",
      trend: upTo.map((m) => m.breakEven),
    },
  ];

  return (
    <div className="grid grid-cols-1 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.name} className="border-b border-border px-5 py-6 sm:border-r last:sm:border-r-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">{m.name}</p>
          <p className="tabular mt-1.5 font-display text-3xl font-bold text-foreground">{m.value}</p>
          <div className="mt-2">
            <VariationTag deltaPoints={m.deltaPoints} lowerIsBetter={m.lowerIsBetter} />
          </div>
          <p className="mt-3 text-sm text-foreground/80">{m.plain}</p>
          <p className="mt-1 text-xs text-muted-foreground">{m.ideal}</p>
          <div className="mt-3">
            <Sparkline values={m.trend} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyDreBlock() {
  return (
    <div className="border-y border-border px-5 py-10 text-center">
      <FileSpreadsheet className="mx-auto h-6 w-6 text-primary" strokeWidth={1.5} />
      <h2 className="mt-3 font-display text-xl font-semibold">Todavía no cargaste ningún mes</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Cargá tu primer mes en el DRE y acá vas a ver, en lenguaje llano, cuánta ganancia limpia te queda y qué palanca
        mover primero.
      </p>
      <Link
        to="/herramientas/dre"
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Cargar mi primer mes
      </Link>
    </div>
  );
}
