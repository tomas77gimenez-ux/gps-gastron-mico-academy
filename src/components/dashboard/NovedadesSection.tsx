import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, PlayCircle, FileText, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { loc } from "@/lib/localize";

type NovedadKind = "lesson" | "material" | "course";

interface Novedad {
  id: string;
  kind: NovedadKind;
  title: string;
  title_en: string | null;
  title_pt: string | null;
  createdAt: string;
  courseId: string | null;
}

const KIND_ICON: Record<NovedadKind, typeof PlayCircle> = {
  lesson: PlayCircle,
  material: FileText,
  course: BookOpen,
};

const LOCALE_MAP = { es: "es-AR", en: "en-US", pt: "pt-BR" } as const;

const formatDate = (iso: string, lang: "es" | "en" | "pt") =>
  new Date(iso).toLocaleDateString(LOCALE_MAP[lang], { day: "2-digit", month: "short" });

export function NovedadesSection() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<Novedad[] | null>(null);

  useEffect(() => {
    let active = true;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    async function load() {
      const [lessons, materials, courses] = await Promise.all([
        supabase.from("lessons").select("id, title, title_en, title_pt, created_at, course_id").gte("created_at", since).order("created_at", { ascending: false }).limit(12),
        supabase.from("course_materials").select("id, title, created_at, course_id").gte("created_at", since).order("created_at", { ascending: false }).limit(12),
        supabase.from("courses").select("id, title, title_en, title_pt, created_at").eq("status", "published").gte("created_at", since).order("created_at", { ascending: false }).limit(12),
      ]);

      if (!active) return;

      const merged: Novedad[] = [
        ...(lessons.data ?? []).map((l) => ({ id: `lesson-${l.id}`, kind: "lesson" as const, title: l.title, title_en: l.title_en, title_pt: l.title_pt, createdAt: l.created_at, courseId: l.course_id })),
        ...(materials.data ?? []).map((m) => ({ id: `material-${m.id}`, kind: "material" as const, title: m.title, title_en: null, title_pt: null, createdAt: m.created_at, courseId: m.course_id })),
        ...(courses.data ?? []).map((c) => ({ id: `course-${c.id}`, kind: "course" as const, title: c.title, title_en: c.title_en, title_pt: c.title_pt, createdAt: c.created_at, courseId: c.id })),
      ]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8);

      setItems(merged);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (items === null) return null;

  return (
    <section id="novedades" className="border-b border-border bg-surface/40 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-text" strokeWidth={1.5} />
          <h2 className="font-display text-xl font-semibold">{t("nov.titulo")}</h2>
          <span className="text-xs text-muted-foreground">{t("nov.ultimos30")}</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {t("nov.vacio")}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const Icon = KIND_ICON[item.kind];
              const content = (
                <div className="h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-primary-text">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {t(`nov.kind.${item.kind}`)}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">{formatDate(item.createdAt, lang)}</span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{loc(item, "title", lang)}</p>
                </div>
              );
              return item.courseId ? (
                <Link key={item.id} to="/cursos/$id" params={{ id: item.courseId }} className="block">
                  {content}
                </Link>
              ) : (
                <Link key={item.id} to="/cursos" className="block">
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
