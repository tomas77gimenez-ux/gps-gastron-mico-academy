import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, BookOpen, CreditCard, Calendar, AlertCircle, CheckCircle2, Loader2, ExternalLink, LogOut, Save, PlayCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { loc } from "@/lib/localize";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
  head: () => ({
    meta: [
      { title: "Mi Perfil — GPS Gastronômico" },
      { name: "description", content: "Gestiona tu cuenta, cursos y compras." },
      { property: "og:title", content: 'Mi Perfil — GPS Gastronômico' },
      { property: "og:description", content: 'Gestiona tu cuenta, suscripción y certificados.' },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/perfil" },
      { name: "robots", content: "noindex,nofollow" }
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/perfil" }],
  }),
});

function formatDate(iso: string | null, lang: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(lang === "en" ? "en-US" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function PerfilPage() {
  const { t, lang } = useI18n();
  const sub = useSubscription();
  const { isReady, user } = useAuthSession();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [customerChecked, setCustomerChecked] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{
    id: string;
    title: string;
    thumbnail_url: string | null;
    total: number;
    completed: number;
    lastAt: string;
  }>>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !user) return;
    let active = true;
    setProfileLoading(true);
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, created_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      const name = data?.display_name ?? user.user_metadata?.display_name ?? "";
      setDisplayName(name);
      setInitialName(name);
      setMemberSince(data?.created_at ?? null);
      setProfileLoading(false);
    })();
    return () => { active = false; };
  }, [isReady, user]);

  useEffect(() => {
    if (!isReady || !user) { setStripeCustomerId(null); setCustomerChecked(true); return; }
    let active = true;
    setCustomerChecked(false);
    (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id, environment, updated_at")
        .eq("user_id", user.id)
        .not("stripe_customer_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(5);
      if (!active) return;
      const valid = (data ?? []).find(
        (r) => r.stripe_customer_id && !r.stripe_customer_id.startsWith("cus_test_fake"),
      );
      setStripeCustomerId(valid?.stripe_customer_id ?? null);
      setCustomerChecked(true);
    })();
    return () => { active = false; };
  }, [isReady, user]);

  useEffect(() => {
    if (!isReady || !user) { setCoursesLoading(false); return; }
    let active = true;
    setCoursesLoading(true);
    (async () => {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("course_id, lesson_id, completed, last_watched_at")
        .eq("user_id", user.id)
        .order("last_watched_at", { ascending: false });
      const byCourse = new Map<string, { completed: Set<string>; lastAt: string }>();
      for (const row of progress ?? []) {
        const entry = byCourse.get(row.course_id) ?? { completed: new Set<string>(), lastAt: row.last_watched_at };
        if (row.completed) entry.completed.add(row.lesson_id);
        if (row.last_watched_at > entry.lastAt) entry.lastAt = row.last_watched_at;
        byCourse.set(row.course_id, entry);
      }
      const [{ data: courseRows }, { data: lessonRows }] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, title_en, title_pt, thumbnail_url, status, sort_order")
          .eq("status", "published")
          .order("sort_order", { ascending: true }),
        supabase.from("lessons").select("course_id"),
      ]);
      const totals = new Map<string, number>();
      for (const l of lessonRows ?? []) totals.set(l.course_id, (totals.get(l.course_id) ?? 0) + 1);
      const result = (courseRows ?? []).map(c => ({
        id: c.id,
        title: loc(c, "title", lang),
        thumbnail_url: c.thumbnail_url,
        total: totals.get(c.id) ?? 0,
        completed: byCourse.get(c.id)?.completed.size ?? 0,
        lastAt: byCourse.get(c.id)?.lastAt ?? "",
      })).sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
      if (active) { setCourses(result); setCoursesLoading(false); }
    })();
    return () => { active = false; };
  }, [isReady, user, lang]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmed = displayName.trim();
    if (!trimmed) { toast.error(t("perfil.errorGuardar")); return; }
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, display_name: trimmed }, { onConflict: "user_id" });
      if (error) throw error;
      setInitialName(trimmed);
      toast.success(t("perfil.guardado"));
    } catch (err) {
      console.error("[perfil] save error", err);
      toast.error(t("perfil.errorGuardar"));
    } finally {
      setProfileSaving(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function openPortal() {
    if (!stripeCustomerId) {
      setPortalError(null);
      toast.info(t("perfil.sinCliente"));
      return;
    }
    setPortalLoading(true);
    setPortalError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          returnUrl: `${window.location.origin}/perfil`,
          environment: getStripeEnvironment(),
        },
      });
      const detail =
        (data && typeof data === "object" && "error" in data ? String((data as { error?: unknown }).error) : null) ??
        error?.message ??
        null;
      if (!data?.url) {
        setPortalError(detail || "El portal de facturación no devolvió una URL válida.");
        return;
      }
      window.open(data.url as string, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("portal error", e);
      setPortalError(e instanceof Error ? e.message : String(e));
    } finally {
      setPortalLoading(false);
    }
  }

  const portalNotice = portalError ? (
    <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-left">
      <p className="text-sm font-medium text-destructive">{t("perfil.errorPortal")}</p>
      <details className="mt-2">
        <summary className="text-xs text-muted-foreground cursor-pointer">{t("perfil.detalleTecnico")}</summary>
        <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-muted-foreground">{portalError}</pre>
      </details>
    </div>
  ) : null;

  const portalButton = (
    <Button onClick={openPortal} disabled={portalLoading} variant="outline">
      {portalLoading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("perfil.abriendoPortal")}</>
      ) : (
        <><ExternalLink className="w-4 h-4 mr-2" />{t("perfil.gestionar")}</>
      )}
    </Button>
  );

  const memberLabel = memberSince
    ? new Date(memberSince).toLocaleDateString(lang === "en" ? "en-US" : "es-ES", { month: "long", year: "numeric" })
    : null;
  const isDirty = displayName.trim() !== initialName.trim();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold font-display mb-8">{t("perfil.titulo")}</h1>

        {isReady && !user && (
          <section className="bg-card rounded-xl border border-border p-6 mb-8 text-center">
            <p className="font-medium mb-2">{t("perfil.sinSuscripcion")}</p>
            <p className="text-sm text-muted-foreground mb-4">Inicia sesión para ver tu suscripción y gestionar tu cuenta.</p>
            <Button asChild>
              <Link to="/login">{t("nav.entrar")}</Link>
            </Button>
          </section>
        )}

        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{initialName || user?.email?.split("@")[0] || "Usuario"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                {sub.hasActive && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                    {sub.status === "trialing" ? t("perfil.prueba") : t("perfil.activa")}
                  </span>
                )}
              </div>
            </div>
            {user && (
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" /> {t("perfil.cerrarSesion")}
              </Button>
            )}
          </div>
          {memberLabel && (
            <p className="text-sm text-muted-foreground mt-4">
              {lang === "en" ? `Member since ${memberLabel}` : lang === "pt" ? `Membro desde ${memberLabel}` : `Miembro desde ${memberLabel}`}
            </p>
          )}
        </div>

        {/* Datos personales */}
        {user && (
          <section className="bg-card rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{t("perfil.datosPersonales")}</h2>
            </div>
            <form onSubmit={saveProfile} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="displayName">{t("perfil.nombre")}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={profileLoading || profileSaving}
                  maxLength={80}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email ?? ""} disabled className="mt-1.5" />
              </div>
              <Button type="submit" disabled={!isDirty || profileSaving || profileLoading}>
                {profileSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("perfil.guardando")}</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />{t("perfil.guardar")}</>
                )}
              </Button>
            </form>
          </section>
        )}

        {/* Subscription section */}
        <section className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{t("perfil.suscripcion")}</h2>
          </div>

          {!isReady ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t("perfil.cargandoSub")}</span>
            </div>
          ) : !user ? (
            <div className="text-center py-6">
              <p className="font-medium mb-1">Inicia sesión para ver tu suscripción</p>
              <p className="text-sm text-muted-foreground mb-4">Tu plan, estado y cobros aparecerán aquí automáticamente.</p>
              <Button asChild>
                <Link to="/login">{t("nav.entrar")}</Link>
              </Button>
            </div>
          ) : sub.loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t("perfil.cargandoSub")}</span>
            </div>
          ) : sub.hasActive ? (
            <div className="space-y-4">
              {sub.inGrace && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">
                    Actualizá tu método de pago — tenés 5 días de acceso mientras se regulariza el cobro.
                  </p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {t("perfil.plan")}
                  </p>
                  <p className="font-semibold truncate" title={sub.productId ?? ""}>
                    {sub.productId ?? "—"}
                  </p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {t("perfil.estado")}
                  </p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="font-semibold">
                      {sub.status === "trialing"
                        ? t("perfil.prueba")
                        : sub.status === "canceled"
                        ? t("perfil.cancelada")
                        : t("perfil.activa")}
                    </span>
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-border sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t("perfil.proximaCobranza")}
                  </p>
                  <p className="font-semibold">{formatDate(sub.currentPeriodEnd, lang)}</p>
                </div>
              </div>

              {sub.cancelAtPeriodEnd && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    {t("perfil.cancelaEn")} <strong>{formatDate(sub.currentPeriodEnd, lang)}</strong>
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                {customerChecked && !stripeCustomerId ? (
                  <p className="text-sm text-muted-foreground">{t("perfil.sinCliente")}</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">{t("perfil.gestionarDesc")}</p>
                    {portalButton}
                    {portalNotice}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-medium mb-1">{t("perfil.sinSuscripcion")}</p>
              <p className="text-sm text-muted-foreground mb-4">{t("perfil.sinSuscripcionDesc")}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button asChild>
                  <Link to="/planes">{t("perfil.verPlanes")}</Link>
                </Button>
                {customerChecked && stripeCustomerId && portalButton}
              </div>
              {portalNotice}
            </div>
          )}
        </section>

        {/* Mis cursos en progreso */}
        {user && (
          <section className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{t("perfil.misCursos")}</h2>
            </div>
            {coursesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">…</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">{t("perfil.cursosVacio")}</p>
                <Button asChild variant="outline">
                  <Link to="/cursos">{t("perfil.verCatalogo")}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map(c => {
                  const pct = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
                  return (
                    <Link
                      key={c.id}
                      to="/cursos/$id"
                      params={{ id: c.id }}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background/40 hover:border-primary/40 transition-colors group"
                    >
                      <div className="w-20 h-14 shrink-0 rounded-md overflow-hidden bg-secondary flex items-center justify-center">
                        {c.thumbnail_url ? (
                          <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-primary/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate group-hover:text-primary transition-colors">{c.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[200px]">
                            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {c.completed}/{c.total} · {pct}%
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {t("perfil.ultimaVisita")}: {formatDate(c.lastAt, lang)}
                        </p>
                      </div>
                      <PlayCircle className="w-6 h-6 text-primary opacity-70 group-hover:opacity-100 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
