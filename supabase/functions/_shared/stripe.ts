import { encode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

export type StripeEnv = 'sandbox' | 'live';

export function getConnectionApiKey(env: StripeEnv): string {
  const key = env === 'sandbox'
    ? Deno.env.get('STRIPE_SANDBOX_API_KEY')
    : Deno.env.get('STRIPE_LIVE_API_KEY');
  const direct = Deno.env.get('STRIPE_SECRET_KEY');
  const resolved = key || direct;
  if (!resolved) throw new Error(`No Stripe API key configured for ${env}`);
  return resolved;
}

import Stripe from "https://esm.sh/stripe@18.5.0";

const GATEWAY_STRIPE_BASE = 'https://connector-gateway.lovable.dev/stripe';

export function createStripeClient(env: StripeEnv): Stripe {
  const connectionApiKey = getConnectionApiKey(env);
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  const usesGateway = Boolean(
    env === 'sandbox' ? Deno.env.get('STRIPE_SANDBOX_API_KEY') : Deno.env.get('STRIPE_LIVE_API_KEY'),
  );

  // Chave própria (BYOK): fala direto com a API do Stripe.
  if (!usesGateway) {
    return new Stripe(connectionApiKey, { apiVersion: '2025-08-27.basil' });
  }

  if (!lovableApiKey) throw new Error('LOVABLE_API_KEY is not configured');

  return new Stripe(connectionApiKey, {
    httpClient: Stripe.createFetchHttpClient((url: string | URL, init?: RequestInit) => {
      const gatewayUrl = url.toString().replace('https://api.stripe.com', GATEWAY_STRIPE_BASE);
      return fetch(gatewayUrl, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init?.headers).entries()),
          'X-Connection-Api-Key': connectionApiKey,
          'Lovable-API-Key': lovableApiKey,
        },
      });
    }),
  });
}

async function signatureMatches(secret: string, timestamp: string, body: string, v1Signatures: string[]): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${body}`)
  );
  const expected = new TextDecoder().decode(encode(new Uint8Array(signed)));
  return v1Signatures.includes(expected);
}

export async function verifyWebhook(
  req: Request,
  env: StripeEnv,
): Promise<{ id?: string; type: string; livemode?: boolean; data: { object: any } }> {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  const sandboxSecret = Deno.env.get('PAYMENTS_SANDBOX_WEBHOOK_SECRET');
  const liveSecret = Deno.env.get('PAYMENTS_LIVE_WEBHOOK_SECRET');
  const fallbackSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  // El query param solo decide qué secret se prueba primero; si falla,
  // probamos el otro antes de rechazar el evento.
  const preferred = env === 'sandbox' ? sandboxSecret : liveSecret;
  const other = env === 'sandbox' ? liveSecret : sandboxSecret;
  const secrets = [preferred, other, fallbackSecret].filter(
    (s): s is string => typeof s === 'string' && s.length > 0,
  );

  if (!secrets.length) {
    throw new Error('Webhook secret environment variable is not configured');
  }

  if (!signature || !body) {
    throw new Error("Missing signature or body");
  }

  let timestamp: string | undefined;
  const v1Signatures: string[] = [];
  for (const part of signature.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = value;
    if (key === "v1") v1Signatures.push(value);
  }

  if (!timestamp || v1Signatures.length === 0) {
    throw new Error("Invalid signature format");
  }

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) {
    throw new Error("Webhook timestamp too old");
  }

  let verified = false;
  for (const secret of secrets) {
    if (await signatureMatches(secret, timestamp, body, v1Signatures)) {
      verified = true;
      break;
    }
  }

  if (!verified) {
    throw new Error("Invalid webhook signature");
  }

  return JSON.parse(body);
}

