import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const BodySchema = z.object({
  kind: z.enum(["recording", "case"]),
  id: z.string().uuid(),
});

const BUNNY_TOKEN_KEY_SECRET = "bunny_token_auth_key";
const EXPIRY_SECONDS = 6 * 60 * 60;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/public/pro-embed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("authorization");
          if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
            return json({ error: "Unauthorized" }, 401);
          }

          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
            return json({ error: "Server misconfigured" }, 500);
          }

          let body: z.infer<typeof BodySchema>;
          try {
            body = BodySchema.parse(await request.json());
          } catch {
            return json({ error: "Invalid request" }, 400);
          }

          const supabaseUser = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined as never },
          });

          const { data: userData } = await supabaseUser.auth.getUser();
          const userId = userData?.user?.id;
          if (!userId) return json({ error: "Unauthorized" }, 401);

          // Gating server-side: sólo miembros Academy Pro / admins / Acceso Pro.
          const { data: allowed } = await supabaseUser.rpc("has_pro_access", {
            _user_id: userId,
          } as never);
          if (!allowed) return json({ error: "Forbidden" }, 403);

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const table = body.kind === "recording" ? "pro_recordings" : "pro_cases";
          const { data: row } = await supabaseAdmin
            .from(table)
            .select("id, bunny_video_id")
            .eq("id", body.id)
            .maybeSingle();
          if (!row) return json({ error: "Not found" }, 404);
          const guid = ((row as { bunny_video_id: string | null }).bunny_video_id ?? "").trim();
          if (!guid) return json({ urls: [], signed: false, expires: null });

          const { data: settings } = await supabaseAdmin
            .from("app_settings")
            .select("value")
            .eq("key", "bunny_library_id")
            .maybeSingle();
          const libraryId = ((settings?.value as string | null) ?? "").trim();
          if (!libraryId) return json({ error: "Falta el Bunny Library ID" }, 400);

          const { data: tokenKeyData } = await supabaseAdmin.rpc("get_app_secret", {
            _key: BUNNY_TOKEN_KEY_SECRET,
          } as never);
          const tokenKey = (tokenKeyData as string | null)?.trim() ?? "";

          const base = `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`;
          const expires = Math.floor(Date.now() / 1000) + EXPIRY_SECONDS;
          const url = tokenKey
            ? `${base}?token=${await sha256Hex(`${tokenKey}${guid}${expires}`)}&expires=${expires}&autoplay=false&preload=true&responsive=true`
            : `${base}?autoplay=false&preload=true&responsive=true`;

          return json({ urls: [url], signed: !!tokenKey, expires: tokenKey ? expires : null });
        } catch (error) {
          console.error("pro-embed error", error);
          return json({ error: "Server error" }, 500);
        }
      },
    },
  },
});
