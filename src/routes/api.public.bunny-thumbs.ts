import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const BodySchema = z.union([
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("probe"), guid: z.string().min(1).max(200) }),
  z.object({
    action: z.literal("set"),
    guid: z.string().min(1).max(200),
    thumbnailUrl: z.string().url().max(2000),
  }),
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/bunny-thumbs")({
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
          const { data: isAdmin } = await supabaseUser.rpc("has_role", {
            _user_id: userId,
            _role: "admin",
          });
          if (!isAdmin) return json({ error: "Forbidden" }, 403);

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: apiKeyData } = await supabaseAdmin.rpc("get_app_secret", {
            _key: "bunny_api_key",
          } as never);
          const apiKey = (apiKeyData as string | null)?.trim();
          if (!apiKey) return json({ error: "Falta la Bunny API Key" }, 400);

          const { data: settings } = await supabaseAdmin
            .from("app_settings")
            .select("value")
            .eq("key", "bunny_library_id")
            .maybeSingle();
          const libraryId = ((settings?.value as string | null) ?? "").trim();
          if (!libraryId) return json({ error: "Falta el Bunny Library ID" }, 400);

          if (body.action === "probe") {
            const res = await fetch(
              `https://video.bunnycdn.com/library/${encodeURIComponent(libraryId)}/videos/${encodeURIComponent(body.guid)}`,
              { headers: { AccessKey: apiKey, accept: "application/json" } },
            );
            return json({ status: res.status, video: await res.json() });
          }

          if (body.action === "set") {
            const url = `https://video.bunnycdn.com/library/${encodeURIComponent(libraryId)}/videos/${encodeURIComponent(body.guid)}/thumbnail?thumbnailUrl=${encodeURIComponent(body.thumbnailUrl)}`;
            const res = await fetch(url, {
              method: "POST",
              headers: { AccessKey: apiKey, accept: "application/json" },
            });
            const text = await res.text();
            return json({ ok: res.ok, status: res.status, body: text.slice(0, 500) }, res.ok ? 200 : 502);
          }

          // action === "list"
          const { data: lessonRows, error } = await supabaseAdmin
            .from("lessons")
            .select("id, title, sort_order, bunny_video_id, courses(title, status, sort_order)")
            .order("sort_order", { ascending: true });
          if (error) return json({ error: error.message }, 500);

          const lessons = (lessonRows ?? [])
            .filter((r: any) => r.bunny_video_id && r.courses && r.courses.status !== "archived")
            .map((r: any) => ({
              lessonId: r.id,
              title: r.title,
              course_title: r.courses?.title ?? "",
              course_order: r.courses?.sort_order ?? 0,
              sort_order: r.sort_order,
              guid: r.bunny_video_id as string,
            }));

          return json({ libraryId, lessons });
        } catch (e) {
          console.error("bunny-thumbs failed", e);
          return json({ error: e instanceof Error ? e.message : "Error inesperado" }, 500);
        }
      },
    },
  },
});
