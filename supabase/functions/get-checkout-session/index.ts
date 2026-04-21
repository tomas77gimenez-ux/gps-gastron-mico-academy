import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, environment } = await req.json();
    if (!sessionId || typeof sessionId !== "string" || !/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
      return new Response(JSON.stringify({ error: "Invalid sessionId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const env = (environment || "sandbox") as StripeEnv;
    const stripe = createStripeClient(env);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });

    const lineItems = session.line_items?.data ?? [];
    const items = lineItems.map((li) => {
      const price = li.price as any;
      const product = price?.product as any;
      return {
        item_id: price?.metadata?.lovable_external_id || price?.id || "",
        item_name: (typeof product === "object" && product?.name) || "Item",
        price: typeof price?.unit_amount === "number" ? price.unit_amount / 100 : 0,
        quantity: li.quantity ?? 1,
      };
    });

    return new Response(
      JSON.stringify({
        status: session.status,
        payment_status: session.payment_status,
        mode: session.mode,
        amount_total: typeof session.amount_total === "number" ? session.amount_total / 100 : 0,
        currency: (session.currency || "usd").toUpperCase(),
        customer_email: session.customer_details?.email ?? null,
        items,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});