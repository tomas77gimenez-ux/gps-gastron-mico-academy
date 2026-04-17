import type { Lang } from "./i18n";

// Translations for DRE step/section/field labels by ID
const dreTranslations: Record<string, { es: string; en: string }> = {
  // Steps
  "step.revenue.title": { es: "Facturación", en: "Revenue" },
  "step.revenue.subtitle": { es: "Ingresa las ventas brutas de tu operación por canal", en: "Enter your gross sales by channel" },
  "step.fixed_costs.title": { es: "Costos Fijos", en: "Fixed Costs" },
  "step.fixed_costs.subtitle": { es: "Gastos que no varían con el nivel de ventas", en: "Expenses that don't vary with sales" },
  "step.variable_costs.title": { es: "Costos Variables y Otros", en: "Variable & Other Costs" },
  "step.variable_costs.subtitle": { es: "Gastos operacionales adicionales", en: "Additional operating expenses" },
  "step.averages.title": { es: "Promedios Operativos", en: "Operating Averages" },
  "step.averages.subtitle": { es: "Información sobre tu operación diaria", en: "Information about your daily operation" },

  // Sections
  "section.kitchen.title": { es: "Venta Cocina", en: "Kitchen Sales" },
  "section.kitchen.desc": { es: "Ingresos generados por la venta de alimentos", en: "Revenue from food sales" },
  "section.bar.title": { es: "Venta Bar", en: "Bar Sales" },
  "section.bar.desc": { es: "Ingresos generados por bebidas", en: "Revenue from beverages" },
  "section.cafeteria.title": { es: "Cafetería", en: "Cafeteria" },
  "section.cafeteria.desc": { es: "Ingresos de cafetería u otros puntos de venta", en: "Revenue from cafeteria or other outlets" },
  "section.events.title": { es: "Eventos", en: "Events" },
  "section.events.desc": { es: "Ingresos por eventos y catering", en: "Revenue from events and catering" },
  "section.rent.title": { es: "Alquiler / Renta", en: "Rent" },
  "section.rent.desc": { es: "Costo mensual de alquiler del local", en: "Monthly rent cost" },
  "section.utilities.title": { es: "Servicios Públicos", en: "Utilities" },
  "section.utilities.desc": { es: "Electricidad, agua, gas, internet, teléfono", en: "Electricity, water, gas, internet, phone" },
  "section.payroll.title": { es: "Nómina / Salarios", en: "Payroll / Salaries" },
  "section.payroll.desc": { es: "Todos los costos de personal incluyendo comisiones", en: "All staff costs including commissions" },
  "section.services.title": { es: "Prestadores de Servicios / Tercerizados", en: "Outsourced Services" },
  "section.services.desc": { es: "Honorarios profesionales y servicios tercerizados", en: "Professional fees and outsourced services" },
  "section.taxes.title": { es: "Impuestos y Cargos", en: "Taxes & Fees" },
  "section.taxes.desc": { es: "Impuestos operacionales y tasas", en: "Operating taxes and fees" },
  "section.marketing.title": { es: "Marketing", en: "Marketing" },
  "section.marketing.desc": { es: "Inversión en publicidad y marketing", en: "Advertising and marketing investment" },
  "section.maintenance.title": { es: "Mantenimiento y Reparaciones", en: "Maintenance & Repairs" },
  "section.maintenance.desc": { es: "Gastos de mantenimiento del local y equipos", en: "Maintenance for premises and equipment" },
  "section.financial.title": { es: "Gastos Financieros", en: "Financial Expenses" },
  "section.financial.desc": { es: "Intereses, comisiones bancarias, etc.", en: "Interest, bank fees, etc." },
  "section.purchases.title": { es: "Compras / Bienes de Uso / Gastos Varios", en: "Purchases / Supplies / Misc" },
  "section.purchases.desc": { es: "Utensilios, limpieza, equipos menores", en: "Utensils, cleaning, minor equipment" },
  "section.operation.title": { es: "Datos de Operación", en: "Operation Data" },
  "section.operation.desc": { es: "Promedios diarios y semanales", en: "Daily and weekly averages" },

  // Fields
  "field.kitchen_gross_sales": { es: "Venta Bruta Cocina", en: "Gross Kitchen Sales" },
  "field.kitchen_cmv": { es: "CMV Cocina (Costo de Mercadería Vendida)", en: "Kitchen COGS (Cost of Goods Sold)" },
  "field.kitchen_cmv.help": { es: "Costo directo de los insumos de cocina", en: "Direct cost of kitchen inputs" },
  "field.bar_gross_sales": { es: "Venta Bruta Bar", en: "Gross Bar Sales" },
  "field.bar_cmv": { es: "CMV Bar", en: "Bar COGS" },
  "field.cafeteria_gross_sales": { es: "Venta Bruta Cafetería", en: "Gross Cafeteria Sales" },
  "field.cafeteria_cmv": { es: "CMV Cafetería", en: "Cafeteria COGS" },
  "field.events_gross_sales": { es: "Venta Bruta Eventos", en: "Gross Events Sales" },
  "field.events_cmv": { es: "CMV Eventos", en: "Events COGS" },
  "field.rent_fixed": { es: "Alquiler Mensual", en: "Monthly Rent" },
  "field.electricity": { es: "Electricidad", en: "Electricity" },
  "field.water": { es: "Agua", en: "Water" },
  "field.gas": { es: "Gas", en: "Gas" },
  "field.internet_phone": { es: "Internet / Teléfono", en: "Internet / Phone" },
  "field.salaries_kitchen": { es: "Salarios Cocina", en: "Kitchen Salaries" },
  "field.salaries_service": { es: "Salarios Servicio/Sala", en: "Service/Floor Salaries" },
  "field.salaries_admin": { es: "Salarios Administración", en: "Admin Salaries" },
  "field.salaries_commissions": { es: "Comisiones", en: "Commissions" },
  "field.salaries_benefits": { es: "Beneficios / Cargas Sociales", en: "Benefits / Social Charges" },
  "field.accounting": { es: "Contabilidad", en: "Accounting" },
  "field.legal": { es: "Legal", en: "Legal" },
  "field.other_services": { es: "Otros Servicios Tercerizados", en: "Other Outsourced Services" },
  "field.taxes_municipal": { es: "Impuestos Municipales", en: "Municipal Taxes" },
  "field.taxes_state": { es: "Impuestos Estatales/Nacionales", en: "State/National Taxes" },
  "field.taxes_other": { es: "Otros Cargos/Tasas", en: "Other Fees" },
  "field.marketing_digital": { es: "Marketing Digital", en: "Digital Marketing" },
  "field.marketing_traditional": { es: "Marketing Tradicional", en: "Traditional Marketing" },
  "field.marketing_events": { es: "Eventos Promocionales", en: "Promotional Events" },
  "field.maintenance_building": { es: "Mantenimiento Local", en: "Premises Maintenance" },
  "field.maintenance_equipment": { es: "Mantenimiento Equipos", en: "Equipment Maintenance" },
  "field.bank_fees": { es: "Comisiones Bancarias", en: "Bank Fees" },
  "field.loan_interest": { es: "Intereses de Préstamos", en: "Loan Interest" },
  "field.cc_fees": { es: "Comisiones Tarjetas de Crédito", en: "Credit Card Fees" },
  "field.supplies_cleaning": { es: "Limpieza e Insumos", en: "Cleaning & Supplies" },
  "field.supplies_utensils": { es: "Utensilios", en: "Utensils" },
  "field.supplies_misc": { es: "Gastos Varios", en: "Miscellaneous" },
  "field.avg_ticket": { es: "Ticket Medio", en: "Average Ticket" },
  "field.avg_ticket.help": { es: "Gasto promedio por cliente", en: "Average spend per customer" },
  "field.avg_customers_weekday": { es: "Clientes Promedio (Días de Semana)", en: "Average Customers (Weekdays)" },
  "field.avg_customers_weekend": { es: "Clientes Promedio (Fin de Semana)", en: "Average Customers (Weekend)" },
  "field.days_open_per_week": { es: "Días Abiertos por Semana", en: "Days Open per Week" },
  "field.total_seats": { es: "Capacidad Total (Asientos)", en: "Total Capacity (Seats)" },

  // Channel & expense category names (DashboardResults)
  "channel.Cocina": { es: "Cocina", en: "Kitchen" },
  "channel.Bar": { es: "Bar", en: "Bar" },
  "channel.Cafetería": { es: "Cafetería", en: "Cafeteria" },
  "channel.Eventos": { es: "Eventos", en: "Events" },
  "expense.Alquiler": { es: "Alquiler", en: "Rent" },
  "expense.Servicios Públicos": { es: "Servicios Públicos", en: "Utilities" },
  "expense.Nómina": { es: "Nómina", en: "Payroll" },
  "expense.Tercerizados": { es: "Tercerizados", en: "Outsourced" },
  "expense.Impuestos": { es: "Impuestos", en: "Taxes" },
  "expense.Marketing": { es: "Marketing", en: "Marketing" },
  "expense.Mantenimiento": { es: "Mantenimiento", en: "Maintenance" },
  "expense.Financieros": { es: "Financieros", en: "Financial" },
  "expense.Compras/Varios": { es: "Compras/Varios", en: "Purchases/Misc" },

  // Static UI
  "dre.ref": { es: "Ref:", en: "Ref:" },
  "dre.cmv": { es: "CMV:", en: "COGS:" },
  "dre.otro": { es: "Otro", en: "Other" },
  "dre.anterior": { es: "Anterior", en: "Previous" },
  "dre.siguiente": { es: "Siguiente", en: "Next" },
  "dre.verDashboard": { es: "Ver Dashboard", en: "View Dashboard" },
  "dre.nombreConcepto": { es: "Nombre del concepto...", en: "Concept name..." },
  "results.refCmv": { es: "Ref: 28-30%", en: "Ref: 28-30%" },
  "results.refMargen": { es: "Ref: 70-72%", en: "Ref: 70-72%" },
};

export function dreT(key: string, lang: Lang): string {
  return dreTranslations[key]?.[lang] ?? key;
}

export function tChannel(name: string, lang: Lang): string {
  return dreT(`channel.${name}`, lang);
}

export function tExpense(name: string, lang: Lang): string {
  return dreT(`expense.${name}`, lang);
}
