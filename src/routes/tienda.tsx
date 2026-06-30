import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, MessageCircle, Users, FileSearch, Megaphone, Palette, BookOpen, GraduationCap, Calculator, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

// WhatsApp de Daniel Giménez para consultas y soporte
const WHATSAPP_NUMBER = "14709439722";

const buildWhatsappUrl = (message: string) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

type Product = {
  id: string;
  area: string;
  title: string;
  titleEn: string;
  description: string;
  descEn: string;
  icon: typeof Users;
  priceId: string | null; // null = consultar personalizado
  priceLabel?: string;    // ex: "$590"
  whatsappMessage?: string; // mensaje pre-escrito personalizado para Consultar
};

const products: Product[] = [
  { id: "club-elite-plus", area: "Área 1", title: "Club Elite Plus", titleEn: "Elite Plus Club",
    description: "Mentoría 1 a 1 con Daniel Giménez y el equipo. Programas personalizados de 30, 60 o 90 días.",
    descEn: "1-on-1 mentorship with Daniel Giménez and the team. Personalized 30, 60 or 90-day programs.",
    icon: Users, priceId: null,
    whatsappMessage: "Hola, tengo interés en hacer la mentoría 1 a 1 Club Elite Plus con Daniel Giménez. Me gustaría conocer los programas de 30, 60 y 90 días, valores y disponibilidad. ¡Gracias!" },
  { id: "auditoria-contable", area: "Área 2", title: "Auditoría Contable", titleEn: "Accounting Audit",
    description: "Diagnósticos de situación frente al IRS, tipo de corporación ideal, estrategia contable (suscriptores USA).",
    descEn: "IRS situation diagnostics, ideal corporation type, accounting strategy (US subscribers).",
    icon: FileSearch, priceId: "auditoria_contable_base", priceLabel: "$590" },
  { id: "gps-marketing", area: "Área 3", title: "GPS Marketing", titleEn: "GPS Marketing",
    description: "Agencia de marketing especializada. Redes sociales, tráfico pago y branding con ventajas exclusivas.",
    descEn: "Specialized marketing agency. Social media, paid traffic and branding with exclusive perks.",
    icon: Megaphone, priceId: null,
    whatsappMessage: "Hola, quiero saber más sobre GPS Marketing: campañas en redes sociales, tráfico pago y branding para mi restaurante. ¿Podrían enviarme propuesta y ventajas para suscriptores? ¡Gracias!" },
  { id: "diseno-grafico", area: "Área 4", title: "Diseño Gráfico", titleEn: "Graphic Design",
    description: "Diseño de menú profesional con asociados verificados. Descuentos importantes para suscriptores.",
    descEn: "Professional menu design with verified partners. Important discounts for subscribers.",
    icon: Palette, priceId: null,
    whatsappMessage: "Hola, me interesa el servicio de Diseño Gráfico para el menú de mi restaurante. ¿Podrían pasarme valores, plazos y los descuentos para suscriptores? ¡Gracias!" },
  { id: "educacion-financiera", area: "Área 5", title: "Educación Financiera", titleEn: "Financial Education",
    description: "Videos sobre educación financiera, deuda buena y mala, proyecciones. Incluye planilla Excel de flujo de caja.",
    descEn: "Videos on financial education, good and bad debt, projections. Includes cash-flow Excel sheet.",
    icon: Wallet, priceId: "educacion_financiera_base", priceLabel: "$89" },
  { id: "libro-rentabilidad", area: "Área 6", title: "Libro · El Desafío de la Rentabilidad", titleEn: "Book · The Profitability Challenge",
    description: "Guía fundamental del emprendedor gastronómico. 37 años de experiencia resumidos por Daniel Giménez.",
    descEn: "Essential guide for the gastronomic entrepreneur. 37 years of experience by Daniel Giménez.",
    icon: BookOpen, priceId: "libro_desafio_rentabilidad_base", priceLabel: "$28" },
  { id: "protocolo-meseros", area: "Área 7", title: "Protocolo del Éxito · Meseros", titleEn: "Success Protocol · Waiters",
    description: "Entrenamiento completo para meseros. Videos explicativos, protocolo paso a paso y hoja de ruta de servicio.",
    descEn: "Complete waiter training. Explainer videos, step-by-step protocol and service roadmap.",
    icon: GraduationCap, priceId: "protocolo_exito_meseros_base", priceLabel: "$190" },
  { id: "auditoria-sistemas", area: "Área 8", title: "Auditoría de Sistemas", titleEn: "Systems Audit",
    description: "Diagnóstico POS, análisis de débitos ocultos, costo-beneficio y Cash Discount (suscriptores USA).",
    descEn: "POS diagnostics, hidden-debit analysis, cost-benefit and Cash Discount (US subscribers).",
    icon: Calculator, priceId: "auditoria_sistemas_base", priceLabel: "$230" },
];

export const Route = createFileRoute("/tienda")({
  component: TiendaPage,
  head: () => ({
    meta: [
      { title: "Tienda — GPS Gastronômico" },
      { name: "description", content: "Servicios premium y productos exclusivos para profesionales gastronómicos." },
      { property: "og:title", content: "Tienda — GPS Gastronômico" },
      { property: "og:description", content: "Servicios premium y productos exclusivos para profesionales gastronómicos." },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/tienda" },
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/tienda" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Tienda GPS Gastronômico",
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: p.title,
              description: p.description,
              ...(p.priceLabel
                ? {
                    offers: {
                      "@type": "Offer",
                      price: p.priceLabel.replace(/[^0-9.]/g, ""),
                      priceCurrency: "USD",
                      availability: "https://schema.org/InStock",
                    },
                  }
                : {}),
            },
          })),
        }),
      },
    ],
  }),
});

function TiendaPage() {
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const { t, lang } = useI18n();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? undefined);
        setUserId(data.user.id);
      }
    });
  }, []);

  const handleBuy = (product: Product) => {
    if (!product.priceId) {
      const message = product.whatsappMessage
        ?? `Hola, tengo interés en el servicio "${product.title}" de la Tienda GPS Gastronómico. ¿Podrían darme más información? ¡Gracias!`;
      const url = buildWhatsappUrl(message);
      // Usar <a> con target=_blank evita el bloqueo COOP de Safari con window.open
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    setCheckoutPriceId(product.priceId);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <PaymentTestModeBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4">
            <ShoppingCart className="w-3.5 h-3.5" /> TIENDA · 8 ÁREAS
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">{t("tienda.titulo")}</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">{t("tienda.desc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-6 flex flex-col hover:border-primary/30 hover:shadow-[0_0_30px_oklch(0.70_0.18_45/8%)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <product.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                  {product.area}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{lang === "en" ? product.titleEn : product.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{lang === "en" ? product.descEn : product.description}</p>
              <div className="flex items-center justify-between gap-3">
                {product.priceId ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("tienda.desde")}</span>
                    <span className="text-xl font-bold text-primary leading-tight">{product.priceLabel}</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    {t("tienda.personalizado")}
                  </span>
                )}
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  onClick={() => handleBuy(product)}
                >
                  {product.priceId ? (
                    <><ShoppingCart className="w-4 h-4 mr-1.5" />{t("tienda.comprar")}</>
                  ) : (
                    <><MessageCircle className="w-4 h-4 mr-1.5" />{t("tienda.consultar")}</>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={!!checkoutPriceId} onOpenChange={(open) => !open && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{t("tienda.completarCompra")}</DialogTitle>
          {checkoutPriceId && (
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              customerEmail={userEmail}
              userId={userId}
              returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
