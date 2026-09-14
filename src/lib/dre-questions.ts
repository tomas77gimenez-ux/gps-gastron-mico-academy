/* Estructura del cuestionario de DRE (planilla del método GPS) y sus cálculos. */

export type FieldType = "currency" | "number";

export interface QuestionField {
  id: string;
  type: FieldType;
  /** Muestra el ícono "?" con la explicación (clave `field.<id>.help`). */
  help?: boolean;
  /** Agrupación visual dentro de la sección (Marketing). */
  group?: string;
  optional?: boolean;
}

export interface QuestionSection {
  id: string;
  fields: QuestionField[];
  /** Franja de referencia del método, en % de la venta neta. */
  reference?: [number, number];
  /** Subtítulos de grupo, en orden. */
  groups?: string[];
  /** Permite agregar líneas "Otro". */
  allowCustom?: boolean;
}

export interface QuestionStep {
  id: string;
  sections: QuestionSection[];
  /** Muestra el "?" en el título del paso (clave `step.<id>.help`). */
  help?: boolean;
}

/* ------------------------------------------------------------------ */
/* Fuentes de venta                                                    */
/* ------------------------------------------------------------------ */

export const OPTIONAL_SOURCE_KINDS = ["cafeteria", "events", "delivery", "catering", "custom"] as const;
export type SourceKind = (typeof OPTIONAL_SOURCE_KINDS)[number];

export interface RevenueSource {
  id: string;
  kind: SourceKind;
  /** Sólo para `custom`. */
  name?: string;
}

export const FIXED_SOURCES = ["kitchen", "bar"] as const;

export function salesFieldId(sourceId: string): string {
  return `${sourceId}_net_sales`;
}
export function cmvFieldId(sourceId: string): string {
  return `${sourceId}_cmv`;
}

