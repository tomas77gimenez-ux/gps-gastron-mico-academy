import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ChefHat, TrendingUp, Users, Award, Play, ArrowRight,
  Star, Quote, BarChart3, Lightbulb,
  LineChart, GraduationCap, Target,
  Check, Crown, type LucideIcon,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import { DreMockupPreview } from "@/components/DreMockupPreview";
import { GlassCard } from "@/components/visual/GlassCard";
import { GoldButton } from "@/components/visual/GoldButton";
import { SectionHeading } from "@/components/visual/SectionHeading";
import { CountUpNumber } from "@/components/visual/CountUpNumber";
import { RevealOnScroll } from "@/components/visual/RevealOnScroll";
import danielAsset from "@/assets/daniel-gimenez.jpg.asset.json";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "GPS Gastronômico — Gestión · Procesos · Sustentabilidad" },
      { name: "description", content: "Plataforma de formación para profesionales gastronómicos. Cursos, herramientas y mentoría para transformar tu restaurante." },
      { property: "og:title", content: "GPS Gastronômico" },
      { property: "og:description", content: "Plataforma de formación para profesionales gastronómicos." },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "GPS Gastronômico" },
      { name: "twitter:description", content: "Plataforma de formación para profesionales gastronómicos." },
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            ["¿Qué incluye la membresía?", "Acceso a todos los cursos, dashboard financiero (DRE) en tiempo real, herramientas de gestión, comunidad privada y mentorías en vivo según tu plan."],
            ["¿Cuáles son los planes disponibles?", "Tenemos un plan mensual y un plan anual con descuento. Puedes ver el detalle completo y comparativa en la sección de Planes."],
            ["¿Puedo cancelar cuando quiera?", "Sí. Puedes cancelar tu suscripción en cualquier momento desde tu perfil, sin penalizaciones ni preguntas."],
            ["¿Los cursos otorgan certificado?", "Sí. Al completar cada curso recibes un certificado digital firmado por Daniel Gimenez que puedes compartir en LinkedIn y CVs."],
            ["¿Cómo funciona la mentoría?", "Las mentorías son sesiones grupales en vivo (y opcionalmente 1:1 en planes premium) donde revisamos tu DRE, tus desafíos operativos y diseñamos un plan de acción concreto."],
            ["¿Necesito conocimientos previos de gestión?", "No. La metodología está pensada para todos los niveles, desde dueños sin formación financiera hasta chefs ejecutivos y gerentes de cadenas."],
            ["¿En cuánto tiempo veo resultados?", "La mayoría de nuestros mentorados ven mejoras concretas en margen y food cost en los primeros 60-90 días aplicando el método."],
          ].map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
    ],
  }),
});

const testimonials = [
  { name: "María González", role: "Dueña — La Cocina de María", text: "Gracias a GPS Gastronômico, logré reducir mi food cost un 8% en solo 3 meses. El dashboard financiero cambió mi forma de ver el negocio.", textEn: "Thanks to GPS Gastronômico, I managed to reduce my food cost by 8% in just 3 months. The financial dashboard changed the way I see business.", stars: 5 },
  { name: "Carlos Mendoza", role: "Chef Ejecutivo — Bistró Central", text: "La mentoría de Daniel es práctica y directa. No es teoría, es experiencia real de alguien que vivió la cocina.", textEn: "Daniel's mentorship is practical and direct. It's not theory, it's real experience from someone who lived the kitchen.", stars: 5 },
  { name: "Ana Ramírez", role: "Gerente — Grupo Gastro MX", text: "Implementamos los procesos de GPS en 4 restaurantes. La estandarización nos ahorró miles de dólares al mes.", textEn: "We implemented GPS processes in 4 restaurants. Standardization saved us thousands of dollars per month.", stars: 5 },
];

