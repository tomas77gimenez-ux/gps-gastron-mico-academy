import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, MessageCircle, Users, Megaphone, Palette, BookOpen, Calculator, LineChart } from "lucide-react";
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
  {
    id: "gps-marketing",
    area: "Área 1",
    title: "GPS Marketing",
    titleEn: "GPS Marketing",
    description: "Branding, redes sociales y herramientas con IA. Agendá una reunión para que nuestra agencia conozca tu negocio y diseñe una estrategia a tu medida.",
    descEn: "Branding, social media and AI tools. Schedule a meeting so our agency can learn about your business and design a tailored strategy.",
    icon: Megaphone,
    priceId: null,
    whatsappMessage: "Hola, tengo interés en GPS Marketing (branding, redes sociales y herramientas con IA). Me gustaría agendar una reunión para hablar con su agencia de marketing sobre mi negocio. ¡Gracias!",
  },
  {
    id: "esfera-digital",
    area: "Área 2",
    title: "Esfera Digital",
    titleEn: "Digital Sphere",
    description: "Entendé los números de tu Instagram y tomá decisiones claras para hacer crecer tu cuenta de forma orgánica, sin depender solo del alcance pagado.",
    descEn: "Understand your Instagram numbers and make clear decisions to grow your account organically, without relying only on paid reach.",
    icon: LineChart,
    priceId: "esfera_digital_mensual",
    priceLabel: "$119/mes",
  },
  {
    id: "rebranding",
    area: "Área 3",
    title: "Rebranding",
    titleEn: "Rebranding",
    description: "Renová la imagen de tu restaurante con menú nuevo, website con pedidos online, logotipo, manual de marca y aplicaciones en todos tus materiales.",
    descEn: "Renew your restaurant's image with a new menu, website with online ordering, logo, brand manual and applications across all your materials.",
    icon: Palette,
    priceId: "rebranding_restaurante_base",
    priceLabel: "$1.800",
  },
  {
    id: "gerente-digital",
    area: "Área 4",
    title: "Gerente Digital",
    titleEn: "Digital Manager",
    description: "Conjunto de herramientas para que implementes en tu operación y mejores tu performance. Acompaña 1 reunión de implementación de herramienta en Google Meet.",
    descEn: "Set of tools for you to implement in your operation and improve performance. Includes 1 tool implementation meeting on Google Meet.",
    icon: Calculator,
    priceId: "gerente_digital_base",
    priceLabel: "$320",
  },
  {
    id: "libro-rentabilidad",
    area: "Área 5",
    title: "Libro · El Desafío de la Rentabilidad",
    titleEn: "Book · The Profitability Challenge",
    description: "Guía fundamental del emprendedor gastronómico. 37 años de experiencia resumidos por Daniel Giménez.",
    descEn: "Essential guide for the gastronomic entrepreneur. 37 years of experience by Daniel Giménez.",
    icon: BookOpen,
    priceId: "libro_desafio_rentabilidad_base",
    priceLabel: "$28",
  },
  {
    id: "club-elite-plus",
    area: "Área 6",
    title: "Club Elite Plus",
    titleEn: "Elite Plus Club",
    description: "Consultoría con Daniel Giménez y todo su equipo de consultores. Duración de 60 a 90 días.",
    descEn: "Consulting with Daniel Giménez and his entire team of consultants. Duration of 60 to 90 days.",
    icon: Users,
    priceId: null,
    whatsappMessage: "Hola, tengo interés en el Club Elite Plus. Me gustaría conocer más sobre la consultoría con Daniel Giménez y su equipo, duración de 60 a 90 días, valores y disponibilidad. ¡Gracias!",
  },
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
            <ShoppingCart className="w-3.5 h-3.5" /> TIENDA · 6 ÁREAS
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
