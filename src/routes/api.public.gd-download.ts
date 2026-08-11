import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function sanitizeFilename(name: string) {
  return name.replace(/[\r\n"\\]/g, "").slice(0, 200) || "archivo";
}

export const Route = createFileRoute("/api/public/gd-download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const fileId = url.searchParams.get("file_id");
        if (!fileId) return new Response("Missing file_id", { status: 400 });

        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }

        // User-scoped client so RLS on gd_files enforces the entitlement check.
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined as any },
        });

        const { data: file, error } = await supabase
          .from("gd_files")
          .select("id, title, file_url, file_type")
          .eq("id", fileId)
          .maybeSingle();

        if (error) return new Response("Access check failed", { status: 500 });
        if (!file) return new Response("Forbidden", { status: 403 });

        let sourceUrl: URL;
        try {
          sourceUrl = new URL(file.file_url);
        } catch {
          return new Response("Invalid stored file", { status: 500 });
        }
        if (!sourceUrl.pathname.includes("/storage/v1/object/public/course-content/")) {
          return new Response("Invalid stored file", { status: 500 });
        }

        const upstream = await fetch(sourceUrl.toString());
        if (!upstream.ok || !upstream.body) {
          return new Response("File not available", { status: upstream.status || 502 });
        }

        const ext = (file.file_type || "bin").toLowerCase();
        const filename = `${sanitizeFilename(file.title)}.${ext}`;

        const headers = new Headers();
        headers.set(
          "Content-Type",
          upstream.headers.get("Content-Type") || "application/octet-stream",
        );
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Cache-Control", "private, no-store");
        const contentLength = upstream.headers.get("Content-Length");
        if (contentLength) headers.set("Content-Length", contentLength);

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});