import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X, Star, Crown, Gem, Shield, CreditCard, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n, type Lang } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { getStripeEnvironment } from "@/lib/stripe";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

// Helper: pick a translation from an object keyed by language, falling back to es
function pickLang<T>(obj: Partial<Record<Lang, T>> & { es: T }, lang: Lang): T {
  return obj[lang] ?? obj.es;
}

const plans = [
  {
    id: "basico",
    name: { es: "Academy", en: "Academy" },
    monthlyPrice: 57,
    yearlyPrice: 581,
    priceIdMonthly: "plan_basico_monthly",
    priceIdYearly: "plan_basico_yearly",
    description: { es: "Curso completo, todas las herramientas de gestión y la comunidad de miembros.", en: "Complete course, all management tools and the members community." },
    icon: Star,
    featured: false,
    features: {
      es: [
        "Curso completo GPS Gastronómico (7 módulos)",
        "Todas las herramientas de gestión (DRE, Punto de Equilibrio, Control de Caja, Monitor de CMV, Fichas Técnicas)",
        "Comunidad de miembros",
        "Asistente IA gastronómico",
        "Actualizaciones mensuales",
      ],
      en: [
        "Complete GPS Gastronômico course (7 modules)",
        "All management tools (DRE, Break-even, Cash Control, CMV Monitor, Recipe Cards)",
        "Members community",
        "Gastronomic AI assistant",
        "Monthly updates",
      ],
    },
  },
  {
    id: "premium",
    name: { es: "Academy Pro", en: "Academy Pro" },
    monthlyPrice: 87,
    yearlyPrice: 887,
    priceIdMonthly: "plan_premium_monthly",
    priceIdYearly: "plan_premium_yearly",
    description: { es: "Todo lo de Academy más acompañamiento en vivo cada semana en la Sala Pro.", en: "Everything in Academy plus weekly live guidance in the Pro Room." },
    icon: Crown,
    featured: true,
    features: {
      es: [
        "Todo lo del plan Academy",
        "Reunión semanal de implementación en vivo",
        "Caso Real del Mes (análisis antes/después)",
        "Acceso a la Sala Pro y al archivo de grabaciones",
        "Soporte prioritario del equipo de Daniel",
      ],
      en: [
        "Everything in Academy",
        "Weekly live implementation call",
        "Real Case of the Month (before/after analysis)",
        "Pro Room access and recordings archive",
        "Priority support from Daniel's team",
      ],
    },
  },
];

plans.push({
  id: "elite",
  name: { es: "Academy Élite", en: "Academy Élite" },
  monthlyPrice: 167,
  yearlyPrice: 1703,
  priceIdMonthly: "plan_elite_monthly",
  priceIdYearly: "plan_elite_yearly",
  description: {
    es: "Todo lo de Pro más acompañamiento 1 a 1 con Daniel y la línea completa de Gerentes Digitales.",
    en: "Everything in Pro plus 1-on-1 guidance with Daniel and the full Digital Managers line.",
  },
  icon: Gem,
  featured: false,
  features: {
    es: [
      "Todo lo del plan Academy Pro",
      "1 llamada 1 a 1 mensual con Daniel Gimenez",
      "Acceso incluido a TODOS los Gerentes Digitales (presentes y futuros)",
      "Prioridad máxima en soporte y revisiones",
    ],
    en: [
      "Everything in Academy Pro",
      "1 monthly 1-on-1 call with Daniel Gimenez",
      "Included access to ALL Digital Managers (present and future)",
      "Highest priority support and reviews",
    ],
  },
});

