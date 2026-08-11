import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { matchVideos, type BunnyVideo, type LessonRef } from "@/lib/bunny-match";

const BodySchema = z.union([
  z.object({ action: z.literal("status") }),
  z.object({ action: z.literal("set_key"), apiKey: z.string().min(8).max(500) }),
  z.object({ action: z.literal("set_token_key"), tokenKey: z.string().min(8).max(500) }),
  z.object({ action: z.literal("sync") }),
  z.object({
    action: z.literal("save"),
    pairs: z
      .array(
        z.object({
          lessonId: z.string().uuid(),
          slot: z.union([z.literal(1), z.literal(2)]),
          guid: z.string().min(1).max(200),
        }),
      )
      .max(300),
  }),
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/bunny-sync")({
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

        // User-scoped client — verifies the caller is a real admin.
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

        if (body.action === "set_key") {
          const { error } = await supabaseAdmin.rpc("set_app_secret", {
            _key: "bunny_api_key",
            _value: body.apiKey.trim(),
          } as never);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true, hasKey: true });
        }

        if (body.action === "set_token_key") {
          const { error } = await supabaseAdmin.rpc("set_app_secret", {
            _key: "bunny_token_auth_key",
            _value: body.tokenKey.trim(),
          } as never);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true, hasTokenKey: true });
        }

        if (body.action === "status") {
          const { data } = await supabaseAdmin.rpc("get_app_secret", {
            _key: "bunny_api_key",
          } as never);
          const { data: tokenData } = await supabaseAdmin.rpc("get_app_secret", {
            _key: "bunny_token_auth_key",
          } as never);
          return json({
            hasKey: !!(data as string | null),
            hasTokenKey: !!(tokenData as string | null),
          });
        }

        if (body.action === "save") {
          for (const pair of body.pairs) {
            const column = pair.slot === 2 ? "bunny_video_id_2" : "bunny_video_id";
            const { error } = await supabaseAdmin
              .from("lessons")
              .update({ [column]: pair.guid } as never)
              .eq("id", pair.lessonId);
            if (error) return json({ error: error.message }, 500);
          }
          return json({ ok: true, saved: body.pairs.length });
        }

        // action === "sync"
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

        const videos: BunnyVideo[] = [];
        let page = 1;
        // Paginate defensively (max 20 pages of 100).
        while (page <= 20) {
          const res = await fetch(
            `https://video.bunnycdn.com/library/${encodeURIComponent(libraryId)}/videos?page=${page}&itemsPerPage=100`,
            { headers: { AccessKey: apiKey, accept: "application/json" } },
          );
          if (!res.ok) {
            return json({ error: `Bunny respondió ${res.status}` }, 502);
          }
          const payload = (await res.json()) as {
            items?: { guid?: string; title?: string }[];
            totalItems?: number;
          };
          const items = payload.items ?? [];
          for (const item of items) {
            if (item.guid) videos.push({ guid: item.guid, title: item.title ?? "" });
          }
          if (items.length < 100) break;
          page += 1;
        }

        const { data: lessonRows, error: lessonsError } = await supabaseAdmin
          .from("lessons")
          .select("id, title, sort_order, bunny_video_id, bunny_video_id_2, courses(title, status)")
          .order("sort_order", { ascending: true });
        if (lessonsError) return json({ error: lessonsError.message }, 500);

        const lessons: LessonRef[] = (lessonRows ?? [])
          .filter((row: any) => row.courses && row.courses.status !== "archived")
          .map((row: any) => ({
            id: row.id,
            title: row.title,
            course_title: row.courses?.title ?? "",
            sort_order: row.sort_order,
            bunny_video_id: row.bunny_video_id,
            bunny_video_id_2: row.bunny_video_id_2,
          }));

        const result = matchVideos(videos, lessons);

        // Auto-persist confident matches so players work right away.
        for (const pair of result.matched) {
          const column = pair.slot === 2 ? "bunny_video_id_2" : "bunny_video_id";
          await supabaseAdmin
            .from("lessons")
            .update({ [column]: pair.guid } as never)
            .eq("id", pair.lessonId);
        }

        return json({
          libraryId,
          totalVideos: videos.length,
          ...result,
          lessons: lessons.map((l) => ({ id: l.id, title: l.title, course_title: l.course_title })),
        });
       } catch (e) {
         console.error("bunny-sync failed", e);
         return json({ error: e instanceof Error ? e.message : "Error inesperado" }, 500);
       }
      },
    },
  },
});