import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { ToolsFooterNote } from "@/components/tools/ToolUI";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/herramientas/")({
  component: ToolsIndexPage,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("hpage.index.headTitle") },
        { name: "description", content: t("hpage.index.headDesc") },
        { property: "og:title", content: t("hpage.index.headTitle") },
        { property: "og:description", content: t("hpage.index.ogDesc") },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: "https://plataforma-test1.lovable.app/herramientas" },
      ],
      links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/herramientas" }],
    };
  },
});

function ToolsIndexPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary-text text-sm font-medium mb-4">
            <Wrench className="w-4 h-4" /> {t("hpage.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">
            {t("hpage.tituloPre")}
            <span className="text-gradient-brand">{t("hpage.tituloGradient")}</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{t("hpage.desc")}</p>
        </div>

        <ToolsGrid />
        <ToolsFooterNote />
      </div>
    </div>
  );
}
