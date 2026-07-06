export type PlanTier = "basico" | "premium";

export const PLAN_TIERS: { value: PlanTier; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "premium", label: "Premium" },
];

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  instructor: string;
  thumbnail_url: string | null;
  level: string;
  estimated_duration: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  methodology: string;
  pillar_order: number | null;
  module_number: number | null;
}

export const PILLARS = [
  { order: 0, name: "Introducción", subtitle: "Comenzamos Aquí" },
  { order: 1, name: "Gestión", subtitle: "Diagnóstico y Análisis de Resultado" },
  { order: 2, name: "Proceso Productivo", subtitle: "Operación y Control" },
  { order: 3, name: "Sostenibilidad de la Venta", subtitle: "Servicio y Crecimiento" },
] as const;

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  content_type: string;
  duration: string | null;
  sort_order: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  panda_video_id?: string | null;
  panda_library_id?: string | null;
  required_plan?: PlanTier;
}

export interface CourseMaterial {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  required_plan?: PlanTier;
}
