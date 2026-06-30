import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terminos")({
  component: TerminosPage,
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — GPS Gastronômico" },
      { name: "description", content: "Términos y condiciones de uso de la plataforma GPS Gastronômico." },,
      { property: "og:title", content: 'Términos y Condiciones — GPS Gastronômico' },
      { property: "og:description", content: 'Términos y condiciones de uso de GPS Gastronômico.' },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/terminos" }
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/terminos" }],
  }),
});

function TerminosPage() {
  const { t, lang } = useI18n();
  return (
    <div className="min-h-screen pt-28 pb-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-invert prose-headings:font-display">
        <h1 className="text-4xl font-bold font-display mb-2">{t("legal.terminos.title")}</h1>
        <p className="text-sm text-muted-foreground mb-10">{t("legal.actualizado")}: 2025</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. {lang === "es" ? "Aceptación" : "Acceptance"}</h2>
            <p>{lang === "es"
              ? "Al acceder y utilizar GPS Gastronômico, aceptas estos términos y condiciones en su totalidad."
              : "By accessing and using GPS Gastronômico, you accept these terms and conditions in full."}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. {lang === "es" ? "Uso del servicio" : "Use of service"}</h2>
            <p>{lang === "es"
              ? "Los contenidos, cursos y herramientas son para uso personal. No está permitida la redistribución sin autorización escrita."
              : "Content, courses and tools are for personal use. Redistribution is not allowed without written authorization."}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. {lang === "es" ? "Suscripciones y pagos" : "Subscriptions & payments"}</h2>
            <p>{lang === "es"
              ? "Las suscripciones se renuevan automáticamente. Puedes cancelar en cualquier momento desde tu perfil."
              : "Subscriptions renew automatically. You can cancel anytime from your profile."}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. {lang === "es" ? "Propiedad intelectual" : "Intellectual property"}</h2>
            <p>{lang === "es"
              ? "Todo el material disponible es propiedad de GPS Gastronômico o de sus licenciantes."
              : "All available material is property of GPS Gastronômico or its licensors."}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. {lang === "es" ? "Contacto" : "Contact"}</h2>
            <p>hola@gpsgastronomico.com</p>
          </div>
        </section>
      </article>
    </div>
  );
}