import type { Lang } from "./i18n";

type Entry = { es: string; en: string; pt: string };

// Traducciones de la herramienta de DRE (pasos, secciones, campos, estados y UI).
const dreTranslations: Record<string, Entry> = {
  /* ---------------- Pasos ---------------- */
  "step.revenue.title": { es: "Facturación", en: "Revenue", pt: "Faturamento" },
  "step.revenue.subtitle": {
    es: "Cargá la venta neta y el CMV de cada fuente de ventas",
    en: "Enter net sales and COGS for each revenue source",
    pt: "Informe a venda líquida e o CMV de cada fonte de vendas",
  },
  "step.operating.title": { es: "Gastos operativos", en: "Operating expenses", pt: "Despesas operacionais" },
  "step.operating.subtitle": {
    es: "Alquiler, servicios y personal",
    en: "Rent, utilities and staff",
    pt: "Aluguel, serviços e pessoal",
  },
  "step.operating.help": {
    es: "Todo lo que pagás cada mes para que tu negocio funcione, además de la mercadería: alquiler, servicios, sueldos, contador, marketing, mantenimiento. Si un gasto tuyo no aparece en la lista, sumalo con «Otro».",
    en: "Everything you pay every month to keep the business running, beyond the goods themselves: rent, utilities, wages, accountant, marketing, maintenance. If one of your expenses isn't listed, add it with “Other”.",
    pt: "Tudo o que você paga todo mês para o negócio funcionar, além da mercadoria: aluguel, serviços, salários, contador, marketing, manutenção. Se uma despesa sua não aparece na lista, some com “Outro”.",
  },
  "step.operating_more.title": { es: "Más gastos operativos", en: "More operating expenses", pt: "Mais despesas operacionais" },
  "step.operating_more.subtitle": {
    es: "Prestadores, impuestos, marketing, mantenimiento, financieros y compras",
    en: "Providers, taxes, marketing, maintenance, financial and purchases",
    pt: "Prestadores, impostos, marketing, manutenção, financeiros e compras",
  },
  "step.averages.title": { es: "Promedios operativos", en: "Operating averages", pt: "Médias operacionais" },
  "step.averages.subtitle": {
    es: "Dos datos y el resto se calcula solo",
    en: "Two inputs and the rest is calculated",
    pt: "Dois dados e o resto é calculado",
  },

  /* ---------------- Secciones ---------------- */
  "section.kitchen.title": { es: "Cocina", en: "Kitchen", pt: "Cozinha" },
  "section.kitchen.desc": { es: "Venta de alimentos", en: "Food sales", pt: "Venda de alimentos" },
  "section.bar.title": { es: "Bebidas", en: "Beverages", pt: "Bebidas" },
  "section.bar.desc": { es: "Venta de bebidas", en: "Beverage sales", pt: "Venda de bebidas" },
  "section.cafeteria.title": { es: "Cafetería", en: "Coffee shop", pt: "Cafeteria" },
  "section.cafeteria.desc": { es: "Venta de cafetería", en: "Coffee shop sales", pt: "Venda de cafeteria" },
  "section.events.title": { es: "Eventos", en: "Events", pt: "Eventos" },
  "section.events.desc": { es: "Venta por eventos", en: "Event sales", pt: "Venda por eventos" },
  "section.delivery.title": { es: "Delivery propio", en: "Own delivery", pt: "Delivery próprio" },
  "section.delivery.desc": { es: "Venta por delivery propio", en: "Sales through your own delivery", pt: "Venda por delivery próprio" },
  "section.catering.title": { es: "Catering", en: "Catering", pt: "Catering" },
  "section.catering.desc": { es: "Venta por catering", en: "Catering sales", pt: "Venda por catering" },
  "section.custom.title": { es: "Otra fuente", en: "Other source", pt: "Outra fonte" },
  "section.custom.desc": { es: "Fuente de ventas propia", en: "Your own revenue source", pt: "Fonte de vendas própria" },

  "section.rent.title": { es: "Alquiler", en: "Rent", pt: "Aluguel" },
  "section.rent.desc": { es: "Alquiler y gastos del inmueble", en: "Rent and property costs", pt: "Aluguel e custos do imóvel" },
  "section.utilities.title": { es: "Servicios", en: "Utilities", pt: "Serviços" },
  "section.utilities.desc": { es: "Servicios del local y sistema", en: "Utilities and systems", pt: "Serviços do local e sistema" },
  "section.payroll.title": { es: "Salarios y personal", en: "Salaries & staff", pt: "Salários e pessoal" },
  "section.payroll.desc": { es: "Todo el costo del equipo", en: "Full cost of your team", pt: "Todo o custo da equipe" },
  "section.providers.title": { es: "Prestadores de servicios", en: "Service providers", pt: "Prestadores de serviços" },
  "section.providers.desc": { es: "Honorarios y tercerizados", en: "Fees and outsourced services", pt: "Honorários e terceirizados" },
  "section.taxes.title": { es: "Impuestos y tasas", en: "Taxes & fees", pt: "Impostos e taxas" },
  "section.taxes.desc": { es: "Impuestos y habilitaciones", en: "Taxes and licences", pt: "Impostos e licenças" },
  "section.marketing.title": { es: "Marketing", en: "Marketing", pt: "Marketing" },
  "section.marketing.desc": { es: "Inversión para vender más", en: "Investment to sell more", pt: "Investimento para vender mais" },
  "section.maintenance.title": { es: "Mantenimiento y reparaciones", en: "Maintenance & repairs", pt: "Manutenção e reparos" },
  "section.maintenance.desc": { es: "Local y equipos", en: "Premises and equipment", pt: "Local e equipamentos" },
  "section.financial.title": { es: "Gastos financieros", en: "Financial expenses", pt: "Despesas financeiras" },
  "section.financial.desc": { es: "Comisiones y préstamos", en: "Fees and loans", pt: "Comissões e empréstimos" },
  "section.purchases.title": { es: "Compras, bienes de uso y varios", en: "Purchases, assets & misc", pt: "Compras, bens de uso e diversos" },
  "section.purchases.desc": { es: "Insumos, utensilios y equipos", en: "Supplies, utensils and equipment", pt: "Insumos, utensílios e equipamentos" },
  "section.operation.title": { es: "Datos de operación", en: "Operation data", pt: "Dados de operação" },
  "section.operation.desc": { es: "Ticket medio y días abiertos", en: "Average ticket and open days", pt: "Ticket médio e dias abertos" },

  "group.digital": { es: "Digital", en: "Digital", pt: "Digital" },
  "group.print": { es: "Impresos y cartelería", en: "Print & signage", pt: "Impressos e sinalização" },

  /* ---------------- Campos ---------------- */
  "field.kitchen_net_sales": { es: "Venta neta cocina", en: "Net kitchen sales", pt: "Venda líquida cozinha" },
  "field.kitchen_cmv": { es: "CMV cocina", en: "Kitchen COGS", pt: "CMV cozinha" },
  "field.bar_net_sales": { es: "Venta neta bebidas", en: "Net beverage sales", pt: "Venda líquida bebidas" },
  "field.bar_cmv": { es: "CMV bebidas", en: "Beverage COGS", pt: "CMV bebidas" },
  "field.net_sales.generic": { es: "Venta neta", en: "Net sales", pt: "Venda líquida" },
  "field.cmv.generic": { es: "CMV", en: "COGS", pt: "CMV" },
  "field.kitchen_net_sales.help": {
    es: "Lo que de verdad entra por ventas: el total vendido menos los impuestos que se cobran sobre la venta (como el IVA), los descuentos, las cortesías y las cancelaciones. Las comisiones de las apps de delivery no se restan acá: van en Gastos financieros.",
    en: "What really comes in from sales: total sold minus sales taxes (such as VAT), discounts, comps and cancellations. Delivery app commissions are not deducted here: they go under Financial expenses.",
    pt: "O que realmente entra pelas vendas: o total vendido menos os impostos sobre a venda (como o ICMS ou IVA), os descontos, as cortesias e os cancelamentos. As comissões dos aplicativos de delivery não entram aqui: vão em Despesas financeiras.",
  },
  "field.kitchen_cmv.help": {
    es: "Costo de la Mercadería Vendida: lo que te costaron los ingredientes y bebidas que vendiste en el mes. Si no llevás inventario, usá lo que compraste de mercadería en el mes.",
    en: "Cost of Goods Sold: what the ingredients and drinks you sold this month cost you. If you don't track inventory, use what you purchased in goods during the month.",
    pt: "Custo da Mercadoria Vendida: o que custaram os ingredientes e bebidas que você vendeu no mês. Se você não faz inventário, use o que comprou de mercadoria no mês.",
  },

  "field.rent_fixed": { es: "Alquiler mensual", en: "Monthly rent", pt: "Aluguel mensal" },
  "field.rent_insurance": { es: "Seguro del local", en: "Premises insurance", pt: "Seguro do local" },
  "field.rent_condo": { es: "Expensas o condominio", en: "Building fees", pt: "Condomínio" },
  "field.rent_property_tax": { es: "Impuesto o tasa del inmueble", en: "Property tax", pt: "Imposto do imóvel (IPTU)" },
  "field.rent_storage": { es: "Depósito o bodega", en: "Storage unit", pt: "Depósito" },
  "field.rent_parking": { es: "Estacionamiento", en: "Parking", pt: "Estacionamento" },

  "field.electricity": { es: "Electricidad", en: "Electricity", pt: "Eletricidade" },
  "field.water": { es: "Agua", en: "Water", pt: "Água" },
  "field.gas": { es: "Gas", en: "Gas", pt: "Gás" },
  "field.internet_phone": { es: "Internet y teléfono", en: "Internet & phone", pt: "Internet e telefone" },
  "field.pos_system": { es: "Sistema POS", en: "POS system", pt: "Sistema POS" },

  "field.salaries_kitchen": { es: "Salarios cocina", en: "Kitchen salaries", pt: "Salários cozinha" },
  "field.salaries_service": { es: "Salarios salón", en: "Floor salaries", pt: "Salários salão" },
  "field.salaries_admin": { es: "Salarios administración", en: "Admin salaries", pt: "Salários administração" },
  "field.salaries_commissions": { es: "Comisiones", en: "Commissions", pt: "Comissões" },
  "field.salaries_benefits": { es: "Cargas sociales", en: "Payroll taxes & benefits", pt: "Encargos sociais" },
  "field.staff_meals": { es: "Alimentación del personal", en: "Staff meals", pt: "Alimentação do pessoal" },
  "field.staff_training": { es: "Capacitación", en: "Training", pt: "Capacitação" },
  "field.staff_uniforms": { es: "Uniformes y herramientas del personal", en: "Uniforms & staff tools", pt: "Uniformes e ferramentas do pessoal" },
  "field.pro_labore": { es: "Sueldo de los socios (pro labore)", en: "Owners' salary (pro labore)", pt: "Pró-labore dos sócios" },
  "field.pro_labore.help": {
    es: "Lo que los dueños se pagan por trabajar en el restaurante. Cargalo aunque hoy no te lo pagues: si no está, el negocio parece más rentable de lo que es, porque tu trabajo queda gratis.",
    en: "What the owners pay themselves for working in the restaurant. Enter it even if you don't take it today: without it the business looks more profitable than it is, because your work is free.",
    pt: "O que os sócios se pagam por trabalhar no restaurante. Informe mesmo que hoje você não retire: sem isso o negócio parece mais rentável do que é, porque seu trabalho fica de graça.",
  },

  "field.accounting": { es: "Contador", en: "Accountant", pt: "Contador" },
  "field.legal": { es: "Legal", en: "Legal", pt: "Jurídico" },
  "field.consulting": { es: "Consultorías", en: "Consulting", pt: "Consultorias" },
  "field.cleaning_service": { es: "Servicio de limpieza", en: "Cleaning service", pt: "Serviço de limpeza" },
  "field.other_services": { es: "Otros servicios tercerizados", en: "Other outsourced services", pt: "Outros serviços terceirizados" },

  "field.taxes_municipal": { es: "Impuestos municipales", en: "Municipal taxes", pt: "Impostos municipais" },
  "field.taxes_licenses": {
    es: "Licencias y habilitaciones de la ciudad o el estado",
    en: "City or state licences and permits",
    pt: "Licenças e alvarás da cidade ou do estado",
  },
  "field.taxes_other": { es: "Otras tasas", en: "Other fees", pt: "Outras taxas" },

  "field.marketing_ads": { es: "Publicidad paga (Ads)", en: "Paid advertising (Ads)", pt: "Publicidade paga (Ads)" },
  "field.marketing_agency": { es: "Agencia o gestor de marketing", en: "Marketing agency or manager", pt: "Agência ou gestor de marketing" },
  "field.marketing_social": { es: "Manejo de redes sociales", en: "Social media management", pt: "Gestão de redes sociais" },
  "field.marketing_branding": { es: "Branding y rebranding", en: "Branding & rebranding", pt: "Branding e rebranding" },
  "field.marketing_flyers": { es: "Volantes", en: "Flyers", pt: "Panfletos" },
  "field.marketing_print": { es: "Imprenta", en: "Printing", pt: "Gráfica" },
  "field.marketing_signage": { es: "Carteles", en: "Signage", pt: "Placas e letreiros" },
  "field.marketing_events": { es: "Eventos promocionales", en: "Promotional events", pt: "Eventos promocionais" },

  "field.maintenance_building": { es: "Mantenimiento del local", en: "Premises maintenance", pt: "Manutenção do local" },
  "field.maintenance_equipment": { es: "Mantenimiento de equipos", en: "Equipment maintenance", pt: "Manutenção de equipamentos" },

  "field.bank_fees": { es: "Comisiones bancarias", en: "Bank fees", pt: "Taxas bancárias" },
  "field.loan_payments": { es: "Cuotas de préstamos", en: "Loan instalments", pt: "Parcelas de empréstimos" },
  "field.cc_fees": { es: "Comisiones de tarjetas", en: "Card fees", pt: "Taxas de cartões" },
  "field.delivery_app_fees": { es: "Comisiones de apps de delivery", en: "Delivery app commissions", pt: "Comissões de apps de delivery" },
  "field.financial_other": { es: "Otros gastos financieros", en: "Other financial expenses", pt: "Outras despesas financeiras" },

  "field.supplies_cleaning": { es: "Limpieza e insumos", en: "Cleaning & supplies", pt: "Limpeza e insumos" },
  "field.supplies_utensils": { es: "Utensilios", en: "Utensils", pt: "Utensílios" },
  "field.supplies_disposables": { es: "Descartables", en: "Disposables", pt: "Descartáveis" },
  "field.capex_purchases": { es: "Compra de bienes de uso", en: "Equipment purchases", pt: "Compra de bens de uso" },
  "field.supplies_misc": { es: "Gastos varios", en: "Miscellaneous", pt: "Despesas diversas" },

  "field.avg_ticket": { es: "Ticket medio", en: "Average ticket", pt: "Ticket médio" },
  "field.avg_ticket.help": {
    es: "Lo que gasta en promedio cada cliente. Si no lo sabés, dividí la venta neta del mes por la cantidad de clientes que atendiste.",
    en: "What each customer spends on average. If you don't know it, divide the month's net sales by the number of customers you served.",
    pt: "O que cada cliente gasta em média. Se você não sabe, divida a venda líquida do mês pela quantidade de clientes atendidos.",
  },
  "field.days_open_per_week": { es: "Días abiertos por semana", en: "Days open per week", pt: "Dias abertos por semana" },
  "field.total_seats": { es: "Capacidad (asientos)", en: "Capacity (seats)", pt: "Capacidade (lugares)" },

  /* ---------------- Canales y gastos en resultados ---------------- */
  "channel.kitchen": { es: "Cocina", en: "Kitchen", pt: "Cozinha" },
  "channel.bar": { es: "Bebidas", en: "Beverages", pt: "Bebidas" },
  "channel.cafeteria": { es: "Cafetería", en: "Coffee shop", pt: "Cafeteria" },
  "channel.events": { es: "Eventos", en: "Events", pt: "Eventos" },
  "channel.delivery": { es: "Delivery propio", en: "Own delivery", pt: "Delivery próprio" },
  "channel.catering": { es: "Catering", en: "Catering", pt: "Catering" },
  "channel.custom": { es: "Otra fuente", en: "Other source", pt: "Outra fonte" },

  "expense.rent": { es: "Alquiler", en: "Rent", pt: "Aluguel" },
  "expense.utilities": { es: "Servicios", en: "Utilities", pt: "Serviços" },
  "expense.payroll": { es: "Salarios y personal", en: "Salaries & staff", pt: "Salários e pessoal" },
  "expense.providers": { es: "Prestadores", en: "Providers", pt: "Prestadores" },
  "expense.taxes": { es: "Impuestos", en: "Taxes", pt: "Impostos" },
  "expense.marketing": { es: "Marketing", en: "Marketing", pt: "Marketing" },
  "expense.maintenance": { es: "Mantenimiento", en: "Maintenance", pt: "Manutenção" },
  "expense.financial": { es: "Financieros", en: "Financial", pt: "Financeiros" },
  "expense.purchases": { es: "Compras y varios", en: "Purchases & misc", pt: "Compras e diversos" },

  /* ---------------- Estados ---------------- */
  "status.underControl": { es: "Bajo control", en: "Under control", pt: "Sob controle" },
  "status.above": { es: "Por encima", en: "Above range", pt: "Acima da faixa" },
  "status.reviewExpense": { es: "Revisá este gasto", en: "Review this expense", pt: "Revise esta despesa" },
  "status.checkData": { es: "Revisar carga", en: "Check your data", pt: "Revisar lançamento" },
  "status.onTarget": { es: "En la meta", en: "On target", pt: "Na meta" },
  "status.belowTarget": { es: "Por debajo de la meta", en: "Below target", pt: "Abaixo da meta" },
  "status.investLittle": { es: "Invertís poco", en: "You invest too little", pt: "Você investe pouco" },
  "status.checkReturn": { es: "Revisá el retorno", en: "Check the return", pt: "Revise o retorno" },
  "status.loss": { es: "Pérdida", en: "Loss", pt: "Prejuízo" },
  "status.covered": { es: "Cubierto", en: "Covered", pt: "Coberto" },
  "status.notCovered": { es: "No cubierto", en: "Not covered", pt: "Não coberto" },

  /* ---------------- UI del cuestionario ---------------- */
  "dre.mensualNota": {
    es: "Cargá valores mensuales. Si elegiste un período de varios meses, usá el promedio por mes.",
    en: "Enter monthly values. If you chose a period of several months, use the monthly average.",
    pt: "Informe valores mensais. Se escolheu um período de vários meses, use a média por mês.",
  },
  "dre.ref": { es: "Referencia {min}–{max}%", en: "Benchmark {min}–{max}%", pt: "Referência {min}–{max}%" },
  "dre.otro": { es: "Otro", en: "Other", pt: "Outro" },
  "dre.anterior": { es: "Anterior", en: "Back", pt: "Anterior" },
  "dre.siguiente": { es: "Siguiente", en: "Next", pt: "Próximo" },
  "dre.verDashboard": { es: "Ver resultados", en: "View results", pt: "Ver resultados" },
  "dre.guardarCambios": { es: "Guardar cambios", en: "Save changes", pt: "Salvar alterações" },
  "dre.nombreConcepto": { es: "Nombre del concepto…", en: "Concept name…", pt: "Nome do conceito…" },
  "dre.otraFuente": { es: "¿Tenés otra fuente de ventas?", en: "Do you have another revenue source?", pt: "Você tem outra fonte de vendas?" },
  "dre.nombreFuente": { es: "Nombre de la fuente…", en: "Source name…", pt: "Nome da fonte…" },
  "dre.opcional": { es: "Opcional", en: "Optional", pt: "Opcional" },
  "dre.calculados": { es: "Calculados automáticamente", en: "Calculated automatically", pt: "Calculados automaticamente" },
  "dre.clientesMes": { es: "Clientes por mes", en: "Customers per month", pt: "Clientes por mês" },
  "dre.clientesDia": { es: "Clientes por día", en: "Customers per day", pt: "Clientes por dia" },
  "dre.ventaDia": { es: "Venta por día", en: "Sales per day", pt: "Venda por dia" },
  "dre.clientesEquilibrio": {
    es: "Clientes necesarios para cubrir el punto de equilibrio",
    en: "Customers needed to cover break-even",
    pt: "Clientes necessários para cobrir o ponto de equilíbrio",
  },
  "dre.rotacion": { es: "Rotación de mesas por día", en: "Table turns per day", pt: "Rotação de mesas por dia" },
  "dre.ayuda": { es: "Ver explicación", en: "See explanation", pt: "Ver explicação" },

  /* ---------------- Planillas guardadas ---------------- */
  "dre.moneda": { es: "Moneda de la planilla", en: "Sheet currency", pt: "Moeda da planilha" },
  "dre.planillas": { es: "Tus planillas", en: "Your sheets", pt: "Suas planilhas" },
  "dre.nuevaPlanilla": { es: "Nueva planilla", en: "New sheet", pt: "Nova planilha" },
  "dre.editarDatos": { es: "Editar datos", en: "Edit data", pt: "Editar dados" },
  "dre.guardar": { es: "Guardar", en: "Save", pt: "Salvar" },
  "dre.guardando": { es: "Guardando…", en: "Saving…", pt: "Salvando…" },
  "dre.guardado": { es: "Guardado", en: "Saved", pt: "Salvo" },
  "dre.errorGuardar": { es: "No pudimos guardar. Probá de nuevo.", en: "We couldn't save. Please try again.", pt: "Não conseguimos salvar. Tente novamente." },
  "dre.renombrar": { es: "Renombrar", en: "Rename", pt: "Renomear" },
  "dre.fijar": { es: "Fijar en el inicio", en: "Pin to home", pt: "Fixar no início" },
  "dre.fijada": { es: "Fijada en el inicio", en: "Pinned to home", pt: "Fixada no início" },
  "dre.borrar": { es: "Borrar", en: "Delete", pt: "Excluir" },
  "dre.borrarConfirm": {
    es: "¿Borrar esta planilla? No se puede recuperar.",
    en: "Delete this sheet? This can't be undone.",
    pt: "Excluir esta planilha? Não é possível recuperar.",
  },
  "dre.sinPlanillas": { es: "Todavía no guardaste ninguna planilla.", en: "You haven't saved any sheet yet.", pt: "Você ainda não salvou nenhuma planilha." },
  "dre.necesitaCuenta": {
    es: "Iniciá sesión para guardar tus planillas.",
    en: "Sign in to save your sheets.",
    pt: "Entre na sua conta para salvar suas planilhas.",
  },

  /* ---------------- Conversión de moneda ---------------- */
  "dre.convertir": { es: "Convertir moneda", en: "Convert currency", pt: "Converter moeda" },
  "dre.convertirTooltip": { es: "Usa la cotización oficial del día.", en: "Uses today's official rate.", pt: "Usa a cotação oficial do dia." },
  "dre.convertirA": { es: "Convertir a", en: "Convert to", pt: "Converter para" },
  "dre.convertirAccion": { es: "Convertir", en: "Convert", pt: "Converter" },
  "dre.convertirCancelar": { es: "Cancelar", en: "Cancel", pt: "Cancelar" },
  "dre.convertirError": {
    es: "No pudimos traer la cotización. No se convirtió nada.",
    en: "We couldn't fetch the rate. Nothing was converted.",
    pt: "Não conseguimos buscar a cotação. Nada foi convertido.",
  },
  "dre.convertirOk": { es: "Planilla convertida", en: "Sheet converted", pt: "Planilha convertida" },
  "dre.fxNota": { es: "Convertido de {from} a {to} · 1 {to} = {rate} {from} · {date}", en: "Converted from {from} to {to} · 1 {to} = {rate} {from} · {date}", pt: "Convertido de {from} para {to} · 1 {to} = {rate} {from} · {date}" },
  "dre.fxAtribucion": { es: "Cotizaciones: ExchangeRate-API", en: "Rates: ExchangeRate-API", pt: "Cotações: ExchangeRate-API" },

  /* ---------------- Resultados ---------------- */
  "results.titulo": { es: "Tus resultados", en: "Your results", pt: "Seus resultados" },
  "results.ventaNeta": { es: "Venta neta", en: "Net sales", pt: "Venda líquida" },
  "results.cmvTotal": { es: "CMV total", en: "Total COGS", pt: "CMV total" },
  "results.margenContribucion": { es: "Margen de contribución", en: "Contribution margin", pt: "Margem de contribuição" },
  "results.puntoEquilibrio": { es: "Punto de equilibrio", en: "Break-even point", pt: "Ponto de equilíbrio" },
  "results.totalGastos": { es: "Total de gastos operativos", en: "Total operating expenses", pt: "Total de despesas operacionais" },
  "results.facturacionCanal": { es: "Facturación por canal", en: "Revenue by channel", pt: "Faturamento por canal" },
  "results.desgloseGastos": { es: "Desglose de gastos", en: "Expense breakdown", pt: "Detalhe das despesas" },
  "results.sinVentas": { es: "Todavía no cargaste ventas.", en: "You haven't entered sales yet.", pt: "Você ainda não lançou vendas." },
  "results.ganancia": { es: "Ganancia", en: "Profit", pt: "Lucro" },
  "results.gananciaNeta": { es: "Ganancia neta", en: "Net profit", pt: "Lucro líquido" },
  "results.ticketMedio": { es: "Ticket medio", en: "Average ticket", pt: "Ticket médio" },
  "results.tuPct": { es: "Tu {pct} · Referencia {min}–{max}%", en: "Yours {pct} · Benchmark {min}–{max}%", pt: "Seu {pct} · Referência {min}–{max}%" },
  "results.referencias": { es: "Referencias del método", en: "Method benchmarks", pt: "Referências do método" },
  "results.ventaMinima": { es: "Venta mínima para no perder", en: "Minimum sales to break even", pt: "Venda mínima para não perder" },
  "results.sinReferencia": { es: "Sin referencia", en: "No benchmark", pt: "Sem referência" },

  /* ---------------- Campos de fuentes opcionales (plantilla) ---------------- */
  "field.net_sales.source": { es: "Venta neta {source}", en: "{source} net sales", pt: "Venda líquida {source}" },
  "field.cmv.source": { es: "CMV {source}", en: "{source} COGS", pt: "CMV {source}" },
  "dre.fuenteSinNombre": { es: "otra fuente", en: "other source", pt: "outra fonte" },
};

