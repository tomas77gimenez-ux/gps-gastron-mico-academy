import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { Lock, Play, BookOpen, CheckCircle2, Sparkles, Compass, ChevronRight, Crown, Star } from "lucide-react";
import { hasPlanAccess } from "@/lib/plan-access";
import { loc, locLevel, locPlan, locCategory } from "@/lib/localize";
import type { PlanTier } from "@/lib/admin-types";

export const Route = createFileRoute("/cursos")({
  component: CursosPage,
  head: () => ({
    meta: [
      { title: "Mentoría · Método GPS — GPS Gastronômico" },
      { name: "description", content: "Método GPS: 3 Pilares y 9 Módulos para transformar la gestión de tu restaurante." },
      { property: "og:title", content: "Mentoría · Método GPS" },
      { property: "og:description", content: "Método GPS: 3 Pilares y 9 Módulos para transformar la gestión de tu restaurante." },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/cursos" },
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/cursos" }],
  }),
});

interface CourseRow {
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
  methodology: string;
  pillar_order: number | null;
  module_number: number | null;
  lessonCount: number;
  hasFreeLesson: boolean;
  minRequiredPlan: PlanTier | null;
}

function CursosPage() {
  const { t, lang } = useI18n();
  const sub = useSubscription();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: courseData, error: courseErr } = await supabase
          .from("courses")
          .select("id, title, description, title_en, title_pt, description_en, description_pt, category, level, thumbnail_url, estimated_duration, instructor, methodology, pillar_order, module_number")
          .eq("status", "published")
          .order("methodology", { ascending: true })
          .order("pillar_order", { ascending: true, nullsFirst: false })
          .order("module_number", { ascending: true, nullsFirst: false })
          .order("sort_order", { ascending: true });

        if (courseErr) console.error("[cursos] courses query error:", courseErr);

        const ids = (courseData ?? []).map(c => c.id);
        let lessonMap: Record<string, { count: number; hasFree: boolean; minPlan: PlanTier | null }> = {};
        if (ids.length > 0) {
          const { data: lessonData, error: lessonErr } = await supabase
            .from("lessons")
            .select("course_id, is_free, required_plan")
            .in("course_id", ids);
          if (lessonErr) console.error("[cursos] lessons query error:", lessonErr);
          for (const id of ids) lessonMap[id] = { count: 0, hasFree: false, minPlan: null };
          for (const l of lessonData ?? []) {
            const m = lessonMap[l.course_id];
            if (m) {
              m.count += 1;
              if (l.is_free) m.hasFree = true;
              if (!l.is_free) {
                const rp = (l.required_plan as PlanTier | null) ?? "basico";
                if (rp === "basico" || m.minPlan === null) {
                  // Básico é o mínimo; se algum requer básico, esse vira o mínimo
                  if (m.minPlan !== "basico") m.minPlan = rp;
                }
              }
            }
          }
        }

        if (!active) return;
        setCourses((courseData ?? []).map(c => ({
          ...c,
          lessonCount: lessonMap[c.id]?.count ?? 0,
          hasFreeLesson: lessonMap[c.id]?.hasFree ?? false,
          minRequiredPlan: lessonMap[c.id]?.minPlan ?? null,
        })));
      } catch (e) {
        console.error("[cursos] unexpected error:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const gpsCourses = courses.filter(c => c.methodology === "gps");
  const generalCourses = courses.filter(c => c.methodology !== "gps");
  const generalGrouped = generalCourses.reduce<Record<string, CourseRow[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});
  const totalLessons = gpsCourses.reduce((sum, c) => sum + c.lessonCount, 0);

  const showAccessBanner = sub.isAuthenticated && sub.hasActive;
  const showCtaBanner = !sub.loading && !sub.hasActive;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mentoría hero — high-contrast left accent */}
        <div className="mb-12 border-l-4 border-primary pl-6">
          <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs">{t("cursos.heroKicker")}</span>
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-foreground mt-2 leading-tight">
            <span className="text-gradient-brand">GPS Gastronómico</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            {gpsCourses.length > 0
              ? `${gpsCourses.length} ${t("cursos.heroResumen").replace("{n}", String(totalLessons))}`
              : t("cursos.heroResumenFallback")}{" "}
            {t("cursos.heroTagline")}
          </p>
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
        ) : (
          <div className="space-y-12">
            <section>
              <div className="flex items-end gap-4 mb-5 pb-3 border-b border-border">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold font-display text-foreground">{t("cursos.modulosTitulo")}</h2>
                  <p className="text-sm text-muted-foreground">{t("cursos.modulosDesc")}</p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {gpsCourses.length} {gpsCourses.length === 1 ? t("cursos.modulo") : t("cursos.modulos")}
                </span>
              </div>
              {gpsCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4">{t("cursos.proximamente")}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gpsCourses.map(course => (
                    <CourseGridCard key={course.id} course={course} userPlan={sub.planTier} />
                  ))}
                </div>
              )}
            </section>

            {/* Catálogo general extra */}
            {Object.entries(generalGrouped).length > 0 && (
              <div className="pt-8 border-t border-border space-y-10">
                <h2 className="text-2xl font-bold font-display text-foreground">{t("cursos.catalogoAdicional")}</h2>
                {Object.entries(generalGrouped).map(([category, list]) => (
                  <section key={category}>
                    <h3 className="text-lg font-bold font-display text-foreground mb-4">{locCategory(category, lang)}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map(course => (
                        <CourseGridCard key={course.id} course={course} userPlan={sub.planTier} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseGridCard({ course, userPlan }: { course: CourseRow; userPlan: PlanTier | null }) {
  const { t, lang } = useI18n();
  const requiredPlan: PlanTier = course.minRequiredPlan ?? "basico";
  const hasAccess = hasPlanAccess(userPlan, requiredPlan);
  const needsUpgrade = userPlan === "basico" && requiredPlan === "premium";
  const locked = !hasAccess && !course.hasFreeLesson;
  const title = loc(course, "title", lang);
  const description = loc(course, "description", lang);

  return (
    <Link
      to="/cursos/$id"
      params={{ id: course.id }}
      className="group rounded-xl bg-card border border-border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(212,160,23,0.06)]"
    >
      <div className="relative aspect-video bg-secondary overflow-hidden">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-secondary">
            <BookOpen className="w-12 h-12 text-primary/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/55 to-transparent" />

        {course.methodology === "gps" && course.module_number && (
          <span className="absolute top-2 right-2 text-[10px] font-bold bg-background/80 backdrop-blur text-primary px-2 py-1 rounded">
            {t("cursos.moduloBadge")} {course.module_number}
          </span>
        )}

        {locked ? (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <Lock className="w-8 h-8 text-primary" />
            <span className="text-xs font-medium text-foreground/80">
              {needsUpgrade ? t("cursos.requierePremium") : t("cursos.bloqueado")}
            </span>
          </div>
        ) : (
          <>
            <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground glow-orange">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
            </div>
            {!hasAccess && course.hasFreeLesson && (
              <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded">
                {t("cursos.gratis")}
              </span>
            )}
          </>
        )}

        {requiredPlan === "premium" && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-primary/90 text-primary-foreground px-2 py-0.5 rounded inline-flex items-center gap-1">
            <Crown className="w-3 h-3" /> Premium
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{locLevel(course.level, lang)}</span>
          {locked ? (
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{t("cursos.bloqueado")}</span>
          ) : requiredPlan === "premium" ? (
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{locPlan("premium", lang)}</span>
          ) : (
            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{locPlan("basico", lang)}</span>
          )}
        </div>
        <h3 className="text-foreground text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            {course.lessonCount} {t("cursos.lecciones")}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}
