import { Star, Crown, Gem, type LucideIcon } from "lucide-react";

export interface MembershipPlan {
  id: "basico" | "premium" | "elite";
  name: { es: string; en: string; pt: string };
  monthlyPrice: number;
  yearlyPrice: number;
  priceIdMonthly: string;
  priceIdYearly: string;
  description: { es: string; en: string; pt: string };
  icon: LucideIcon;
  featured: boolean;
  features: { es: string[]; en: string[]; pt: string[] };
}

export const membershipPlans: MembershipPlan[] = [
  {
    id: "basico",
    name: { es: "Academy", en: "Academy", pt: "Academy" },
    monthlyPrice: 57,
    yearlyPrice: 581,
    priceIdMonthly: "plan_basico_monthly",
    priceIdYearly: "plan_basico_yearly",
    description: {
      es: "Curso completo, todas las herramientas de gestión y la comunidad de miembros.",
      en: "Complete course, all management tools and the members community.",
      pt: "Curso completo, todas as ferramentas de gestão e a comunidade de membros.",
    },
    icon: Star,
    featured: false,
    features: {
      es: [
        "Curso completo GPS Gastronómico (7 módulos)",
        "Todas las herramientas de gestión (DRE, Punto de Equilibrio, Control de Caja, Monitor de CMV, Fichas Técnicas)",
        "Comunidad de miembros",
        "Asistente IA gastronómico",
        "Actualizaciones mensuales",
      ],
      en: [
        "Complete GPS Gastronômico course (7 modules)",
        "All management tools (DRE, Break-even, Cash Control, CMV Monitor, Recipe Cards)",
        "Members community",
        "Gastronomic AI assistant",
        "Monthly updates",
      ],
      pt: [
        "Curso completo GPS Gastronômico (7 módulos)",
        "Todas as ferramentas de gestão (DRE, Ponto de Equilíbrio, Controle de Caixa, Monitor de CMV, Fichas Técnicas)",
        "Comunidade de membros",
        "Assistente IA gastronômico",
        "Atualizações mensais",
      ],
    },
  },
  {
    id: "premium",
    name: { es: "Academy Pro", en: "Academy Pro", pt: "Academy Pro" },
    monthlyPrice: 87,
    yearlyPrice: 887,
    priceIdMonthly: "plan_premium_monthly",
    priceIdYearly: "plan_premium_yearly",
    description: {
      es: "Todo lo de Academy más acompañamiento en vivo cada semana en la Sala Pro.",
      en: "Everything in Academy plus weekly live guidance in the Pro Room.",
      pt: "Tudo do Academy mais acompanhamento ao vivo toda semana na Sala Pro.",
    },
    icon: Crown,
    featured: true,
    features: {
      es: [
        "Todo lo del plan Academy",
        "Reunión semanal de implementación en vivo",
        "Caso Real del Mes (análisis antes/después)",
        "Acceso a la Sala Pro y al archivo de grabaciones",
        "Soporte prioritario del equipo de Daniel",
      ],
      en: [
        "Everything in Academy",
        "Weekly live implementation call",
        "Real Case of the Month (before/after analysis)",
        "Pro Room access and recordings archive",
        "Priority support from Daniel's team",
      ],
      pt: [
        "Tudo do plano Academy",
        "Reunião semanal de implementação ao vivo",
        "Caso Real do Mês (análise antes/depois)",
        "Acesso à Sala Pro e ao arquivo de gravações",
        "Suporte prioritário da equipe do Daniel",
      ],
    },
  },
  {
    id: "elite",
    name: { es: "Academy Élite", en: "Academy Élite", pt: "Academy Élite" },
    monthlyPrice: 167,
    yearlyPrice: 1703,
    priceIdMonthly: "plan_elite_monthly",
    priceIdYearly: "plan_elite_yearly",
    description: {
      es: "Todo lo de Pro más acompañamiento 1 a 1 con Daniel y la línea completa de Gerentes Digitales.",
      en: "Everything in Pro plus 1-on-1 guidance with Daniel and the full Digital Managers line.",
      pt: "Tudo do Pro mais acompanhamento 1 a 1 com o Daniel e a linha completa de Gerentes Digitais.",
    },
    icon: Gem,
    featured: false,
    features: {
      es: [
        "Todo lo del plan Academy Pro",
        "1 llamada 1 a 1 mensual con Daniel Gimenez",
        "Acceso incluido a TODOS los Gerentes Digitales (presentes y futuros)",
        "Prioridad máxima en soporte y revisiones",
      ],
      en: [
        "Everything in Academy Pro",
        "1 monthly 1-on-1 call with Daniel Gimenez",
        "Included access to ALL Digital Managers (present and future)",
        "Highest priority support and reviews",
      ],
      pt: [
        "Tudo do plano Academy Pro",
        "1 chamada 1 a 1 mensal com Daniel Gimenez",
        "Acesso incluído a TODOS os Gerentes Digitais (presentes e futuros)",
        "Prioridade máxima em suporte e revisões",
      ],
    },
  },
];
