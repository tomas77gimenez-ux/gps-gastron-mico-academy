import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChefHat, TrendingUp, Users, Award, Play, ArrowRight,
  Star, Quote, Utensils, BarChart3, BookOpen, Lightbulb,
  LineChart, GraduationCap, Target, Sparkles, HelpCircle,
  Check, Crown, Gift,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import platformMockup from "@/assets/platform-mockup.jpg";

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

const statIcons = [Award, Utensils, BookOpen, Star];

const testimonials = [
  { name: "María González", role: "Dueña — La Cocina de María", text: "Gracias a GPS Gastronômico, logré reducir mi food cost un 8% en solo 3 meses. El dashboard financiero cambió mi forma de ver el negocio.", textEn: "Thanks to GPS Gastronômico, I managed to reduce my food cost by 8% in just 3 months. The financial dashboard changed the way I see business.", stars: 5 },
  { name: "Carlos Mendoza", role: "Chef Ejecutivo — Bistró Central", text: "La mentoría de Daniel es práctica y directa. No es teoría, es experiencia real de alguien que vivió la cocina.", textEn: "Daniel's mentorship is practical and direct. It's not theory, it's real experience from someone who lived the kitchen.", stars: 5 },
  { name: "Ana Ramírez", role: "Gerente — Grupo Gastro MX", text: "Implementamos los procesos de GPS en 4 restaurantes. La estandarización nos ahorró miles de dólares al mes.", textEn: "We implemented GPS processes in 4 restaurants. Standardization saved us thousands of dollars per month.", stars: 5 },
];

