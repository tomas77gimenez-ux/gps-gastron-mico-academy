import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { CmvMonitorTool } from "@/components/tools/CmvMonitorTool";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/herramientas/monitor-cmv")({
  component: Page,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("hpage.cmv.headTitle") },
        { name: "description", content: t("hpage.cmv.headDesc") },
        { property: "og:title", content: t("hpage.cmv.headTitle") },
        { property: "og:description", content: t("hpage.cmv.ogDesc") },
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
    <ToolPage title={t("hpage.cmv.titulo")} subtitle={t("hpage.cmv.subtitulo")} icon={LineChart}>
      <CmvMonitorTool />
    </ToolPage>
  );
}
