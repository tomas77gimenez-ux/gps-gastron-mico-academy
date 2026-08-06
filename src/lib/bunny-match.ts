/** Shared (client-safe) normalization + auto-matching rules for Bunny video sync. */

export function normalizeTitle(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.(mp4|mov|m4v|webm)$/i, "")
    .replace(/[_\-—–]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface MatchRule {
  /** normalized filename key coming from Bunny */
  key: string;
  /** exact lesson title in the database */
  lesson: string;
  /** which player slot: 1 = bunny_video_id, 2 = bunny_video_id_2 */
  slot?: 1 | 2;
  /** requires exact normalized equality (no substring fallback) */
  exact?: boolean;
}

export const MATCH_RULES: MatchRule[] = [
  { key: "comienza aqui", lesson: "Comienza aquí" },
  { key: "tener o ganar dinero", lesson: "Tener o Ganar Dinero" },
  { key: "vender o fabricar", lesson: "Vender o Fabricar" },
  { key: "administrar o gestionar", lesson: "Administrar o Gestionar" },
  { key: "emprendedor a empresario", lesson: "De Emprendedor a Empresario" },
  { key: "ciclo del resultado", lesson: "Ciclo del Resultado" },
  { key: "concepto", lesson: "1.1 Plan de Mercado — Introducción" },
  { key: "f.o.d.a", lesson: "1.2 Análisis F.O.D.A" },
  { key: "foda", lesson: "1.2 Análisis F.O.D.A" },
  { key: "el local", lesson: "1.3 El Local" },
  { key: "la sociedad", lesson: "1.4 La Sociedad" },
  { key: "introduccion", lesson: "2.1 Introducción", exact: true },
  { key: "gastos fijos", lesson: "2.2 Gastos Fijos" },
  { key: "cmv", lesson: "2.3 CMV", exact: true },
  { key: "dre 1", lesson: "2.4 Planilla DRE 1" },
  { key: "dre 2", lesson: "2.5 Planilla DRE 2" },
  { key: "dre2", lesson: "2.5 Planilla DRE 2" },
  { key: "sup 1", lesson: "3.2 Planilla S.U.P I — Banco de Datos" },
  { key: "sup 2", lesson: "3.3 Planilla S.U.P II — Factor de Rendimiento" },
  { key: "sup 3", lesson: "3.4 Planilla S.U.P III — Fichas Técnicas" },
  { key: "ranking planilla", lesson: "3.6 Ranking de Productos — Planilla (Margen Ponderado)" },
  { key: "ranking de productos", lesson: "3.5 Ranking de Productos", exact: true },
  { key: "inventario 1", lesson: "4.1 Inventario I — Conceptos e Introducción" },
  { key: "inventario 2", lesson: "4.2 Inventario II — Función Operativa y Financiera" },
  { key: "inventrio2", lesson: "4.3 Inventario III — Soluciones en la Gestión" },
  { key: "inventario 3", lesson: "4.3 Inventario III — Soluciones en la Gestión" },
  { key: "planilla inventario", lesson: "4.4 Planilla de Inventario" },
  { key: "mise en place 1", lesson: "4.5 Mise en Place I — Introducción" },
  { key: "planilla excel aliados del cmv mod 4", lesson: "4.8 Planilla Excel — Aliados del CMV" },
  { key: "presentacion planilla", lesson: "5.1 Flujo de Caja", slot: 1 },
  { key: "flujo de caja", lesson: "5.1 Flujo de Caja", slot: 2 },
  { key: "masteeclass e fianciera", lesson: "5.2 Masterclass Educación Financiera" },
  { key: "masterclass e financiera", lesson: "5.2 Masterclass Educación Financiera" },
];

export interface BunnyVideo {
  guid: string;
  title: string;
}

export interface LessonRef {
  id: string;
  title: string;
  course_title: string;
  sort_order: number;
  bunny_video_id: string | null;
  bunny_video_id_2: string | null;
}

export interface MatchPair {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  slot: 1 | 2;
  guid: string;
  videoTitle: string;
}

export interface MatchResult {
  matched: MatchPair[];
  unmatchedVideos: BunnyVideo[];
  lessonsWithoutVideo: { id: string; title: string; course_title: string }[];
  ambiguous: BunnyVideo[];
}

/** Deterministic auto-match of Bunny videos to lessons. */
export function matchVideos(videos: BunnyVideo[], lessons: LessonRef[]): MatchResult {
  const byTitle = new Map(lessons.map((l) => [l.title, l]));
  const normCount = new Map<string, number>();
  for (const v of videos) {
    const n = normalizeTitle(v.title);
    normCount.set(n, (normCount.get(n) ?? 0) + 1);
  }

  const matched: MatchPair[] = [];
  const unmatchedVideos: BunnyVideo[] = [];
  const ambiguous: BunnyVideo[] = [];
  const taken = new Set<string>(); // `${lessonId}:${slot}`

  // Videos ya persistidos en una lección cuentan como asociados (y no vuelven
  // a revisión manual, incluso si su nombre es ambiguo).
  const assigned = new Map<string, { lesson: LessonRef; slot: 1 | 2 }>();
  for (const l of lessons) {
    if (l.bunny_video_id) assigned.set(l.bunny_video_id, { lesson: l, slot: 1 });
    if (l.bunny_video_id_2) assigned.set(l.bunny_video_id_2, { lesson: l, slot: 2 });
  }

  for (const video of videos) {
    const n = normalizeTitle(video.title);

    const already = assigned.get(video.guid);
    if (already) {
      taken.add(`${already.lesson.id}:${already.slot}`);
      matched.push({
        lessonId: already.lesson.id,
        lessonTitle: already.lesson.title,
        courseTitle: already.lesson.course_title,
        slot: already.slot,
        guid: video.guid,
        videoTitle: video.title,
      });
      continue;
    }

    // Ambiguity guard: several videos share the exact same normalized name.
    if ((normCount.get(n) ?? 0) > 1) {
      ambiguous.push(video);
      continue;
    }

    const rule =
      MATCH_RULES.find((r) => r.key === n) ??
      MATCH_RULES.find((r) => !r.exact && r.key.length >= 4 && n.includes(r.key));

    const lesson = rule ? byTitle.get(rule.lesson) : undefined;
    if (!rule || !lesson) {
      unmatchedVideos.push(video);
      continue;
    }

    const slot: 1 | 2 = rule.slot ?? 1;
    const key = `${lesson.id}:${slot}`;
    if (taken.has(key)) {
      unmatchedVideos.push(video);
      continue;
    }
    taken.add(key);
    matched.push({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseTitle: lesson.course_title,
      slot,
      guid: video.guid,
      videoTitle: video.title,
    });
  }

  const matchedLessonIds = new Set(matched.filter((m) => m.slot === 1).map((m) => m.lessonId));
  const lessonsWithoutVideo = lessons
    .filter((l) => !matchedLessonIds.has(l.id) && !l.bunny_video_id)
    .map((l) => ({ id: l.id, title: l.title, course_title: l.course_title }));

  return { matched, unmatchedVideos, lessonsWithoutVideo, ambiguous };
}