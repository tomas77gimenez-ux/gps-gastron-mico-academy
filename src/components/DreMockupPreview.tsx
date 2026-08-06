import { Activity, FileSpreadsheet } from "lucide-react";

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

const EXPENSES: { group: string; items: { label: string; value: number }[] }[] = [
  {
    group: "Personal",
    items: [
      { label: "Sueldos cocina", value: 6800 },
      { label: "Sueldos salón", value: 3900 },
      { label: "Cargas sociales", value: 2100 },
    ],
  },
  {
    group: "Fijos",
    items: [
      { label: "Alquiler", value: 4200 },
      { label: "Servicios (luz, gas, agua)", value: 1450 },
      { label: "Contabilidad", value: 520 },
    ],
  },
  {
    group: "Variables y otros",
    items: [
      { label: "Comisiones delivery", value: 1980 },
      { label: "Marketing", value: 860 },
      { label: "Mantenimiento", value: 640 },
    ],
  },
];

const SALES = 48250;
const CMV = 15420;

const subtotal = (g: string) =>
  EXPENSES.find((e) => e.group === g)!.items.reduce((a, b) => a + b.value, 0);

const personal = subtotal("Personal");
const fijos = subtotal("Fijos");
const otros = subtotal("Variables y otros");
const contribution = SALES - CMV;
const operating = contribution - personal - fijos - otros;

const cmvPct = (CMV / SALES) * 100;
const personalPct = (personal / SALES) * 100;
const netPct = (operating / SALES) * 100;

const pct = (n: number) => `${n.toFixed(1)}%`;

function Bar({ value, tone }: { value: number; tone: "success" | "warning" | "danger" }) {
  const bg =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive";
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${Math.min(100, value)}%` }} />
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
  tone: "success" | "warning" | "danger";
  max: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="font-medium">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground">{reference}</span>
          <span className="font-semibold">{pct(value)}</span>
        </span>
      </div>
      <Bar value={(Math.max(0, value) / max) * 100} tone={tone} />
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

export function DreMockupPreview() {
  return (
    <div className="p-4 sm:p-5 text-xs sm:text-sm" aria-hidden="true">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
            Herramientas · DRE
          </p>
          <h3 className="font-display font-semibold text-base sm:text-lg">Resultado mensual</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full border border-border text-[10px] text-muted-foreground">
          mayo 2026
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Left: expense entry */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
            <Row label="Ventas del mes" value={money(SALES)} strong />
            <Row label="CMV — compras del mes" value={money(CMV)} />
          </div>

          {EXPENSES.map((g) => (
            <div key={g.group} className="rounded-xl border border-border bg-background/50 p-3">
              <p className="font-display font-semibold mb-2">{g.group}</p>
              <div className="space-y-1.5">
                {g.items.map((it) => (
                  <div key={it.label} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground truncate pr-2">{it.label}</span>
                    <span>{money(it.value)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px]">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{money(subtotal(g.group))}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: results + diagnostic */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold">Resultado del mes</span>
            </div>
            <div className="space-y-2 text-[11px] sm:text-xs">
              <Row label="Ventas" value={money(SALES)} strong />
              <Row label={`− CMV (${pct(cmvPct)})`} value={`− ${money(CMV)}`} />
              <Row
                label={`= Margen de contribución (${pct((contribution / SALES) * 100)})`}
                value={money(contribution)}
                strong
              />
              <Row label="− Personal" value={`− ${money(personal)}`} />
              <Row label="− Fijos" value={`− ${money(fijos)}`} />
              <Row label="− Variables y otros" value={`− ${money(otros)}`} />
              <div className="pt-2.5 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Resultado operativo</span>
                  <span className="font-bold text-base text-success">{money(operating)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Margen neto</span>
                  <span>{pct(netPct)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Punto de equilibrio</span>
                  <span>{money(Math.round((personal + fijos + otros) / (contribution / SALES)))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold">Diagnóstico GPS</span>
            </div>
            <div className="space-y-3">
              <HealthRow label="CMV" value={cmvPct} reference="ideal 28–35%" tone="success" max={50} />
              <HealthRow label="Personal" value={personalPct} reference="ideal 25–32%" tone="warning" max={50} />
              <HealthRow label="Margen neto" value={netPct} reference="ideal ≥ 10%" tone="success" max={25} />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Método GPS · Gestión — Procesos — Sostenibilidad
          </p>
        </div>
      </div>
    </div>
  );
}
