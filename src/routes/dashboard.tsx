import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Radio, Wrench, Route as RouteIcon, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useProAccess } from "@/hooks/useProAccess";
import {
  TOOL_STATUS_LABEL,
  useDreMetrics,
  useMemberProgress,
  useToolsStatus,
  type RouteCourse,
  type ToolStatusKind,
} from "@/hooks/useMemberDashboard";
import { MetricsStrip, EmptyDreBlock } from "@/components/dashboard/MetricsStrip";
import { ProximoEnVivoCard } from "@/components/dashboard/ProximoEnVivoCard";
import { NovedadesSection } from "@/components/dashboard/NovedadesSection";
import { money } from "@/lib/tools-format";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Mi tablero — GPS Gastronômico" },
      { name: "description", content: "Tu tablero de operación: resultado del mes, avance de la mentoría y estado de tus herramientas." },
      { property: "og:title", content: "Mi tablero — GPS Gastronômico" },
      { property: "og:description", content: "Resultado del mes, avance de la mentoría y estado de tus herramientas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function DashboardPage() {
  const { user } = useAuthSession();
  const dre = useDreMetrics();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const lastThree = dre.months.slice(-3);
  const selected =
    dre.months.find((m) => m.month === selectedMonth) ?? dre.months[dre.months.length - 1] ?? null;

  useEffect(() => {
    if (!selectedMonth && selected) setSelectedMonth(selected.month);
  }, [selected, selectedMonth]);

  const idx = selected ? dre.months.findIndex((m) => m.month === selected.month) : -1;
  const prev = idx > 0 ? dre.months[idx - 1] : null;
  const deltaNet = selected && prev ? selected.netPct - prev.netPct : null;

  return (
    <div className="pt-16">
      {/* -------- Encabezado de veredicto -------- */}
      <header className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {dre.loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-secondary/40" />
        ) : selected ? (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">Tu tablero</p>
              <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-4xl">
                En {selected.label} te quedó{" "}
                <span className="text-primary">{selected.netPct.toFixed(1).replace(".", ",")}%</span> de ganancia limpia
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Vendiste {money(selected.sales)} en el mes.{" "}
                {deltaNet === null ? (
                  <>Es el primer mes que cargás, así que todavía no hay con qué comparar.</>
                ) : Math.abs(deltaNet) < 0.05 ? (
                  <>Quedaste igual que en {prev!.label}.</>
                ) : deltaNet > 0 ? (
                  <>
                    Mejoraste {Math.abs(deltaNet).toFixed(1).replace(".", ",")} puntos contra {prev!.label}.
                  </>
                ) : (
                  <>
                    Bajaste {Math.abs(deltaNet).toFixed(1).replace(".", ",")} puntos contra {prev!.label}.
                  </>
                )}
              </p>
            </div>
            {lastThree.length > 1 && (
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                Mes
                <select
                  value={selected.month}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {[...lastThree].reverse().map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.labelLong}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        ) : (
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">Tu tablero</p>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Empecemos por saber dónde estás</h1>
          </div>
        )}
      </header>

      {/* -------- Indicadores -------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        {dre.loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-secondary/30" />
        ) : selected ? (
          <MetricsStrip months={dre.months} selected={selected} />
        ) : (
          <EmptyDreBlock />
        )}
      </section>

      {/* -------- Dos columnas -------- */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-12">
          <ResumeBlock />
          <RouteBlock />
          <ToolsBlock />
        </div>
        <div className="space-y-10">
          <LiveColumn />
          <div className="[&>section]:border-0 [&>section]:bg-transparent [&>section]:py-0 [&_.max-w-7xl]:px-0 [&_.grid]:grid-cols-1">
            <NovedadesSection />
          </div>
        </div>
      </div>
      {user ? null : null}
    </div>
  );
}

/* ---------------- Donde quedaste ---------------- */

function ResumeBlock() {
  const { loading, resume } = useMemberProgress();

  if (loading) return <div className="h-32 animate-pulse rounded-xl bg-secondary/30" />;

  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <PlayCircle className="h-4 w-4 text-primary" strokeWidth={1.5} /> Donde quedaste
      </h2>
      {resume ? (
        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center">
          <div className="h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-secondary">
            {resume.coverUrl ? (
              <img src={resume.coverUrl} alt={resume.lessonTitle} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Play className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{resume.courseTitle}</p>
            <p className="mt-1 font-display text-base font-semibold">{resume.lessonTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {resume.minutesLeft !== null ? `Te quedan ${resume.minutesLeft} min de la clase · ` : ""}
              {resume.modulePct}% del módulo completado
            </p>
          </div>
          <Link
            to="/cursos/$id"
            params={{ id: resume.courseId }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Play className="h-4 w-4" strokeWidth={2} /> Seguir viendo
          </Link>
        </div>
      ) : (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Todavía no empezaste ninguna clase. Arrancá por el primer módulo de la mentoría.
          </p>
          <Link
            to="/cursos"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Empezar el primer módulo
          </Link>
        </div>
      )}
    </section>
  );
}

/* ---------------- Tu ruta ---------------- */

function RouteBlock() {
  const { loading, route } = useMemberProgress();
  const [active, setActive] = useState<string | null>(null);

  if (loading) return <div className="h-24 animate-pulse rounded-xl bg-secondary/30" />;
  if (route.length === 0) return null;

  const current = route.find((c) => c.id === active) ?? route.find((c) => c.state === "active") ?? route[0];

  const barClass = (c: RouteCourse) =>
    c.state === "done" ? "bg-primary/40" : c.state === "active" ? "bg-primary" : "bg-muted";

  const stateWord = (c: RouteCourse) =>
    c.state === "done" ? "Completado" : c.state === "active" ? "En curso" : "Pendiente";

  const cta = (c: RouteCourse) => (c.state === "done" ? "Repasar" : c.state === "active" ? "Continuar" : "Empezar");

  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <RouteIcon className="h-4 w-4 text-primary" strokeWidth={1.5} /> Tu ruta
      </h2>
      <div className="mt-4 flex gap-1.5 border-t border-border pt-4">
        {route.map((c) => (
          <button
            key={c.id}
            onMouseEnter={() => setActive(c.id)}
            onFocus={() => setActive(c.id)}
            onClick={() => setActive(c.id)}
            aria-label={c.title}
            className="group flex-1 py-2"
          >
            <span
              className={`block h-1.5 w-full rounded-full transition-all ${barClass(c)} ${
                current.id === c.id ? "h-2.5" : "group-hover:h-2.5"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base font-semibold">{current.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {current.lessonCount} {current.lessonCount === 1 ? "clase" : "clases"} · {stateWord(current)}
            {current.state === "active" ? ` · ${current.completedCount} de ${current.lessonCount} vistas` : ""}
          </p>
        </div>
        <Link
          to="/cursos/$id"
          params={{ id: current.id }}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {cta(current)}
        </Link>
      </div>
    </section>
  );
}

/* ---------------- Tus herramientas ---------------- */

const PILL_CLASS: Record<ToolStatusKind, string> = {
  ok: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  late: "bg-destructive/15 text-destructive",
  unused: "bg-secondary text-muted-foreground",
};

function ToolsBlock() {
  const { loading, rows } = useToolsStatus();

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-secondary/30" />;

  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Wrench className="h-4 w-4 text-primary" strokeWidth={1.5} /> Tus herramientas
      </h2>
      <div className="mt-4 border-t border-border">
        {rows.map((r) => (
          <div key={r.key} className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{r.name}</p>
                <span className={`inline-flex rounded-md px-2 py-0.5 text-[0.7rem] font-semibold ${PILL_CLASS[r.status]}`}>
                  {TOOL_STATUS_LABEL[r.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>
            </div>
            <Link
              to={r.to}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Abrir
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Próximo en vivo ---------------- */

function LiveColumn() {
  const pro = useProAccess();

  if (pro.loading) return <div className="h-32 animate-pulse rounded-xl bg-secondary/30" />;

  if (!pro.hasPro) {
    return (
      <section className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
          <Radio className="h-3.5 w-3.5" strokeWidth={1.5} /> Próximo en vivo
        </span>
        <h2 className="mt-3 font-display text-xl font-bold">Las clases en vivo son de Academy Pro</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sumá Academy Pro y entrá a las sesiones en vivo, las grabaciones y los casos del mes.
        </p>
        <Link
          to="/planes"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Sumar a mi plan · Academy Pro
        </Link>
      </section>
    );
  }

  return (
    <div className="[&>section]:border-0 [&>section]:py-0 [&_.max-w-7xl]:px-0">
      <ProximoEnVivoCard />
    </div>
  );
}
