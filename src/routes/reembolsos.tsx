import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reembolsos")({
  component: ReembolsosPage,
  head: () => ({
    meta: [
      { title: "Política de Reembolsos y Cancelación — GPS Gastronômico" },
      {
        name: "description",
        content:
          "Cómo funcionan la prueba gratuita de 5 días, la cancelación de la suscripción y los reembolsos en GPS Gastronômico.",
      },
      { property: "og:title", content: "Política de Reembolsos y Cancelación — GPS Gastronômico" },
      {
        property: "og:description",
        content: "Prueba gratuita, cancelación y reembolsos de las suscripciones de GPS Gastronômico.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/reembolsos" },
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/reembolsos" }],
  }),
});

function ReembolsosPage() {
  const { t, lang } = useI18n();
  const es = lang === "es";

  const sections: { title: string; body: string[] }[] = es
    ? [
        {
          title: "1. Prueba gratuita de 5 días",
          body: [
            "Todas las suscripciones (Básico y Premium) incluyen 5 días de prueba sin cargo. Durante ese período tenés acceso completo al plan elegido y no se realiza ningún cobro.",
            "Si cancelás antes de que finalice la prueba, no se cobra nada. El primer cobro se realiza automáticamente al terminar los 5 días.",
          ],
        },
        {
          title: "2. Renovación automática",
          body: [
            "Las suscripciones se renuevan automáticamente al final de cada período (mensual o anual) con el mismo medio de pago, hasta que las canceles.",
            "Antes de cada renovación anual y al finalizar la prueba te enviamos un aviso por correo electrónico.",
          ],
        },
        {
          title: "3. Cómo cancelar",
          body: [
            "Podés cancelar en cualquier momento, sin llamadas ni trámites: entrá en Mi cuenta → Gestionar suscripción y cancelá desde el portal de facturación.",
            "La cancelación detiene los cobros futuros y mantenés el acceso hasta el final del período ya pagado.",
          ],
        },
        {
          title: "4. Reembolsos",
          body: [
            "Ofrecemos reembolso total dentro de los 7 días posteriores al primer cobro de una suscripción, si no estás conforme con la plataforma.",
            "Las renovaciones posteriores (mensuales o anuales) no son reembolsables, pero podés cancelar para evitar el siguiente cobro.",
            "Los productos y servicios de la Tienda (consultorías, rebranding, libro y programas) tienen condiciones propias, informadas antes de la compra, y no están cubiertos por esta política de 7 días una vez iniciada la ejecución del servicio.",
          ],
        },
        {
          title: "5. Cómo solicitar un reembolso",
          body: [
            "Escribinos a hola@gpsgastronomico.com desde el correo de tu cuenta, indicando el motivo. Respondemos en un plazo máximo de 3 días hábiles.",
            "Los reembolsos aprobados se devuelven al medio de pago original y pueden tardar entre 5 y 10 días hábiles en acreditarse, según tu banco.",
          ],
        },
        {
          title: "6. Excepciones",
          body: [
            "No se otorgan reembolsos en casos de uso indebido de la plataforma, compartición de credenciales o redistribución del contenido, según los Términos y Condiciones.",
          ],
        },
        {
          title: "7. Contacto",
          body: ["hola@gpsgastronomico.com"],
        },
      ]
    : [
        {
          title: "1. 5-day free trial",
          body: [
            "Every subscription (Básico and Premium) includes a 5-day free trial with full access to the selected plan. No charge is made during the trial.",
            "If you cancel before the trial ends, you are not charged. The first payment is taken automatically once the 5 days are over.",
          ],
        },
        {
          title: "2. Automatic renewal",
          body: [
            "Subscriptions renew automatically at the end of each period (monthly or yearly) using the same payment method, until you cancel.",
            "We email you a reminder before the trial ends and before each yearly renewal.",
          ],
        },
        {
          title: "3. How to cancel",
          body: [
            "You can cancel anytime from My account → Manage subscription, in the billing portal. No calls or forms needed.",
            "Cancelling stops future charges and you keep access until the end of the period already paid.",
          ],
        },
        {
          title: "4. Refunds",
          body: [
            "We offer a full refund within 7 days of the first subscription charge if the platform is not a fit for you.",
            "Later renewals (monthly or yearly) are not refundable, but you can cancel to avoid the next charge.",
            "Store products and services (consulting, rebranding, book and programs) have their own conditions, disclosed before purchase, and are not covered by this 7-day policy once the service has started.",
          ],
        },
        {
          title: "5. How to request a refund",
          body: [
            "Email hola@gpsgastronomico.com from your account address, stating the reason. We reply within 3 business days.",
            "Approved refunds go back to the original payment method and may take 5-10 business days to appear, depending on your bank.",
          ],
        },
        {
          title: "6. Exceptions",
          body: [
            "No refunds are granted in cases of platform misuse, credential sharing or content redistribution, as stated in the Terms & Conditions.",
          ],
        },
        {
          title: "7. Contact",
          body: ["hola@gpsgastronomico.com"],
        },
      ];

  return (
    <div className="min-h-screen pt-28 pb-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-invert prose-headings:font-display">
        <h1 className="text-4xl font-bold font-display mb-2">{t("legal.reembolsos.title")}</h1>
        <p className="text-sm text-muted-foreground mb-10">{t("legal.actualizado")}: 2026</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-semibold text-foreground mb-2">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          ))}
        </section>
      </article>
    </div>
  );
}