import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { useCourseProgress, usePandaProgressTracker } from "@/hooks/useLessonProgress";
import { ArrowLeft, Lock, Play, Sparkles, BookOpen, CheckCircle2, Check, Download, FileText } from "lucide-react";

export const Route = createFileRoute("/cursos_/$id")({
  component: CourseDetailPage,
  loader: async ({ params: { id } }) => {
    const [{ data: course }, { data: lessons }] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title, description, category, level, thumbnail_url, estimated_duration, instructor")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("lessons")
        .select("id, title, description, duration, video_url, poster_url, is_free, sort_order, panda_video_id, panda_library_id")
        .eq("course_id", id)
        .order("sort_order", { ascending: true }),
    ]);
    const { data: materials } = await supabase
      .from("course_materials")
      .select("id, lesson_id, title, file_url, file_type, file_size")
      .or(`course_id.eq.${id},lesson_id.in.(${(lessons ?? []).map(l => l.id).join(",") || "00000000-0000-0000-0000-000000000000"})`);
    return { course, lessons: lessons ?? [], materials: materials ?? [] };
  },
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
  poster_url: string | null;
  is_free: boolean;
  sort_order: number;
  panda_video_id: string | null;
  panda_library_id: string | null;
}

interface Material {
  id: string;
  lesson_id: string | null;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
}

function CourseDetailPage() {
  const { t } = useI18n();
  const sub = useSubscription();
  const loaderData = Route.useLoaderData() as { course: Course | null; lessons: Lesson[]; materials?: Material[] };
  const { course, lessons } = loaderData;
  const [materials, setMaterials] = useState<Material[]>(loaderData.materials ?? []);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(lessons[0]?.id ?? null);
  const pandaVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeLesson = lessons.find(l => l.id === activeLessonId) ?? null;
  const canPlay = (lesson: Lesson) => sub.hasActive || lesson.is_free;
  const activeMaterials = useMemo(
    () => (activeLesson ? materials.filter(m => m.lesson_id === activeLesson.id) : []),
    [activeLesson, materials]
  );

  // Fallback: garante que os materiais sejam buscados no cliente
  useEffect(() => {
    if (!course?.id) return;
    let cancelled = false;
    (async () => {
      const lessonIds = lessons.map(l => l.id);
      if (lessonIds.length === 0) return;
      const { data } = await supabase
        .from("course_materials")
        .select("id, lesson_id, title, file_url, file_type, file_size")
        .in("lesson_id", lessonIds);
      if (!cancelled && data) setMaterials(data as Material[]);
    })();
    return () => { cancelled = true; };
  }, [course?.id, lessons]);

  const { progress, reload } = useCourseProgress(course?.id);
  usePandaProgressTracker({
    lessonId: activeLesson?.panda_video_id ? activeLesson.id : null,
    courseId: course?.id ?? null,
    enabled: !!activeLesson && canPlay(activeLesson),
    mode: activeLesson?.panda_video_id ? "html5" : "iframe",
    videoRef: pandaVideoRef,
    onUpdate: reload,
  });

  const completedCount = useMemo(
    () => Object.values(progress).filter(p => p.completed).length,
    [progress]
  );
  const overallPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const pandaStreamUrl = activeLesson && activeLesson.panda_library_id && activeLesson.panda_video_id
    ? `https://b-${activeLesson.panda_library_id}.tv.pandavideo.com.br/${activeLesson.panda_video_id}/playlist.m3u8`
    : null;
  const resumeSeconds = activeLesson ? Math.floor(progress[activeLesson.id]?.progress_seconds ?? 0) : 0;

  useEffect(() => {
    const video = pandaVideoRef.current;
    if (!video || !pandaStreamUrl) return;

    let hls: Hls | null = null;

    const applyResume = () => {
      if (resumeSeconds <= 0) return;
      if (Math.abs((video.currentTime || 0) - resumeSeconds) < 2) return;
      try {
        video.currentTime = resumeSeconds;
      } catch {
        // no-op
      }
    };

    video.crossOrigin = "anonymous";
    video.poster = activeLesson?.poster_url ?? "";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = pandaStreamUrl;
      video.addEventListener("loadedmetadata", applyResume);
      video.load();

      return () => {
        video.removeEventListener("loadedmetadata", applyResume);
        video.removeAttribute("src");
        video.load();
      };
    }

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(pandaStreamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, applyResume);

      return () => {
        hls?.destroy();
        video.removeAttribute("src");
        video.load();
      };
    }

    return undefined;
  }, [activeLesson?.id, activeLesson?.poster_url, pandaStreamUrl, resumeSeconds]);

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
              {activeLesson && canPlay(activeLesson) && pandaStreamUrl ? (
                <video
                  key={activeLesson.id}
                  ref={pandaVideoRef}
                  poster={activeLesson.poster_url ?? undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain bg-black"
                />
              ) : activeLesson && canPlay(activeLesson) && activeLesson.video_url ? (
                <video
                  key={activeLesson.id}
                  src={activeLesson.video_url}
                  poster={activeLesson.poster_url ?? undefined}
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
                {activeMaterials.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Material complementario
                    </p>
                    <div className="flex flex-col gap-2">
                    {activeMaterials.map(m => (
                      <a
                        key={m.id}
                        href={m.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors px-4 py-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{m.title}</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                              {m.file_type}{m.file_size ? ` · ${(m.file_size / (1024 * 1024)).toFixed(1)} MB` : ""}
                            </p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-primary shrink-0 group-hover:translate-y-0.5 transition-transform" />
                      </a>
                    ))}
                    </div>
                  </div>
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
              {sub.hasActive && lessons.length > 0 && (
                <div className="px-4 py-3 border-b border-border bg-secondary/20">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-semibold text-primary">{completedCount}/{lessons.length} · {overallPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                </div>
              )}
              {lessons.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t("cursos.sinAulas")}</p>
              ) : (
                <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                  {lessons.map((lesson, i) => {
                    const playable = canPlay(lesson);
                    const isActive = lesson.id === activeLessonId;
                    const lessonProg = progress[lesson.id];
                    const isCompleted = !!lessonProg?.completed;
                    const partial = !isCompleted && lessonProg && lessonProg.duration_seconds
                      ? Math.min(100, Math.round((lessonProg.progress_seconds / lessonProg.duration_seconds) * 100))
                      : 0;
                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                            isActive ? "bg-primary/10" : "hover:bg-secondary/50"
                          }`}
                        >
                          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isCompleted
                              ? "bg-green-500/20 text-green-400 border border-green-500/40"
                              : isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                            {!playable ? <Lock className="w-3 h-3" />
                              : isCompleted ? <Check className="w-3.5 h-3.5" />
                              : isActive ? <Play className="w-3 h-3 ml-0.5" /> : i + 1}
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
                            {partial > 0 && (
                              <div className="mt-1.5 h-0.5 rounded-full bg-secondary overflow-hidden">
                                <div className="h-full bg-primary/60" style={{ width: `${partial}%` }} />
                              </div>
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
