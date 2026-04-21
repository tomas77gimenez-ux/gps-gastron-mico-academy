import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/checkout/return")({
  component: CheckoutReturnPage,
  head: () => ({
    meta: [
      { title: "Pago Completado — GPS Gastronômico" },
      { name: "description", content: "Tu pago ha sido procesado exitosamente." },
    ],
  }),
});

function CheckoutReturnPage() {
  const sessionId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("session_id")
    : null;

  useEffect(() => {
    if (!sessionId) return;
    // Clear the abandonment marker — user reached the return page
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("pending_checkout_session");
    }
    const key = `ga_purchase_tracked_${sessionId}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(key)) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-checkout-session", {
          body: { sessionId, environment: getStripeEnvironment() },
        });
        if (cancelled) return;
        if (error || !data) {
          trackEvent("purchase", { transaction_id: sessionId });
        } else if (data.payment_status === "paid" || data.status === "complete") {
          trackEvent("purchase", {
            transaction_id: sessionId,
            value: data.amount_total ?? 0,
            currency: data.currency ?? "USD",
            items: data.items ?? [],
          });
        } else {
          // Not paid — don't fire purchase
          return;
        }
        if (typeof window !== "undefined") window.sessionStorage.setItem(key, "1");
      } catch {
        trackEvent("purchase", { transaction_id: sessionId });
        if (typeof window !== "undefined") window.sessionStorage.setItem(key, "1");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">¡Pago completado!</h1>
        <p className="text-muted-foreground mb-6">
          Tu compra ha sido procesada exitosamente. Recibirás un email con los detalles.
        </p>
        {sessionId && (
          <p className="text-xs text-muted-foreground/60 mb-6 break-all">
            Referencia: {sessionId}
          </p>
        )}
        <Link to="/tienda">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
            Volver a Productos
          </Button>
        </Link>
      </div>
    </div>
  );
}
