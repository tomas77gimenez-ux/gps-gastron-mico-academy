import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/checkout/return")({
  component: CheckoutReturnPage,
  head: () => ({
    meta: [
      { title: "Resultado del Pago — GPS Gastronômico" },
      { name: "description", content: "Resultado de tu intento de pago." },
      { property: "og:title", content: 'Resultado del Pago — GPS Gastronômico' },
      { property: "og:description", content: 'Confirmación del resultado del pago.' },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/checkout/return" },
      { name: "robots", content: "noindex,nofollow" }
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/checkout/return" }],
  }),
});

type PaymentResult =
  | { state: "loading" }
  | { state: "success" }
  | { state: "failed"; plan?: string; period?: string };

function CheckoutReturnPage() {
  const sessionId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("session_id")
    : null;
  const navigate = useNavigate();
  const [result, setResult] = useState<PaymentResult>({ state: "loading" });

  useEffect(() => {
    if (!sessionId) return;
    // Read the pending checkout context (plan, period) before clearing
    let pendingContext: { plan?: string; period?: string } = {};
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem("pending_checkout_session");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          pendingContext = { plan: parsed.plan, period: parsed.period };
        } catch {
          // ignore
        }
      }
      window.sessionStorage.removeItem("pending_checkout_session");
    }
    const key = `ga_purchase_tracked_${sessionId}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(key)) {
      setResult({ state: "success" });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-checkout-session", {
          body: { sessionId, environment: getStripeEnvironment() },
        });
        if (cancelled) return;
        if (error || !data) {
          trackEvent("purchase", { transaction_id: sessionId });
          setResult({ state: "success" });
        } else if (data.payment_status === "paid" || data.status === "complete") {
          trackEvent("purchase", {
            transaction_id: sessionId,
            value: data.amount_total ?? 0,
            currency: data.currency ?? "USD",
            items: data.items ?? [],
          });
          setResult({ state: "success" });
        } else {
          // Stripe redirected here but payment is not paid → failure
          trackEvent("checkout_failed", {
            session_id: sessionId,
            plan: pendingContext.plan ?? "unknown",
            period: pendingContext.period ?? "unknown",
            payment_status: data.payment_status ?? "unknown",
            session_status: data.status ?? "unknown",
            reason: "payment_not_completed",
          });
          if (typeof window !== "undefined") window.sessionStorage.setItem(key, "1");
          setResult({ state: "failed", plan: pendingContext.plan, period: pendingContext.period });
          return;
        }
        if (typeof window !== "undefined") window.sessionStorage.setItem(key, "1");
      } catch {
        trackEvent("purchase", { transaction_id: sessionId });
        if (typeof window !== "undefined") window.sessionStorage.setItem(key, "1");
        setResult({ state: "success" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  function handleRetry() {
    if (result.state !== "failed") return;
    trackEvent("checkout_retry_clicked", {
      session_id: sessionId ?? "unknown",
      plan: result.plan ?? "unknown",
      period: result.period ?? "unknown",
    });
    navigate({
      to: "/planes",
      search: {
        retry_plan: result.plan ?? undefined,
        retry_period: result.period ?? undefined,
      } as never,
    });
  }

  if (result.state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground">Procesando…</p>
      </div>
    );
  }

  if (result.state === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold font-display mb-2">El pago no se completó</h1>
          <p className="text-muted-foreground mb-6">
            Tu pago no fue procesado. Podés volver a intentarlo con el mismo plan o cambiar de método de pago.
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground/60 mb-6 break-all">
              Referencia: {sessionId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleRetry}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              Intentar de nuevo
            </Button>
            <Link to="/planes">
              <Button variant="outline" className="rounded-xl w-full sm:w-auto">
                Volver a Planes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
