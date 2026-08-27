import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

/** Reutiliza el customer de Stripe del usuario para evitar duplicados al reactivar. */
async function existingCustomerId(userId: string, env: StripeEnv): Promise<string | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .eq("environment", env)
    .not("stripe_customer_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const id = data?.stripe_customer_id as string | null | undefined;
  if (!id || id.startsWith("cus_test_fake")) return null;
  return id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, quantity, customerEmail, userId, returnUrl, environment } = await req.json();
    if (!priceId || typeof priceId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      return new Response(JSON.stringify({ error: "Invalid priceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const env = (environment || 'sandbox') as StripeEnv;
    const stripe = createStripeClient(env);

    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) {
      return new Response(JSON.stringify({ error: "Price not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const reusedCustomerId = userId ? await existingCustomerId(userId, env) : null;

    // Trial solo para clientes nuevos: si ya hubo alguna suscripción (en
    // cualquier estado) o reutilizamos un customer existente, sin trial.
    let hadSubscriptionBefore = false;
    if (userId) {
      const { count } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      hadSubscriptionBefore = (count ?? 0) > 0;
    }
    const trialEligible = isRecurring && !reusedCustomerId && !hadSubscriptionBefore;
    const subscriptionDataBase = trialEligible ? { trial_period_days: 5 } : {};

    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      line_items: [{ price: stripePrice.id, quantity: quantity || 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded",
      return_url: returnUrl || `${req.headers.get("origin")}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      ...(reusedCustomerId
        ? { customer: reusedCustomerId }
        : customerEmail
        ? { customer_email: customerEmail }
        : {}),
      ...(userId && {
        metadata: { userId },
        ...(isRecurring && {
          subscription_data: { metadata: { userId }, ...subscriptionDataBase },
        }),
      }),
      ...(isRecurring && !userId && {
        subscription_data: { ...subscriptionDataBase },
      }),
    });


    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
