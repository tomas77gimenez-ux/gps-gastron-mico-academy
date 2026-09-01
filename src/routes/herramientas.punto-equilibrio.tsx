import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { BreakEvenTool } from "@/components/tools/BreakEvenTool";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/herramientas/punto-equilibrio")({
  component: Page,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("hpage.pe.headTitle") },
        { name: "description", content: t("hpage.pe.headDesc") },
        { property: "og:title", content: t("hpage.pe.headTitle") },
        { property: "og:description", content: t("hpage.pe.ogDesc") },
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
    <ToolPage title={t("hpage.pe.titulo")} subtitle={t("hpage.pe.subtitulo")} icon={Calculator}>
      <BreakEvenTool />
    </ToolPage>
  );
}
