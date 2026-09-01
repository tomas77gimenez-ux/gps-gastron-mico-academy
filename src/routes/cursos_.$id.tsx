import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";
import { useSubscription } from "@/hooks/useSubscription";
import { useCourseProgress, usePandaProgressTracker, useLessonCompletion } from "@/hooks/useLessonProgress";
import { useLessonEmbedUrls } from "@/lib/bunny";
import { ArrowLeft, Lock, Play, Sparkles, BookOpen, CheckCircle2, Check, Download, FileText, Crown, Star, Clock, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { hasPlanAccess } from "@/lib/plan-access";
import { loc, locLevel, locCategory } from "@/lib/localize";
import type { PlanTier } from "@/lib/admin-types";

export const Route = createFileRoute("/cursos_/$id")({
  component: CourseDetailPage,
  loader: async ({ params: { id } }) => {
    const [{ data: course }, { data: lessons }] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title, description, title_en, title_pt, description_en, description_pt, category, level, thumbnail_url, estimated_duration, instructor")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("lessons")
        .select("id, title, description, title_en, title_pt, description_en, description_pt, duration, poster_url, cover_url, content_type, is_free, sort_order, required_plan")
        .eq("course_id", id)
        .order("sort_order", { ascending: true }),
    ]);
    const { data: materials } = await supabase
      .from("course_materials")
      .select("id, lesson_id, title, file_type, file_size, required_plan, has_file")
      .or(`course_id.eq.${id},lesson_id.in.(${(lessons ?? []).map(l => l.id).join(",") || "00000000-0000-0000-0000-000000000000"})`);
    return { course, lessons: lessons ?? [], materials: materials ?? [] };
  },
  head: ({ loaderData, params }) => {
    const tt = tFor(readPrefs().lang);
    const course = (loaderData as { course?: { title?: string; description?: string | null; thumbnail_url?: string | null; instructor?: string } } | undefined)?.course;
    const title = course?.title
      ? `${course.title} — GPS Gastronômico`
      : tt("crs2.head.fallbackTitle");
    const description =
      (course?.description?.slice(0, 160)) ||
      tt("crs2.head.fallbackDesc");
    const canonical = `https://plataforma-test1.lovable.app/cursos/${params?.id ?? ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: course?.title ?? tt("crs2.head.fallbackTitle") },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        ...(course?.thumbnail_url
          ? [{ property: "og:image", content: course.thumbnail_url }]
          : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: course
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Course",
                name: course.title,
                description,
                provider: {
                  "@type": "Organization",
                  name: "GPS Gastronômico",
                  sameAs: "https://plataforma-test1.lovable.app",
                },
                ...(course.instructor
                  ? { instructor: { "@type": "Person", name: course.instructor } }
                  : {}),
                ...(course.thumbnail_url ? { image: course.thumbnail_url } : {}),
              }),
            },
          ]
        : [],
    };
  },
});

interface Course {
  id: string;
  title: string;
  description: string | null;
  title_en: string | null;
  title_pt: string | null;
  description_en: string | null;
  description_pt: string | null;
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
  title_en: string | null;
  title_pt: string | null;
  description_en: string | null;
  description_pt: string | null;
  duration: string | null;
  video_url: string | null;
  poster_url: string | null;
  cover_url: string | null;
  content_type: string;
  is_free: boolean;
  sort_order: number;
  panda_video_id: string | null;
  panda_library_id: string | null;
  bunny_video_id: string | null;
  bunny_video_id_2: string | null;
  required_plan?: PlanTier;
}

interface Material {
  id: string;
  lesson_id: string | null;
  title: string;
  file_type: string;
  file_size: number | null;
  required_plan?: PlanTier;
  has_file?: boolean;
}

function CourseDetailPage() {
  const { t, lang } = useI18n();
  const sub = useSubscription();
  const loaderData = Route.useLoaderData() as { course: Course | null; lessons: Lesson[]; materials?: Material[] };
  const { course } = loaderData;
  const [lessons, setLessons] = useState<Lesson[]>(
    (loaderData.lessons ?? []).map((l) => ({
      ...l,
      video_url: null,
      panda_video_id: null,
      panda_library_id: null,
      bunny_video_id: null,
      bunny_video_id_2: null,
    }))
  );
  const [materials, setMaterials] = useState<Material[]>(loaderData.materials ?? []);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(lessons[0]?.id ?? null);
  const pandaVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeLesson = lessons.find(l => l.id === activeLessonId) ?? null;
  const canPlay = (lesson: Lesson) =>
    lesson.is_free || hasPlanAccess(sub.planTier, lesson.required_plan ?? "basico");
  const canDownload = (material: Material) =>
    hasPlanAccess(sub.planTier, material.required_plan ?? "basico");
  const activeLessonRequired: PlanTier = activeLesson?.required_plan ?? "basico";
  const activeNeedsUpgrade =
    activeLesson && !canPlay(activeLesson) && sub.planTier === "basico" && activeLessonRequired === "premium";

  // Fetch sensitive video identifiers via subscription-gated RPC when active lesson changes
  useEffect(() => {
    if (!activeLessonId) return;
    const current = lessons.find((l) => l.id === activeLessonId);
    if (!current) return;
    if (current.panda_video_id || current.video_url || current.bunny_video_id) return; // already loaded
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_lesson_video", { _lesson_id: activeLessonId });
      if (cancelled || error || !data || data.length === 0) return;
      const row = data[0] as {
        panda_video_id: string | null;
        panda_library_id: string | null;
        video_url: string | null;
        bunny_video_id: string | null;
        bunny_video_id_2: string | null;
      };
      setLessons((prev) =>
        prev.map((l) =>
          l.id === activeLessonId
            ? {
                ...l,
                panda_video_id: row.panda_video_id,
                panda_library_id: row.panda_library_id,
                video_url: row.video_url,
                bunny_video_id: row.bunny_video_id,
                bunny_video_id_2: row.bunny_video_id_2,
              }
            : l
        )
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [activeLessonId, lessons]);

  const activeMaterials = useMemo(
    () => (activeLesson ? materials.filter(m => m.lesson_id === activeLesson.id) : []),
    [activeLesson, materials]
  );

  const getMaterialFilename = (material: Material) => {
    const extension = material.file_type?.toLowerCase() || "pdf";
    const base = material.title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "material";
    return `${base}.${extension}`;
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const handleDownload = async (material: Material) => {
    if (downloadingId) return;
    setDownloadingId(material.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error(t("cursos.iniciaSesionDescargar"));
        return;
      }
      const res = await fetch(
        `/api/public/material-download?material_id=${encodeURIComponent(material.id)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 401) {
        toast.error(t("cursos.sesionExpirada"), { description: t("cursos.volverIniciarSesion") });
        return;
      }
      if (res.status === 403) {
        toast.error(t("cursos.sinAccesoMaterial"), {
          description: t("cursos.actualizaPlan"),
        });
        return;
      }
      if (!res.ok) {
        toast.error(t("cursos.noSePudoDescargar"), { description: `Error ${res.status}` });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getMaterialFilename(material);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(t("cursos.descargaIniciada"), { description: getMaterialFilename(material) });
    } catch (err: any) {
      toast.error(t("cursos.errorDescarga"), { description: err?.message ?? t("cursos.intentaNuevamente") });
    } finally {
      setDownloadingId(null);
    }
  };

  // Fallback: garante que os materiais sejam buscados no cliente
  useEffect(() => {
    if (!course?.id) return;
    let cancelled = false;
    (async () => {
      const lessonIds = lessons.map(l => l.id);
      if (lessonIds.length === 0) return;
      const { data } = await supabase
        .from("course_materials")
        .select("id, lesson_id, title, file_type, file_size, required_plan, has_file")
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

  const { setCompleted, saving: savingCompletion, canTrack } = useLessonCompletion(course?.id, reload);
  const hasBunnyVideo = !!(activeLesson?.bunny_video_id || activeLesson?.bunny_video_id_2);
  // URLs firmadas resueltas en el servidor (nunca se construye el iframe en el cliente).
  const { urls: bunnyUrls, loading: bunnyLoading } = useLessonEmbedUrls(
    hasBunnyVideo && activeLesson && canPlay(activeLesson) ? activeLesson.id : null,
    true,
  );
  const isMaterialOnly = activeLesson?.content_type === "material";

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

    // Don't set crossOrigin: not needed for public HLS and breaks poster caching
    video.removeAttribute("crossorigin");
    if (activeLesson?.poster_url) video.poster = activeLesson.poster_url;

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
      hls = new Hls({ enableWorker: true, xhrSetup: (xhr) => { xhr.withCredentials = false; } });
      hls.loadSource(pandaStreamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, applyResume);
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          // Fallback: try native src as last resort
          try { hls?.destroy(); } catch {}
          video.src = pandaStreamUrl;
          video.load();
        }
      });

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
        <Link to="/cursos" className="text-primary-text hover:underline">{t("cursos.volver")}</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("cursos.volver")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)] gap-8">
          {/* Left: Player + info */}
          <div>
            <div className="mb-5 space-y-4">
              {!activeLesson ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <BookOpen className="w-10 h-10 text-primary-text/40" />
                  <span className="text-sm">{t("cursos.sinAulas")}</span>
                </div>
              ) : !canPlay(activeLesson) ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-card to-secondary">
                  {(activeLesson.cover_url || course.thumbnail_url) && (
                    <img src={activeLesson.cover_url ?? course.thumbnail_url!} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      {activeNeedsUpgrade ? <Crown className="w-7 h-7 text-primary-text" /> : <Lock className="w-7 h-7 text-primary-text" />}
                    </div>
                    <p className="text-sm text-foreground/80 max-w-sm">
                      {activeNeedsUpgrade
                        ? t("cursos.leccionPremium")
                        : t("cursos.aulaBloqueada")}
                    </p>
                    <Link
                      to="/planes"
                      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      {activeNeedsUpgrade ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      {activeNeedsUpgrade ? t("cursos.actualizarPremium") : t("cursos.verPlanes")}
                    </Link>
                  </div>
                </div>
              ) : bunnyUrls.length > 0 ? (
                bunnyUrls.map((embedUrl, i) => (
                  <div key={i}>
                    {bunnyUrls.length > 1 && (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                        {t("cursos.parte")} {i + 1}
                      </p>
                    )}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border">
                      <iframe
                        key={`${activeLesson.id}-${i}`}
                        src={embedUrl}
                        title={`${loc(activeLesson, "title", lang)}${bunnyUrls.length > 1 ? ` — ${t("cursos.parte")} ${i + 1}` : ""}`}
                        loading="lazy"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    </div>
                  </div>
                ))
              ) : hasBunnyVideo && bunnyLoading ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black border border-border flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-text/70" />
                </div>
              ) : pandaStreamUrl ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                  <video
                    key={activeLesson.id}
                    ref={pandaVideoRef}
                    poster={activeLesson.cover_url ?? activeLesson.poster_url ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              ) : activeLesson.video_url ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
                  <video
                    key={activeLesson.id}
                    src={activeLesson.video_url}
                    poster={activeLesson.cover_url ?? activeLesson.poster_url ?? undefined}
                    controls
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              ) : isMaterialOnly ? (
                <div className="relative rounded-xl overflow-hidden border border-primary/25 bg-gradient-to-br from-card to-secondary px-6 py-10 text-center">
                  {activeLesson.cover_url && (
                    <img src={activeLesson.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-3 max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-primary-text" />
                    </div>
                    <h3 className="text-lg font-semibold">{t("cursos.clasePractica")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("cursos.clasePracticaDesc")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary border border-border flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  {activeLesson.cover_url && (
                    <img src={activeLesson.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <Clock className="w-10 h-10 text-primary-text/50" />
                    <span className="text-sm font-medium">{t("cursos.videoProximamente")}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              <span className="text-primary-text">{locCategory(course.category, lang)}</span>
              <span>·</span>
              <span>{locLevel(course.level, lang)}</span>
              {course.estimated_duration && <><span>·</span><span>{course.estimated_duration}</span></>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">{loc(course, "title", lang)}</h1>
            <p className="text-sm text-muted-foreground mb-4">{course.instructor}</p>
            {loc(course, "description", lang) && <p className="text-sm leading-relaxed">{loc(course, "description", lang)}</p>}

            {activeLesson && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-lg font-semibold">{loc(activeLesson, "title", lang)}</h2>
                  {canTrack && canPlay(activeLesson) && (
                    <button
                      type="button"
                      disabled={savingCompletion}
                      onClick={() => setCompleted(activeLesson.id, !progress[activeLesson.id]?.completed)}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        progress[activeLesson.id]?.completed
                          ? "border border-green-500/40 bg-green-500/10 text-green-300"
                          : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {progress[activeLesson.id]?.completed ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      {progress[activeLesson.id]?.completed ? t("cursos.completada") : t("cursos.marcarCompletada")}
                    </button>
                  )}
                </div>
                {loc(activeLesson, "description", lang) && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{loc(activeLesson, "description", lang)}</p>
                )}
                {activeMaterials.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      {t("cursos.materiales")}
                    </p>
                    <div className="flex flex-col gap-2">
                      {activeMaterials.map(m => (
                      m.has_file === false ? (
                        <div
                          key={m.id}
                          className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{m.title}</p>
                              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                                {m.file_type} · {t("cursos.disponibleProximamente")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : canDownload(m) ? (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleDownload(m)}
                        disabled={downloadingId === m.id}
                        className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors px-4 py-3 group text-left disabled:opacity-60"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary-text" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{m.title}</p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                              {m.file_type}{m.file_size ? ` · ${(m.file_size / (1024 * 1024)).toFixed(1)} MB` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-primary-text">
                          <Download className="w-4 h-4 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                          <span className="text-[11px] underline underline-offset-2 hover:text-primary-text/80">
                            {downloadingId === m.id ? "..." : t("cursos.descargar")}
                          </span>
                        </div>
                      </button>
                      ) : (
                        <Link
                          key={m.id}
                          to="/planes"
                          className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-3 group text-left opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0 w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                                {m.title}
                                <span className="text-[10px] font-semibold uppercase tracking-wide bg-primary/20 text-primary-text px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                  <Crown className="w-3 h-3" /> Premium
                                </span>
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {t("cursos.actualizarParaDescargar")}
                              </p>
                            </div>
                          </div>
                          <Crown className="w-4 h-4 shrink-0 text-primary-text" />
                        </Link>
                      )
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
                    <span className="text-muted-foreground">{t("cursos.progreso")}</span>
                    <span className="font-semibold text-primary-text">{completedCount}/{lessons.length} · {overallPct}%</span>
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
                <ul className="divide-y divide-border max-h-[72vh] overflow-y-auto">
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
                          className={`w-full text-left px-4 py-3.5 flex items-start gap-3.5 transition-colors ${
                            isActive ? "bg-primary/10" : "hover:bg-secondary/50"
                          }`}
                        >
                          <div className="relative shrink-0 w-32 sm:w-36 aspect-video rounded-lg overflow-hidden bg-secondary border border-border">
                            {(lesson.cover_url ?? lesson.poster_url) ? (
                              <img
                                src={(lesson.cover_url ?? lesson.poster_url)!}
                                alt=""
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                                {i + 1}
                              </div>
                            )}
                            <div className={`absolute inset-0 flex items-center justify-center ${
                              isActive || isCompleted || !playable ? "bg-black/40" : "bg-black/10"
                            }`}>
                              {!playable ? (
                                <Lock className="w-4 h-4 text-white" />
                              ) : isCompleted ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : isActive ? (
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              ) : (
                                <Play className="w-4 h-4 text-white/80 ml-0.5" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <span className={`text-sm font-medium line-clamp-2 ${isActive ? "text-primary-text" : ""}`}>
                                {loc(lesson, "title", lang)}
                              </span>
                              {lesson.is_free && !sub.hasActive && (
                                <span className="text-[9px] font-semibold uppercase tracking-wide bg-primary/20 text-primary-text px-1.5 py-0.5 rounded">
                                  {t("cursos.gratis")}
                                </span>
                              )}
                              {!lesson.is_free && (lesson.required_plan ?? "basico") === "premium" && !hasPlanAccess(sub.planTier, "premium") && (
                                <span className="text-[9px] font-semibold uppercase tracking-wide bg-primary/20 text-primary-text px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" /> Premium
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
