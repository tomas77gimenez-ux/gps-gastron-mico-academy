// Financial questionnaire structure based on DRE Master spreadsheet

export interface QuestionField {
  id: string;
  label: string;
  placeholder?: string;
  type: "currency" | "percentage" | "number";
  helpText?: string;
}

export interface QuestionSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: QuestionField[];
  referenceRange?: string; // e.g. "6-10%"
}

export interface QuestionStep {
  id: string;
  title: string;
  subtitle: string;
  sections: QuestionSection[];
}

export const questionnaireSteps: QuestionStep[] = [
  {
    id: "revenue",
    title: "Facturación",
    subtitle: "Ingresa las ventas brutas de tu operación por canal",
    sections: [
      {
        id: "kitchen",
        title: "Venta Cocina",
        description: "Ingresos generados por la venta de alimentos",
        icon: "🍳",
        fields: [
          { id: "kitchen_gross_sales", label: "Venta Bruta Cocina", type: "currency", placeholder: "0.00" },
          { id: "kitchen_cmv", label: "CMV Cocina (Costo de Mercadería Vendida)", type: "currency", placeholder: "0.00", helpText: "Costo directo de los insumos de cocina" },
        ],
      },
      {
        id: "bar",
        title: "Venta Bar",
        description: "Ingresos generados por bebidas",
        icon: "🍸",
        fields: [
          { id: "bar_gross_sales", label: "Venta Bruta Bar", type: "currency", placeholder: "0.00" },
          { id: "bar_cmv", label: "CMV Bar", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "cafeteria",
        title: "Cafetería",
        description: "Ingresos de cafetería u otros puntos de venta",
        icon: "☕",
        fields: [
          { id: "cafeteria_gross_sales", label: "Venta Bruta Cafetería", type: "currency", placeholder: "0.00" },
          { id: "cafeteria_cmv", label: "CMV Cafetería", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "events",
        title: "Eventos",
        description: "Ingresos por eventos y catering",
        icon: "🎉",
        fields: [
          { id: "events_gross_sales", label: "Venta Bruta Eventos", type: "currency", placeholder: "0.00" },
          { id: "events_cmv", label: "CMV Eventos", type: "currency", placeholder: "0.00" },
        ],
      },
    ],
  },
  {
    id: "fixed_costs",
    title: "Costos Fijos",
    subtitle: "Gastos que no varían con el nivel de ventas",
    sections: [
      {
        id: "rent",
        title: "Alquiler / Renta",
        description: "Costo mensual de alquiler del local",
        icon: "🏠",
        referenceRange: "6-10%",
        fields: [
          { id: "rent_fixed", label: "Alquiler Mensual", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "utilities",
        title: "Servicios Públicos",
        description: "Electricidad, agua, gas, internet, teléfono",
        icon: "💡",
        referenceRange: "4-6%",
        fields: [
          { id: "electricity", label: "Electricidad", type: "currency", placeholder: "0.00" },
          { id: "water", label: "Agua", type: "currency", placeholder: "0.00" },
          { id: "gas", label: "Gas", type: "currency", placeholder: "0.00" },
          { id: "internet_phone", label: "Internet / Teléfono", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "payroll",
        title: "Nómina / Salarios",
        description: "Todos los costos de personal incluyendo comisiones",
        icon: "👥",
        referenceRange: "25-30%",
        fields: [
          { id: "salaries_kitchen", label: "Salarios Cocina", type: "currency", placeholder: "0.00" },
          { id: "salaries_service", label: "Salarios Servicio/Sala", type: "currency", placeholder: "0.00" },
          { id: "salaries_admin", label: "Salarios Administración", type: "currency", placeholder: "0.00" },
          { id: "salaries_commissions", label: "Comisiones", type: "currency", placeholder: "0.00" },
          { id: "salaries_benefits", label: "Beneficios / Cargas Sociales", type: "currency", placeholder: "0.00" },
        ],
      },
    ],
  },
  {
    id: "variable_costs",
    title: "Costos Variables y Otros",
    subtitle: "Gastos operacionales adicionales",
    sections: [
      {
        id: "services",
        title: "Prestadores de Servicios / Tercerizados",
        description: "Honorarios profesionales y servicios tercerizados",
        icon: "📋",
        referenceRange: "1-3%",
        fields: [
          { id: "accounting", label: "Contabilidad", type: "currency", placeholder: "0.00" },
          { id: "legal", label: "Legal", type: "currency", placeholder: "0.00" },
          { id: "other_services", label: "Otros Servicios Tercerizados", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "taxes",
        title: "Impuestos y Cargos",
        description: "Impuestos operacionales y tasas",
        icon: "🏛️",
        referenceRange: "5-8%",
        fields: [
          { id: "taxes_municipal", label: "Impuestos Municipales", type: "currency", placeholder: "0.00" },
          { id: "taxes_state", label: "Impuestos Estatales/Nacionales", type: "currency", placeholder: "0.00" },
          { id: "taxes_other", label: "Otros Cargos/Tasas", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "marketing",
        title: "Marketing",
        description: "Inversión en publicidad y marketing",
        icon: "📣",
        referenceRange: "4-8%",
        fields: [
          { id: "marketing_digital", label: "Marketing Digital", type: "currency", placeholder: "0.00" },
          { id: "marketing_traditional", label: "Marketing Tradicional", type: "currency", placeholder: "0.00" },
          { id: "marketing_events", label: "Eventos Promocionales", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "maintenance",
        title: "Mantenimiento y Reparaciones",
        description: "Gastos de mantenimiento del local y equipos",
        icon: "🔧",
        fields: [
          { id: "maintenance_building", label: "Mantenimiento Local", type: "currency", placeholder: "0.00" },
          { id: "maintenance_equipment", label: "Mantenimiento Equipos", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "financial",
        title: "Gastos Financieros",
        description: "Intereses, comisiones bancarias, etc.",
        icon: "🏦",
        fields: [
          { id: "bank_fees", label: "Comisiones Bancarias", type: "currency", placeholder: "0.00" },
          { id: "loan_interest", label: "Intereses de Préstamos", type: "currency", placeholder: "0.00" },
          { id: "cc_fees", label: "Comisiones Tarjetas de Crédito", type: "currency", placeholder: "0.00" },
        ],
      },
      {
        id: "purchases",
        title: "Compras / Bienes de Uso / Gastos Varios",
        description: "Utensilios, limpieza, equipos menores",
        icon: "🛒",
        fields: [
          { id: "supplies_cleaning", label: "Limpieza e Insumos", type: "currency", placeholder: "0.00" },
          { id: "supplies_utensils", label: "Utensilios", type: "currency", placeholder: "0.00" },
          { id: "supplies_misc", label: "Gastos Varios", type: "currency", placeholder: "0.00" },
        ],
      },
    ],
  },
  {
    id: "averages",
    title: "Promedios Operativos",
    subtitle: "Información sobre tu operación diaria",
    sections: [
      {
        id: "operation",
        title: "Datos de Operación",
        description: "Promedios diarios y semanales",
        icon: "📊",
        fields: [
          { id: "avg_ticket", label: "Ticket Medio", type: "currency", placeholder: "0.00", helpText: "Gasto promedio por cliente" },
          { id: "avg_customers_weekday", label: "Clientes Promedio (Días de Semana)", type: "number", placeholder: "0" },
          { id: "avg_customers_weekend", label: "Clientes Promedio (Fin de Semana)", type: "number", placeholder: "0" },
          { id: "days_open_per_week", label: "Días Abiertos por Semana", type: "number", placeholder: "5" },
          { id: "total_seats", label: "Capacidad Total (Asientos)", type: "number", placeholder: "0" },
        ],
      },
    ],
  },
];

export interface DREData {
  [key: string]: number;
}

export interface DREResults {
  grossRevenue: number;
  totalCMV: number;
  cmvPercent: number;
  totalOPEX: number;
  opexPercent: number;
  grossOperatingProfit: number;
  gopPercent: number;
  netProfit: number;
  netProfitPercent: number;
  breakEvenPoint: number;
  contributionMargin: number;
  contributionMarginPercent: number;
  avgTicket: number;
  revenueByChannel: { name: string; value: number; cmv: number; cmvPercent: number }[];
  expensesByCategory: { name: string; value: number; percent: number; reference: string }[];
}

export function calculateDRE(data: DREData): DREResults {
  const kitchenSales = data.kitchen_gross_sales || 0;
  const barSales = data.bar_gross_sales || 0;
  const cafeteriaSales = data.cafeteria_gross_sales || 0;
  const eventsSales = data.events_gross_sales || 0;
  const grossRevenue = kitchenSales + barSales + cafeteriaSales + eventsSales;

  const kitchenCMV = data.kitchen_cmv || 0;
  const barCMV = data.bar_cmv || 0;
  const cafeteriaCMV = data.cafeteria_cmv || 0;
  const eventsCMV = data.events_cmv || 0;
  const totalCMV = kitchenCMV + barCMV + cafeteriaCMV + eventsCMV;

  const rent = data.rent_fixed || 0;
  const utilities = (data.electricity || 0) + (data.water || 0) + (data.gas || 0) + (data.internet_phone || 0);
  const payroll = (data.salaries_kitchen || 0) + (data.salaries_service || 0) + (data.salaries_admin || 0) + (data.salaries_commissions || 0) + (data.salaries_benefits || 0);
  const services = (data.accounting || 0) + (data.legal || 0) + (data.other_services || 0);
  const taxes = (data.taxes_municipal || 0) + (data.taxes_state || 0) + (data.taxes_other || 0);
  const marketing = (data.marketing_digital || 0) + (data.marketing_traditional || 0) + (data.marketing_events || 0);
  const maintenance = (data.maintenance_building || 0) + (data.maintenance_equipment || 0);
  const financial = (data.bank_fees || 0) + (data.loan_interest || 0) + (data.cc_fees || 0);
  const purchases = (data.supplies_cleaning || 0) + (data.supplies_utensils || 0) + (data.supplies_misc || 0);

  const totalOPEX = rent + utilities + payroll + services + taxes + marketing + maintenance + financial + purchases;
  const gop = grossRevenue - totalCMV - totalOPEX;
  const netProfit = gop;
  const contributionMargin = grossRevenue - totalCMV;

  const pct = (v: number) => grossRevenue > 0 ? (v / grossRevenue) * 100 : 0;

  const breakEven = contributionMargin > 0 && grossRevenue > 0
    ? totalOPEX / (contributionMargin / grossRevenue)
    : 0;

  return {
    grossRevenue,
    totalCMV,
    cmvPercent: pct(totalCMV),
    totalOPEX,
    opexPercent: pct(totalOPEX),
    grossOperatingProfit: gop,
    gopPercent: pct(gop),
    netProfit,
    netProfitPercent: pct(netProfit),
    breakEvenPoint: breakEven,
    contributionMargin,
    contributionMarginPercent: pct(contributionMargin),
    avgTicket: data.avg_ticket || 0,
    revenueByChannel: [
      { name: "Cocina", value: kitchenSales, cmv: kitchenCMV, cmvPercent: kitchenSales > 0 ? (kitchenCMV / kitchenSales) * 100 : 0 },
      { name: "Bar", value: barSales, cmv: barCMV, cmvPercent: barSales > 0 ? (barCMV / barSales) * 100 : 0 },
      { name: "Cafetería", value: cafeteriaSales, cmv: cafeteriaCMV, cmvPercent: cafeteriaSales > 0 ? (cafeteriaCMV / cafeteriaSales) * 100 : 0 },
      { name: "Eventos", value: eventsSales, cmv: eventsCMV, cmvPercent: eventsSales > 0 ? (eventsCMV / eventsSales) * 100 : 0 },
    ],
    expensesByCategory: [
      { name: "Alquiler", value: rent, percent: pct(rent), reference: "6-10%" },
      { name: "Servicios Públicos", value: utilities, percent: pct(utilities), reference: "4-6%" },
      { name: "Nómina", value: payroll, percent: pct(payroll), reference: "25-30%" },
      { name: "Tercerizados", value: services, percent: pct(services), reference: "1-3%" },
      { name: "Impuestos", value: taxes, percent: pct(taxes), reference: "5-8%" },
      { name: "Marketing", value: marketing, percent: pct(marketing), reference: "4-8%" },
      { name: "Mantenimiento", value: maintenance, percent: pct(maintenance), reference: "-" },
      { name: "Financieros", value: financial, percent: pct(financial), reference: "-" },
      { name: "Compras/Varios", value: purchases, percent: pct(purchases), reference: "-" },
    ],
  };
}
