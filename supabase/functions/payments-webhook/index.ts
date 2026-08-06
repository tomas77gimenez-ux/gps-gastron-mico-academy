import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as StripeEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log("Received event:", event.type, "env:", env);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, env);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object, env);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, env);
        break;
      case "customer.subscription.trial_will_end":
        console.log("Trial will end:", event.data.object.id);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, env);
        break;
      case "invoice.paid":
      case "invoice.payment_succeeded":
        console.log("Invoice paid:", event.data.object.id);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  console.log("Checkout completed:", session.id, "mode:", session.mode);
  if (session.mode !== "subscription" || !session.subscription) return;
  const userId = session.metadata?.userId;
  if (!userId) return;
  // Garante o vínculo user <-> subscription mesmo se o evento de subscription
  // chegar antes/sem metadata.
  await supabase
    .from("subscriptions")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", session.subscription)
    .eq("environment", env);
}

function planTierFrom(priceId: string | null, nickname?: string | null): "basico" | "premium" | null {
  const hay = `${priceId ?? ""} ${nickname ?? ""}`.toLowerCase();
  if (hay.includes("premium")) return "premium";
  if (hay.includes("basico") || hay.includes("básico") || hay.includes("basic")) return "basico";
  return null;
}

function priceInfo(subscription: any) {
  const item = subscription.items?.data?.[0];
  const price = item?.price;
  const priceId = price?.metadata?.lovable_external_id || price?.lookup_key || price?.id || null;
  return {
    priceId,
    productId: price?.product ?? null,
    planTier: planTierFrom(priceId, price?.nickname),
  };
}

async function resolveUserId(subscription: any, env: StripeEnv): Promise<string | null> {
  if (subscription.metadata?.userId) return subscription.metadata.userId;
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", subscription.customer)
    .eq("environment", env)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function handleSubscriptionCreated(subscription: any, env: StripeEnv) {
  const userId = await resolveUserId(subscription, env);
  if (!userId) {
    console.error("No userId resolved for subscription", subscription.id);
    return;
  }

  const { priceId, productId, planTier } = priceInfo(subscription);

  const periodStart = subscription.current_period_start;
  const periodEnd = subscription.current_period_end ?? subscription.trial_end;

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      ...(planTier && { plan_tier: planTier }),
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
}

async function handleSubscriptionUpdated(subscription: any, env: StripeEnv) {
  const { priceId, productId, planTier } = priceInfo(subscription);

  const periodStart = subscription.current_period_start;
  const periodEnd = subscription.current_period_end ?? subscription.trial_end;

  const { data: updated } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.status,
      product_id: productId,
      price_id: priceId,
      ...(planTier && { plan_tier: planTier }),
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env)
    .select("id");

  // Assinatura desconhecida (ex.: criada fora do app): cria a linha.
  if (!updated || updated.length === 0) {
    await handleSubscriptionCreated(subscription, env);
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: false,
      current_period_end: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

async function handlePaymentFailed(invoice: any, env: StripeEnv) {
  if (!invoice.subscription) return;
  await supabase
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", invoice.subscription)
    .eq("environment", env);
}
