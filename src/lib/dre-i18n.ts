import type { Lang } from "./i18n";

// Translations for DRE step/section/field labels by ID
const dreTranslations: Record<string, { es: string; en: string }> = {
  // Steps
  "step.revenue.title": { es: "Facturación", en: "Revenue", pt: "Faturamento" },
  "step.revenue.subtitle": { es: "Ingresa las ventas brutas de tu operación por canal", en: "Enter your gross sales by channel", pt: "Insira as vendas brutas da sua operação por canal" },
  "step.fixed_costs.title": { es: "Costos Fijos", en: "Fixed Costs", pt: "Custos Fixos" },
  "step.fixed_costs.subtitle": { es: "Gastos que no varían con el nivel de ventas", en: "Expenses that don't vary with sales", pt: "Despesas que não variam com o nível de vendas" },
  "step.variable_costs.title": { es: "Costos Variables y Otros", en: "Variable & Other Costs", pt: "Custos Variáveis e Outros" },
  "step.variable_costs.subtitle": { es: "Gastos operacionales adicionales", en: "Additional operating expenses", pt: "Despesas operacionais adicionais" },
  "step.averages.title": { es: "Promedios Operativos", en: "Operating Averages", pt: "Médias Operacionais" },
  "step.averages.subtitle": { es: "Información sobre tu operación diaria", en: "Information about your daily operation", pt: "Informação sobre sua operação diária" },

  // Sections
  "section.kitchen.title": { es: "Venta Cocina", en: "Kitchen Sales", pt: "Venda Cozinha" },
  "section.kitchen.desc": { es: "Ingresos generados por la venta de alimentos", en: "Revenue from food sales", pt: "Receita gerada pela venda de alimentos" },
  "section.bar.title": { es: "Venta Bar", en: "Bar Sales", pt: "Venda Bar" },
  "section.bar.desc": { es: "Ingresos generados por bebidas", en: "Revenue from beverages", pt: "Receita gerada por bebidas" },
  "section.cafeteria.title": { es: "Cafetería", en: "Cafeteria", pt: "Cafeteria" },
  "section.cafeteria.desc": { es: "Ingresos de cafetería u otros puntos de venta", en: "Revenue from cafeteria or other outlets", pt: "Receita de cafeteria ou outros pontos de venda" },
  "section.events.title": { es: "Eventos", en: "Events", pt: "Eventos" },
  "section.events.desc": { es: "Ingresos por eventos y catering", en: "Revenue from events and catering", pt: "Receita por eventos e catering" },
  "section.rent.title": { es: "Alquiler / Renta", en: "Rent", pt: "Aluguel" },
  "section.rent.desc": { es: "Costo mensual de alquiler del local", en: "Monthly rent cost", pt: "Custo mensal de aluguel do local" },
  "section.utilities.title": { es: "Servicios Públicos", en: "Utilities", pt: "Serviços Públicos" },
  "section.utilities.desc": { es: "Electricidad, agua, gas, internet, teléfono", en: "Electricity, water, gas, internet, phone", pt: "Eletricidade, água, gás, internet, telefone" },
  "section.payroll.title": { es: "Nómina / Salarios", en: "Payroll / Salaries", pt: "Folha de Pagamento / Salários" },
  "section.payroll.desc": { es: "Todos los costos de personal incluyendo comisiones", en: "All staff costs including commissions", pt: "Todos os custos de pessoal incluindo comissões" },
  "section.services.title": { es: "Prestadores de Servicios / Tercerizados", en: "Outsourced Services", pt: "Prestadores de Serviços / Terceirizados" },
  "section.services.desc": { es: "Honorarios profesionales y servicios tercerizados", en: "Professional fees and outsourced services", pt: "Honorários profissionais e serviços terceirizados" },
  "section.taxes.title": { es: "Impuestos y Cargos", en: "Taxes & Fees", pt: "Impostos e Taxas" },
  "section.taxes.desc": { es: "Impuestos operacionales y tasas", en: "Operating taxes and fees", pt: "Impostos operacionais e taxas" },
  "section.marketing.title": { es: "Marketing", en: "Marketing", pt: "Marketing" },
  "section.marketing.desc": { es: "Inversión en publicidad y marketing", en: "Advertising and marketing investment", pt: "Investimento em publicidade e marketing" },
  "section.maintenance.title": { es: "Mantenimiento y Reparaciones", en: "Maintenance & Repairs", pt: "Manutenção e Reparos" },
  "section.maintenance.desc": { es: "Gastos de mantenimiento del local y equipos", en: "Maintenance for premises and equipment", pt: "Despesas de manutenção do local e equipamentos" },
  "section.financial.title": { es: "Gastos Financieros", en: "Financial Expenses", pt: "Despesas Financeiras" },
  "section.financial.desc": { es: "Intereses, comisiones bancarias, etc.", en: "Interest, bank fees, etc.", pt: "Juros, taxas bancárias, etc." },
  "section.purchases.title": { es: "Compras / Bienes de Uso / Gastos Varios", en: "Purchases / Supplies / Misc", pt: "Compras / Bens de Uso / Despesas Diversas" },
  "section.purchases.desc": { es: "Utensilios, limpieza, equipos menores", en: "Utensils, cleaning, minor equipment", pt: "Utensílios, limpeza, equipamentos menores" },
  "section.operation.title": { es: "Datos de Operación", en: "Operation Data", pt: "Dados de Operação" },
  "section.operation.desc": { es: "Promedios diarios y semanales", en: "Daily and weekly averages", pt: "Médias diárias e semanais" },

  // Fields
  "field.kitchen_gross_sales": { es: "Venta Bruta Cocina", en: "Gross Kitchen Sales", pt: "Venda Bruta Cozinha" },
  "field.kitchen_cmv": { es: "CMV Cocina (Costo de Mercadería Vendida)", en: "Kitchen COGS (Cost of Goods Sold)", pt: "CMV Cozinha (Custo da Mercadoria Vendida)" },
  "field.kitchen_cmv.help": { es: "Costo directo de los insumos de cocina", en: "Direct cost of kitchen inputs", pt: "Custo direto dos insumos da cozinha" },
  "field.bar_gross_sales": { es: "Venta Bruta Bar", en: "Gross Bar Sales", pt: "Venda Bruta Bar" },
  "field.bar_cmv": { es: "CMV Bar", en: "Bar COGS", pt: "CMV Bar" },
  "field.cafeteria_gross_sales": { es: "Venta Bruta Cafetería", en: "Gross Cafeteria Sales", pt: "Venda Bruta Cafeteria" },
  "field.cafeteria_cmv": { es: "CMV Cafetería", en: "Cafeteria COGS", pt: "CMV Cafeteria" },
  "field.events_gross_sales": { es: "Venta Bruta Eventos", en: "Gross Events Sales", pt: "Venda Bruta Eventos" },
  "field.events_cmv": { es: "CMV Eventos", en: "Events COGS", pt: "CMV Eventos" },
  "field.rent_fixed": { es: "Alquiler Mensual", en: "Monthly Rent", pt: "Aluguel Mensal" },
  "field.electricity": { es: "Electricidad", en: "Electricity", pt: "Eletricidade" },
  "field.water": { es: "Agua", en: "Water", pt: "Água" },
  "field.gas": { es: "Gas", en: "Gas", pt: "Gás" },
  "field.internet_phone": { es: "Internet / Teléfono", en: "Internet / Phone", pt: "Internet / Telefone" },
  "field.salaries_kitchen": { es: "Salarios Cocina", en: "Kitchen Salaries", pt: "Salários Cozinha" },
  "field.salaries_service": { es: "Salarios Servicio/Sala", en: "Service/Floor Salaries", pt: "Salários Serviço/Salão" },
  "field.salaries_admin": { es: "Salarios Administración", en: "Admin Salaries", pt: "Salários Administração" },
  "field.salaries_commissions": { es: "Comisiones", en: "Commissions", pt: "Comissões" },
  "field.salaries_benefits": { es: "Beneficios / Cargas Sociales", en: "Benefits / Social Charges", pt: "Benefícios / Encargos Sociais" },
  "field.accounting": { es: "Contabilidad", en: "Accounting", pt: "Contabilidade" },
  "field.legal": { es: "Legal", en: "Legal", pt: "Jurídico" },
  "field.other_services": { es: "Otros Servicios Tercerizados", en: "Other Outsourced Services", pt: "Outros Serviços Terceirizados" },
  "field.taxes_municipal": { es: "Impuestos Municipales", en: "Municipal Taxes", pt: "Impostos Municipais" },
  "field.taxes_state": { es: "Impuestos Estatales/Nacionales", en: "State/National Taxes", pt: "Impostos Estaduais/Federais" },
  "field.taxes_other": { es: "Otros Cargos/Tasas", en: "Other Fees", pt: "Outras Taxas" },
  "field.marketing_digital": { es: "Marketing Digital", en: "Digital Marketing", pt: "Marketing Digital" },
  "field.marketing_traditional": { es: "Marketing Tradicional", en: "Traditional Marketing", pt: "Marketing Tradicional" },
  "field.marketing_events": { es: "Eventos Promocionales", en: "Promotional Events", pt: "Eventos Promocionais" },
  "field.maintenance_building": { es: "Mantenimiento Local", en: "Premises Maintenance", pt: "Manutenção do Local" },
  "field.maintenance_equipment": { es: "Mantenimiento Equipos", en: "Equipment Maintenance", pt: "Manutenção de Equipamentos" },
  "field.bank_fees": { es: "Comisiones Bancarias", en: "Bank Fees", pt: "Taxas Bancárias" },
  "field.loan_interest": { es: "Intereses de Préstamos", en: "Loan Interest", pt: "Juros de Empréstimos" },
  "field.cc_fees": { es: "Comisiones Tarjetas de Crédito", en: "Credit Card Fees", pt: "Taxas de Cartão de Crédito" },
  "field.supplies_cleaning": { es: "Limpieza e Insumos", en: "Cleaning & Supplies", pt: "Limpeza e Insumos" },
  "field.supplies_utensils": { es: "Utensilios", en: "Utensils", pt: "Utensílios" },
  "field.supplies_misc": { es: "Gastos Varios", en: "Miscellaneous", pt: "Despesas Diversas" },
  "field.avg_ticket": { es: "Ticket Medio", en: "Average Ticket", pt: "Ticket Médio" },
  "field.avg_ticket.help": { es: "Gasto promedio por cliente", en: "Average spend per customer", pt: "Gasto médio por cliente" },
  "field.avg_customers_weekday": { es: "Clientes Promedio (Días de Semana)", en: "Average Customers (Weekdays)", pt: "Clientes Médio (Dias de Semana)" },
  "field.avg_customers_weekend": { es: "Clientes Promedio (Fin de Semana)", en: "Average Customers (Weekend)", pt: "Clientes Médio (Fim de Semana)" },
  "field.days_open_per_week": { es: "Días Abiertos por Semana", en: "Days Open per Week", pt: "Dias Abertos por Semana" },
  "field.total_seats": { es: "Capacidad Total (Asientos)", en: "Total Capacity (Seats)", pt: "Capacidade Total (Lugares)" },

  // Channel & expense category names (DashboardResults)
  "channel.Cocina": { es: "Cocina", en: "Kitchen", pt: "Cozinha" },
  "channel.Bar": { es: "Bar", en: "Bar", pt: "Bar" },
  "channel.Cafetería": { es: "Cafetería", en: "Cafeteria", pt: "Cafeteria" },
  "channel.Eventos": { es: "Eventos", en: "Events", pt: "Eventos" },
  "expense.Alquiler": { es: "Alquiler", en: "Rent", pt: "Aluguel" },
  "expense.Servicios Públicos": { es: "Servicios Públicos", en: "Utilities", pt: "Serviços Públicos" },
  "expense.Nómina": { es: "Nómina", en: "Payroll", pt: "Folha de Pagamento" },
  "expense.Tercerizados": { es: "Tercerizados", en: "Outsourced", pt: "Terceirizados" },
  "expense.Impuestos": { es: "Impuestos", en: "Taxes", pt: "Impostos" },
  "expense.Marketing": { es: "Marketing", en: "Marketing", pt: "Marketing" },
  "expense.Mantenimiento": { es: "Mantenimiento", en: "Maintenance", pt: "Manutenção" },
  "expense.Financieros": { es: "Financieros", en: "Financial", pt: "Financeiros" },
  "expense.Compras/Varios": { es: "Compras/Varios", en: "Purchases/Misc", pt: "Compras/Diversos" },

  // Static UI
  "dre.ref": { es: "Ref:", en: "Ref:", pt: "Ref:" },
  "dre.cmv": { es: "CMV:", en: "COGS:", pt: "CMV:" },
  "dre.otro": { es: "Otro", en: "Other", pt: "Outro" },
  "dre.anterior": { es: "Anterior", en: "Previous", pt: "Anterior" },
  "dre.siguiente": { es: "Siguiente", en: "Next", pt: "Próximo" },
  "dre.verDashboard": { es: "Ver Dashboard", en: "View Dashboard", pt: "Ver Dashboard" },
  "dre.nombreConcepto": { es: "Nombre del concepto...", en: "Concept name...", pt: "Nome do conceito..." },
  "results.refCmv": { es: "Ref: 28-30%", en: "Ref: 28-30%", pt: "Ref: 28-30%" },
  "results.refMargen": { es: "Ref: 70-72%", en: "Ref: 70-72%", pt: "Ref: 70-72%" },
};

export function dreT(key: string, lang: Lang): string {
  const entry = dreTranslations[key];
  if (!entry) return key;
  // Fallback to Spanish for languages without a dedicated translation (e.g. pt)
  return (entry as Record<string, string>)[lang] ?? entry.es ?? key;
}

export function tChannel(name: string, lang: Lang): string {
  return dreT(`channel.${name}`, lang);
}

export function tExpense(name: string, lang: Lang): string {
  return dreT(`expense.${name}`, lang);
}
