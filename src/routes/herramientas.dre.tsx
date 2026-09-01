import { createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { GpsDiagnosticTool } from "@/components/tools/GpsDiagnosticTool";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/herramientas/dre")({
  component: Page,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("hpage.dre.headTitle") },
        { name: "description", content: t("hpage.dre.headDesc") },
        { property: "og:title", content: t("hpage.dre.headTitle") },
        { property: "og:description", content: t("hpage.dre.ogDesc") },
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
    <ToolPage title={t("hpage.dre.titulo")} subtitle={t("hpage.dre.subtitulo")} icon={Compass}>
      <GpsDiagnosticTool />
    </ToolPage>
  );
}
