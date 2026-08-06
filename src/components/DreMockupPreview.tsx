import { Activity, FileSpreadsheet } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

const EXPENSES = [
  {
    groupKey: "dreMock.grupoPersonal",
    items: [
      { key: "dreMock.sueldosCocina", value: 6800 },
      { key: "dreMock.sueldosSalon", value: 3900 },
      { key: "dreMock.cargasSociales", value: 2100 },
    ],
  },
  {
    groupKey: "dreMock.grupoFijos",
    items: [
      { key: "dreMock.alquiler", value: 4200 },
      { key: "dreMock.servicios", value: 1450 },
      { key: "dreMock.contabilidad", value: 520 },
    ],
  },
  {
    groupKey: "dreMock.grupoVariables",
    items: [
      { key: "dreMock.delivery", value: 1980 },
      { key: "dreMock.marketing", value: 860 },
      { key: "dreMock.mantenimiento", value: 640 },
    ],
  },
] as const;

const SALES = 48250;
const CMV = 15420;

const groupTotal = (i: number) => EXPENSES[i]!.items.reduce((a, b) => a + b.value, 0);

const personal = groupTotal(0);
const fijos = groupTotal(1);
const otros = groupTotal(2);
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
  const { t } = useI18n();

  return (
    <div className="p-4 sm:p-5 text-xs sm:text-sm" aria-hidden="true">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
            {t("dreMock.kicker")}
          </p>
          <h3 className="font-display font-semibold text-base sm:text-lg">{t("dreMock.titulo")}</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full border border-border text-[10px] text-muted-foreground">
          {t("dreMock.periodo")}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Left: expense entry */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
            <Row label={t("dreMock.ventasMes")} value={money(SALES)} strong />
            <Row label={t("dreMock.cmvCompras")} value={money(CMV)} />
          </div>

          {EXPENSES.map((g, gi) => (
            <div key={g.groupKey} className="rounded-xl border border-border bg-background/50 p-3">
              <p className="font-display font-semibold mb-2">{t(g.groupKey)}</p>
              <div className="space-y-1.5">
                {g.items.map((it) => (
                  <div key={it.key} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground truncate pr-2">{t(it.key)}</span>
                    <span>{money(it.value)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px]">
                <span className="text-muted-foreground">{t("dreMock.subtotal")}</span>
                <span className="font-semibold">{money(groupTotal(gi))}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: results + diagnostic */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold">{t("dreMock.resultadoMes")}</span>
            </div>
            <div className="space-y-2 text-[11px] sm:text-xs">
              <Row label={t("dreMock.ventas")} value={money(SALES)} strong />
              <Row label={`− ${t("dreMock.cmv")} (${pct(cmvPct)})`} value={`− ${money(CMV)}`} />
              <Row
                label={`= ${t("dreMock.margenContribucion")} (${pct((contribution / SALES) * 100)})`}
                value={money(contribution)}
                strong
              />
              <Row label={`− ${t("dreMock.grupoPersonal")}`} value={`− ${money(personal)}`} />
              <Row label={`− ${t("dreMock.grupoFijos")}`} value={`− ${money(fijos)}`} />
              <Row label={`− ${t("dreMock.grupoVariables")}`} value={`− ${money(otros)}`} />
              <div className="pt-2.5 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("dreMock.resultadoOperativo")}</span>
                  <span className="font-bold text-base text-success">{money(operating)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{t("dreMock.margenNeto")}</span>
                  <span>{pct(netPct)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{t("dreMock.puntoEquilibrio")}</span>
                  <span>{money(Math.round((personal + fijos + otros) / (contribution / SALES)))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold">{t("dreMock.diagnostico")}</span>
            </div>
            <div className="space-y-3">
              <HealthRow label={t("dreMock.cmv")} value={cmvPct} reference={`${t("dreMock.ideal")} 28–35%`} tone="success" max={50} />
              <HealthRow label={t("dreMock.grupoPersonal")} value={personalPct} reference={`${t("dreMock.ideal")} 25–32%`} tone="warning" max={50} />
              <HealthRow label={t("dreMock.margenNeto")} value={netPct} reference={`${t("dreMock.ideal")} ≥ 10%`} tone="success" max={25} />
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            {t("dreMock.footer")}
          </p>
        </div>
      </div>
    </div>
  );
}
