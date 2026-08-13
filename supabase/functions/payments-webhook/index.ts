import { createClient } from "npm:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const APP_URL = "https://plataforma-test1.lovable.app";

function planName(planTier: string | null | undefined) {
  if (planTier === "elite") return "Academy Élite";
  if (planTier === "premium") return "Academy Pro";
  if (planTier === "basico") return "Academy";
  return "tu suscripción";
}

function formatDate(seconds?: number | null) {
  if (!seconds) return undefined;
  return new Date(seconds * 1000).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAmount(cents?: number | null, currency?: string | null) {
  if (cents === undefined || cents === null) return undefined;
  return `${(currency || "usd").toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

function intervalLabel(price: any): string {
  const interval = price?.recurring?.interval;
  const count = price?.recurring?.interval_count ?? 1;
  if (interval === "year") return count > 1 ? `cada ${count} años` : "anual";
  if (interval === "month") return count > 1 ? `cada ${count} meses` : "mensual";
  if (interval === "week") return "semanal";
  if (interval === "day") return "diaria";
  return "mensual";
}

/** Resolves the account email for a Stripe customer via our own subscriptions table. */
async function emailForCustomer(customerId: string, env: StripeEnv): Promise<string | null> {
  const { data: row } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .eq("environment", env)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row?.user_id) return null;
  const { data } = await supabase.auth.admin.getUserById(row.user_id);
  return data?.user?.email ?? null;
}

async function planTierForCustomer(customerId: string, env: StripeEnv): Promise<string | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan_tier")
    .eq("stripe_customer_id", customerId)
    .eq("environment", env)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.plan_tier ?? null;
}

/** Fire-and-forget lifecycle email through the app's transactional email route. */
async function sendLifecycleEmail(
  templateName: string,
  recipientEmail: string,
  idempotencyKey: string,
  templateData: Record<string, unknown>
) {
  const internalToken =
    Deno.env.get("INTERNAL_EMAIL_TOKEN") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  try {
    const res = await fetch(`${APP_URL}/lovable/email/transactional/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${internalToken}`,
      },
      body: JSON.stringify({ templateName, recipientEmail, idempotencyKey, templateData }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Lifecycle email failed", templateName, res.status, body);
      // Fire-and-forget audit row; never block the caller.
      supabase
        .from("email_send_log")
        .insert({
          message_id: crypto.randomUUID(),
          template_name: templateName,
          recipient_email: recipientEmail,
          status: "failed",
          error_message: `webhook POST ${res.status}: ${body.slice(0, 500)}`,
        })
        .then(({ error }) => {
          if (error) console.error("email_send_log insert failed", error.message);
        });
    } else {
      console.log("Lifecycle email queued", templateName);
    }
  } catch (e) {
    console.error("Lifecycle email error", templateName, e);
    supabase
      .from("email_send_log")
      .insert({
        message_id: crypto.randomUUID(),
        template_name: templateName,
        recipient_email: recipientEmail,
        status: "failed",
        error_message: `webhook POST threw: ${String(e).slice(0, 500)}`,
      })
      .then(({ error }) => {
        if (error) console.error("email_send_log insert failed", error.message);
      });
  }
}

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
        await handleTrialWillEnd(event.data.object, env, event.id);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env, event.id);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, env, event.id);
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
  if (session.mode === "payment") {
    await handleOneTimePurchase(session, env);
    return;
  }
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

/**
 * Compra única: entrega los Gerentes Digitales comprados (entitlement + email).
 * El acceso se guarda por user_id cuando hay sesión, o por email para que se
 * reclame automáticamente al crear la cuenta con ese mismo correo.
 */
async function handleOneTimePurchase(session: any, env: StripeEnv) {
  if (session.payment_status !== "paid") {
    console.log("One-time checkout not paid yet:", session.id, session.payment_status);
    return;
  }

  const stripe = createStripeClient(env);
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 20,
    expand: ["data.price"],
  });

  const lookupKeys = lineItems.data
    .map((item: any) => item.price?.lookup_key)
    .filter((k: unknown): k is string => typeof k === "string" && k.length > 0);
  if (!lookupKeys.length) return;

  const { data: products } = await supabase
    .from("gerentes_digitales")
    .select("id, slug, name, stripe_price_id")
    .in("stripe_price_id", lookupKeys);
  if (!products?.length) {
    console.log("No Gerente Digital matched for", lookupKeys.join(","));
    return;
  }

  const userId: string | null = session.metadata?.userId ?? null;
  const email: string | null =
    session.customer_details?.email ?? session.customer_email ?? null;

  for (const product of products) {
    let existing = supabase
      .from("gd_entitlements")
      .select("id")
      .eq("gd_id", product.id)
      .limit(1);
    existing = userId ? existing.eq("user_id", userId) : existing.ilike("email", email ?? "");
    const { data: already } = await existing.maybeSingle();

    if (!already) {
      const { error } = await supabase.from("gd_entitlements").insert({
        gd_id: product.id,
        user_id: userId,
        email: email,
        granted_via: "purchase",
        stripe_session_id: session.id,
      });
      if (error) console.error("Entitlement insert failed", product.slug, error.message);
    }

    if (email) {
      await sendLifecycleEmail("gd-access", email, `gd-access-${session.id}-${product.id}`, {
        productName: product.name,
        hasAccount: !!userId,
        ctaUrl: `${APP_URL}/gerente-digital/${product.id}`,
        signupUrl: `${APP_URL}/registro`,
        email,
      });
    }
  }
}

function planTierFrom(priceId: string | null, nickname?: string | null): "basico" | "premium" | "elite" | null {
  const hay = `${priceId ?? ""} ${nickname ?? ""}`.toLowerCase();
  if (hay.includes("elite") || hay.includes("élite")) return "elite";
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

async function handleTrialWillEnd(subscription: any, env: StripeEnv, eventId: string) {
  const { planTier } = priceInfo(subscription);
  const email = await emailForCustomer(subscription.customer, env);
  if (!email) {
    console.log("trial_will_end: no email for customer", subscription.customer);
    return;
  }
  const item = subscription.items?.data?.[0];
  await sendLifecycleEmail("trial-ending", email, `trial-ending-${eventId}`, {
    planName: planName(planTier ?? (await planTierForCustomer(subscription.customer, env))),
    amount: formatAmount(item?.price?.unit_amount, item?.price?.currency),
    trialEndDate: formatDate(subscription.trial_end),
    ctaUrl: `${APP_URL}/perfil`,
  });
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv, eventId: string) {
  const tier = await planTierForCustomer(subscription.customer, env);
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

  const email = await emailForCustomer(subscription.customer, env);
  if (!email) return;
  await sendLifecycleEmail("subscription-canceled", email, `sub-canceled-${eventId}`, {
    planName: planName(tier),
    accessUntil: formatDate(subscription.current_period_end),
    ctaUrl: `${APP_URL}/planes`,
  });
}

async function handlePaymentFailed(invoice: any, env: StripeEnv, eventId: string) {
  if (!invoice.subscription) return;
  await supabase
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", invoice.subscription)
    .eq("environment", env);

  const email = invoice.customer_email || (await emailForCustomer(invoice.customer, env));
  if (!email) return;
  await sendLifecycleEmail("payment-failed", email, `payment-failed-${eventId}`, {
    planName: planName(await planTierForCustomer(invoice.customer, env)),
    amount: formatAmount(invoice.amount_due, invoice.currency),
    ctaUrl: `${APP_URL}/perfil`,
  });
}