export interface CustomLine {
  id: string;
  sectionId: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/* Pasos                                                              */
/* ------------------------------------------------------------------ */

export const REVENUE_STEP: QuestionStep = {
  id: "revenue",
  sections: [
    {
      id: "kitchen",
      fields: [
        { id: salesFieldId("kitchen"), type: "currency", help: true },
        { id: cmvFieldId("kitchen"), type: "currency", help: true },
      ],
    },
    {
      id: "bar",
      fields: [
        { id: salesFieldId("bar"), type: "currency" },
        { id: cmvFieldId("bar"), type: "currency" },
      ],
    },
  ],
};

export const questionnaireSteps: QuestionStep[] = [
  REVENUE_STEP,
  {
    id: "operating",
    help: true,
    sections: [
      {
        id: "rent",
        reference: [6, 10],
        allowCustom: true,
        fields: [
          { id: "rent_fixed", type: "currency" },
          { id: "rent_insurance", type: "currency" },
          { id: "rent_condo", type: "currency" },
          { id: "rent_property_tax", type: "currency" },
          { id: "rent_storage", type: "currency" },
          { id: "rent_parking", type: "currency" },
        ],
      },
      {
        id: "utilities",
        reference: [4, 6],
        allowCustom: true,
        fields: [
          { id: "electricity", type: "currency" },
          { id: "water", type: "currency" },
          { id: "gas", type: "currency" },
          { id: "internet_phone", type: "currency" },
          { id: "pos_system", type: "currency" },
        ],
      },
      {
        id: "payroll",
        reference: [25, 30],
        allowCustom: true,
        fields: [
          { id: "salaries_kitchen", type: "currency" },
          { id: "salaries_service", type: "currency" },
          { id: "salaries_admin", type: "currency" },
          { id: "salaries_commissions", type: "currency" },
          { id: "salaries_benefits", type: "currency" },
          { id: "staff_meals", type: "currency" },
          { id: "staff_training", type: "currency" },
          { id: "staff_uniforms", type: "currency" },
          { id: "pro_labore", type: "currency", help: true },
        ],
      },
    ],
  },
  {
    id: "operating_more",
    sections: [
      {
        id: "providers",
        reference: [1, 3],
        allowCustom: true,
        fields: [
          { id: "accounting", type: "currency" },
          { id: "legal", type: "currency" },
          { id: "consulting", type: "currency" },
          { id: "cleaning_service", type: "currency" },
          { id: "other_services", type: "currency" },
        ],
      },
      {
        id: "taxes",
        reference: [5, 8],
        allowCustom: true,
        fields: [
          { id: "taxes_municipal", type: "currency" },
          { id: "taxes_licenses", type: "currency" },
          { id: "taxes_other", type: "currency" },
        ],
      },
      {
        id: "marketing",
        reference: [4, 8],
        allowCustom: true,
        groups: ["digital", "print"],
        fields: [
          { id: "marketing_ads", type: "currency", group: "digital" },
          { id: "marketing_agency", type: "currency", group: "digital" },
          { id: "marketing_social", type: "currency", group: "digital" },
          { id: "marketing_branding", type: "currency", group: "digital" },
          { id: "marketing_flyers", type: "currency", group: "print" },
          { id: "marketing_print", type: "currency", group: "print" },
          { id: "marketing_signage", type: "currency", group: "print" },
          { id: "marketing_events", type: "currency" },
        ],
      },
      {
        id: "maintenance",
        allowCustom: true,
        fields: [
          { id: "maintenance_building", type: "currency" },
          { id: "maintenance_equipment", type: "currency" },
        ],
      },
      {
        id: "financial",
        allowCustom: true,
        fields: [
          { id: "bank_fees", type: "currency" },
          { id: "loan_payments", type: "currency" },
          { id: "cc_fees", type: "currency" },
          { id: "delivery_app_fees", type: "currency" },
          { id: "financial_other", type: "currency" },
        ],
      },
      {
        id: "purchases",
        allowCustom: true,
        fields: [
          { id: "supplies_cleaning", type: "currency" },
          { id: "supplies_utensils", type: "currency" },
          { id: "supplies_disposables", type: "currency" },
          { id: "capex_purchases", type: "currency" },
          { id: "supplies_misc", type: "currency" },
        ],
      },
    ],
  },
  {
    id: "averages",
    sections: [
      {
        id: "operation",
        fields: [
          { id: "avg_ticket", type: "currency", help: true },
          { id: "days_open_per_week", type: "number" },
          { id: "total_seats", type: "number", optional: true },
        ],
      },
    ],
  },
];

/** Secciones de gasto operativo, en el orden en que se muestran. */
export const EXPENSE_SECTIONS: QuestionSection[] = questionnaireSteps
  .filter((s) => s.id === "operating" || s.id === "operating_more")
  .flatMap((s) => s.sections);

/** Campos que NO son montos de dinero (no se convierten al cambiar moneda). */
export const NON_MONETARY_FIELDS = ["days_open_per_week", "total_seats"];

/* ------------------------------------------------------------------ */
/* Cálculos                                                           */
/* ------------------------------------------------------------------ */

export interface DREData {
  [key: string]: number;
}

export const WEEKS_PER_MONTH = 4.33;

export type StatusKind = "success" | "warning" | "destructive";

export interface StatusInfo {
  /** Clave de traducción de la pastilla. */
  key: string;
  kind: StatusKind;
  /** Ayuda opcional. */
  hintKey?: string;
}

export interface ChannelResult {
  id: string;
  /** Nombre libre para fuentes personalizadas. */
  customName?: string;
  kind: "kitchen" | "bar" | SourceKind;
  value: number;
  cmv: number;
  cmvPercent: number;
}

export interface ExpenseResult {
  id: string;
  value: number;
  percent: number;
  reference: [number, number] | null;
  status: StatusInfo | null;
}

export interface DREResults {
  netRevenue: number;
  totalCMV: number;
  cmvPercent: number;
  contributionMargin: number;
  contributionMarginPercent: number;
  totalOPEX: number;
  opexPercent: number;
  netProfit: number;
  netProfitPercent: number;
  breakEvenPoint: number;
  avgTicket: number;
  daysOpenPerWeek: number;
  seats: number;
  customersPerMonth: number | null;
  customersPerDay: number | null;
  salesPerDay: number | null;
  customersForBreakEven: number | null;
  tableTurns: number | null;
  revenueByChannel: ChannelResult[];
  expensesByCategory: ExpenseResult[];
  /** Correspondencias para el tablero del inicio. */
  personalTotal: number;
  fijosTotal: number;
  otrosTotal: number;
  cmvStatus: StatusInfo;
  contributionStatus: StatusInfo;
  netStatus: StatusInfo;
  breakEvenStatus: StatusInfo;
}

export function expenseStatus(pct: number, reference: [number, number] | null, sectionId: string): StatusInfo | null {
  if (!reference) return null;
  if (sectionId === "marketing") {
    if (pct < reference[0]) return { key: "status.investLittle", kind: "warning" };
    if (pct <= reference[1]) return { key: "status.onTarget", kind: "success" };
    return { key: "status.checkReturn", kind: "warning" };
  }
  if (pct <= reference[1]) return { key: "status.underControl", kind: "success" };
  return { key: "status.above", kind: "warning", hintKey: "status.reviewExpense" };
}

export function cmvStatus(pct: number): StatusInfo {
  if (pct < 20) return { key: "status.checkData", kind: "warning" };
  if (pct <= 30) return { key: "status.underControl", kind: "success" };
  return { key: "status.above", kind: "warning", hintKey: "status.reviewExpense" };
}

export function contributionStatus(pct: number): StatusInfo {
  return pct >= 70 ? { key: "status.onTarget", kind: "success" } : { key: "status.belowTarget", kind: "warning" };
}

export function netStatus(pct: number): StatusInfo {
  if (pct < 0) return { key: "status.loss", kind: "destructive" };
  if (pct < 10) return { key: "status.belowTarget", kind: "warning" };
  return { key: "status.onTarget", kind: "success" };
}

export const CMV_REFERENCE: [number, number] = [28, 30];
export const CONTRIBUTION_REFERENCE: [number, number] = [70, 72];

function sum(data: DREData, ids: string[]): number {
  return ids.reduce((acc, id) => acc + (Number(data[id]) || 0), 0);
}

export function calculateDRE(data: DREData, sources: RevenueSource[] = [], customLines: CustomLine[] = []): DREResults {
  const channels: ChannelResult[] = [];

  for (const fixed of FIXED_SOURCES) {
    const value = Number(data[salesFieldId(fixed)]) || 0;
    const cmv = Number(data[cmvFieldId(fixed)]) || 0;
    channels.push({ id: fixed, kind: fixed, value, cmv, cmvPercent: value > 0 ? (cmv / value) * 100 : 0 });
  }
  for (const s of sources) {
    const value = Number(data[salesFieldId(s.id)]) || 0;
    const cmv = Number(data[cmvFieldId(s.id)]) || 0;
    channels.push({
      id: s.id,
      kind: s.kind,
      customName: s.kind === "custom" ? s.name : undefined,
      value,
      cmv,
      cmvPercent: value > 0 ? (cmv / value) * 100 : 0,
    });
  }

  const netRevenue = channels.reduce((a, c) => a + c.value, 0);
  const totalCMV = channels.reduce((a, c) => a + c.cmv, 0);
  const pct = (v: number) => (netRevenue > 0 ? (v / netRevenue) * 100 : 0);

  const expensesByCategory: ExpenseResult[] = EXPENSE_SECTIONS.map((section) => {
    const base = sum(
      data,
      section.fields.map((f) => f.id),
    );
    const custom = sum(
      data,
      customLines.filter((l) => l.sectionId === section.id).map((l) => l.id),
    );
    const value = base + custom;
    const percent = pct(value);
    return {
      id: section.id,
      value,
      percent,
      reference: section.reference ?? null,
      status: value > 0 || section.reference ? expenseStatus(percent, section.reference ?? null, section.id) : null,
    };
  });

  const totalOPEX = expensesByCategory.reduce((a, e) => a + e.value, 0);
  const contributionMargin = netRevenue - totalCMV;
  const netProfit = contributionMargin - totalOPEX;
  const contributionRatio = netRevenue > 0 ? contributionMargin / netRevenue : 0;
  const breakEvenPoint = contributionRatio > 0 ? totalOPEX / contributionRatio : 0;

  const catValue = (id: string) => expensesByCategory.find((e) => e.id === id)?.value ?? 0;
  const personalTotal = catValue("payroll");
  const fijosTotal = catValue("rent") + catValue("utilities");
  const otrosTotal = totalOPEX - personalTotal - fijosTotal;

  const avgTicket = Number(data.avg_ticket) || 0;
  const daysOpenPerWeek = Number(data.days_open_per_week) || 0;
  const seats = Number(data.total_seats) || 0;
  const openDaysPerMonth = daysOpenPerWeek > 0 ? daysOpenPerWeek * WEEKS_PER_MONTH : 0;

  const customersPerMonth = avgTicket > 0 && netRevenue > 0 ? netRevenue / avgTicket : null;
  const customersPerDay = customersPerMonth !== null && openDaysPerMonth > 0 ? customersPerMonth / openDaysPerMonth : null;
  const salesPerDay = openDaysPerMonth > 0 && netRevenue > 0 ? netRevenue / openDaysPerMonth : null;
  const customersForBreakEven = avgTicket > 0 && breakEvenPoint > 0 ? breakEvenPoint / avgTicket : null;
  const tableTurns = customersPerDay !== null && seats > 0 ? customersPerDay / seats : null;

  const cmvPercent = pct(totalCMV);
  const contributionMarginPercent = pct(contributionMargin);
  const netProfitPercent = pct(netProfit);

  return {
    netRevenue,
    totalCMV,
    cmvPercent,
    contributionMargin,
    contributionMarginPercent,
    totalOPEX,
    opexPercent: pct(totalOPEX),
    netProfit,
    netProfitPercent,
    breakEvenPoint,
    avgTicket,
    daysOpenPerWeek,
    seats,
    customersPerMonth,
    customersPerDay,
    salesPerDay,
    customersForBreakEven,
    tableTurns,
    revenueByChannel: channels,
    expensesByCategory,
    personalTotal,
    fijosTotal,
    otrosTotal,
    cmvStatus: cmvStatus(cmvPercent),
    contributionStatus: contributionStatus(contributionMarginPercent),
    netStatus: netStatus(netProfitPercent),
    breakEvenStatus:
      netRevenue >= breakEvenPoint
        ? { key: "status.covered", kind: "success" }
        : { key: "status.notCovered", kind: "destructive" },
  };
}
