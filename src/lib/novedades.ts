import { supabase } from "@/integrations/supabase/client";
import type { Lang } from "@/lib/i18n";

export type NovedadKind = "lesson" | "material" | "recording" | "case";

export interface PendingNovedad {
  id: string;
  kind: NovedadKind;
  title: string;
  createdAt: string;
  pro: boolean;
}

export const KIND_LABEL_ES: Record<NovedadKind, string> = {
  lesson: "Clase",
  material: "Material",
  recording: "Grabación",
  case: "Caso Real del Mes",
};

/** Items that were never announced by email yet (admin preview). */
export async function fetchUnannouncedNovedades(): Promise<PendingNovedad[]> {
  const [lessons, materials, recordings, cases] = await Promise.all([
    supabase.from("lessons").select("id, title, created_at").is("announced_at", null),
    supabase.from("course_materials").select("id, title, created_at").is("announced_at", null),
    supabase.from("pro_recordings").select("id, title, created_at").is("announced_at", null),
    supabase.from("pro_cases").select("id, title, created_at").is("announced_at", null),
  ]);

  const items: PendingNovedad[] = [
    ...(lessons.data ?? []).map((l) => ({ id: `lesson-${l.id}`, kind: "lesson" as const, title: l.title, createdAt: l.created_at, pro: false })),
    ...(materials.data ?? []).map((m) => ({ id: `material-${m.id}`, kind: "material" as const, title: m.title, createdAt: m.created_at, pro: false })),
    ...(recordings.data ?? []).map((r) => ({ id: `recording-${r.id}`, kind: "recording" as const, title: r.title, createdAt: r.created_at, pro: true })),
    ...(cases.data ?? []).map((c) => ({ id: `case-${c.id}`, kind: "case" as const, title: c.title, createdAt: c.created_at, pro: true })),
  ];

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Localized summary like "1 real case · 2 recordings · 1 worksheet". */
export function summarizeNovedades(counts: Record<NovedadKind, number>, t: (key: string) => string): string {
  const parts: string[] = [];
  const push = (n: number, kind: NovedadKind) => {
    if (n > 0) parts.push(`${n} ${t(`nov.count.${kind}.${n === 1 ? "one" : "many"}`)}`);
  };
  push(counts.case, "case");
  push(counts.lesson, "lesson");
  push(counts.recording, "recording");
  push(counts.material, "material");
  return parts.join(" · ");
}