/** Horizontal timeline whose gold progress line draws as the section scrolls. */
function MethodTimeline({ steps }: { steps: { icon: LucideIcon; title: string; desc: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight * 0.55;
      const p = (window.innerHeight * 0.85 - r.top) / total;
      setProgress(Math.min(Math.max(p, 0), 1));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Rail */}
      <div aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-border lg:block">
        <div
          className="h-px origin-left bg-gradient-to-r from-primary to-primary-soft transition-[transform] duration-150 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => {
          const active = progress >= (i + 0.35) / steps.length;
          return (
            <div key={step.title} className="relative pt-0 lg:pt-16">
              <span
                aria-hidden="true"
                className={`absolute left-0 top-[22px] hidden h-2.5 w-2.5 rounded-full transition-colors duration-300 lg:block ${
                  active ? "bg-primary shadow-[0_0_0_4px_rgba(212,160,23,0.16)]" : "bg-muted"
                }`}
              />
              <div className="flex items-center gap-3">
                <span
                  className={`font-display text-4xl font-bold tabular transition-colors duration-300 ${
                    active ? "text-primary" : "text-transparent"
                  }`}
                  style={{ WebkitTextStroke: active ? "0" : "1px rgba(255,255,255,0.14)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <step.icon
                  className={`h-5 w-5 transition-colors duration-300 ${active ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={1.25}
                />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomePage() {
  const { t, lang } = useI18n();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const basicMonthly = 89;
  const premiumMonthly = 128;
  const basicYearly = 908;
  const premiumYearly = 1306;
  const paidPeriod = billing === "monthly" ? t("home.plans.perMonth") : t("home.plans.perYear");

  const stats = [
    { value: 35, suffix: "+", label: t("home.stat.experiencia") },
    { value: 200, suffix: "+", label: t("home.stat.restaurantes") },
    { value: 50, suffix: "+", label: t("home.stat.cursos") },
    { value: 95, suffix: "%", label: t("home.stat.satisfaccion") },
  ];

  const methodSteps = [
    { icon: BarChart3, title: t("home.step.diagnostico"), desc: t("home.step.diagnosticoDesc") },
    { icon: Lightbulb, title: t("home.step.estrategia"), desc: t("home.step.estrategiaDesc") },
    { icon: TrendingUp, title: t("home.step.implementacion"), desc: t("home.step.implementacionDesc") },
    { icon: Award, title: t("home.step.resultados"), desc: t("home.step.resultadosDesc") },
  ];

  const bento = [
    { icon: LineChart, title: t("home.howItWorks.b1Title"), desc: t("home.howItWorks.b1Desc"), wide: true },
    { icon: GraduationCap, title: t("home.howItWorks.b2Title"), desc: t("home.howItWorks.b2Desc"), wide: false },
    { icon: Target, title: t("home.howItWorks.b3Title"), desc: t("home.howItWorks.b3Desc"), wide: false },
    { icon: Users, title: t("home.howItWorks.b4Title"), desc: t("home.howItWorks.b4Desc"), wide: true },
  ];

  const plans = [
    {
      id: "basico",
      icon: Star,
      name: t("home.plans.basicName"),
      amount: billing === "monthly" ? basicMonthly : basicYearly,
      desc: t("home.plans.basicDesc"),
      features: [t("home.plans.basicF1"), t("home.plans.basicF2"), t("home.plans.basicF3"), t("home.plans.basicF4")],
      featured: false,
    },
    {
      id: "premium",
      icon: Crown,
      name: t("home.plans.premiumName"),
      amount: billing === "monthly" ? premiumMonthly : premiumYearly,
      desc: t("home.plans.premiumDesc"),
      features: [t("home.plans.premiumF1"), t("home.plans.premiumF2"), t("home.plans.premiumF3"), t("home.plans.premiumF4")],
      featured: true,
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden pt-28 pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-lines" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-70 blur-[120px]"
          style={{ background: "radial-gradient(closest-side, rgba(212,160,23,0.14), transparent)" }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium tracking-wide text-primary-soft">
              <ChefHat className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t("home.badge")}
            </span>
            <h1 className="mt-7 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-[3.9rem]">
              {t("home.heroTitle1")}
              <span className="text-gradient-brand">{t("home.heroTitle2")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t("home.heroDesc")}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/cursos">
                <GoldButton size="lg">
                  <Play className="h-4 w-4" strokeWidth={1.75} /> {t("home.explorarCursos")}
                </GoldButton>
              </Link>
              <Link to="/dashboard">
                <GoldButton size="lg" variant="ghost">
                  <BarChart3 className="h-4 w-4" strokeWidth={1.5} /> {t("home.diagnosticar")}
                </GoldButton>
              </Link>
            </div>
          </div>

          {/* Tilted DRE mockup */}
          <div className="group relative [perspective:1400px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-80 blur-[80px]"
              style={{ background: "radial-gradient(closest-side, rgba(212,160,23,0.20), transparent)" }}
            />
            <div className="relative overflow-hidden rounded-2xl glass glow-gold-soft transition-transform duration-700 ease-out [transform:rotateY(-9deg)_rotateX(4deg)_translateZ(0)] group-hover:[transform:rotateY(0deg)_rotateX(0deg)]">
              <DreMockupPreview />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 divide-border sm:divide-x lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-2 py-10 text-center sm:px-6">
                <p className="font-display text-4xl font-bold sm:text-5xl">
                  <CountUpNumber value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CÓMO FUNCIONA (bento) ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              align="left"
              eyebrow={t("home.howItWorks.badge")}
              title={
                <>
                  {t("home.howItWorks.title1")}
                  <span className="text-gradient-brand">{t("home.howItWorks.title2")}</span>
                </>
              }
              desc={t("home.howItWorks.desc")}
            />
          </RevealOnScroll>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {bento.map((b, i) => (
              <RevealOnScroll
                key={b.title}
                delay={i * 70}
                className={b.wide ? "md:col-span-2" : "md:col-span-1"}
              >
                <GlassCard glowFollow className="h-full p-7 hover:scale-[1.01]">
                  <b.icon className="h-6 w-6 text-primary" strokeWidth={1.25} />
                  <h3 className="mt-5 font-display text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                  {i === 0 && (
                    <div aria-hidden="true" className="mt-8 flex h-20 items-end gap-2">
                      {[38, 62, 46, 78, 58, 88, 70, 96].map((h, bi) => (
                        <span
                          key={bi}
                          className="flex-1 rounded-t-[3px] bg-gradient-to-t from-primary/10 via-primary/30 to-primary/70 transition-[height] duration-500 ease-out"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  )}
                </GlassCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- DANIEL ---------------- */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <RevealOnScroll>
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-70 blur-[70px]"
                style={{ background: "radial-gradient(closest-side, rgba(212,160,23,0.18), transparent)" }}
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl glass p-1.5">
                <img
                  src={danielAsset.url}
                  alt="Daniel Gimenez — GPS Gastronômico"
                  className="h-full w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              {t("home.conoce")}<span className="text-gradient-brand">Daniel Gimenez</span>
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
              <p>{t("home.aboutP1")}</p>
              <p>{t("home.aboutP2")}</p>
              <p>{t("home.aboutP3")}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {["Food Cost", "DRE", "KPIs", lang === "es" ? "Liderazgo" : "Leadership", lang === "es" ? "Escalabilidad" : "Scalability"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full glass px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ---------------- MÉTODO ---------------- */}
      <section className="border-y border-border bg-surface/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t("home.metodo")}
              title={<span className="text-gradient-brand">{t("home.metodoWord")}</span>}
              desc={t("home.metodoDesc")}
              className="mb-16"
            />
          </RevealOnScroll>
          <MethodTimeline steps={methodSteps} />
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              title={
                <>
                  {t("home.testimonios")}<span className="text-gradient-brand">{t("home.testimoniosWord")}</span>
                </>
              }
              className="mb-14"
            />
          </RevealOnScroll>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((te, i) => (
              <RevealOnScroll key={te.name} delay={i * 70}>
                <GlassCard tilt className="h-full p-7">
                  <Quote className="h-8 w-8 text-primary/40" strokeWidth={1.25} />
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {lang === "en" ? te.textEn : te.text}
                  </p>
                  <div className="mt-6 flex items-center gap-1">
                    {Array.from({ length: te.stars }).map((_, si) => (
                      <Star key={si} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-semibold text-primary ring-1 ring-primary/40">
                      {te.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{te.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{te.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section className="border-y border-border bg-surface/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t("home.plans.badge")}
              title={
                <>
                  {t("home.plans.title1")}<span className="text-gradient-brand">{t("home.plans.title2")}</span>
                </>
              }
              desc={t("home.plans.desc")}
            />
            <div className="mt-9 flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-full glass p-1">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                    billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("home.plans.billingMonthly")}
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                    billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("home.plans.billingYearly")}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      billing === "yearly" ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                    }`}
                  >
                    −15%
                  </span>
                </button>
              </div>
            </div>
          </RevealOnScroll>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            {plans.map((plan, i) => (
              <RevealOnScroll key={plan.id} delay={i * 70} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-2xl p-7 transition-all duration-300 ease-out hover:-translate-y-1 ${
                    plan.featured
                      ? "gradient-border-gold glow-gold md:scale-[1.03]"
                      : "glass hover:border-border-strong"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                      {t("home.plans.popular")}
                    </span>
                  )}
                  <plan.icon className="h-6 w-6 text-primary" strokeWidth={1.25} />
                  <h3 className="mt-5 font-display text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{plan.desc}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold tabular">
                      $<CountUpNumber key={`${plan.id}-${plan.amount}`} value={plan.amount} duration={500} />
                    </span>
                    <span className="text-sm text-muted-foreground">{paidPeriod}</span>
                  </div>
                  <ul className="mt-6 mb-7 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/planes" className="mt-auto">
                    <GoldButton
                      variant={plan.featured ? "gold" : "ghost"}
                      className="w-full"
                    >
                      {t("home.plans.ctaPaid")}
                    </GoldButton>
                  </Link>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/planes">
              <GoldButton variant="ghost" size="lg">
                {t("home.plans.viewAll")} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </GoldButton>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- CTA FINAL ---------------- */}
      <section className="relative overflow-hidden py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 blur-[110px]"
          style={{ background: "radial-gradient(closest-side, rgba(212,160,23,0.16), transparent)" }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <RevealOnScroll>
            <h2 className="font-display text-3xl font-bold leading-[1.1] sm:text-5xl">{t("home.ctaTitle")}</h2>
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-muted-foreground">{t("home.ctaDesc")}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/dashboard">
                <GoldButton size="lg">
                  <BarChart3 className="h-4 w-4" strokeWidth={1.5} /> {t("home.hacerDiag")}
                </GoldButton>
              </Link>
              <Link to="/asistente">
                <GoldButton size="lg" variant="ghost">
                  {t("home.hablarAsistente")} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </GoldButton>
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t("home.faq.badge")}
              title={
                <>
                  {t("home.faq.title1")}<span className="text-gradient-brand">{t("home.faq.title2")}</span>
                </>
              }
              desc={t("home.faq.desc")}
              className="mb-12"
            />
          </RevealOnScroll>

          <Accordion type="single" collapsible className="divide-y divide-border border-y border-border">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-0">
                <AccordionTrigger className="py-5 text-left font-display font-semibold transition-colors hover:text-primary hover:no-underline">
                  {t(`home.faq.q${i}` as never)}
                </AccordionTrigger>
                <AccordionContent className="pb-6 leading-relaxed text-muted-foreground">
                  {t(`home.faq.a${i}` as never)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
