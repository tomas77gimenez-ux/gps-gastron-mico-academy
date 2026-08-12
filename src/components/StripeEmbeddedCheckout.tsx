import { useState, useCallback } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface StripeEmbeddedCheckoutProps {
  priceId: string;
  quantity?: number;
  customerEmail?: string;
  userId?: string;
  returnUrl?: string;
  onSessionCreated?: (sessionId: string) => void;
  plan?: string;
  period?: string;
}

export function StripeEmbeddedCheckout({
  priceId,
  quantity,
  customerEmail,
  userId,
  returnUrl,
  onSessionCreated,
  plan,
  period,
}: StripeEmbeddedCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async (): Promise<string> => {
    setError(null);
    const { data, error: functionError } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, quantity, customerEmail, userId, returnUrl, environment: getStripeEnvironment() },
    });

    const serverMessage = functionError?.message || data?.error || "Failed to create checkout session";

    if (functionError || !data?.clientSecret) {
      console.error("[StripeEmbeddedCheckout] create-checkout error:", serverMessage);
      trackEvent("checkout_failed", {
        plan: plan ?? "unknown",
        period: period ?? "unknown",
        price_id: priceId,
        reason: "session_creation_failed",
        error: serverMessage,
      });
      setError(serverMessage);
      // Return a never-resolving promise so EmbeddedCheckoutProvider stays idle
      // while our error UI is shown. The error state prevents the checkout from rendering.
      return new Promise(() => {});
    }

    // clientSecret format: "cs_test_xxx_secret_yyy" — first segment is the session_id
    const sessionId = (data.clientSecret as string).split("_secret_")[0];
    if (sessionId && onSessionCreated) onSessionCreated(sessionId);
    return data.clientSecret;
  }, [priceId, quantity, customerEmail, userId, returnUrl, plan, period, onSessionCreated]);

  return (
    <div id="checkout" className="relative">
      {error ? (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Error al iniciar el pago</AlertTitle>
          <AlertDescription className="text-sm opacity-90">
            No pudimos iniciar el pago. Por favor intentá de nuevo.
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchClientSecret()}
            className="mt-3 w-full gap-2 border-destructive/50 text-destructive-foreground hover:bg-destructive/20"
          >
            <RefreshCcw className="h-4 w-4" />
            Reintentar
          </Button>
        </Alert>
      ) : (
        <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
}
