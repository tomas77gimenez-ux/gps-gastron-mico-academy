import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacidad")({
  component: PrivacidadPage,
  head: () => ({
    meta: [
      { title: "Política de Privacidad — GPS Gastronômico" },
      { name: "description", content: "Política de privacidad y tratamiento de datos en GPS Gastronômico." },,
      { property: "og:title", content: 'Política de Privacidad — GPS Gastronômico' },
      { property: "og:description", content: 'Política de privacidad y tratamiento de datos personales.' },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/privacidad" }
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/privacidad" }],
  }),
});

function PrivacidadPage() {
  const { t, lang } = useI18n();
  return (
    <div className="min-h-screen pt-28 pb-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold font-display mb-2">{t("legal.privacidad.title")}</h1>
        <p className="text-sm text-muted-foreground mb-10">{t("legal.actualizado")}: 2025</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. {lang === "es" ? "Datos que recopilamos" : "Data we collect"}</h2>
            <p>{lang === "es"
              ? "Recopilamos los datos que nos proporcionas al registrarte (nombre, email) y datos de uso de la plataforma para mejorar la experiencia."
              : "We collect data you provide on signup (name, email) and platform usage data to improve the experience."}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. {lang === "es" ? "Uso de los datos" : "Use of data"}</h2>
            <p>{lang === "es"
              ? "Tus datos se utilizan para gestionar tu cuenta, procesar pagos y enviar comunicaciones relevantes. Nunca vendemos tus datos."
              : "Your data is used to manage your account, process payments and send relevant communications. We never sell your data."}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. {lang === "es" ? "Tus derechos" : "Your rights"}</h2>
            <p>{lang === "es"
              ? "Puedes acceder, modificar o eliminar tus datos en cualquier momento escribiendo a hola@gpsgastronomico.com."
              : "You can access, modify or delete your data anytime by writing to hola@gpsgastronomico.com."}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. {lang === "es" ? "Cookies" : "Cookies"}</h2>
            <p>{lang === "es"
              ? "Utilizamos cookies técnicas necesarias para el funcionamiento del sitio y cookies analíticas con tu consentimiento."
              : "We use necessary technical cookies and analytical cookies with your consent."}</p>
          </div>
        </section>
      </article>
    </div>
  );
}