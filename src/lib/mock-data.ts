import type { CourseCardData } from "@/components/CourseCard";

export const featuredCourse = {
  title: "El Desafío de la Rentabilidad",
  description: "Aprende a transformar los números de tu restaurante en decisiones estratégicas que impulsen la rentabilidad.",
  instructor: "Daniel Gimenez",
  category: "Gestión Financiera",
};

const makeId = () => Math.random().toString(36).slice(2, 9);

export const courseRows = [
  {
    title: "🔥 Continuar Viendo",
    courses: [
      { id: makeId(), title: "DRE: Estado de Resultados para Restaurantes", lessons: 8, progress: 65, instructor: "Daniel Gimenez", category: "Gestión Financiera" },
      { id: makeId(), title: "Food Cost: Domina tu Costo de Alimentos", lessons: 12, progress: 30, instructor: "Tomás Gimenez", category: "Procesos Operativos" },
    ] as CourseCardData[],
  },
  {
    title: "💰 Gestión Financiera",
    courses: [
      { id: makeId(), title: "DRE: Estado de Resultados para Restaurantes", lessons: 8, progress: 65, instructor: "Daniel Gimenez", category: "Gestión Financiera" },
      { id: makeId(), title: "Presupuesto y Flujo de Caja", lessons: 10, instructor: "Daniel Gimenez", category: "Gestión Financiera" },
      { id: makeId(), title: "KPIs Financieros Esenciales", lessons: 6, instructor: "Tomás Gimenez", category: "Gestión Financiera" },
      { id: makeId(), title: "Control de Costos Laborales", lessons: 9, instructor: "Daniel Gimenez", category: "Gestión Financiera" },
      { id: makeId(), title: "Pricing: Estrategias de Precios", lessons: 7, instructor: "Tomás Gimenez", category: "Gestión Financiera" },
    ] as CourseCardData[],
  },
  {
    title: "⚙️ Procesos Operativos",
    courses: [
      { id: makeId(), title: "Food Cost: Domina tu Costo de Alimentos", lessons: 12, progress: 30, instructor: "Tomás Gimenez", category: "Procesos Operativos" },
      { id: makeId(), title: "Sistema Único de Pedidos (SUP)", lessons: 8, instructor: "Daniel Gimenez", category: "Procesos Operativos" },
      { id: makeId(), title: "Inventario y Almacén Eficiente", lessons: 10, instructor: "Tomás Gimenez", category: "Procesos Operativos" },
      { id: makeId(), title: "Estandarización de Recetas", lessons: 6, instructor: "Daniel Gimenez", category: "Procesos Operativos" },
    ] as CourseCardData[],
  },
  {
    title: "📢 Marketing para Restaurantes",
    courses: [
      { id: makeId(), title: "Redes Sociales para Restaurantes", lessons: 11, instructor: "Tomás Gimenez", category: "Marketing para Restaurantes" },
      { id: makeId(), title: "Branding Gastronómico", lessons: 7, instructor: "Daniel Gimenez", category: "Marketing para Restaurantes" },
      { id: makeId(), title: "Fidelización de Clientes", lessons: 8, instructor: "Tomás Gimenez", category: "Marketing para Restaurantes" },
      { id: makeId(), title: "Delivery y Dark Kitchens", lessons: 9, instructor: "Daniel Gimenez", category: "Marketing para Restaurantes" },
    ] as CourseCardData[],
  },
  {
    title: "👥 Liderazgo y Equipo",
    courses: [
      { id: makeId(), title: "Cultura Organizacional en Restaurantes", lessons: 6, instructor: "Daniel Gimenez", category: "Liderazgo y Equipo" },
      { id: makeId(), title: "Reclutamiento y Retención de Talento", lessons: 8, instructor: "Tomás Gimenez", category: "Liderazgo y Equipo" },
      { id: makeId(), title: "Liderazgo en la Cocina", lessons: 5, instructor: "Daniel Gimenez", category: "Liderazgo y Equipo" },
    ] as CourseCardData[],
  },
  {
    title: "🌱 Sustentabilidad y Crecimiento",
    courses: [
      { id: makeId(), title: "Plan de Negocios para Restaurantes", lessons: 10, instructor: "Daniel Gimenez", category: "Sustentabilidad y Crecimiento" },
      { id: makeId(), title: "Expansión y Franquicias", lessons: 12, instructor: "Tomás Gimenez", category: "Sustentabilidad y Crecimiento" },
      { id: makeId(), title: "Sustentabilidad Ambiental en Gastronomía", lessons: 7, instructor: "Daniel Gimenez", category: "Sustentabilidad y Crecimiento" },
    ] as CourseCardData[],
  },
];
