import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProAccess } from "@/hooks/useProAccess";
import { ProVideoPlayer } from "@/components/pro/ProVideoPlayer";
import { monthLabel, parseMetrics, type ProCase, type ProRecording, type ProSession } from "@/lib/pro";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CalendarClock, Crown, FileText, Loader2, Lock, MessageSquare,
  PlayCircle, Sparkles, TrendingUp, Video,
} from "lucide-react";

export const Route = createFileRoute("/sala-pro")({
  component: SalaProPage,
  head: () => ({
    meta: [
      { title: "Sala Pro — GPS Gastronômico" },
      { name: "description", content: "Reunión semanal de implementación en vivo, grabaciones y el Caso Real del Mes para miembros Academy Pro." },
      { property: "og:title", content: "Sala Pro — GPS Gastronômico" },
      { property: "og:description", content: "Acompañamiento en vivo cada semana y casos reales con números antes/después." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/sala-pro" },
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/sala-pro" }],
  }),
});

function formatDateTimeET(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      weekday: "long", day: "2-digit", month: "long",
      hour: "2-digit", minute: "2-digit", timeZone: "America/New_York",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function SalaProPage() {
  const { loading, isAuthenticated, hasPro } = useProAccess();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPro) return <ProTeaser isAuthenticated={isAuthenticated} />;
  return <ProContent />;
}

/* ------------------------------- Teaser ------------------------------- */

function ProTeaser({ isAuthenticated }: { isAuthenticated: boolean }) {
  const perks = [
    { icon: Video, title: "Reunión semanal en vivo", desc: "Implementamos juntos, en vivo, lo que mueve la aguja en tu restaurante." },
    { icon: TrendingUp, title: "Caso Real del Mes", desc: "Un caso real con números antes y después: CMV, ticket promedio y margen." },
    { icon: PlayCircle, title: "Archivo de grabaciones", desc: "Todas las reuniones anteriores disponibles cuando las necesites." },
    { icon: MessageSquare, title: "Soporte prioritario", desc: "Tus dudas van primero en la fila del equipo de Daniel." },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Lock className="w-3.5 h-3.5" /> Exclusivo Academy Pro
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3">Sala Pro</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            El espacio donde el método deja de ser teoría: acompañamiento en vivo cada semana y casos reales analizados con números.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
              <p.icon className="w-5 h-5 text-primary mb-3" strokeWidth={1.6} />
              <h2 className="font-semibold mb-1">{p.title}</h2>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <Crown className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.6} />
          <h2 className="text-xl font-semibold font-display mb-2">
            {isAuthenticated ? "Tu plan actual no incluye la Sala Pro" : "Ingresá con tu cuenta Academy Pro"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Pasate a Academy Pro y sumate a la próxima reunión de implementación.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild>
              <Link to="/planes">Pasate a Academy Pro <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Contenido ----------------------------- */

function ProContent() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<ProSession | null>(null);
  const [recordings, setRecordings] = useState<ProRecording[]>([]);
  const [cases, setCases] = useState<ProCase[]>([]);
  const [openRecording, setOpenRecording] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, r, c] = await Promise.all([
        supabase.from("pro_sessions").select("*").eq("is_active", true).order("starts_at", { ascending: true }).limit(20),
        supabase.from("pro_recordings").select("*").order("session_date", { ascending: false }),
        supabase.from("pro_cases").select("*").order("year", { ascending: false }).order("month", { ascending: false }),
      ]);
      if (cancelled) return;
      const sessions = (s.data ?? []) as ProSession[];
      const now = Date.now();
      setSession(sessions.find((x) => new Date(x.starts_at).getTime() >= now) ?? sessions[sessions.length - 1] ?? null);
      setRecordings((r.data ?? []) as ProRecording[]);
      setCases(((c.data ?? []) as unknown as ProCase[]).map((x) => ({ ...x, metrics: parseMetrics(x.metrics) })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const [featured, ...previous] = cases;
  const nextIsUpcoming = useMemo(
    () => (session ? new Date(session.starts_at).getTime() >= Date.now() : false),
    [session],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Crown className="w-3.5 h-3.5" /> Academy Pro
          </div>
          <h1 className="text-3xl font-bold font-display">Sala Pro</h1>
          <p className="text-muted-foreground mt-1">
            Reunión semanal de implementación, grabaciones y el Caso Real del Mes.
          </p>
        </header>

        {/* Reunión semanal */}
        <section>
          <h2 className="text-xl font-semibold font-display mb-4 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" /> Reunión semanal de implementación
          </h2>
          {session ? (
            <div className="rounded-2xl border border-primary/30 bg-card p-6">
              <p className="text-xs uppercase tracking-wide text-primary mb-2">
                {nextIsUpcoming ? "Próxima sesión" : "Última sesión"}
              </p>
              <h3 className="text-lg font-semibold mb-1">{session.title}</h3>
              <p className="text-sm text-muted-foreground capitalize mb-3">
                {formatDateTimeET(session.starts_at)} (ET)
              </p>
              {session.description && (
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{session.description}</p>
              )}
              {session.meeting_url && (
                <Button asChild>
                  <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">
                    Entrar a la reunión <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <EmptyBox text="La próxima reunión se anuncia pronto." />
          )}
        </section>

        {/* Grabaciones */}
        <section>
          <h2 className="text-xl font-semibold font-display mb-4 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" /> Grabaciones anteriores
          </h2>
          {recordings.length === 0 ? (
            <EmptyBox text="Todavía no hay grabaciones publicadas." />
          ) : (
            <div className="space-y-3">
              {recordings.map((rec) => {
                const open = openRecording === rec.id;
                return (
                  <div key={rec.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => setOpenRecording(open ? null : rec.id)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-secondary/40 transition-colors"
                    >
                      <span>
                        <span className="block font-medium">{rec.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {new Date(`${rec.session_date}T12:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                      </span>
                      <PlayCircle className={`w-5 h-5 shrink-0 ${open ? "text-primary" : "text-muted-foreground"}`} />
                    </button>
                    {open && (
                      <div className="p-4 pt-0 space-y-3">
                        <ProVideoPlayer kind="recording" id={rec.id} title={rec.title} />
                        {rec.notes && <p className="text-sm text-muted-foreground whitespace-pre-line">{rec.notes}</p>}
                        {rec.attachment_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={rec.attachment_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-1" /> {rec.attachment_name || "Material adjunto"}
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Caso Real del Mes */}
        <section>
          <h2 className="text-xl font-semibold font-display mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Caso Real del Mes
          </h2>
          {!featured ? (
            <EmptyBox text="El primer caso llega este mes." />
          ) : (
            <div className="space-y-6">
              <article className="rounded-2xl border border-primary/30 bg-card p-6">
                <p className="text-xs uppercase tracking-wide text-primary mb-2">{monthLabel(featured.month, featured.year)}</p>
                <h3 className="text-xl font-semibold font-display mb-2">{featured.title}</h3>
                {featured.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line mb-4">{featured.description}</p>
                )}
                {featured.metrics.length > 0 && (
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    {featured.metrics.map((m, i) => (
                      <div key={`${m.label}-${i}`} className="rounded-xl border border-border bg-secondary/40 p-4">
                        <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                        <p className="text-sm">
                          <span className="text-muted-foreground line-through">{m.before}</span>
                          <span className="mx-2 text-primary">→</span>
                          <span className="font-semibold text-primary">{m.after}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {featured.bunny_video_id && (
                  <div className="mb-4">
                    <ProVideoPlayer kind="case" id={featured.id} title={featured.title} />
                  </div>
                )}
                {featured.attachment_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={featured.attachment_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-1" /> {featured.attachment_name || "Descargar PDF"}
                    </a>
                  </Button>
                )}
              </article>

              {previous.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previous.map((c) => (
                    <Link
                      key={c.id}
                      to="/sala-pro"
                      hash={c.id}
                      className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
                    >
                      <p className="text-xs uppercase tracking-wide text-primary mb-1">{monthLabel(c.month, c.year)}</p>
                      <p className="font-medium mb-1">{c.title}</p>
                      {c.metrics[0] && (
                        <p className="text-xs text-muted-foreground">
                          {c.metrics[0].label}: {c.metrics[0].before} → {c.metrics[0].after}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
