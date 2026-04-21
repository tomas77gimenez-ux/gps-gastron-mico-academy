import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Star, Crown, Shield, CreditCard, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const plans = [
  {
    id: "basico",
    name: { es: "Plan Básico", en: "Basic Plan" },
    monthlyPrice: 27,
    priceIdMonthly: "plan_basico_monthly",
    priceIdYearly: "plan_basico_yearly",
    description: { es: "Todo lo que necesitás para empezar a controlar tu restaurante.", en: "Everything you need to start controlling your restaurant." },
    icon: Star,
    featured: false,
    features: {
      es: ["Acceso a todos los cursos", "Planillas DRE y SUP", "Calculadora de Food Cost", "Comunidad privada", "Actualizaciones mensuales"],
      en: ["Access to all courses", "DRE and SUP spreadsheets", "Food Cost Calculator", "Private community", "Monthly updates"],
    },
  },
  {
    id: "premium",
    name: { es: "Plan Premium", en: "Premium Plan" },
    monthlyPrice: 97,
    priceIdMonthly: "plan_premium_monthly",
    priceIdYearly: "plan_premium_yearly",
    description: { es: "Para dueños que quieren resultados acelerados con acompañamiento.", en: "For owners who want accelerated results with guidance." },
    icon: Crown,
    featured: true,
    features: {
      es: ["Todo del Plan Básico", "Mentoría grupal mensual", "Acceso prioritario a mentorías individuales", "Contenido exclusivo avanzado", "Soporte directo por WhatsApp", "Descuentos en productos de la tienda"],
      en: ["Everything in Basic Plan", "Monthly group mentorship", "Priority access to individual mentorships", "Exclusive advanced content", "Direct WhatsApp support", "Discounts on store products"],
    },
  },
];

const compareFeatures = [
  { key: "compare.cursos", basico: true, premium: true },
  { key: "compare.dre", basico: true, premium: true },
  { key: "compare.foodcost", basico: true, premium: true },
  { key: "compare.asistente", basico: true, premium: true },
  { key: "compare.comunidad", basico: true, premium: true },
  { key: "compare.actualizaciones", basico: true, premium: true },
  { key: "compare.mentoria", basico: false, premium: true },
  { key: "compare.individual", basico: false, premium: true },
  { key: "compare.contenido", basico: false, premium: true },
  { key: "compare.whatsapp", basico: false, premium: true },
  { key: "compare.descuentos", basico: false, premium: true },
] as const;

