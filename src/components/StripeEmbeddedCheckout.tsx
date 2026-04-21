import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

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
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId, quantity, customerEmail, userId, returnUrl, environment: getStripeEnvironment() },
    });
    if (error || !data?.clientSecret) {
      trackEvent("checkout_failed", {
        plan: plan ?? "unknown",
        period: period ?? "unknown",
        price_id: priceId,
        reason: "session_creation_failed",
        error: error?.message ?? "no_client_secret",
      });
      throw new Error(error?.message || "Failed to create checkout session");
    }
    // clientSecret format: "cs_test_xxx_secret_yyy" — first segment is the session_id
    const sessionId = (data.clientSecret as string).split("_secret_")[0];
    if (sessionId && onSessionCreated) onSessionCreated(sessionId);
    return data.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
