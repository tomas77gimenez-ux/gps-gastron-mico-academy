import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { CashControlTool } from "@/components/tools/CashControlTool";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/herramientas/control-caja")({
  component: Page,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("hpage.caja.headTitle") },
        { name: "description", content: t("hpage.caja.headDesc") },
        { property: "og:title", content: t("hpage.caja.headTitle") },
        { property: "og:description", content: t("hpage.caja.ogDesc") },
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
    <ToolPage title={t("hpage.caja.titulo")} subtitle={t("hpage.caja.subtitulo")} icon={Wallet}>
      <CashControlTool />
    </ToolPage>
  );
}
