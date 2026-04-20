import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { ArrowLeft, Lock, Play, Sparkles, BookOpen, FileText, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/cursos/$id")({
  component: CourseDetailPage,
  head: () => ({
    meta: [
      { title: "Curso — GPS Gastronômico" },
      { name: "description", content: "Aulas y materiales del curso." },
    ],
  }),
});

interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  thumbnail_url: string | null;
  estimated_duration: string | null;
  instructor: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  video_url: string | null;
  is_free: boolean;
  sort_order: number;
}

function CourseDetailPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const sub = useSubscription();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ data: courseData, error: cErr }, { data: lessonData, error: lErr }] = await Promise.all([
          supabase
            .from("courses")
            .select("id, title, description, category, level, thumbnail_url, estimated_duration, instructor")
            .eq("id", id)
            .maybeSingle(),
          supabase
            .from("lessons")
            .select("id, title, description, duration, video_url, is_free, sort_order")
            .eq("course_id", id)
            .order("sort_order", { ascending: true }),
        ]);
        if (cErr) console.error("[curso] course err:", cErr);
        if (lErr) console.error("[curso] lessons err:", lErr);
        if (!active) return;
        setCourse(courseData);
        const ls = lessonData ?? [];
        setLessons(ls);
        if (ls.length > 0) setActiveLessonId(ls[0].id);
      } catch (e) {
        console.error("[curso] unexpected:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const activeLesson = lessons.find(l => l.id === activeLessonId) ?? null;
  const canPlay = (lesson: Lesson) => sub.hasActive || lesson.is_free;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center text-muted-foreground">{t("cursos.cargando")}</div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center">
        <p className="text-muted-foreground mb-4">{t("cursos.vacio")}</p>
        <Link to="/cursos" className="text-primary hover:underline">{t("cursos.volver")}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("cursos.volver")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left: Player + info */}
          <div>
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border mb-5 relative">
              {activeLesson && canPlay(activeLesson) && activeLesson.video_url ? (
                <video
                  key={activeLesson.id}
                  src={activeLesson.video_url}
                  controls
                  className="w-full h-full object-contain bg-black"
                />
              ) : activeLesson && !canPlay(activeLesson) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-card to-secondary">
                  {course.thumbnail_url && (
                    <img src={course.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80 max-w-sm">{t("cursos.aulaBloqueada")}</p>
                    <Link
                      to="/planes"
                      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> {t("cursos.verPlanes")}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <BookOpen className="w-10 h-10 text-primary/40" />
                  <span className="text-sm">{t("cursos.sinVideo")}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              <span className="text-primary">{course.category}</span>
              <span>·</span>
              <span>{course.level}</span>
              {course.estimated_duration && <><span>·</span><span>{course.estimated_duration}</span></>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">{course.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">{course.instructor}</p>
            {course.description && <p className="text-sm leading-relaxed">{course.description}</p>}

            {activeLesson && (
              <div className="mt-6 pt-6 border-t border-border">
                <h2 className="text-lg font-semibold mb-2">{activeLesson.title}</h2>
                {activeLesson.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{activeLesson.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Right: Lesson list */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {!sub.loading && !sub.hasActive && (
              <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-medium mb-3">{t("cursos.suscribete")}</p>
                <Link
                  to="/planes"
                  className="block text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  {t("cursos.verPlanes")}
                </Link>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm">{t("cursos.aulas")}</h3>
                <span className="text-xs text-muted-foreground">{lessons.length}</span>
              </div>
              {lessons.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t("cursos.sinAulas")}</p>
              ) : (
                <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                  {lessons.map((lesson, i) => {
                    const playable = canPlay(lesson);
                    const isActive = lesson.id === activeLessonId;
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                            isActive ? "bg-primary/10" : "hover:bg-secondary/50"
                          }`}
                        >
                          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                            {playable ? (isActive ? <Play className="w-3 h-3 ml-0.5" /> : i + 1) : <Lock className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>
                                {lesson.title}
                              </span>
                              {lesson.is_free && !sub.hasActive && (
                                <span className="text-[9px] font-semibold uppercase tracking-wide bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                  {t("cursos.gratis")}
                                </span>
                              )}
                            </div>
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {sub.hasActive && (
              <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 className="w-4 h-4" /> {t("cursos.acceso")}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
