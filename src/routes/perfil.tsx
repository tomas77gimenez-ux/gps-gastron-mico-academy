import { createFileRoute, Link } from "@tanstack/react-router";
import { User, BookOpen, ShoppingBag, Award, CreditCard, Calendar, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
  head: () => ({
    meta: [
      { title: "Mi Perfil — GPS Gastronômico" },
      { name: "description", content: "Gestiona tu cuenta, cursos y compras." },
    ],
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

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold font-display mb-8">{t("perfil.titulo")}</h1>

        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Usuario Demo</h2>
              <p className="text-sm text-muted-foreground">usuario@ejemplo.com</p>
              {sub.hasActive && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                  {sub.status === "trialing" ? t("perfil.prueba") : t("perfil.activa")}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{t("perfil.miembro")}</p>
        </div>

        {/* Subscription section */}
        <section className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{t("perfil.suscripcion")}</h2>
          </div>

          {sub.loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t("perfil.cargandoSub")}</span>
            </div>
          ) : sub.hasActive ? (
            <div className="space-y-4">
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
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-medium mb-1">{t("perfil.sinSuscripcion")}</p>
              <p className="text-sm text-muted-foreground mb-4">{t("perfil.sinSuscripcionDesc")}</p>
              <Button asChild>
                <Link to="/planes">{t("perfil.verPlanes")}</Link>
              </Button>
            </div>
          )}
        </section>

        <div className="grid gap-6">
          {[
            { icon: BookOpen, title: t("perfil.misCursos"), desc: t("perfil.cursosDesc") },
            { icon: ShoppingBag, title: t("perfil.misCompras"), desc: t("perfil.comprasDesc") },
            { icon: Award, title: t("perfil.certificados"), desc: t("perfil.certificadosDesc") },
          ].map((section) => (
            <div key={section.title} className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
