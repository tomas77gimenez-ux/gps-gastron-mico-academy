import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, PlayCircle, FileText, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type NovedadKind = "lesson" | "material" | "course";

interface Novedad {
  id: string;
  kind: NovedadKind;
  title: string;
  createdAt: string;
  courseId: string | null;
}

const KIND_META: Record<NovedadKind, { label: string; icon: typeof PlayCircle }> = {
  lesson: { label: "Clase", icon: PlayCircle },
  material: { label: "Material", icon: FileText },
  course: { label: "Módulo", icon: BookOpen },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });

export function NovedadesSection() {
  const [items, setItems] = useState<Novedad[] | null>(null);

  useEffect(() => {
    let active = true;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    async function load() {
      const [lessons, materials, courses] = await Promise.all([
        supabase.from("lessons").select("id, title, created_at, course_id").gte("created_at", since).order("created_at", { ascending: false }).limit(12),
        supabase.from("course_materials").select("id, title, created_at, course_id").gte("created_at", since).order("created_at", { ascending: false }).limit(12),
        supabase.from("courses").select("id, title, created_at").eq("status", "published").gte("created_at", since).order("created_at", { ascending: false }).limit(12),
      ]);

      if (!active) return;

      const merged: Novedad[] = [
        ...(lessons.data ?? []).map((l) => ({ id: `lesson-${l.id}`, kind: "lesson" as const, title: l.title, createdAt: l.created_at, courseId: l.course_id })),
        ...(materials.data ?? []).map((m) => ({ id: `material-${m.id}`, kind: "material" as const, title: m.title, createdAt: m.created_at, courseId: m.course_id })),
        ...(courses.data ?? []).map((c) => ({ id: `course-${c.id}`, kind: "course" as const, title: c.title, createdAt: c.created_at, courseId: c.id })),
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
    <section className="border-b border-border bg-surface/40 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
          <h2 className="font-display text-xl font-semibold">Novedades</h2>
          <span className="text-xs text-muted-foreground">· últimos 30 días</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Pronto vas a ver aquí lo nuevo del mes.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const meta = KIND_META[item.kind];
              const content = (
                <div className="h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-primary">
                      <meta.icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {meta.label}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</p>
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
