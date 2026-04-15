import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChefHat, TrendingUp, Users, Award, Play, ArrowRight,
  Star, Quote, Utensils, BarChart3, BookOpen, Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "GPS Gastronômico — Gestión · Procesos · Sustentabilidad" },
      { name: "description", content: "Plataforma de formación para profesionales gastronómicos. Cursos, herramientas y mentoría para transformar tu restaurante." },
      { property: "og:title", content: "GPS Gastronômico" },
      { property: "og:description", content: "Plataforma de formación para profesionales gastronómicos." },
    ],
  }),
});

const stats = [
  { value: "15+", label: "Años de experiencia", icon: Award },
  { value: "200+", label: "Restaurantes asesorados", icon: Utensils },
  { value: "50+", label: "Cursos y talleres", icon: BookOpen },
  { value: "95%", label: "Satisfacción de clientes", icon: Star },
];

const methodSteps = [
  { icon: BarChart3, title: "Diagnóstico", desc: "Analizamos los números reales de tu operación con nuestro DRE interactivo." },
  { icon: Lightbulb, title: "Estrategia", desc: "Diseñamos un plan de acción basado en datos, no en suposiciones." },
  { icon: TrendingUp, title: "Implementación", desc: "Te acompañamos paso a paso con herramientas y mentoría directa." },
  { icon: Award, title: "Resultados", desc: "Medimos el impacto y ajustamos para crecimiento sostenible." },
];

const testimonials = [
  { name: "María González", role: "Dueña — La Cocina de María", text: "Gracias a GPS Gastronômico, logré reducir mi food cost un 8% en solo 3 meses. El dashboard financiero cambió mi forma de ver el negocio.", stars: 5 },
  { name: "Carlos Mendoza", role: "Chef Ejecutivo — Bistró Central", text: "La mentoría de Daniel es práctica y directa. No es teoría, es experiencia real de alguien que vivió la cocina.", stars: 5 },
  { name: "Ana Ramírez", role: "Gerente — Grupo Gastro MX", text: "Implementamos los procesos de GPS en 4 restaurantes. La estandarización nos ahorró miles de dólares al mes.", stars: 5 },
];

function HomePage() {
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
              Gestión · Procesos · Sustentabilidad
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight">
              Transforma tu restaurante con{" "}
              <span className="text-gradient-brand">datos y estrategia</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Soy Daniel Gimenez, y hace más de 15 años ayudo a restaurantes a ser más rentables, organizados y sustentables. Bienvenido a tu plataforma de crecimiento gastronómico.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/cursos">
                <Button size="lg" className="glow-orange gap-2">
                  <Play className="w-4 h-4" /> Explorar Cursos
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  <BarChart3 className="w-4 h-4" /> Diagnosticar mi Restaurante
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
                key={s.label}
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
                  <p className="text-muted-foreground text-sm">Foto de Daniel Gimenez</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-6">
                Conoce a <span className="text-gradient-brand">Daniel Gimenez</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Con más de 15 años en el sector gastronómico, Daniel ha transformado la operación de cientos de restaurantes en América Latina y España.
                </p>
                <p>
                  Su enfoque combina análisis financiero riguroso con estrategias prácticas que cualquier operador puede implementar, sin importar el tamaño de su negocio.
                </p>
                <p>
                  Fundador de GPS Gastronômico, una metodología que integra Gestión, Procesos y Sustentabilidad para crear restaurantes que prosperan a largo plazo.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {["Food Cost", "DRE", "KPIs", "Liderazgo", "Escalabilidad"].map(tag => (
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
              Nuestro <span className="text-gradient-brand">Método</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Un proceso probado en más de 200 restaurantes para llevar tu negocio al siguiente nivel.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodSteps.map((step, i) => (
              <motion.div
                key={step.title}
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
              Lo que dicen nuestros <span className="text-gradient-brand">clientes</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </motion.div>
            ))}
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
              ¿Listo para transformar tu restaurante?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Comienza hoy con un diagnóstico gratuito o explora nuestros cursos y herramientas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="glow-orange gap-2">
                  <BarChart3 className="w-4 h-4" /> Hacer Diagnóstico
                </Button>
              </Link>
              <Link to="/asistente">
                <Button size="lg" variant="outline" className="gap-2">
                  Hablar con el Asistente IA <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