const faqs = [
  { q: "planes.faqQ1", a: "planes.faqA1" },
  { q: "planes.faqQ2", a: "planes.faqA2" },
  { q: "planes.faqQ3", a: "planes.faqA3" },
  { q: "planes.faqQ4", a: "planes.faqA4" },
  { q: "planes.faqQ5", a: "planes.faqA5" },
] as const;

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
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [portalLoading, setPortalLoading] = useState(false);
  const { t, lang } = useI18n();
  const subscription = useSubscription();

  const yearlyDiscount = 0.8; // 20% off

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? undefined);
        setUserId(data.user.id);
      }
    });
  }, []);

  // Map active subscription's price_id back to a plan slug
  // We can infer from product_id stored. Here we read the subscriptions row directly via priceId hint.
  // useSubscription only exposes product_id. We additionally fetch the price_id once.
  const [currentPriceId, setCurrentPriceId] = useState<string | null>(null);
  useEffect(() => {
    if (!subscription.hasActive || !userId) return;
    supabase
      .from("subscriptions")
      .select("price_id, environment")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        const env = getStripeEnvironment();
        const match = data?.find((r) => r.environment === env) ?? data?.[0];
        setCurrentPriceId(match?.price_id ?? null);
      });
  }, [subscription.hasActive, userId]);

  function isCurrentPlan(planId: string) {
    if (!subscription.hasActive || !currentPriceId) return false;
    return currentPriceId.startsWith(`plan_${planId}_`);
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        toast.error(lang === "es" ? "Iniciá sesión primero" : "Sign in first");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}/planes` : undefined,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "No URL");
      window.location.href = data.url;
    } catch (e) {
      toast.error((e as Error).message || (lang === "es" ? "Error al abrir el portal" : "Failed to open portal"));
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <PaymentTestModeBanner />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display mb-3">{t("planes.titulo")}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("planes.desc")}</p>

          <div className="inline-flex items-center gap-1 mt-8 p-1 bg-card border border-border rounded-full">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                billing === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("home.plans.billingMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("home.plans.billingYearly")}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  billing === "yearly" ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                }`}
              >
                −20%
              </span>
            </button>
          </div>
        </div>

        {subscription.hasActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8 rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
          >
            <Settings className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">{t("planes.gestionar")}</p>
              <p className="text-muted-foreground">{t("planes.gestionarDesc")}</p>
            </div>
            <Button onClick={openPortal} disabled={portalLoading} variant="outline" size="sm" className="shrink-0">
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("planes.gestionar")}
            </Button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => {
            const yearlyPrice = Math.round(plan.monthlyPrice * 12 * yearlyDiscount);
            const yearlySavings = plan.monthlyPrice * 12 - yearlyPrice;
            const monthlyEquivalent = (yearlyPrice / 12).toFixed(2);
            const displayPrice = billing === "monthly" ? `$${plan.monthlyPrice}` : `$${yearlyPrice}`;
            const displayPeriod = billing === "monthly" ? t("home.plans.perMonth") : t("home.plans.perYear");
            const activePriceId = billing === "monthly" ? plan.priceIdMonthly : plan.priceIdYearly;
            const isCurrent = isCurrentPlan(plan.id);
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.featured
                    ? "border-primary bg-primary/5 shadow-[0_0_40px_oklch(0.70_0.18_45/12%)]"
                    : "border-border bg-card"
                } ${isCurrent ? "ring-2 ring-primary" : ""}`}
              >
                {plan.featured && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    {t("planes.masPopular")}
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> {t("planes.planActual")}
                  </span>
                )}

                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-2xl font-bold font-display mb-1">{plan.name[lang]}</h2>
                <p className="text-sm text-muted-foreground mb-6">{plan.description[lang]}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
                    <span className="text-muted-foreground">{displayPeriod}</span>
                  </div>
                  {billing === "yearly" && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        ${monthlyEquivalent}{t("home.plans.perMonth")} · {t("planes.equivalente")}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        {t("planes.ahorra")} ${yearlySavings}{t("planes.alAno")}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features[lang].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={openPortal}
                    disabled={portalLoading}
                  >
                    {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("planes.gestionar")}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className={`w-full rounded-xl ${
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => setCheckoutPriceId(activePriceId)}
                  >
                    {t("planes.suscribirme")}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> {t("planes.garantia")}
          </span>
          <span className="inline-flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> {t("planes.pagoSeguro")}
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold tracking-wide">
            <span className="px-2 py-0.5 rounded bg-foreground/5 border border-border">VISA</span>
            <span className="px-2 py-0.5 rounded bg-foreground/5 border border-border">MASTERCARD</span>
            <span className="px-2 py-0.5 rounded bg-foreground/5 border border-border">AMEX</span>
          </span>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-center mb-8">
            {t("planes.compararTitulo")}
          </h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-3 bg-secondary/40 border-b border-border">
              <div className="px-4 py-4 text-sm font-semibold">{t("planes.feature")}</div>
              <div className="px-4 py-4 text-sm font-semibold text-center">{plans[0].name[lang]}</div>
              <div className="px-4 py-4 text-sm font-semibold text-center text-primary">{plans[1].name[lang]}</div>
            </div>
            {compareFeatures.map((row, idx) => (
              <div
                key={row.key}
                className={`grid grid-cols-3 items-center ${idx !== compareFeatures.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="px-4 py-3 text-sm">{t(row.key)}</div>
                <div className="px-4 py-3 flex justify-center">
                  {row.basico ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="px-4 py-3 flex justify-center">
                  {row.premium ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-center mb-8">
            {t("planes.faqTitulo")}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, idx) => (
              <AccordionItem key={item.q} value={`q${idx}`}>
                <AccordionTrigger className="text-left text-base">{t(item.q)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{t(item.a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>

      <Dialog open={!!checkoutPriceId} onOpenChange={(open) => !open && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{t("planes.completarSub")}</DialogTitle>
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