function HomePage() {
  const { t, lang } = useI18n();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const basicMonthly = 39;
  const premiumMonthly = 79;
  const basicYearly = 397;
  const premiumYearly = 806;
  const basicPrice = billing === "monthly" ? `$${basicMonthly}` : `$${basicYearly}`;
  const premiumPrice = billing === "monthly" ? `$${premiumMonthly}` : `$${premiumYearly}`;
  const paidPeriod = billing === "monthly" ? t("home.plans.perMonth") : t("home.plans.perYear");

  const stats = [
    { value: "35+", label: t("home.stat.experiencia"), icon: Award },
    { value: "200+", label: t("home.stat.restaurantes"), icon: Utensils },
    { value: "50+", label: t("home.stat.cursos"), icon: BookOpen },
    { value: "95%", label: t("home.stat.satisfaccion"), icon: Star },
  ];

  const methodSteps = [
    { icon: BarChart3, title: t("home.step.diagnostico"), desc: t("home.step.diagnosticoDesc") },
    { icon: Lightbulb, title: t("home.step.estrategia"), desc: t("home.step.estrategiaDesc") },
    { icon: TrendingUp, title: t("home.step.implementacion"), desc: t("home.step.implementacionDesc") },
    { icon: Award, title: t("home.step.resultados"), desc: t("home.step.resultadosDesc") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <ChefHat className="w-4 h-4" />
              {t("home.badge")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight">
              {t("home.heroTitle1")}
              <span className="text-gradient-brand">{t("home.heroTitle2")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              {t("home.heroDesc")}
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/cursos">
                <Button size="lg" className="glow-orange gap-2">
                  <Play className="w-4 h-4" /> {t("home.explorarCursos")}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  <BarChart3 className="w-4 h-4" /> {t("home.diagnosticar")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold font-display">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
                <Sparkles className="w-4 h-4" />
                {t("home.howItWorks.badge")}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
                {t("home.howItWorks.title1")}
                <span className="text-gradient-brand">{t("home.howItWorks.title2")}</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("home.howItWorks.desc")}
              </p>
              <div className="space-y-5">
                {[
                  { icon: LineChart, title: t("home.howItWorks.b1Title"), desc: t("home.howItWorks.b1Desc") },
                  { icon: GraduationCap, title: t("home.howItWorks.b2Title"), desc: t("home.howItWorks.b2Desc") },
                  { icon: Target, title: t("home.howItWorks.b3Title"), desc: t("home.howItWorks.b3Desc") },
                  { icon: Users, title: t("home.howItWorks.b4Title"), desc: t("home.howItWorks.b4Desc") },
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      <b.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold font-display mb-1">{b.title}</h3>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-6 bg-primary/10 rounded-3xl blur-3xl" aria-hidden="true" />
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl">
                <img
                  src={platformMockup}
                  alt={t("home.howItWorks.imgAlt")}
                  width={1024}
                  height={768}
                  loading="lazy"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Daniel */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 via-card to-secondary overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <ChefHat className="w-20 h-20 text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-sm">{t("home.fotoDesc")}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-6">
                {t("home.conoce")}<span className="text-gradient-brand">Daniel Gimenez</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t("home.aboutP1")}</p>
                <p>{t("home.aboutP2")}</p>
                <p>{t("home.aboutP3")}</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {["Food Cost", "DRE", "KPIs", lang === "es" ? "Liderazgo" : "Leadership", lang === "es" ? "Escalabilidad" : "Scalability"].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              {t("home.metodo")}<span className="text-gradient-brand">{t("home.metodoWord")}</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              {t("home.metodoDesc")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative rounded-xl border border-border bg-card p-6 group hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="absolute top-4 right-4 text-4xl font-bold font-display text-border">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              {t("home.testimonios")}<span className="text-gradient-brand">{t("home.testimoniosWord")}</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((te, i) => (
              <motion.div
                key={te.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{lang === "en" ? te.textEn : te.text}</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: te.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-semibold text-sm">{te.name}</p>
                <p className="text-xs text-muted-foreground">{te.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
              <Sparkles className="w-4 h-4" />
              {t("home.plans.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              {t("home.plans.title1")}<span className="text-gradient-brand">{t("home.plans.title2")}</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("home.plans.desc")}</p>

            <div className="inline-flex items-center gap-1 mt-8 p-1 rounded-full border border-border bg-card">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  billing === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("home.plans.billingMonthly")}
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  billing === "yearly"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("home.plans.billingYearly")}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  billing === "yearly" ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                }`}>
                  −15%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                id: "gratis",
                icon: Gift,
                name: t("home.plans.freeName"),
                price: t("home.plans.freePrice"),
                period: "",
                desc: t("home.plans.freeDesc"),
                features: [t("home.plans.freeF1"), t("home.plans.freeF2"), t("home.plans.freeF3")],
                featured: false,
              },
              {
                id: "basico",
                icon: Star,
                name: t("home.plans.basicName"),
                price: basicPrice,
                period: paidPeriod,
                desc: t("home.plans.basicDesc"),
                features: [t("home.plans.basicF1"), t("home.plans.basicF2"), t("home.plans.basicF3"), t("home.plans.basicF4")],
                featured: false,
              },
              {
                id: "premium",
                icon: Crown,
                name: t("home.plans.premiumName"),
                price: premiumPrice,
                period: paidPeriod,
                desc: t("home.plans.premiumDesc"),
                features: [t("home.plans.premiumF1"), t("home.plans.premiumF2"), t("home.plans.premiumF3"), t("home.plans.premiumF4")],
                featured: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-7 flex flex-col ${
                  plan.featured
                    ? "border-primary bg-primary/5 shadow-[0_0_40px_oklch(0.70_0.18_45/12%)]"
                    : "border-border bg-card"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    {t("home.plans.popular")}
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <plan.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/planes">
                  <Button
                    className={`w-full rounded-xl ${
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {plan.id === "gratis" ? t("home.plans.ctaFree") : t("home.plans.ctaPaid")}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/planes">
              <Button variant="outline" size="lg" className="gap-2">
                {t("home.plans.viewAll")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-10 sm:p-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t("home.ctaDesc")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="glow-orange gap-2">
                  <BarChart3 className="w-4 h-4" /> {t("home.hacerDiag")}
                </Button>
              </Link>
              <Link to="/asistente">
                <Button size="lg" variant="outline" className="gap-2">
                  {t("home.hablarAsistente")} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
              <HelpCircle className="w-4 h-4" />
              {t("home.faq.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">
              {t("home.faq.title1")}<span className="text-gradient-brand">{t("home.faq.title2")}</span>
            </h2>
            <p className="text-muted-foreground mt-3">{t("home.faq.desc")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-xl border border-border bg-card px-5 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left font-display font-semibold hover:no-underline py-5">
                    {t(`home.faq.q${i}` as never)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {t(`home.faq.a${i}` as never)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
