import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardCheck, Download, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import type { GdFile, GerenteDigital } from "@/lib/gerentes-digitales";

export const Route = createFileRoute("/gerente-digital/$id")({
  component: GerenteDigitalPage,
  head: () => ({
    meta: [
      { title: "Gerente Digital — GPS Gastronômico" },
      {
        name: "description",
        content: "Accedé a los checklists de auditoría operativa de tu Gerente Digital.",
      },
      { property: "og:title", content: "Gerente Digital — GPS Gastronômico" },
      {
        property: "og:description",
        content: "Accedé a los checklists de auditoría operativa de tu Gerente Digital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function GerenteDigitalPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<GerenteDigital | null>(null);
  const [files, setFiles] = useState<GdFile[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const { data: prod } = await supabase
        .from("gerentes_digitales")
        .select("id, slug, name, description, price_cents, stripe_price_id, active, sort_order")
        .eq("id", id)
        .maybeSingle();

      let access = false;
      if (userId) {
        const { data } = await supabase.rpc("has_gd_access", { _user_id: userId, _gd_id: id });
        access = !!data;
      }

      const { data: fileRows } = access
        ? await supabase
            .from("gd_files")
            .select("id, gd_id, title, file_url, file_type, file_size, sort_order")
            .eq("gd_id", id)
            .order("sort_order", { ascending: true })
        : { data: [] as GdFile[] };

      if (cancelled) return;
      setProduct((prod as GerenteDigital) ?? null);
      setHasAccess(access);
      setFiles((fileRows as GdFile[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function download(file: GdFile) {
    setDownloading(file.id);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error("Sesión expirada");
      const res = await fetch(`/api/public/gd-download?file_id=${encodeURIComponent(file.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.title}.${file.file_type || "bin"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error((e as Error).message || "No se pudo descargar el archivo");
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 text-center text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Cargando...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center">
        <p className="text-muted-foreground">{t("gd.bloqueado")}</p>
        <Button asChild className="mt-4 rounded-xl">
          <Link to="/tienda">{t("gd.verTienda")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <ClipboardCheck className="w-6 h-6 text-primary-text" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">{product.name}</h1>
          {product.description && (
            <p className="text-muted-foreground mt-3">{product.description}</p>
          )}
        </div>

        {!hasAccess ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
            <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("gd.bloqueado")}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <Button asChild className="rounded-xl">
                <Link to="/tienda">{t("gd.verTienda")}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/login">{t("nav.iniciarSesion")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">{t("gd.archivos")}</h2>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-xl border border-border bg-card p-6">
                {t("gd.sinArchivos")}
              </p>
            ) : (
              <ul className="space-y-3">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{file.title}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {file.file_type}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xl shrink-0"
                      onClick={() => download(file)}
                      disabled={downloading === file.id}
                    >
                      {downloading === file.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1.5" />
                          {t("gd.descargar")}
                        </>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}