import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SITE = "https://plataforma-test1.lovable.app";

const STATIC_ROUTES = [
  "/",
  "/cursos",
  "/planes",
  "/tienda",
  "/login",
  "/registro",
  "/forgot-password",
  "/terminos",
  "/privacidad",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date().toISOString();
        const urls: { loc: string; lastmod?: string }[] = STATIC_ROUTES.map((p) => ({
          loc: `${SITE}${p}`,
          lastmod: now,
        }));

        try {
          const { data: courses } = await supabase
            .from("courses")
            .select("id, updated_at");
          if (courses) {
            for (const c of courses) {
              urls.push({
                loc: `${SITE}/cursos/${c.id}`,
                lastmod: (c as { updated_at?: string }).updated_at ?? now,
              });
            }
          }
        } catch {
          // ignore — still serve static portion
        }

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls
            .map(
              (u) =>
                `  <url><loc>${u.loc}</loc>${
                  u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""
                }</url>`
            )
            .join("\n") +
          `\n</urlset>\n`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});