import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const BodySchema = z.object({ lessonId: z.string().uuid() });

const BUNNY_TOKEN_KEY_SECRET = "bunny_token_auth_key";
const EXPIRY_SECONDS = 6 * 60 * 60; // 6 horas

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

function baseEmbed(libraryId: string, guid: string) {
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`;
}

export const Route = createFileRoute("/api/public/lesson-embed")({
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

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: lesson } = await supabaseAdmin
            .from("lessons")
            .select("id, is_free, required_plan, bunny_video_id, bunny_video_id_2")
            .eq("id", body.lessonId)
            .maybeSingle();
          if (!lesson) return json({ error: "Not found" }, 404);

          // Autorización server-side: lección gratuita, admin, free-grant o
          // suscripción vigente con el plan requerido (has_plan_access).
          let authorized = !!lesson.is_free;
          if (!authorized) {
            const { data: allowed } = await supabaseUser.rpc("has_plan_access", {
              _user_id: userId,
              _required: (lesson.required_plan ?? "basico") as never,
            } as never);
            authorized = !!allowed;
          }
          if (!authorized) return json({ error: "Forbidden" }, 403);

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

          const guids = [lesson.bunny_video_id, lesson.bunny_video_id_2].filter(
            (v): v is string => !!v && v.trim().length > 0,
          );

          const expires = Math.floor(Date.now() / 1000) + EXPIRY_SECONDS;
          const urls: string[] = [];
          for (const guid of guids) {
            if (tokenKey) {
              const token = await sha256Hex(`${tokenKey}${guid}${expires}`);
              urls.push(
                `${baseEmbed(libraryId, guid)}?token=${token}&expires=${expires}&autoplay=false&preload=true&responsive=true`,
              );
            } else {
              urls.push(`${baseEmbed(libraryId, guid)}?autoplay=false&preload=true&responsive=true`);
            }
          }

          return json({ urls, signed: !!tokenKey, expires: tokenKey ? expires : null });
        } catch (error) {
          console.error("lesson-embed error", error);
          return json({ error: "Server error" }, 500);
        }
      },
    },
  },
});
