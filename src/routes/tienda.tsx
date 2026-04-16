import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, ExternalLink, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const products = [
  { id: "mentoria-individual", title: "Mentoría Individual 60 días", description: "Sesión 1-on-1 personalizada para resolver los desafíos de tu restaurante.", price: "$4.500", priceId: "mentoria_individual", type: "mentorship", icon: Users },
  { id: "mentoria-grupal", title: "Mentoría Grupal", description: "Sesión grupal con otros dueños de restaurantes. Aprende de experiencias compartidas.", price: "$450", priceId: "mentoria_grupal", type: "mentorship", icon: Users },
  { id: "dre", title: "DRE - Estado de Resultados", description: "Planilla profesional para controlar el estado de resultados de tu restaurante.", price: "$18", priceId: "planilla_dre", type: "download", icon: Download },
  { id: "sup", title: "SUP - Sistema Único de Pedidos", description: "Herramienta para optimizar y sistematizar tus pedidos a proveedores.", price: "$18", priceId: "planilla_sup", type: "download", icon: Download },
  { id: "food-cost-calc", title: "Calculadora de Food Cost", description: "Calcula el costo real de cada plato y optimiza tu menú.", price: "$28", priceId: "food_cost_calc", type: "download", icon: Download },
  { id: "libro-gps", title: "Libro GPS Gastronômico", description: "La guía definitiva en formato libro. Disponible en Amazon.", price: "Ver en Amazon", priceId: null, type: "external", icon: ExternalLink },
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
        <h1 className="text-3xl font-bold font-display mb-2">Productos</h1>
        <p className="text-muted-foreground mb-8">Herramientas y servicios para transformar tu negocio gastronómico.</p>

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
              <h3 className="font-semibold text-foreground mb-2">{product.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">{product.price}</span>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  onClick={() => handleBuy(product)}
                >
                  {product.type === "external" ? (
                    <>
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      Ver
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Comprar
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
          <DialogTitle>Completar Compra</DialogTitle>
          {checkoutPriceId && (
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              customerEmail={userEmail}
              userId={userId}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