const compareFeatures = [
  { key: "compare.cursos", basico: true, premium: true, elite: true },
  { key: "compare.tools", basico: true, premium: true, elite: true },
  { key: "compare.comunidadMiembros", basico: true, premium: true, elite: true },
  { key: "compare.asistente", basico: true, premium: true, elite: true },
  { key: "compare.actualizaciones", basico: true, premium: true, elite: true },
  { key: "compare.reunion", basico: false, premium: true, elite: true },
  { key: "compare.caso", basico: false, premium: true, elite: true },
  { key: "compare.prioritario", basico: false, premium: true, elite: true },
  { key: "compare.llamada1a1", basico: false, premium: false, elite: true },
  { key: "compare.gerentes", basico: false, premium: false, elite: true },
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
      { name: "description", content: "Elegí el plan que mejor se adapte a tu restaurante: Academy o Academy Pro." },
      { property: "og:title", content: 'Planes de Membresía — GPS Gastronômico' },
      { property: "og:description", content: 'Elegí el plan que mejor se adapte a tu restaurante: Academy o Academy Pro.' },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/planes" }
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/planes" }],
  }),
});

function PlanesPage() {
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [portalLoading, setPortalLoading] = useState(false);
  const { t, lang } = useI18n();
  const subscription = useSubscription();

  const yearlyDiscount = 0.85; // 15% off (yearlyPrice on each plan is the source of truth)

  // Auto-open checkout when arriving from a retry link (?retry_plan=...&retry_period=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const retryPlan = params.get("retry_plan");
    const retryPeriod = params.get("retry_period") as "monthly" | "yearly" | null;
    if (!retryPlan) return;
    const plan = plans.find((p) => p.id === retryPlan);
    if (!plan) return;
    if (retryPeriod === "monthly" || retryPeriod === "yearly") {
      setBilling(retryPeriod);
    }
    const priceId = retryPeriod === "yearly" ? plan.priceIdYearly : plan.priceIdMonthly;
    setCheckoutPriceId(priceId);
    setCheckoutSessionId(null);
    trackEvent("checkout_opened", {
      plan: plan.id,
      period: retryPeriod ?? "monthly",
      price_id: priceId,
      source: "retry",
    });
    // Clean URL so refresh doesn't re-open
    const url = new URL(window.location.href);
    url.searchParams.delete("retry_plan");
    url.searchParams.delete("retry_period");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Fire checkout_abandoned if user closes the dialog or leaves the page
  // before completing payment. Cleared in /checkout/return when purchase fires.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      const pending = window.sessionStorage.getItem("pending_checkout_session");
      if (pending) {
        const parsed = JSON.parse(pending);
        trackEvent("checkout_abandoned", {
          session_id: parsed.sessionId,
          plan: parsed.plan,
          period: parsed.period,
          reason: "page_unload",
        });
        window.sessionStorage.removeItem("pending_checkout_session");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? undefined);
        setUserId(data.user.id);
      }
    });
  }, []);

  // Funnel step 1: reached the pricing page.
  useEffect(() => {
    trackFunnelStep("view_plans");
  }, []);

  // Track subscription state transitions (e.g. user canceled/reactivated from Stripe portal)
  useEffect(() => {
    if (subscription.loading) return;
    if (typeof window === "undefined") return;
    const key = `sub_state_${userId ?? "anon"}`;
    const snapshot = JSON.stringify({
      hasActive: subscription.hasActive,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });
    const prev = window.sessionStorage.getItem(key);
    if (prev && prev !== snapshot) {
      const prevState = JSON.parse(prev) as {
        hasActive: boolean;
        status: string | null;
        cancelAtPeriodEnd: boolean;
      };
      if (!prevState.cancelAtPeriodEnd && subscription.cancelAtPeriodEnd) {
        trackEvent("subscription_canceled", {
          status: subscription.status ?? "unknown",
          source: "stripe_portal",
        });
      } else if (prevState.cancelAtPeriodEnd && !subscription.cancelAtPeriodEnd && subscription.hasActive) {
        trackEvent("subscription_reactivated", {
          status: subscription.status ?? "unknown",
          source: "stripe_portal",
        });
      } else if (prevState.hasActive && !subscription.hasActive) {
        trackEvent("subscription_ended", {
          previous_status: prevState.status ?? "unknown",
        });
      } else if (!prevState.hasActive && subscription.hasActive) {
        trackEvent("subscription_activated", {
          status: subscription.status ?? "unknown",
        });
      }
    }
    window.sessionStorage.setItem(key, snapshot);
  }, [subscription.loading, subscription.hasActive, subscription.status, subscription.cancelAtPeriodEnd, userId]);

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
    trackEvent("manage_subscription_clicked", {
      plan_status: subscription.status ?? "unknown",
      cancel_at_period_end: subscription.cancelAtPeriodEnd,
    });
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
              onClick={() => {
                setBilling("monthly");
                trackEvent("plans_billing_toggle", { period: "monthly" });
              }}
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
              onClick={() => {
                setBilling("yearly");
                trackEvent("plans_billing_toggle", { period: "yearly" });
              }}
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
                −15%
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
            const yearlyPrice = plan.yearlyPrice ?? Math.round(plan.monthlyPrice * 12 * yearlyDiscount);
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

                <h2 className="text-2xl font-bold font-display mb-1">{pickLang(plan.name, lang)}</h2>
                <p className="text-sm text-muted-foreground mb-6">{pickLang(plan.description, lang)}</p>

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
                  {pickLang(plan.features, lang).map((feature: string) => (
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
                    onClick={() => {
                      setCheckoutPriceId(activePriceId);
                      setCheckoutSessionId(null);
                      trackEvent("checkout_opened", {
                        plan: plan.id,
                        period: billing,
                        price_id: activePriceId,
                        value: billing === "monthly" ? plan.monthlyPrice : yearlyPrice,
                        currency: "USD",
                      });
                    }}
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

        {/* Aviso legal */}
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          {lang === "es"
            ? "5 días de prueba gratis. Se renueva automáticamente; cancelás en un clic desde tu cuenta. Al suscribirte aceptás los "
            : "5-day free trial. Renews automatically; cancel in one click from your account. By subscribing you accept the "}
          <Link to="/terminos" className="underline hover:text-primary">
            {t("footer.terminos")}
          </Link>
          {", "}
          <Link to="/privacidad" className="underline hover:text-primary">
            {t("footer.privacidad")}
          </Link>
          {lang === "es" ? " y la " : " and the "}
          <Link to="/reembolsos" className="underline hover:text-primary">
            {t("footer.reembolsos")}
          </Link>
          .
        </p>

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
              <div className="px-4 py-4 text-sm font-semibold text-center">{pickLang(plans[0].name, lang)}</div>
              <div className="px-4 py-4 text-sm font-semibold text-center text-primary">{pickLang(plans[1].name, lang)}</div>
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

      <Dialog
        open={!!checkoutPriceId}
        onOpenChange={(open) => {
          if (open) return;
          // Dialog being closed — if there's a pending session, treat as abandoned
          if (typeof window !== "undefined") {
            const pending = window.sessionStorage.getItem("pending_checkout_session");
            if (pending) {
              try {
                const parsed = JSON.parse(pending);
                trackEvent("checkout_abandoned", {
                  session_id: parsed.sessionId,
                  plan: parsed.plan,
                  period: parsed.period,
                  reason: "dialog_closed",
                });
              } catch {
                // ignore
              }
              window.sessionStorage.removeItem("pending_checkout_session");
            }
          }
          setCheckoutPriceId(null);
          setCheckoutSessionId(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{t("planes.completarSub")}</DialogTitle>
          {checkoutPriceId && (
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              customerEmail={userEmail}
              userId={userId}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
              plan={plans.find((p) => p.priceIdMonthly === checkoutPriceId || p.priceIdYearly === checkoutPriceId)?.id}
              period={billing}
              onSessionCreated={(sessionId) => {
                setCheckoutSessionId(sessionId);
                if (typeof window !== "undefined") {
                  // Find the plan slug from the active priceId
                  const planMatch = plans.find(
                    (p) => p.priceIdMonthly === checkoutPriceId || p.priceIdYearly === checkoutPriceId,
                  );
                  window.sessionStorage.setItem(
                    "pending_checkout_session",
                    JSON.stringify({
                      sessionId,
                      plan: planMatch?.id ?? "unknown",
                      period: billing,
                    }),
                  );
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}