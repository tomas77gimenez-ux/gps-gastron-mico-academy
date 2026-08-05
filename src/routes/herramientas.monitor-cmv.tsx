import { createFileRoute } from "@tanstack/react-router";
import { LineChart } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { CmvMonitorTool } from "@/components/tools/CmvMonitorTool";

export const Route = createFileRoute("/herramientas/monitor-cmv")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Monitor de CMV — GPS Gastronômico" },
      { name: "description", content: "Seguimiento semanal del costo de mercadería vendida con alertas de desvío." },
      { property: "og:title", content: "Monitor de CMV — GPS Gastronômico" },
      { property: "og:description", content: "Controlá tu CMV semana a semana y detectá el dinero que se escapa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function Page() {
  return (
    <ToolPage
      title="Monitor de CMV"
      subtitle="Semana a semana: compras vs ventas, desvío contra tu meta y el impacto en dinero."
      icon={LineChart}
    >
      <CmvMonitorTool />
    </ToolPage>
  );
}