export const dreTranslationKeys: string[] = Object.keys(dreTranslations);

export function hasDreKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(dreTranslations, key);
}

export function dreT(key: string, lang: Lang): string {
  const entry = dreTranslations[key];
  if (!entry) {
    if (import.meta.env?.DEV) console.warn(`[dre-i18n] clave faltante: ${key}`);
    return key;
  }
  return (entry as unknown as Record<string, string>)[lang] ?? entry.es ?? key;
}

/** Nombre de la fuente tal como se inserta en "Venta neta {source}". */
export function sourceLabel(kind: string, lang: Lang, customName?: string): string {
  if (kind === "custom") {
    const name = (customName ?? "").trim();
    return name || dreT("dre.fuenteSinNombre", lang);
  }
  const title = dreT(`section.${kind}.title`, lang);
  return lang === "en" ? title : title.toLocaleLowerCase(lang === "pt" ? "pt-BR" : "es-AR");
}

export function sourceFieldLabel(type: "net_sales" | "cmv", kind: string, lang: Lang, customName?: string): string {
  return dreT(`field.${type}.source`, lang).replace("{source}", sourceLabel(kind, lang, customName));
}

export function tChannel(id: string, lang: Lang): string {
  return dreT(`channel.${id}`, lang);
}

export function tExpense(id: string, lang: Lang): string {
  return dreT(`expense.${id}`, lang);
}

export function refLabel(reference: [number, number], lang: Lang): string {
  return dreT("dre.ref", lang).replace("{min}", String(reference[0])).replace("{max}", String(reference[1]));
}
