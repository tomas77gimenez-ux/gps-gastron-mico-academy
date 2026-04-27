import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/material-download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const src = requestUrl.searchParams.get("src");
        const filename = requestUrl.searchParams.get("filename") || "material.pdf";

        if (!src) {
          return new Response("Missing file source", { status: 400 });
        }

        let sourceUrl: URL;

        try {
          sourceUrl = new URL(src);
        } catch {
          return new Response("Invalid file source", { status: 400 });
        }

        if (!sourceUrl.pathname.includes("/storage/v1/object/public/course-content/")) {
          return new Response("Invalid file source", { status: 400 });
        }

        const upstream = await fetch(sourceUrl.toString());

        if (!upstream.ok || !upstream.body) {
          return new Response("File not available", { status: upstream.status || 502 });
        }

        const headers = new Headers();
        headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/pdf");
        headers.set("Content-Disposition", `attachment; filename="${filename.replace(/"/g, "")}"`);
        headers.set("Cache-Control", "private, max-age=300");

        const contentLength = upstream.headers.get("Content-Length");
        if (contentLength) {
          headers.set("Content-Length", contentLength);
        }

        return new Response(upstream.body, {
          status: 200,
          headers,
        });
      },
    },
  },
});