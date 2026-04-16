import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, ExternalLink, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

const products = [
  { id: "mentoria-individual", title: "Mentoría Individual 60 días", titleEn: "Individual Mentorship 60 days", description: "Sesión 1-on-1 personalizada para resolver los desafíos de tu restaurante.", descEn: "Personalized 1-on-1 session to solve your restaurant challenges.", price: "$4.500", priceId: "mentoria_individual", type: "mentorship", icon: Users },
  { id: "mentoria-grupal", title: "Mentoría Grupal", titleEn: "Group Mentorship", description: "Sesión grupal con otros dueños de restaurantes. Aprende de experiencias compartidas.", descEn: "Group session with other restaurant owners. Learn from shared experiences.", price: "$450", priceId: "mentoria_grupal", type: "mentorship", icon: Users },
  { id: "dre", title: "DRE - Estado de Resultados", titleEn: "DRE - Income Statement", description: "Planilla profesional para controlar el estado de resultados de tu restaurante.", descEn: "Professional spreadsheet to control your restaurant's income statement.", price: "$18", priceId: "planilla_dre", type: "download", icon: Download },
  { id: "sup", title: "SUP - Sistema Único de Pedidos", titleEn: "SUP - Unique Order System", description: "Herramienta para optimizar y sistematizar tus pedidos a proveedores.", descEn: "Tool to optimize and systematize your supplier orders.", price: "$18", priceId: "planilla_sup", type: "download", icon: Download },
  { id: "food-cost-calc", title: "Calculadora de Food Cost", titleEn: "Food Cost Calculator", description: "Calcula el costo real de cada plato y optimiza tu menú.", descEn: "Calculate the real cost of each dish and optimize your menu.", price: "$28", priceId: "food_cost_calc", type: "download", icon: Download },
  { id: "libro-gps", title: "Libro GPS Gastronômico", titleEn: "GPS Gastronômico Book", description: "La guía definitiva en formato libro. Disponible en Amazon.", descEn: "The definitive guide in book format. Available on Amazon.", price: "Ver en Amazon", priceId: null, type: "external", icon: ExternalLink },
];

export const Route = createFileRoute("/tienda")({
  component: TiendaPage,
  head: () => ({
    meta: [
      { title: "Productos — GPS Gastronômico" },
      { name: "description", content: "Herramientas, mentorías y productos para profesionales gastronómicos." },
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

  const handleBuy = (product: typeof products[0]) => {
    if (product.type === "external") {
      window.open("https://www.amazon.com", "_blank");
      return;
    }
    if (product.priceId) {
      setCheckoutPriceId(product.priceId);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <PaymentTestModeBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold font-display mb-2">{t("tienda.titulo")}</h1>
        <p className="text-muted-foreground mb-8">{t("tienda.desc")}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-6 flex flex-col hover:border-primary/30 hover:shadow-[0_0_30px_oklch(0.70_0.18_45/8%)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <product.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{lang === "en" ? product.titleEn : product.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{lang === "en" ? product.descEn : product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">{product.type === "external" && lang === "en" ? "See on Amazon" : product.price}</span>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  onClick={() => handleBuy(product)}
                >
                  {product.type === "external" ? (
                    <>
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      {t("tienda.ver")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      {t("tienda.comprar")}
                    </>
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
