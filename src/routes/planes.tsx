import { createFileRoute } from "@tanstack/react-router";
import { Check, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const plans = [
  {
    id: "basico",
    name: "Plan Básico",
    price: "$27",
    priceId: "plan_basico_monthly",
    period: "/mes",
    description: "Todo lo que necesitás para empezar a controlar tu restaurante.",
    icon: Star,
    featured: false,
    features: [
      "Acceso a todos los cursos",
      "Planillas DRE y SUP",
      "Calculadora de Food Cost",
      "Comunidad privada",
      "Actualizaciones mensuales",
    ],
  },
  {
    id: "premium",
    name: "Plan Premium",
    price: "$97",
    priceId: "plan_premium_monthly",
    period: "/mes",
    description: "Para dueños que quieren resultados acelerados con acompañamiento.",
    icon: Crown,
    featured: true,
    features: [
      "Todo del Plan Básico",
      "Mentoría grupal mensual",
      "Acceso prioritario a mentorías individuales",
      "Contenido exclusivo avanzado",
      "Soporte directo por WhatsApp",
      "Descuentos en productos de la tienda",
    ],
  },
];

export const Route = createFileRoute("/planes")({
  component: PlanesPage,
  head: () => ({
    meta: [
      { title: "Planes de Membresía — GPS Gastronômico" },
      { name: "description", content: "Elegí el plan que mejor se adapte a tu restaurante. Básico o Premium." },
    ],
  }),
});

function PlanesPage() {
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

  return (
    <div className="min-h-screen pt-20 pb-16">
      <PaymentTestModeBanner />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display mb-3">Elegí tu Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invertí en el crecimiento de tu negocio gastronómico con herramientas, contenido y acompañamiento profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.featured
                  ? "border-primary bg-primary/5 shadow-[0_0_40px_oklch(0.70_0.18_45/12%)]"
                  : "border-border bg-card"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  Más Popular
                </span>
              )}

              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <plan.icon className="w-6 h-6 text-primary" />
              </div>

              <h2 className="text-2xl font-bold font-display mb-1">{plan.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className={`w-full rounded-xl ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => setCheckoutPriceId(plan.priceId)}
              >
                Suscribirme
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={!!checkoutPriceId} onOpenChange={(open) => !open && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Completar Suscripción</DialogTitle>
          {checkoutPriceId && (
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              customerEmail={userEmail}
              userId={userId}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
