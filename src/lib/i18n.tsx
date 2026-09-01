import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { LANG_COOKIE, readPrefs, writePrefCookie } from "@/lib/prefs";
import { studentDict } from "@/lib/i18n-dicts/student";
import { toolsDict } from "@/lib/i18n-dicts/tools";
import { authDict } from "@/lib/i18n-dicts/auth";

export type Lang = "es" | "en" | "pt";

const baseTranslations = {

  // Navbar
  "nav.inicio": { es: "Inicio", en: "Home", pt: "Início" },
  "nav.dre": { es: "Diagnóstico GPS", en: "GPS Diagnosis", pt: "Diagnóstico GPS" },
  "nav.herramientas": { es: "Herramientas", en: "Tools", pt: "Ferramentas" },
  "nav.mentoria": { es: "Contenido", en: "Content", pt: "Conteúdo" },
  "nav.planes": { es: "Planes", en: "Plans", pt: "Planos" },
  "nav.productos": { es: "Tienda", en: "Store", pt: "Loja" },
  "nav.perfil": { es: "Mi Perfil", en: "My Profile", pt: "Meu Perfil" },
  "nav.admin": { es: "Admin", en: "Admin", pt: "Admin" },
  "nav.asistente": { es: "Asistente IA", en: "AI Assistant", pt: "Assistente IA" },
  "nav.cerrarSesion": { es: "Cerrar Sesión", en: "Log Out", pt: "Sair" },
  "nav.iniciarSesion": { es: "Iniciar Sesión", en: "Log In", pt: "Entrar" },
  "nav.entrar": { es: "Entrar", en: "Sign In", pt: "Entrar" },
  "nav.buscar": { es: "Buscar cursos, productos...", en: "Search courses, products...", pt: "Buscar cursos, produtos..." },
  "nav.cambiarTema": { es: "Cambiar tema", en: "Toggle theme", pt: "Alternar tema" },
  "nav.temaClaro": { es: "Cambiar a modo claro", en: "Switch to light mode", pt: "Mudar para modo claro" },
  "nav.temaClaroCorto": { es: "Claro", en: "Light", pt: "Claro" },
  "nav.temaOscuroCorto": { es: "Oscuro", en: "Dark", pt: "Escuro" },
  "nav.temaOscuro": { es: "Cambiar a modo oscuro", en: "Switch to dark mode", pt: "Mudar para modo escuro" },
  "nav.abrirMenu": { es: "Abrir menú", en: "Open menu", pt: "Abrir menu" },
  "nav.cerrarMenu": { es: "Cerrar menú", en: "Close menu", pt: "Fechar menu" },

  // Home page
  "home.badge": { es: "Gestión · Procesos · Sustentabilidad", en: "Management · Processes · Sustainability", pt: "Gestão · Processos · Sustentabilidade" },
  "home.heroTitle1": { es: "Transforma tu restaurante con ", en: "Transform your restaurant with ", pt: "Transforme seu restaurante com " },
  "home.heroTitle2": { es: "datos y estrategia", en: "data and strategy", pt: "dados e estratégia" },
  "home.heroDesc": { es: "Soy Daniel Gimenez, y hace más de 35 años ayudo a restaurantes a ser más rentables, organizados y sustentables. Bienvenido a tu plataforma de crecimiento gastronómico.", en: "I'm Daniel Gimenez, and for over 35 years I've been helping restaurants become more profitable, organized, and sustainable. Welcome to your gastronomic growth platform.", pt: "Sou Daniel Gimenez, e há mais de 35 anos ajudo restaurantes a serem mais rentáveis, organizados e sustentáveis. Bem-vindo à sua plataforma de crescimento gastronômico." },
  "home.explorarCursos": { es: "Explorar Cursos", en: "Explore Courses", pt: "Explorar Cursos" },
  "home.diagnosticar": { es: "Diagnosticar mi Restaurante", en: "Diagnose my Restaurant", pt: "Diagnosticar meu Restaurante" },
  "home.stat.experiencia": { es: "Años de experiencia", en: "Years of experience", pt: "Anos de experiência" },
  "home.stat.restaurantes": { es: "Restaurantes asesorados", en: "Restaurants advised", pt: "Restaurantes assessorados" },
  "home.stat.cursos": { es: "Cursos y talleres", en: "Courses and workshops", pt: "Cursos e workshops" },
  "home.stat.satisfaccion": { es: "Satisfacción de clientes", en: "Client satisfaction", pt: "Satisfação dos clientes" },
  "home.conoce": { es: "Conoce a ", en: "Meet ", pt: "Conheça " },
  "home.aboutP1": { es: "Con más de 35 años en el sector gastronómico, Daniel ha transformado la operación de cientos de restaurantes en América Latina y España.", en: "With over 35 years in the gastronomic sector, Daniel has transformed the operations of hundreds of restaurants in Latin America and Spain.", pt: "Com mais de 35 anos no setor gastronômico, Daniel transformou a operação de centenas de restaurantes na América Latina e Espanha." },
  "home.aboutP2": { es: "Su enfoque combina análisis financiero riguroso con estrategias prácticas que cualquier operador puede implementar, sin importar el tamaño de su negocio.", en: "His approach combines rigorous financial analysis with practical strategies that any operator can implement, regardless of business size.", pt: "Sua abordagem combina análise financeira rigorosa com estratégias práticas que qualquer operador pode implementar, independentemente do tamanho do negócio." },
  "home.aboutP3": { es: "Fundador de GPS Gastronômico, una metodología que integra Gestión, Procesos y Sustentabilidad para crear restaurantes que prosperan a largo plazo.", en: "Founder of GPS Gastronômico, a methodology that integrates Management, Processes, and Sustainability to create restaurants that thrive long-term.", pt: "Fundador do GPS Gastronômico, uma metodologia que integra Gestão, Processos e Sustentabilidade para criar restaurantes que prosperam no longo prazo." },
  "home.metodo": { es: "Nuestro ", en: "Our ", pt: "Nosso " },
  "home.metodoWord": { es: "Método", en: "Method", pt: "Método" },
  "home.metodoDesc": { es: "Un proceso probado en más de 200 restaurantes para llevar tu negocio al siguiente nivel.", en: "A proven process in over 200 restaurants to take your business to the next level.", pt: "Um processo testado em mais de 200 restaurantes para levar seu negócio ao próximo nível." },
  "home.step.diagnostico": { es: "Diagnóstico", en: "Diagnosis", pt: "Diagnóstico" },
  "home.step.diagnosticoDesc": { es: "Analizamos los números reales de tu operación con nuestro DRE interactivo.", en: "We analyze the real numbers of your operation with our interactive DRE.", pt: "Analisamos os números reais da sua operação com nosso DRE interativo." },
  "home.step.estrategia": { es: "Estrategia", en: "Strategy", pt: "Estratégia" },
  "home.step.estrategiaDesc": { es: "Diseñamos un plan de acción basado en datos, no en suposiciones.", en: "We design an action plan based on data, not assumptions.", pt: "Desenhamos um plano de ação baseado em dados, não em suposições." },
  "home.step.implementacion": { es: "Implementación", en: "Implementation", pt: "Implementação" },
  "home.step.implementacionDesc": { es: "Te acompañamos paso a paso con herramientas y mentoría directa.", en: "We accompany you step by step with tools and direct mentorship.", pt: "Acompanhamos você passo a passo com ferramentas e mentoria direta." },
  "home.step.resultados": { es: "Resultados", en: "Results", pt: "Resultados" },
  "home.step.resultadosDesc": { es: "Medimos el impacto y ajustamos para crecimiento sostenible.", en: "We measure the impact and adjust for sustainable growth.", pt: "Medimos o impacto e ajustamos para crescimento sustentável." },
  "home.testimonios": { es: "Lo que dicen nuestros ", en: "What our ", pt: "O que dizem nossos " },
  "home.testimoniosWord": { es: "clientes", en: "clients say", pt: "clientes" },
  "home.ctaTitle": { es: "¿Listo para transformar tu restaurante?", en: "Ready to transform your restaurant?", pt: "Pronto para transformar seu restaurante?" },
  "home.ctaDesc": { es: "Comienza hoy con un diagnóstico gratuito o explora nuestros cursos y herramientas.", en: "Start today with a free diagnosis or explore our courses and tools.", pt: "Comece hoje com um diagnóstico gratuito ou explore nossos cursos e ferramentas." },
  "home.hacerDiag": { es: "Hacer Diagnóstico", en: "Run Diagnosis", pt: "Fazer Diagnóstico" },
  "home.hablarAsistente": { es: "Hablar con el Asistente IA", en: "Talk to AI Assistant", pt: "Falar com o Assistente IA" },
  "home.fotoDesc": { es: "Foto de Daniel Gimenez", en: "Photo of Daniel Gimenez", pt: "Foto de Daniel Gimenez" },
  "home.reproducir": { es: "Reproducir", en: "Play", pt: "Reproduzir" },

  // Cursos
  "cursos.titulo": { es: "Catálogo de Cursos", en: "Course Catalog", pt: "Catálogo de Cursos" },
  "cursos.desc": { es: "Aprendé a gestionar y hacer crecer tu restaurante con nuestros cursos exclusivos.", en: "Learn to manage and grow your restaurant with our exclusive courses.", pt: "Aprenda a gerenciar e fazer crescer seu restaurante com nossos cursos exclusivos." },
  "cursos.lecciones": { es: "lecciones", en: "lessons", pt: "aulas" },
  "cursos.bloqueado": { es: "Solo para suscriptores", en: "Subscribers only", pt: "Apenas para assinantes" },
  "cursos.suscribete": { es: "Suscribite para acceder a todo el contenido", en: "Subscribe to access all content", pt: "Assine para acessar todo o conteúdo" },
  "cursos.verCurso": { es: "Ver Clases", en: "View Lessons", pt: "Ver Aulas" },
  "cursos.continuar": { es: "Continuar", en: "Continue", pt: "Continuar" },
  "cursos.gratis": { es: "Vista previa", en: "Free preview", pt: "Pré-visualização" },
  "cursos.vacio": { es: "Aún no hay cursos disponibles.", en: "No courses available yet.", pt: "Ainda não há cursos disponíveis." },
  "cursos.cargando": { es: "Cargando cursos...", en: "Loading courses...", pt: "Carregando cursos..." },
  "cursos.acceso": { es: "Tenés acceso completo a todos los cursos", en: "You have full access to all courses", pt: "Você tem acesso completo a todos os cursos" },
  "cursos.reproducir": { es: "Reproducir", en: "Play", pt: "Reproduzir" },
  "cursos.aulas": { es: "Clases", en: "Lessons", pt: "Aulas" },
  "cursos.aulaBloqueada": { es: "Esta aula es exclusiva para suscriptores", en: "This lesson is for subscribers only", pt: "Esta aula é exclusiva para assinantes" },
  "cursos.verPlanes": { es: "Ver Planes", en: "View Plans", pt: "Ver Planos" },
  "cursos.volver": { es: "Volver a la mentoría", en: "Back to mentorship", pt: "Voltar à mentoria" },
  "cursos.sinAulas": { es: "Este curso aún no tiene aulas.", en: "This course has no lessons yet.", pt: "Este curso ainda não tem aulas." },
  "cursos.sinVideo": { es: "Esta aula aún no tiene video.", en: "This lesson has no video yet.", pt: "Esta aula ainda não tem vídeo." },
  "cursos.heroKicker": { es: "Mentoría · Método GPS", en: "Mentorship · GPS Method", pt: "Mentoria · Método GPS" },
  "cursos.heroResumen": { es: "módulos · {n} clases con videos y materiales descargables.", en: "modules · {n} lessons with videos and downloadable materials.", pt: "módulos · {n} aulas com vídeos e materiais para download." },
  "cursos.heroResumenFallback": { es: "Módulos con videos y materiales descargables.", en: "Modules with videos and downloadable materials.", pt: "Módulos com vídeos e materiais para download." },
  "cursos.heroTagline": { es: "La metodología profesional para transformar tu restaurante.", en: "The professional methodology to transform your restaurant.", pt: "A metodologia profissional para transformar seu restaurante." },
  "cursos.modulosTitulo": { es: "Módulos del curso", en: "Course modules", pt: "Módulos do curso" },
  "cursos.modulosDesc": { es: "Seguí el orden sugerido, de los fundamentos a la educación financiera.", en: "Follow the suggested order, from the fundamentals to financial education.", pt: "Siga a ordem sugerida, dos fundamentos à educação financeira." },
  "cursos.modulo": { es: "módulo", en: "module", pt: "módulo" },
  "cursos.modulos": { es: "módulos", en: "modules", pt: "módulos" },
  "cursos.moduloBadge": { es: "MÓDULO", en: "MODULE", pt: "MÓDULO" },
  "cursos.proximamente": { es: "Próximamente.", en: "Coming soon.", pt: "Em breve." },
  "cursos.catalogoAdicional": { es: "Catálogo Adicional", en: "Additional Catalog", pt: "Catálogo Adicional" },
  "cursos.requierePremium": { es: "Requiere Premium", en: "Requires Premium", pt: "Requer Premium" },
  "cursos.leccionPremium": { es: "Esta lección requiere el Plan Premium.", en: "This lesson requires the Premium Plan.", pt: "Esta aula requer o Plano Premium." },
  "cursos.actualizarPremium": { es: "Actualizar a Premium", en: "Upgrade to Premium", pt: "Atualizar para Premium" },
  "cursos.parte": { es: "Parte", en: "Part", pt: "Parte" },
  "cursos.clasePractica": { es: "Clase práctica · Material descargable", en: "Practical class · Downloadable material", pt: "Aula prática · Material para download" },
  "cursos.clasePracticaDesc": { es: "Esta clase no tiene video: se trabaja con los materiales de apoyo que están más abajo.", en: "This class has no video: work with the support materials below.", pt: "Esta aula não tem vídeo: trabalhe com os materiais de apoio abaixo." },
  "cursos.videoProximamente": { es: "Video próximamente", en: "Video coming soon", pt: "Vídeo em breve" },
  "cursos.completada": { es: "Completada", en: "Completed", pt: "Concluída" },
  "cursos.marcarCompletada": { es: "Marcar como completada", en: "Mark as completed", pt: "Marcar como concluída" },
  "cursos.materiales": { es: "Materiales de apoyo", en: "Support materials", pt: "Materiais de apoio" },
  "cursos.disponibleProximamente": { es: "Disponible próximamente", en: "Available soon", pt: "Disponível em breve" },
  "cursos.descargar": { es: "Descargar", en: "Download", pt: "Baixar" },
  "cursos.actualizarParaDescargar": { es: "Actualizá a Premium para descargar", en: "Upgrade to Premium to download", pt: "Atualize para Premium para baixar" },
  "cursos.progreso": { es: "Progreso", en: "Progress", pt: "Progresso" },
  "cursos.descargaIniciada": { es: "Descarga iniciada", en: "Download started", pt: "Download iniciado" },
  "cursos.errorDescarga": { es: "Error al descargar", en: "Download error", pt: "Erro ao baixar" },
  "cursos.noSePudoDescargar": { es: "No se pudo descargar", en: "Could not download", pt: "Não foi possível baixar" },
  "cursos.intentaNuevamente": { es: "Intentá nuevamente", en: "Please try again", pt: "Tente novamente" },
  "cursos.iniciaSesionDescargar": { es: "Iniciá sesión para descargar", en: "Sign in to download", pt: "Entre para baixar" },
  "cursos.sesionExpirada": { es: "Sesión expirada", en: "Session expired", pt: "Sessão expirada" },
  "cursos.volverIniciarSesion": { es: "Volvé a iniciar sesión.", en: "Please sign in again.", pt: "Faça login novamente." },
  "cursos.sinAccesoMaterial": { es: "Sin acceso a este material", en: "No access to this material", pt: "Sem acesso a este material" },
  "cursos.actualizaPlan": { es: "Actualizá tu plan para descargarlo.", en: "Upgrade your plan to download it.", pt: "Atualize seu plano para baixar." },

  // DRE mockup preview (home)
  "dreMock.kicker": { es: "Herramientas · DRE", en: "Tools · P&L", pt: "Ferramentas · DRE" },
  "dreMock.titulo": { es: "Resultado mensual", en: "Monthly result", pt: "Resultado mensal" },
  "dreMock.periodo": { es: "mayo 2026", en: "May 2026", pt: "maio 2026" },
  "dreMock.ventasMes": { es: "Ventas del mes", en: "Monthly sales", pt: "Vendas do mês" },
  "dreMock.cmvCompras": { es: "CMV — compras del mes", en: "COGS — monthly purchases", pt: "CMV — compras do mês" },
  "dreMock.grupoPersonal": { es: "Personal", en: "Payroll", pt: "Pessoal" },
  "dreMock.grupoFijos": { es: "Fijos", en: "Fixed", pt: "Fixos" },
  "dreMock.grupoVariables": { es: "Variables y otros", en: "Variable and others", pt: "Variáveis e outros" },
  "dreMock.sueldosCocina": { es: "Sueldos cocina", en: "Kitchen wages", pt: "Salários cozinha" },
  "dreMock.sueldosSalon": { es: "Sueldos salón", en: "Front-of-house wages", pt: "Salários salão" },
  "dreMock.cargasSociales": { es: "Cargas sociales", en: "Payroll taxes", pt: "Encargos sociais" },
  "dreMock.alquiler": { es: "Alquiler", en: "Rent", pt: "Aluguel" },
  "dreMock.servicios": { es: "Servicios (luz, gas, agua)", en: "Utilities (power, gas, water)", pt: "Serviços (luz, gás, água)" },
  "dreMock.contabilidad": { es: "Contabilidad", en: "Accounting", pt: "Contabilidade" },
  "dreMock.delivery": { es: "Comisiones delivery", en: "Delivery commissions", pt: "Comissões delivery" },
  "dreMock.marketing": { es: "Marketing", en: "Marketing", pt: "Marketing" },
  "dreMock.mantenimiento": { es: "Mantenimiento", en: "Maintenance", pt: "Manutenção" },
  "dreMock.subtotal": { es: "Subtotal", en: "Subtotal", pt: "Subtotal" },
  "dreMock.resultadoMes": { es: "Resultado del mes", en: "Result of the month", pt: "Resultado do mês" },
  "dreMock.ventas": { es: "Ventas", en: "Sales", pt: "Vendas" },
  "dreMock.cmv": { es: "CMV", en: "COGS", pt: "CMV" },
  "dreMock.margenContribucion": { es: "Margen de contribución", en: "Contribution margin", pt: "Margem de contribuição" },
  "dreMock.resultadoOperativo": { es: "Resultado operativo", en: "Operating result", pt: "Resultado operacional" },
  "dreMock.margenNeto": { es: "Margen neto", en: "Net margin", pt: "Margem líquida" },
  "dreMock.puntoEquilibrio": { es: "Punto de equilibrio", en: "Break-even point", pt: "Ponto de equilíbrio" },
  "dreMock.diagnostico": { es: "Diagnóstico GPS", en: "GPS Diagnosis", pt: "Diagnóstico GPS" },
  "dreMock.ideal": { es: "ideal", en: "ideal", pt: "ideal" },
  "dreMock.footer": { es: "Método GPS · Gestión — Procesos — Sostenibilidad", en: "GPS Method · Management — Processes — Sustainability", pt: "Método GPS · Gestão — Processos — Sustentabilidade" },

  // Dashboard
  "dashboard.badge": { es: "Diagnóstico GPS", en: "GPS Diagnosis", pt: "Diagnóstico GPS" },
  "dashboard.titulo1": { es: "Diagnóstico de tu ", en: "Diagnosis of your ", pt: "Diagnóstico do seu " },
  "dashboard.titulo2": { es: "Restaurante", en: "Restaurant", pt: "Restaurante" },
  "dashboard.desc": { es: "Selecciona el período de análisis y completa los datos financieros.", en: "Select the analysis period and fill in the financial data.", pt: "Selecione o período de análise e preencha os dados financeiros." },
  "dashboard.periodo": { es: "Período de Análisis", en: "Analysis Period", pt: "Período de Análise" },
  "dashboard.nuevoDiag": { es: "Nuevo Diagnóstico", en: "New Diagnosis", pt: "Novo Diagnóstico" },

  // Tienda
  "tienda.titulo": { es: "Tienda GPS Gastronómico", en: "GPS Gastronómico Store", pt: "Loja GPS Gastronômico" },
  "tienda.desc": { es: "Servicios premium y productos exclusivos para profesionales gastronómicos.", en: "Premium services and exclusive products for gastronomic professionals.", pt: "Serviços premium e produtos exclusivos para profissionais gastronômicos." },
  "tienda.comprar": { es: "Comprar", en: "Buy", pt: "Comprar" },
  "tienda.consultar": { es: "Consultar", en: "Inquire", pt: "Consultar" },
  "tienda.ver": { es: "Ver", en: "View", pt: "Ver" },
  "tienda.desde": { es: "Desde", en: "From", pt: "A partir de" },
  "tienda.personalizado": { es: "Consultar Personalizado", en: "Custom Quote", pt: "Consultar Personalizado" },
  "tienda.completarCompra": { es: "Completar Compra", en: "Complete Purchase", pt: "Concluir Compra" },

  // Planes
  "planes.titulo": { es: "Elegí tu Plan", en: "Choose your Plan", pt: "Escolha seu Plano" },
  "planes.desc": { es: "Invertí en el crecimiento de tu negocio gastronómico con herramientas, contenido y acompañamiento profesional.", en: "Invest in the growth of your gastronomic business with tools, content, and professional support.", pt: "Invista no crescimento do seu negócio gastronômico com ferramentas, conteúdo e acompanhamento profissional." },
  "planes.suscribirme": { es: "Suscribirme", en: "Subscribe", pt: "Assinar" },
  "planes.masPopular": { es: "Más Popular", en: "Most Popular", pt: "Mais Popular" },
  "planes.completarSub": { es: "Completar Suscripción", en: "Complete Subscription", pt: "Concluir Assinatura" },
  "planes.planActual": { es: "Tu plan actual", en: "Your current plan", pt: "Seu plano atual" },
  "planes.gestionar": { es: "Gestionar suscripción", en: "Manage subscription", pt: "Gerenciar assinatura" },
  "planes.gestionarDesc": { es: "Cambiá de plan, actualizá tu método de pago o cancelá cuando quieras.", en: "Change plan, update payment method or cancel anytime.", pt: "Mude de plano, atualize seu método de pagamento ou cancele quando quiser." },
  "planes.equivalente": { es: "facturado anualmente", en: "billed annually", pt: "faturado anualmente" },
  "planes.ahorra": { es: "Ahorrás", en: "You save", pt: "Você economiza" },
  "planes.alAno": { es: "/año", en: "/yr", pt: "/ano" },
  "planes.compararTitulo": { es: "Compará los planes en detalle", en: "Compare plans in detail", pt: "Compare os planos em detalhe" },
  "planes.feature": { es: "Característica", en: "Feature", pt: "Característica" },
  "planes.faqTitulo": { es: "Preguntas frecuentes sobre planes", en: "Frequently asked questions about plans", pt: "Perguntas frequentes sobre planos" },
  "planes.faqQ1": { es: "¿Puedo cancelar cuando quiera?", en: "Can I cancel anytime?", pt: "Posso cancelar quando quiser?" },
  "planes.faqA1": { es: "Sí. Podés cancelar tu suscripción en cualquier momento desde 'Gestionar suscripción'. Mantenés el acceso hasta el final del período pagado.", en: "Yes. You can cancel your subscription anytime from 'Manage subscription'. You keep access until the end of the paid period.", pt: "Sim. Você pode cancelar sua assinatura a qualquer momento em 'Gerenciar assinatura'. Mantém o acesso até o final do período pago." },
  "planes.faqQ2": { es: "¿Puedo cambiar de Academy a Academy Pro?", en: "Can I switch from Academy to Academy Pro?", pt: "Posso mudar do Academy para o Academy Pro?" },
  "planes.faqA2": { es: "Sí, podés hacer upgrade o downgrade cuando quieras. La diferencia se prorratea automáticamente.", en: "Yes, you can upgrade or downgrade anytime. The difference is prorated automatically.", pt: "Sim, você pode fazer upgrade ou downgrade quando quiser. A diferença é calculada proporcionalmente de forma automática." },
  "planes.faqQ3": { es: "¿Qué métodos de pago aceptan?", en: "What payment methods do you accept?", pt: "Quais métodos de pagamento aceitam?" },
  "planes.faqA3": { es: "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de Stripe.", en: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe.", pt: "Aceitamos todos os principais cartões de crédito e débito (Visa, Mastercard, American Express) através do Stripe." },
  "planes.faqQ4": { es: "¿Hay garantía de reembolso?", en: "Is there a money-back guarantee?", pt: "Existe garantia de reembolso?" },
  "planes.faqA4": { es: "Ofrecemos 7 días de garantía. Si no estás conforme, te devolvemos el 100% de lo pagado, sin preguntas.", en: "We offer a 7-day guarantee. If you're not satisfied, we refund 100% with no questions asked.", pt: "Oferecemos garantia de 7 dias. Se você não estiver satisfeito, devolvemos 100% do valor pago, sem perguntas." },
  "planes.faqQ5": { es: "¿La factura anual incluye los 12 meses de una vez?", en: "Does the annual invoice cover all 12 months at once?", pt: "A fatura anual cobre os 12 meses de uma vez?" },
  "planes.faqA5": { es: "Sí. Pagás una sola vez por todo el año y obtenés un 15% de descuento sobre el precio mensual. Además, todos los planes incluyen 5 días de prueba gratis.", en: "Yes. You pay once for the whole year and get a 15% discount over the monthly price. All plans also include a 5-day free trial.", pt: "Sim. Você paga uma única vez pelo ano todo e ganha 15% de desconto sobre o preço mensal. Todos os planos incluem 5 dias grátis de teste." },
  "planes.garantia": { es: "Garantía de 7 días — devolvemos el 100% si no estás conforme", en: "7-day guarantee — 100% refund if you're not satisfied", pt: "Garantia de 7 dias — devolvemos 100% se você não estiver satisfeito" },
  "planes.pagoSeguro": { es: "Pago seguro vía Stripe", en: "Secure payment via Stripe", pt: "Pagamento seguro via Stripe" },

  "compare.cursos": { es: "Acceso a todos los cursos", en: "Access to all courses", pt: "Acesso a todos os cursos" },
  "compare.clases": { es: "Clases de la mentoría", en: "Mentorship classes", pt: "Aulas da mentoria" },
  "compare.tools": { es: "Todas las herramientas de gestión (DRE, Punto de Equilibrio, Caja, CMV, Fichas Técnicas)", en: "All management tools (DRE, Break-even, Cash, CMV, Recipe Cards)", pt: "Todas as ferramentas de gestão (DRE, Ponto de Equilíbrio, Caixa, CMV, Fichas Técnicas)" },
  "compare.vip": { es: "Grupo VIP de WhatsApp", en: "VIP WhatsApp group", pt: "Grupo VIP no WhatsApp" },
  "compare.soporte": { es: "Soporte diario del equipo de Daniel", en: "Daily support from Daniel's team", pt: "Suporte diário da equipe do Daniel" },
  "compare.dre": { es: "Planillas DRE y SUP", en: "DRE & SUP spreadsheets", pt: "Planilhas DRE e SUP" },
  "compare.foodcost": { es: "Calculadora de Food Cost", en: "Food Cost Calculator", pt: "Calculadora de Food Cost" },
  "compare.asistente": { es: "Asistente IA gastronómico", en: "Gastronomic AI Assistant", pt: "Assistente IA gastronômico" },
  "compare.comunidad": { es: "Comunidad privada", en: "Private community", pt: "Comunidade privada" },
  "compare.mentoria": { es: "Mentoría grupal mensual", en: "Monthly group mentorship", pt: "Mentoria em grupo mensal" },
  "compare.individual": { es: "Acceso prioritario a mentorías 1:1", en: "Priority access to 1:1 mentorship", pt: "Acesso prioritário a mentorias 1:1" },
  "compare.whatsapp": { es: "Soporte directo por WhatsApp", en: "Direct WhatsApp support", pt: "Suporte direto por WhatsApp" },
  "compare.descuentos": { es: "Descuentos en la tienda", en: "Store discounts", pt: "Descontos na loja" },
  "compare.contenido": { es: "Contenido exclusivo avanzado", en: "Exclusive advanced content", pt: "Conteúdo exclusivo avançado" },
  "compare.actualizaciones": { es: "Actualizaciones mensuales", en: "Monthly updates", pt: "Atualizações mensais" },

  // Perfil
  "perfil.titulo": { es: "Mi Perfil", en: "My Profile", pt: "Meu Perfil" },
  "perfil.miembro": { es: "Miembro desde enero 2025", en: "Member since January 2025", pt: "Membro desde janeiro de 2025" },
  "perfil.misCursos": { es: "Mis Cursos", en: "My Courses", pt: "Meus Cursos" },
  "perfil.cursosDesc": { es: "2 cursos en progreso", en: "2 courses in progress", pt: "2 cursos em andamento" },
  "perfil.misCompras": { es: "Mis Compras", en: "My Purchases", pt: "Minhas Compras" },
  "perfil.comprasDesc": { es: "3 productos adquiridos", en: "3 products purchased", pt: "3 produtos adquiridos" },
  "perfil.certificados": { es: "Certificados", en: "Certificates", pt: "Certificados" },
  "perfil.certificadosDesc": { es: "0 certificados obtenidos", en: "0 certificates obtained", pt: "0 certificados obtidos" },
  "perfil.suscripcion": { es: "Mi Suscripción", en: "My Subscription", pt: "Minha Assinatura" },
  "perfil.plan": { es: "Plan", en: "Plan", pt: "Plano" },
  "perfil.estado": { es: "Estado", en: "Status", pt: "Status" },
  "perfil.proximaCobranza": { es: "Próxima cobranza", en: "Next billing", pt: "Próxima cobrança" },
  "perfil.cancelaEn": { es: "Tu suscripción se cancelará el", en: "Your subscription will cancel on", pt: "Sua assinatura será cancelada em" },
  "perfil.activa": { es: "Activa", en: "Active", pt: "Ativa" },
  "perfil.prueba": { es: "En prueba", en: "Trialing", pt: "Em teste" },
  "perfil.cancelada": { es: "Cancelada", en: "Canceled", pt: "Cancelada" },
  "perfil.sinSuscripcion": { es: "No tenés una suscripción activa", en: "You don't have an active subscription", pt: "Você não tem uma assinatura ativa" },
  "perfil.sinSuscripcionDesc": { es: "Suscribite para acceder a todos los cursos y contenido exclusivo.", en: "Subscribe to access all courses and exclusive content.", pt: "Assine para acessar todos os cursos e conteúdo exclusivo." },
  "perfil.verPlanes": { es: "Ver Planes", en: "View Plans", pt: "Ver Planos" },
  "perfil.cargandoSub": { es: "Cargando suscripción...", en: "Loading subscription...", pt: "Carregando assinatura..." },
  "perfil.gestionar": { es: "Gestionar mi suscripción", en: "Manage my subscription", pt: "Gerenciar minha assinatura" },
  "perfil.gestionarDesc": { es: "Cancelar, actualizar método de pago o ver facturas.", en: "Cancel, update payment method or view invoices.", pt: "Cancelar, atualizar método de pagamento ou ver faturas." },
  "perfil.abriendoPortal": { es: "Abriendo portal...", en: "Opening portal...", pt: "Abrindo portal..." },
  "perfil.errorPortal": { es: "No se pudo abrir el portal. Intentá de nuevo.", en: "Could not open the portal. Please try again.", pt: "Não foi possível abrir o portal. Tente novamente." },
  "perfil.sinCliente": { es: "No tenés una suscripción de Stripe activa. Este botón es para suscriptores pagos.", en: "You don't have an active Stripe subscription. This button is for paying subscribers.", pt: "Você não tem uma assinatura Stripe ativa. Este botão é para assinantes pagos." },
  "perfil.detalleTecnico": { es: "Ver detalle técnico", en: "View technical detail", pt: "Ver detalhe técnico" },
  "perfil.datosPersonales": { es: "Datos personales", en: "Personal info", pt: "Dados pessoais" },
  "perfil.nombre": { es: "Nombre para mostrar", en: "Display name", pt: "Nome de exibição" },
  "perfil.guardar": { es: "Guardar cambios", en: "Save changes", pt: "Salvar alterações" },
  "perfil.guardando": { es: "Guardando...", en: "Saving...", pt: "Salvando..." },
  "perfil.guardado": { es: "Datos actualizados", en: "Profile updated", pt: "Dados atualizados" },
  "perfil.errorGuardar": { es: "No se pudo guardar. Intentá de nuevo.", en: "Could not save. Please try again.", pt: "Não foi possível salvar. Tente novamente." },
  "perfil.cursosVacio": { es: "Aún no empezaste ningún curso.", en: "You haven't started any course yet.", pt: "Você ainda não começou nenhum curso." },
  "perfil.verCatalogo": { es: "Ver catálogo", en: "View catalog", pt: "Ver catálogo" },
  "perfil.continuar": { es: "Continuar", en: "Continue", pt: "Continuar" },
  "perfil.lecciones": { es: "lecciones", en: "lessons", pt: "aulas" },
  "perfil.completadas": { es: "completadas", en: "completed", pt: "concluídas" },
  "perfil.ultimaVisita": { es: "Última visita", en: "Last visit", pt: "Última visita" },
  "perfil.cerrarSesion": { es: "Cerrar sesión", en: "Sign out", pt: "Sair" },

  // Login
  "login.bienvenido": { es: "Bienvenido de vuelta", en: "Welcome back", pt: "Bem-vindo de volta" },
  "login.titulo": { es: "Iniciar Sesión", en: "Sign In", pt: "Entrar" },
  "login.desc": { es: "Accede a tu cuenta para continuar", en: "Access your account to continue", pt: "Acesse sua conta para continuar" },
  "login.email": { es: "Email", en: "Email", pt: "Email" },
  "login.contrasena": { es: "Contraseña", en: "Password", pt: "Senha" },
  "login.olvidaste": { es: "¿Olvidaste tu contraseña?", en: "Forgot password?", pt: "Esqueceu sua senha?" },
  "login.ingresando": { es: "Ingresando...", en: "Signing in...", pt: "Entrando..." },
  "login.iniciar": { es: "Iniciar Sesión", en: "Sign In", pt: "Entrar" },
  "login.noCuenta": { es: "¿No tienes cuenta? ", en: "Don't have an account? ", pt: "Não tem conta? " },
  "login.registrate": { es: "Regístrate", en: "Sign Up", pt: "Cadastre-se" },
  "login.google": { es: "Continuar con Google", en: "Continue with Google", pt: "Continuar com Google" },
  "login.oConEmail": { es: "o con email", en: "or with email", pt: "ou com email" },
  "login.emailIncorrecto": { es: "Email o contraseña incorrectos.", en: "Incorrect email or password.", pt: "Email ou senha incorretos." },
  "login.noVerificado": { es: "Tu email aún no ha sido verificado. Revisa tu bandeja de entrada.", en: "Your email has not been verified yet. Check your inbox.", pt: "Seu email ainda não foi verificado. Verifique sua caixa de entrada." },

  // Dashboard Results
  "results.titulo": { es: "Tu Dashboard Financiero", en: "Your Financial Dashboard", pt: "Seu Dashboard Financeiro" },
  "results.desc": { es: "Análisis basado en tus datos del DRE", en: "Analysis based on your DRE data", pt: "Análise baseada nos seus dados do DRE" },
  "results.editar": { es: "Editar Datos", en: "Edit Data", pt: "Editar Dados" },
  "results.ventaBruta": { es: "Venta Bruta", en: "Gross Revenue", pt: "Venda Bruta" },
  "results.cmvTotal": { es: "CMV Total", en: "Total COGS", pt: "CMV Total" },
  "results.gop": { es: "GOP (Lucro Operativo)", en: "GOP (Operating Profit)", pt: "GOP (Lucro Operacional)" },
  "results.puntoEquilibrio": { es: "Punto de Equilibrio", en: "Break-Even Point", pt: "Ponto de Equilíbrio" },
  "results.ventaMinima": { es: "Venta mínima mensual", en: "Minimum monthly revenue", pt: "Venda mínima mensal" },
  "results.facturacionCanal": { es: "Facturación por Canal", en: "Revenue by Channel", pt: "Faturamento por Canal" },
  "results.desgloseGastos": { es: "Desglose de Gastos Operativos", en: "Operating Expense Breakdown", pt: "Detalhamento de Despesas Operacionais" },
  "results.totalOpex": { es: "Total OPEX", en: "Total OPEX", pt: "Total OPEX" },
  "results.resultadoNeto": { es: "Resultado Neto", en: "Net Result", pt: "Resultado Líquido" },
  "results.margenContribucion": { es: "Margen de Contribución", en: "Contribution Margin", pt: "Margem de Contribuição" },
  "results.lucroNeto": { es: "Lucro Neto", en: "Net Profit", pt: "Lucro Líquido" },
  "results.ticketMedio": { es: "Ticket Medio", en: "Average Ticket", pt: "Ticket Médio" },
  "results.noVentas": { es: "No se registraron ventas.", en: "No sales recorded.", pt: "Não foram registradas vendas." },
  "results.enRango": { es: "En rango", en: "In range", pt: "Na faixa" },
  "results.bajo": { es: "Bajo", en: "Low", pt: "Baixo" },
  "results.alto": { es: "Alto", en: "High", pt: "Alto" },

  // Period options
  "period.realtime": { es: "Tiempo Real", en: "Real Time", pt: "Tempo Real" },
  "period.1m": { es: "1 Mes", en: "1 Month", pt: "1 Mês" },
  "period.3m": { es: "3 Meses", en: "3 Months", pt: "3 Meses" },
  "period.6m": { es: "6 Meses", en: "6 Months", pt: "6 Meses" },
  "period.1y": { es: "1 Año", en: "1 Year", pt: "1 Ano" },

  // Home — Cómo funciona
  "home.howItWorks.badge": { es: "¿Cómo funciona?", en: "How it works", pt: "Como funciona?" },
  "home.howItWorks.title1": { es: "Una plataforma que combina ", en: "A platform that combines ", pt: "Uma plataforma que combina " },
  "home.howItWorks.title2": { es: "datos, formación y comunidad", en: "data, training and community", pt: "dados, formação e comunidade" },
  "home.howItWorks.desc": {
    es: "GPS Gastronômico reúne todo lo que tu restaurante necesita para crecer con números claros: diagnostica tu salud financiera, aprende con cursos prácticos y aplica con acompañamiento experto.",
    en: "GPS Gastronômico brings together everything your restaurant needs to grow with clear numbers: diagnose your financial health, learn with practical courses, and apply with expert guidance.",
  pt: "GPS Gastronômico reúne tudo o que seu restaurante precisa para crescer com números claros: diagnostique sua saúde financeira, aprenda com cursos práticos e aplique com acompanhamento especializado."
  },
  "home.howItWorks.b1Title": { es: "Diagnóstico financiero en tiempo real", en: "Real-time financial diagnosis", pt: "Diagnóstico financeiro em tempo real" },
  "home.howItWorks.b1Desc": {
    es: "Carga tus números semana a semana y mira cómo evolucionan tu facturación, CMV y margen al instante.",
    en: "Enter your numbers week by week and watch revenue, COGS and margin evolve instantly.",
  pt: "Carregue seus números semana a semana e veja como evoluem seu faturamento, CMV e margem instantaneamente."
  },
  "home.howItWorks.b2Title": { es: "Cursos prácticos de gestión", en: "Practical management courses", pt: "Cursos práticos de gestão" },
  "home.howItWorks.b2Desc": {
    es: "Mentorías y módulos paso a paso para dominar food cost, KPIs, equipos y crecimiento.",
    en: "Mentorships and step-by-step modules to master food cost, KPIs, teams and growth.",
  pt: "Mentorias e módulos passo a passo para dominar food cost, KPIs, equipes e crescimento."
  },
  "home.howItWorks.b3Title": { es: "Decisiones basadas en datos", en: "Data-driven decisions", pt: "Decisões baseadas em dados" },
  "home.howItWorks.b3Desc": {
    es: "Dashboards claros que te dicen dónde estás perdiendo dinero y qué palanca mover primero.",
    en: "Clear dashboards that show where you're losing money and which lever to pull first.",
  pt: "Dashboards claros que mostram onde você está perdendo dinheiro e qual alavanca puxar primeiro."
  },
  "home.howItWorks.b4Title": { es: "Acompañamiento experto", en: "Expert mentorship", pt: "Acompanhamento especializado" },
  "home.howItWorks.b4Desc": {
    es: "Acceso al método y al equipo de Daniel Gimenez, con +35 años transformando restaurantes.",
    en: "Access to Daniel Gimenez's method and team, with 35+ years transforming restaurants.",
  pt: "Acesso ao método e à equipe de Daniel Gimenez, com +35 anos transformando restaurantes."
  },
  "home.howItWorks.imgAlt": {
    es: "Vista del dashboard financiero de GPS Gastronômico",
    en: "View of the GPS Gastronômico financial dashboard",
  pt: "Visualização do dashboard financeiro do GPS Gastronômico"
  },

  // Footer
  "footer.tagline": {
    es: "Plataforma de formación y consultoría para profesionales gastronómicos. Datos, procesos y mentoría para transformar tu restaurante.",
    en: "Training and consulting platform for gastronomic professionals. Data, processes and mentorship to transform your restaurant.",
  pt: "Plataforma de formação e consultoria para profissionais gastronômicos. Dados, processos e mentoria para transformar seu restaurante."
  },
  "footer.explorar": { es: "Explorar", en: "Explore", pt: "Explorar" },
  "footer.recursos": { es: "Recursos", en: "Resources", pt: "Recursos" },
  "footer.legal": { es: "Legal", en: "Legal", pt: "Legal" },
  "footer.contacto": { es: "Contacto", en: "Contact", pt: "Contato" },
  "footer.terminos": { es: "Términos y Condiciones", en: "Terms & Conditions", pt: "Termos e Condições" },
  "footer.privacidad": { es: "Política de Privacidad", en: "Privacy Policy", pt: "Política de Privacidade" },
  "footer.reembolsos": { es: "Reembolsos y Cancelación", en: "Refunds & Cancellation", pt: "Reembolsos e Cancelamento" },
  "footer.cookies": { es: "Política de Cookies", en: "Cookie Policy", pt: "Política de Cookies" },
  "footer.dashboard": { es: "Diagnóstico DRE", en: "DRE Diagnosis", pt: "Diagnóstico DRE" },
  "footer.asistente": { es: "Asistente IA", en: "AI Assistant", pt: "Assistente IA" },
  "footer.faq": { es: "Preguntas frecuentes", en: "FAQ", pt: "Perguntas frequentes" },
  "footer.soporte": { es: "Soporte", en: "Support", pt: "Suporte" },
  "footer.newsletter": { es: "Recibe tips de gestión gastronómica", en: "Get gastronomy management tips", pt: "Receba dicas de gestão gastronômica" },
  "footer.suscribir": { es: "Suscribir", en: "Subscribe", pt: "Assinar" },
  "footer.email": { es: "Tu email", en: "Your email", pt: "Seu email" },
  "footer.derechos": { es: "Todos los derechos reservados.", en: "All rights reserved.", pt: "Todos os direitos reservados." },
  "footer.hechoCon": { es: "Hecho con", en: "Made with", pt: "Feito com" },
  "footer.para": { es: "para gastrónomos", en: "for gastronomes", pt: "para gastrônomos" },

  // Legal pages
  "legal.terminos.title": { es: "Términos y Condiciones", en: "Terms & Conditions", pt: "Termos e Condições" },
  "legal.privacidad.title": { es: "Política de Privacidad", en: "Privacy Policy", pt: "Política de Privacidade" },
  "legal.reembolsos.title": { es: "Política de Reembolsos y Cancelación", en: "Refunds & Cancellation Policy", pt: "Política de Reembolsos e Cancelamento" },
  "legal.actualizado": { es: "Última actualización", en: "Last updated", pt: "Última atualização" },

  // FAQ
  "home.faq.badge": { es: "Preguntas frecuentes", en: "Frequently asked questions", pt: "Perguntas frequentes" },
  "home.faq.title1": { es: "Resolvemos tus ", en: "We answer your ", pt: "Tiramos suas " },
  "home.faq.title2": { es: "dudas", en: "questions", pt: "dúvidas" },
  "home.faq.desc": {
    es: "Todo lo que necesitas saber antes de empezar con GPS Gastronômico.",
    en: "Everything you need to know before starting with GPS Gastronômico.",
  pt: "Tudo o que você precisa saber antes de começar com o GPS Gastronômico."
  },

  "home.faq.q1": { es: "¿Qué incluye la membresía?", en: "What does the membership include?", pt: "O que inclui a assinatura?" },
  "home.faq.a1": {
    es: "Acceso a todos los cursos, dashboard financiero (DRE) en tiempo real, herramientas de gestión, comunidad privada y mentorías en vivo según tu plan.",
    en: "Access to all courses, real-time financial dashboard (DRE), management tools, private community and live mentoring sessions depending on your plan.",
  pt: "Acesso a todos os cursos, dashboard financeiro (DRE) em tempo real, ferramentas de gestão, comunidade privada e mentorias ao vivo conforme seu plano."
  },

  "home.faq.q2": { es: "¿Cuáles son los planes disponibles?", en: "What plans are available?", pt: "Quais são os planos disponíveis?" },
  "home.faq.a2": {
    es: "Tenemos un plan mensual y un plan anual con descuento. Puedes ver el detalle completo y comparativa en la sección de Planes.",
    en: "We offer a monthly plan and a discounted annual plan. You can see the full breakdown and comparison in the Plans section.",
  pt: "Temos um plano mensal e um plano anual com desconto. Você pode ver o detalhamento completo e a comparação na seção de Planos."
  },

  "home.faq.q3": { es: "¿Puedo cancelar cuando quiera?", en: "Can I cancel anytime?", pt: "Posso cancelar quando quiser?" },
  "home.faq.a3": {
    es: "Sí. Puedes cancelar tu suscripción en cualquier momento desde tu perfil, sin penalizaciones ni preguntas.",
    en: "Yes. You can cancel your subscription anytime from your profile, with no penalties or questions asked.",
  pt: "Sim. Você pode cancelar sua assinatura a qualquer momento pelo seu perfil, sem penalidades nem perguntas."
  },

  "home.faq.q4": { es: "¿Los cursos otorgan certificado?", en: "Do courses provide a certificate?", pt: "Os cursos dão certificado?" },
  "home.faq.a4": {
    es: "Sí. Al completar cada curso recibes un certificado digital firmado por Daniel Gimenez que puedes compartir en LinkedIn y CVs.",
    en: "Yes. Upon completing each course you receive a digital certificate signed by Daniel Gimenez that you can share on LinkedIn and your CV.",
  pt: "Sim. Ao concluir cada curso você recebe um certificado digital assinado por Daniel Gimenez para compartilhar no LinkedIn e no currículo."
  },

  "home.faq.q5": { es: "¿Cómo funciona la mentoría?", en: "How does the mentorship work?", pt: "Como funciona a mentoria?" },
  "home.faq.a5": {
    es: "Las mentorías son sesiones grupales en vivo (y opcionalmente 1:1 en planes premium) donde revisamos tu DRE, tus desafíos operativos y diseñamos un plan de acción concreto.",
    en: "Mentorships are live group sessions (and optionally 1:1 in premium plans) where we review your DRE, operational challenges and design a concrete action plan.",
  pt: "As mentorias são sessões em grupo ao vivo (e opcionalmente 1:1 nos planos premium) onde revisamos seu DRE, seus desafios operacionais e desenhamos um plano de ação concreto."
  },

  "home.faq.q6": { es: "¿Necesito conocimientos previos de gestión?", en: "Do I need prior management knowledge?", pt: "Preciso ter conhecimentos prévios de gestão?" },
  "home.faq.a6": {
    es: "No. La metodología está pensada para todos los niveles, desde dueños sin formación financiera hasta chefs ejecutivos y gerentes de cadenas.",
    en: "No. The methodology is designed for all levels, from owners without financial training to executive chefs and chain managers.",
  pt: "Não. A metodologia é pensada para todos os níveis, desde donos sem formação financeira até chefs executivos e gerentes de redes."
  },

  "home.faq.q7": { es: "¿En cuánto tiempo veo resultados?", en: "How long until I see results?", pt: "Em quanto tempo vejo resultados?" },
  "home.faq.a7": {
    es: "La mayoría de nuestros mentorados ven mejoras concretas en margen y food cost en los primeros 60-90 días aplicando el método.",
    en: "Most of our mentees see concrete improvements in margin and food cost within the first 60-90 days applying the method.",
  pt: "A maioria dos nossos mentorados vê melhorias concretas em margem e food cost nos primeiros 60-90 dias aplicando o método."
  },

  "home.plans.badge": { es: "Planes y precios", en: "Plans & pricing", pt: "Planos e preços" },
  "home.plans.title1": { es: "Elegí el plan ideal para ", en: "Choose the right plan for ", pt: "Escolha o plano ideal para " },
  "home.plans.title2": { es: "tu restaurante", en: "your restaurant", pt: "seu restaurante" },
  "home.plans.desc": {
    es: "Empezá gratis o accedé a todo el método con nuestros planes de membresía.",
    en: "Start free or unlock the full method with our membership plans.",
  pt: "Comece grátis ou acesse todo o método com nossos planos de assinatura."
  },
  "home.plans.popular": { es: "Más popular", en: "Most popular", pt: "Mais popular" },
  "home.plans.perMonth": { es: "/mes", en: "/mo", pt: "/mês" },
  "home.plans.perYear": { es: "/año", en: "/yr", pt: "/ano" },
  "home.plans.billingMonthly": { es: "Mensual", en: "Monthly", pt: "Mensal" },
  "home.plans.billingYearly": { es: "Anual", en: "Yearly", pt: "Anual" },
  "home.plans.save20": { es: "Ahorra 15%", en: "Save 15%", pt: "Economize 15%" },
  "home.plans.viewAll": { es: "Ver todos los planes", en: "View all plans", pt: "Ver todos os planos" },
  "home.plans.ctaFree": { es: "Empezar gratis", en: "Start free", pt: "Começar grátis" },
  "home.plans.ctaPaid": { es: "Suscribirme", en: "Subscribe", pt: "Assinar" },

  "home.plans.freeName": { es: "Gratis", en: "Free", pt: "Grátis" },
  "home.plans.freePrice": { es: "$0", en: "$0", pt: "$0" },
  "home.plans.freeDesc": { es: "Probá la plataforma sin compromiso.", en: "Try the platform with no commitment.", pt: "Experimente a plataforma sem compromisso." },
  "home.plans.freeF1": { es: "Acceso a clases gratuitas", en: "Access to free lessons", pt: "Acesso a aulas gratuitas" },
  "home.plans.freeF2": { es: "Diagnóstico inicial", en: "Initial diagnosis", pt: "Diagnóstico inicial" },
  "home.plans.freeF3": { es: "Newsletter semanal", en: "Weekly newsletter", pt: "Newsletter semanal" },

  "home.plans.basicName": { es: "Academy", en: "Academy", pt: "Academy" },
  "home.plans.basicDesc": { es: "Todo lo que necesitás para controlar tu restaurante.", en: "Everything you need to control your restaurant.", pt: "Tudo o que você precisa para controlar seu restaurante." },
  "home.plans.basicF1": { es: "Curso completo GPS Gastronómico", en: "Complete GPS Gastronômico course", pt: "Curso completo GPS Gastronômico" },
  "home.plans.basicF2": { es: "Todas las herramientas de gestión", en: "All management tools", pt: "Todas as ferramentas de gestão" },
  "home.plans.basicF3": { es: "Comunidad de miembros", en: "Members community", pt: "Comunidade de membros" },
  "home.plans.basicF4": { es: "Actualizaciones mensuales", en: "Monthly updates", pt: "Atualizações mensais" },

  "home.plans.premiumName": { es: "Academy Pro", en: "Academy Pro", pt: "Academy Pro" },
  "home.plans.premiumDesc": { es: "Resultados acelerados con acompañamiento en vivo.", en: "Accelerated results with live guidance.", pt: "Resultados acelerados com acompanhamento ao vivo." },
  "home.plans.premiumF1": { es: "Todo lo de Academy", en: "Everything in Academy", pt: "Tudo do Academy" },
  "home.plans.premiumF2": { es: "Reunión semanal de implementación en vivo", en: "Weekly live implementation call", pt: "Reunião semanal de implementação ao vivo" },
  "home.plans.premiumF3": { es: "Caso Real del Mes", en: "Real Case of the Month", pt: "Caso Real do Mês" },
  "home.plans.premiumF4": { es: "Soporte prioritario", en: "Priority support", pt: "Suporte prioritário" },

  "nav.salaPro": { es: "Sala Pro", en: "Pro Room", pt: "Sala Pro" },
  "compare.reunion": { es: "Reunión semanal de implementación en vivo", en: "Weekly live implementation call", pt: "Reunião semanal de implementação ao vivo" },
  "compare.caso": { es: "Caso Real del Mes", en: "Real Case of the Month", pt: "Caso Real do Mês" },
  "compare.prioritario": { es: "Soporte prioritario", en: "Priority support", pt: "Suporte prioritário" },
  "compare.comunidadMiembros": { es: "Comunidad de miembros", en: "Members community", pt: "Comunidade de membros" },
  "compare.llamada1a1": { es: "Llamada 1 a 1 mensual con Daniel Gimenez", en: "Monthly 1-on-1 call with Daniel Gimenez", pt: "Chamada 1 a 1 mensal com Daniel Gimenez" },
  "compare.gerentes": { es: "Todos los Gerentes Digitales incluidos", en: "All Digital Managers included", pt: "Todos os Gerentes Digitais incluídos" },

  // Gerentes Digitales
  "gd.tituloLinea": { es: "Gerentes Digitales", en: "Digital Managers", pt: "Gerentes Digitais" },
  "gd.descLinea": { es: "Checklists de auditoría operativa listos para usar. Compra única, acceso permanente.", en: "Ready-to-use operational audit checklists. One-time purchase, permanent access.", pt: "Checklists de auditoria operacional prontos para usar. Compra única, acesso permanente." },
  "gd.comprar": { es: "Comprar", en: "Buy", pt: "Comprar" },
  "gd.acceder": { es: "Acceder", en: "Open", pt: "Acessar" },
  "gd.yaTienes": { es: "Ya lo tenés", en: "You own it", pt: "Você já tem" },
  "gd.incluidoElite": { es: "Incluido en Academy Élite", en: "Included in Academy Élite", pt: "Incluído no Academy Élite" },
  "gd.compraUnica": { es: "Pago único", en: "One-time payment", pt: "Pagamento único" },
  "gd.misGerentes": { es: "Mis Gerentes Digitales", en: "My Digital Managers", pt: "Meus Gerentes Digitais" },
  "gd.sinAcceso": { es: "Todavía no tenés ningún Gerente Digital.", en: "You don't own any Digital Manager yet.", pt: "Você ainda não tem nenhum Gerente Digital." },
  "gd.archivos": { es: "Archivos incluidos", en: "Included files", pt: "Arquivos incluídos" },
  "gd.descargar": { es: "Descargar", en: "Download", pt: "Baixar" },
  "gd.sinArchivos": { es: "Los archivos se están cargando. Te avisamos por correo cuando estén disponibles.", en: "Files are being uploaded. We'll email you when they're available.", pt: "Os arquivos estão sendo carregados. Avisaremos por e-mail quando estiverem disponíveis." },
  "gd.bloqueado": { es: "No tenés acceso a este Gerente Digital.", en: "You don't have access to this Digital Manager.", pt: "Você não tem acesso a este Gerente Digital." },
  "gd.verTienda": { es: "Ver en la Tienda", en: "View in Store", pt: "Ver na Loja" },
} as const;

const translations = {
  ...baseTranslations,
  ...studentDict,
  ...toolsDict,
  ...authDict,
} as const;

export type TranslationKey = keyof typeof translations;

/** Lang-aware translator for non-React contexts (route head(), loaders). */
export function translate(lang: Lang, key: TranslationKey): string {
  const entry = translations[key] as Record<Lang, string> | undefined;
  if (!entry) return String(key);
  return entry[lang] ?? entry.es ?? entry.en ?? String(key);
}

/** Bound translator: `const t = tFor(readPrefs().lang)`. */
export function tFor(lang: Lang) {
  return (key: TranslationKey) => translate(lang, key);
}


interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  /** Comes from the root router context (cookie-backed), so the first render
   *  is already in the right language — server and client alike. */
  initialLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(() => initialLang ?? readPrefs().lang);

  // One-time migration for users whose language was stored in localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.cookie.includes(`${LANG_COOKIE}=`)) return;
    const saved = localStorage.getItem(LANG_COOKIE) as Lang | null;
    if (saved === "en" || saved === "es" || saved === "pt") {
      setLang(saved);
      writePrefCookie(LANG_COOKIE, saved);
      document.documentElement.lang = saved;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    writePrefCookie(LANG_COOKIE, newLang);
  }, []);

  const toggleLang = useCallback(() => {
    const next: Lang = lang === "es" ? "en" : lang === "en" ? "pt" : "es";
    changeLang(next);
  }, [lang, changeLang]);

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key] as Record<Lang, string> | undefined;
    if (!entry) return key;
    // Fallback: pt -> es when a pt translation isn't provided yet
    return entry[lang] ?? entry.es ?? entry.en ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
