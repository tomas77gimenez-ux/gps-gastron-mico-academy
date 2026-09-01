import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { RecipeTool } from "@/components/tools/RecipeTool";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/herramientas/fichas-tecnicas")({
  component: Page,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("hpage.sup.headTitle") },
        { name: "description", content: t("hpage.sup.headDesc") },
        { property: "og:title", content: t("hpage.sup.headTitle") },
        { property: "og:description", content: t("hpage.sup.ogDesc") },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex,nofollow" },
      ],
    };
  },
});

function Page() {
  const { t } = useI18n();
  return (
    <ToolPage title={t("hpage.sup.titulo")} subtitle={t("hpage.sup.subtitulo")} icon={ClipboardList}>
      <RecipeTool />
    </ToolPage>
  );
}
