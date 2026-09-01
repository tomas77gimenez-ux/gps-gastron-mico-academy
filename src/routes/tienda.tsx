import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, MessageCircle, Users, Megaphone, Palette, BookOpen, ClipboardCheck, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import {
  formatGdPrice,
  listGerentesDigitales,
  listOwnedGdIds,
  type GerenteDigital,
} from "@/lib/gerentes-digitales";

// WhatsApp de Daniel Giménez para consultas y soporte
const WHATSAPP_NUMBER = "14709439722";

const buildWhatsappUrl = (message: string) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

type Badge = {
  text: string;
  textEn?: string;
  variant: "primary" | "accent" | "success";
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
  externalUrl?: string;   // si está seteado, abre URL externa en lugar de Stripe
  badge?: Badge;
  featured?: boolean;
  featuredReason?: string;
  featuredReasonEn?: string;
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
    id: "rebranding",
    area: "Área 2",
    title: "Rebranding",
    titleEn: "Rebranding",
    description: "Renová la imagen de tu restaurante con menú nuevo, website con pedidos online, logotipo, manual de marca y aplicaciones en todos tus materiales.",
    descEn: "Renew your restaurant's image with a new menu, website with online ordering, logo, brand manual and applications across all your materials.",
    icon: Palette,
    priceId: "rebranding_restaurante_base",
    priceLabel: "$1.800",
    badge: { text: "Más vendido", textEn: "Best seller", variant: "accent" },
  },
  {
    id: "libro-rentabilidad",
    area: "Área 4",
    title: "Libro · El Desafío de la Rentabilidad",
    titleEn: "Book · The Profitability Challenge",
    description: "Guía fundamental para el emprendedor gastronómico. 37 años de experiencia de Daniel Giménez condensados en un manual directo y aplicable.",
    descEn: "Essential guide for the gastronomic entrepreneur. 37 years of Daniel Giménez's experience condensed into a direct, actionable manual.",
    icon: BookOpen,
    priceId: "libro_desafio_rentabilidad_base",
    priceLabel: "$28",
    externalUrl: "https://a.co/d/02d4tZ7F",
    badge: { text: "Novedad", textEn: "New", variant: "success" },
  },
  {
    id: "club-elite-plus",
    area: "Área 5",
    title: "Club Elite Plus",
    titleEn: "Elite Plus Club",
    description: "Consultoría personalizada con Daniel Giménez y su equipo de consultores. Programa de 60 a 90 días para transformar tu restaurante.",
    descEn: "Personalized consulting with Daniel Giménez and his team of consultants. 60 to 90 day program to transform your restaurant.",
    icon: Users,
    priceId: null,
    whatsappMessage: "Hola, tengo interés en el Club Elite Plus. Me gustaría conocer más sobre la consultoría con Daniel Giménez y su equipo, duración de 60 a 90 días, valores y disponibilidad. ¡Gracias!",
    featured: true,
    featuredReason: "Programa high-ticket de transformación total",
    featuredReasonEn: "High-ticket total transformation program",
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
  const [gds, setGds] = useState<GerenteDigital[]>([]);
  const [ownedGdIds, setOwnedGdIds] = useState<string[]>([]);
  const { t, lang } = useI18n();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? undefined);
        setUserId(data.user.id);
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listGerentesDigitales();
      if (cancelled) return;
      setGds(list);
      if (userId) {
        const owned = await listOwnedGdIds(userId, list.map((g) => g.id));
        if (!cancelled) setOwnedGdIds(owned);
      } else {
        setOwnedGdIds([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleBuy = (product: Product) => {
    if (product.externalUrl) {
      const a = document.createElement("a");
      a.href = product.externalUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
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
            <ShoppingCart className="w-3.5 h-3.5" /> TIENDA · 5 ÁREAS
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">{t("tienda.titulo")}</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">{t("tienda.desc")}</p>
        </div>

        {(() => {
          const featured = products.find((p) => p.featured);
          const gridProducts = products.filter((p) => !p.featured);
          return (
            <div className="flex flex-col gap-6">
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-card p-1"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 sm:p-8">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4">
                        <Users className="w-3.5 h-3.5" />
                        {lang === "en" ? "High-ticket program" : "Programa high-ticket"}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-2">
                        {lang === "en" ? featured.titleEn : featured.title}
                      </h2>
                      <p className="text-muted-foreground max-w-2xl mb-4">
                        {lang === "en" ? featured.descEn : featured.description}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {lang === "en" ? featured.featuredReasonEn : featured.featuredReason}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-start xl:items-center gap-4 lg:min-w-[16rem]">
                      <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("tienda.personalizado")}
                      </span>
                      <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                        onClick={() => handleBuy(featured)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {t("tienda.consultar")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-6 flex flex-col hover:border-primary/30 hover:shadow-[0_0_30px_color-mix(in_oklab,var(--primary)_10%,transparent)] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <product.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                        {product.area}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{lang === "en" ? product.titleEn : product.title}</h3>
                      {product.badge && (
                        <span
                          className={[
                            "shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            product.badge.variant === "accent" && "bg-accent text-accent-foreground",
                            product.badge.variant === "success" && "bg-success text-success-foreground",
                            product.badge.variant === "primary" && "bg-primary text-primary-foreground",
                          ].filter(Boolean).join(" ")}
                        >
                          {lang === "en" && product.badge.textEn ? product.badge.textEn : product.badge.text}
                        </span>
                      )}
                    </div>
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
                      {product.externalUrl ? (
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                        >
                          <a href={product.externalUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1.5" />
                            {lang === "en" ? "Buy on Amazon" : "Comprar en Amazon"}
                          </a>
                        </Button>
                      ) : (
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
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })()}

        {gds.length > 0 && (
          <section className="mt-14">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
                <ClipboardCheck className="w-3.5 h-3.5" /> {t("gd.tituloLinea")}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display">{t("gd.tituloLinea")}</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">{t("gd.descLinea")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gds.map((gd, i) => {
                const owned = ownedGdIds.includes(gd.id);
                return (
                  <motion.div
                    key={gd.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-6 flex flex-col hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-primary" />
                      </div>
                      {owned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-bold uppercase tracking-wider">
                          <Check className="w-3 h-3" /> {t("gd.yaTienes")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{gd.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{gd.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {t("gd.compraUnica")}
                        </span>
                        <span className="text-xl font-bold text-primary leading-tight">
                          {formatGdPrice(gd.price_cents)}
                        </span>
                      </div>
                      {owned ? (
                        <Button asChild size="sm" variant="outline" className="rounded-xl shrink-0">
                          <Link to="/gerente-digital/$id" params={{ id: gd.id }}>
                            {t("gd.acceder")}
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shrink-0"
                          onClick={() => gd.stripe_price_id && setCheckoutPriceId(gd.stripe_price_id)}
                          disabled={!gd.stripe_price_id}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1.5" />
                          {t("gd.comprar")}
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3">{t("gd.incluidoElite")}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
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
