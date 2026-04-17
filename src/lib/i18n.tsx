import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type Lang = "es" | "en";

const translations = {
  // Navbar
  "nav.inicio": { es: "Inicio", en: "Home" },
  "nav.dre": { es: "DRE", en: "DRE" },
  "nav.mentoria": { es: "Mentoria", en: "Mentorship" },
  "nav.planes": { es: "Planes", en: "Plans" },
  "nav.productos": { es: "Productos", en: "Products" },
  "nav.perfil": { es: "Mi Perfil", en: "My Profile" },
  "nav.admin": { es: "Admin", en: "Admin" },
  "nav.asistente": { es: "Asistente IA", en: "AI Assistant" },
  "nav.cerrarSesion": { es: "Cerrar Sesión", en: "Log Out" },
  "nav.iniciarSesion": { es: "Iniciar Sesión", en: "Log In" },
  "nav.entrar": { es: "Entrar", en: "Sign In" },
  "nav.buscar": { es: "Buscar cursos, productos...", en: "Search courses, products..." },

  // Home page
  "home.badge": { es: "Gestión · Procesos · Sustentabilidad", en: "Management · Processes · Sustainability" },
  "home.heroTitle1": { es: "Transforma tu restaurante con ", en: "Transform your restaurant with " },
  "home.heroTitle2": { es: "datos y estrategia", en: "data and strategy" },
  "home.heroDesc": { es: "Soy Daniel Gimenez, y hace más de 15 años ayudo a restaurantes a ser más rentables, organizados y sustentables. Bienvenido a tu plataforma de crecimiento gastronómico.", en: "I'm Daniel Gimenez, and for over 15 years I've been helping restaurants become more profitable, organized, and sustainable. Welcome to your gastronomic growth platform." },
  "home.explorarCursos": { es: "Explorar Cursos", en: "Explore Courses" },
  "home.diagnosticar": { es: "Diagnosticar mi Restaurante", en: "Diagnose my Restaurant" },
  "home.stat.experiencia": { es: "Años de experiencia", en: "Years of experience" },
  "home.stat.restaurantes": { es: "Restaurantes asesorados", en: "Restaurants advised" },
  "home.stat.cursos": { es: "Cursos y talleres", en: "Courses and workshops" },
  "home.stat.satisfaccion": { es: "Satisfacción de clientes", en: "Client satisfaction" },
  "home.conoce": { es: "Conoce a ", en: "Meet " },
  "home.aboutP1": { es: "Con más de 15 años en el sector gastronómico, Daniel ha transformado la operación de cientos de restaurantes en América Latina y España.", en: "With over 15 years in the gastronomic sector, Daniel has transformed the operations of hundreds of restaurants in Latin America and Spain." },
  "home.aboutP2": { es: "Su enfoque combina análisis financiero riguroso con estrategias prácticas que cualquier operador puede implementar, sin importar el tamaño de su negocio.", en: "His approach combines rigorous financial analysis with practical strategies that any operator can implement, regardless of business size." },
  "home.aboutP3": { es: "Fundador de GPS Gastronômico, una metodología que integra Gestión, Procesos y Sustentabilidad para crear restaurantes que prosperan a largo plazo.", en: "Founder of GPS Gastronômico, a methodology that integrates Management, Processes, and Sustainability to create restaurants that thrive long-term." },
  "home.metodo": { es: "Nuestro ", en: "Our " },
  "home.metodoWord": { es: "Método", en: "Method" },
  "home.metodoDesc": { es: "Un proceso probado en más de 200 restaurantes para llevar tu negocio al siguiente nivel.", en: "A proven process in over 200 restaurants to take your business to the next level." },
  "home.step.diagnostico": { es: "Diagnóstico", en: "Diagnosis" },
  "home.step.diagnosticoDesc": { es: "Analizamos los números reales de tu operación con nuestro DRE interactivo.", en: "We analyze the real numbers of your operation with our interactive DRE." },
  "home.step.estrategia": { es: "Estrategia", en: "Strategy" },
  "home.step.estrategiaDesc": { es: "Diseñamos un plan de acción basado en datos, no en suposiciones.", en: "We design an action plan based on data, not assumptions." },
  "home.step.implementacion": { es: "Implementación", en: "Implementation" },
  "home.step.implementacionDesc": { es: "Te acompañamos paso a paso con herramientas y mentoría directa.", en: "We accompany you step by step with tools and direct mentorship." },
  "home.step.resultados": { es: "Resultados", en: "Results" },
  "home.step.resultadosDesc": { es: "Medimos el impacto y ajustamos para crecimiento sostenible.", en: "We measure the impact and adjust for sustainable growth." },
  "home.testimonios": { es: "Lo que dicen nuestros ", en: "What our " },
  "home.testimoniosWord": { es: "clientes", en: "clients say" },
  "home.ctaTitle": { es: "¿Listo para transformar tu restaurante?", en: "Ready to transform your restaurant?" },
  "home.ctaDesc": { es: "Comienza hoy con un diagnóstico gratuito o explora nuestros cursos y herramientas.", en: "Start today with a free diagnosis or explore our courses and tools." },
  "home.hacerDiag": { es: "Hacer Diagnóstico", en: "Run Diagnosis" },
  "home.hablarAsistente": { es: "Hablar con el Asistente IA", en: "Talk to AI Assistant" },
  "home.fotoDesc": { es: "Foto de Daniel Gimenez", en: "Photo of Daniel Gimenez" },
  "home.reproducir": { es: "Reproducir", en: "Play" },

  // Cursos
  "cursos.titulo": { es: "Catálogo de Cursos", en: "Course Catalog" },
  "cursos.desc": { es: "Aprendé a gestionar y hacer crecer tu restaurante con nuestros cursos exclusivos.", en: "Learn to manage and grow your restaurant with our exclusive courses." },
  "cursos.lecciones": { es: "lecciones", en: "lessons" },
  "cursos.bloqueado": { es: "Solo para suscriptores", en: "Subscribers only" },
  "cursos.suscribete": { es: "Suscribite para acceder a todo el contenido", en: "Subscribe to access all content" },
  "cursos.verCurso": { es: "Ver Curso", en: "View Course" },
  "cursos.continuar": { es: "Continuar", en: "Continue" },
  "cursos.gratis": { es: "Vista previa", en: "Free preview" },
  "cursos.vacio": { es: "Aún no hay cursos disponibles.", en: "No courses available yet." },
  "cursos.cargando": { es: "Cargando cursos...", en: "Loading courses..." },
  "cursos.acceso": { es: "Tenés acceso completo a todos los cursos", en: "You have full access to all courses" },
  "cursos.reproducir": { es: "Reproducir", en: "Play" },
  "cursos.aulas": { es: "Aulas", en: "Lessons" },
  "cursos.aulaBloqueada": { es: "Esta aula es exclusiva para suscriptores", en: "This lesson is for subscribers only" },
  "cursos.verPlanes": { es: "Ver Planes", en: "View Plans" },
  "cursos.volver": { es: "Volver a cursos", en: "Back to courses" },
  "cursos.sinAulas": { es: "Este curso aún no tiene aulas.", en: "This course has no lessons yet." },
  "cursos.sinVideo": { es: "Esta aula aún no tiene video.", en: "This lesson has no video yet." },

  // Dashboard
  "dashboard.badge": { es: "Dashboard Financiero", en: "Financial Dashboard" },
  "dashboard.titulo1": { es: "Diagnóstico de tu ", en: "Diagnosis of your " },
  "dashboard.titulo2": { es: "Restaurante", en: "Restaurant" },
  "dashboard.desc": { es: "Selecciona el período de análisis y completa los datos financieros.", en: "Select the analysis period and fill in the financial data." },
  "dashboard.periodo": { es: "Período de Análisis", en: "Analysis Period" },
  "dashboard.nuevoDiag": { es: "Nuevo Diagnóstico", en: "New Diagnosis" },

  // Tienda
  "tienda.titulo": { es: "Productos", en: "Products" },
  "tienda.desc": { es: "Herramientas y servicios para transformar tu negocio gastronómico.", en: "Tools and services to transform your gastronomic business." },
  "tienda.comprar": { es: "Comprar", en: "Buy" },
  "tienda.ver": { es: "Ver", en: "View" },
  "tienda.completarCompra": { es: "Completar Compra", en: "Complete Purchase" },

  // Planes
  "planes.titulo": { es: "Elegí tu Plan", en: "Choose your Plan" },
  "planes.desc": { es: "Invertí en el crecimiento de tu negocio gastronómico con herramientas, contenido y acompañamiento profesional.", en: "Invest in the growth of your gastronomic business with tools, content, and professional support." },
  "planes.suscribirme": { es: "Suscribirme", en: "Subscribe" },
  "planes.masPopular": { es: "Más Popular", en: "Most Popular" },
  "planes.completarSub": { es: "Completar Suscripción", en: "Complete Subscription" },

  // Perfil
  "perfil.titulo": { es: "Mi Perfil", en: "My Profile" },
  "perfil.miembro": { es: "Miembro desde enero 2025", en: "Member since January 2025" },
  "perfil.misCursos": { es: "Mis Cursos", en: "My Courses" },
  "perfil.cursosDesc": { es: "2 cursos en progreso", en: "2 courses in progress" },
  "perfil.misCompras": { es: "Mis Compras", en: "My Purchases" },
  "perfil.comprasDesc": { es: "3 productos adquiridos", en: "3 products purchased" },
  "perfil.certificados": { es: "Certificados", en: "Certificates" },
  "perfil.certificadosDesc": { es: "0 certificados obtenidos", en: "0 certificates obtained" },
  "perfil.suscripcion": { es: "Mi Suscripción", en: "My Subscription" },
  "perfil.plan": { es: "Plan", en: "Plan" },
  "perfil.estado": { es: "Estado", en: "Status" },
  "perfil.proximaCobranza": { es: "Próxima cobranza", en: "Next billing" },
  "perfil.cancelaEn": { es: "Tu suscripción se cancelará el", en: "Your subscription will cancel on" },
  "perfil.activa": { es: "Activa", en: "Active" },
  "perfil.prueba": { es: "En prueba", en: "Trialing" },
  "perfil.cancelada": { es: "Cancelada", en: "Canceled" },
  "perfil.sinSuscripcion": { es: "No tenés una suscripción activa", en: "You don't have an active subscription" },
  "perfil.sinSuscripcionDesc": { es: "Suscribite para acceder a todos los cursos y contenido exclusivo.", en: "Subscribe to access all courses and exclusive content." },
  "perfil.verPlanes": { es: "Ver Planes", en: "View Plans" },
  "perfil.cargandoSub": { es: "Cargando suscripción...", en: "Loading subscription..." },
  "perfil.gestionar": { es: "Gestionar suscripción", en: "Manage subscription" },
  "perfil.gestionarDesc": { es: "Cancelar, actualizar método de pago o ver facturas.", en: "Cancel, update payment method or view invoices." },
  "perfil.abriendoPortal": { es: "Abriendo portal...", en: "Opening portal..." },
  "perfil.errorPortal": { es: "No se pudo abrir el portal. Intentá de nuevo.", en: "Could not open the portal. Please try again." },

  // Login
  "login.bienvenido": { es: "Bienvenido de vuelta", en: "Welcome back" },
  "login.titulo": { es: "Iniciar Sesión", en: "Sign In" },
  "login.desc": { es: "Accede a tu cuenta para continuar", en: "Access your account to continue" },
  "login.email": { es: "Email", en: "Email" },
  "login.contrasena": { es: "Contraseña", en: "Password" },
  "login.olvidaste": { es: "¿Olvidaste tu contraseña?", en: "Forgot password?" },
  "login.ingresando": { es: "Ingresando...", en: "Signing in..." },
  "login.iniciar": { es: "Iniciar Sesión", en: "Sign In" },
  "login.noCuenta": { es: "¿No tienes cuenta? ", en: "Don't have an account? " },
  "login.registrate": { es: "Regístrate", en: "Sign Up" },
  "login.google": { es: "Continuar con Google", en: "Continue with Google" },
  "login.oConEmail": { es: "o con email", en: "or with email" },
  "login.emailIncorrecto": { es: "Email o contraseña incorrectos.", en: "Incorrect email or password." },
  "login.noVerificado": { es: "Tu email aún no ha sido verificado. Revisa tu bandeja de entrada.", en: "Your email has not been verified yet. Check your inbox." },

  // Dashboard Results
  "results.titulo": { es: "Tu Dashboard Financiero", en: "Your Financial Dashboard" },
  "results.desc": { es: "Análisis basado en tus datos del DRE", en: "Analysis based on your DRE data" },
  "results.editar": { es: "Editar Datos", en: "Edit Data" },
  "results.ventaBruta": { es: "Venta Bruta", en: "Gross Revenue" },
  "results.cmvTotal": { es: "CMV Total", en: "Total COGS" },
  "results.gop": { es: "GOP (Lucro Operativo)", en: "GOP (Operating Profit)" },
  "results.puntoEquilibrio": { es: "Punto de Equilibrio", en: "Break-Even Point" },
  "results.ventaMinima": { es: "Venta mínima mensual", en: "Minimum monthly revenue" },
  "results.facturacionCanal": { es: "Facturación por Canal", en: "Revenue by Channel" },
  "results.desgloseGastos": { es: "Desglose de Gastos Operativos", en: "Operating Expense Breakdown" },
  "results.totalOpex": { es: "Total OPEX", en: "Total OPEX" },
  "results.resultadoNeto": { es: "Resultado Neto", en: "Net Result" },
  "results.margenContribucion": { es: "Margen de Contribución", en: "Contribution Margin" },
  "results.lucroNeto": { es: "Lucro Neto", en: "Net Profit" },
  "results.ticketMedio": { es: "Ticket Medio", en: "Average Ticket" },
  "results.noVentas": { es: "No se registraron ventas.", en: "No sales recorded." },
  "results.enRango": { es: "En rango", en: "In range" },
  "results.bajo": { es: "Bajo", en: "Low" },
  "results.alto": { es: "Alto", en: "High" },

  // Period options
  "period.1m": { es: "1 Mes", en: "1 Month" },
  "period.3m": { es: "3 Meses", en: "3 Months" },
  "period.6m": { es: "6 Meses", en: "6 Months" },
  "period.1y": { es: "1 Año", en: "1 Year" },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gps-lang") as Lang;
      if (saved && (saved === "en" || saved === "es")) {
        setLang(saved);
      }
    }
  }, []);

  const changeLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("gps-lang", newLang);
    }
  }, []);

  const toggleLang = useCallback(() => {
    changeLang(lang === "es" ? "en" : "es");
  }, [lang, changeLang]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[key]?.[lang] ?? key;
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
