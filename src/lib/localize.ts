import type { Lang } from "@/lib/i18n";

/** Picks the localized variant of a DB text field (field, field_en, field_pt). */
export function loc<T extends Record<string, any>>(
  row: T | null | undefined,
  field: string,
  lang: Lang,
): string {
  if (!row) return "";
  const suffix = lang === "en" ? "_en" : lang === "pt" ? "_pt" : "";
  const localized = suffix ? row[`${field}${suffix}`] : undefined;
  const value = localized ?? row[field];
  return typeof value === "string" ? value : "";
}

const LEVELS: Record<string, Record<Lang, string>> = {
  principiante: { es: "Principiante", en: "Beginner", pt: "Iniciante" },
  intermedio: { es: "Intermedio", en: "Intermediate", pt: "Intermediário" },
  avanzado: { es: "Avanzado", en: "Advanced", pt: "Avançado" },
};

export function locLevel(level: string | null | undefined, lang: Lang): string {
  if (!level) return "";
  return LEVELS[level.trim().toLowerCase()]?.[lang] ?? level;
}

const CATEGORIES: Record<string, Record<Lang, string>> = {
  "mentoría gps gastronómico": {
    es: "Mentoría GPS Gastronómico",
    en: "GPS Gastronómico Mentorship",
    pt: "Mentoria GPS Gastronômico",
  },
};

export function locCategory(category: string | null | undefined, lang: Lang): string {
  if (!category) return "";
  return CATEGORIES[category.trim().toLowerCase()]?.[lang] ?? category;
}

const PLANS: Record<string, Record<Lang, string>> = {
  basico: { es: "Básico", en: "Basic", pt: "Básico" },
  premium: { es: "Premium", en: "Premium", pt: "Premium" },
};

export function locPlan(plan: string | null | undefined, lang: Lang): string {
  if (!plan) return "";
  return PLANS[plan.trim().toLowerCase()]?.[lang] ?? plan;
}
