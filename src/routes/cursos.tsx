import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { Lock, Play, BookOpen, CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/cursos")({
  component: CursosPage,
  head: () => ({
    meta: [
      { title: "Cursos — GPS Gastronômico" },
      { name: "description", content: "Explora todos nuestros cursos de gestión, operaciones, marketing y liderazgo gastronómico." },
    ],
  }),
});

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  thumbnail_url: string | null;
  estimated_duration: string | null;
  instructor: string;
  lessonCount: number;
  hasFreeLesson: boolean;
}

function CursosPage() {
  const { t } = useI18n();
  const sub = useSubscription();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title, description, category, level, thumbnail_url, estimated_duration, instructor")
        .eq("status", "published")
        .order("sort_order", { ascending: true });

      const ids = (courseData ?? []).map(c => c.id);
      let lessonMap: Record<string, { count: number; hasFree: boolean }> = {};
      if (ids.length > 0) {
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("course_id, is_free")
          .in("course_id", ids);
        for (const id of ids) lessonMap[id] = { count: 0, hasFree: false };
        for (const l of lessonData ?? []) {
          const m = lessonMap[l.course_id];
          if (m) {
            m.count += 1;
            if (l.is_free) m.hasFree = true;
          }
        }
      }

      if (!active) return;
      setCourses((courseData ?? []).map(c => ({
        ...c,
        lessonCount: lessonMap[c.id]?.count ?? 0,
        hasFreeLesson: lessonMap[c.id]?.hasFree ?? false,
      })));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  // Group by category
  const grouped = courses.reduce<Record<string, CourseRow[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  const showAccessBanner = sub.isAuthenticated && sub.hasActive;
  const showCtaBanner = !sub.loading && !sub.hasActive;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-display">{t("cursos.titulo")}</h1>
          <p className="text-muted-foreground mt-2">{t("cursos.desc")}</p>
        </div>

        {showAccessBanner && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <span className="text-sm font-medium text-green-300">{t("cursos.acceso")}</span>
          </div>
        )}

        {showCtaBanner && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-medium">{t("cursos.suscribete")}</span>
            </div>
            <Link
              to="/planes"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              {t("cursos.verPlanes")}
            </Link>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground text-center py-12">{t("cursos.cargando")}</p>
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">{t("cursos.vacio")}</p>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, list]) => (
              <section key={category}>
                <h2 className="text-xl font-bold font-display mb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {list.map(course => (
                    <CourseGridCard key={course.id} course={course} hasAccess={sub.hasActive} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseGridCard({ course, hasAccess }: { course: CourseRow; hasAccess: boolean }) {
  const { t } = useI18n();
  const locked = !hasAccess && !course.hasFreeLesson;

  return (
    <Link
      to="/cursos/$id"
      params={{ id: course.id }}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-0.5"
    >
      <div className="relative aspect-video bg-secondary overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-secondary">
            <BookOpen className="w-12 h-12 text-primary/30" />
          </div>
        )}

        {locked ? (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <Lock className="w-8 h-8 text-primary" />
            <span className="text-xs font-medium text-foreground/80">{t("cursos.bloqueado")}</span>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center glow-orange">
                <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
              </div>
            </div>
            {!hasAccess && course.hasFreeLesson && (
              <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded">
                {t("cursos.gratis")}
              </span>
            )}
          </>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
          <span>{course.level}</span>
          {course.estimated_duration && <><span>·</span><span>{course.estimated_duration}</span></>}
        </div>
        <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {course.lessonCount} {t("cursos.lecciones")} · {course.instructor}
        </p>
      </div>
    </Link>
  );
}
