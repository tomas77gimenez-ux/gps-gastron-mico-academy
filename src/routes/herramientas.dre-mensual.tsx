import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { MonthlyDreTool } from "@/components/tools/MonthlyDreTool";

export const Route = createFileRoute("/herramientas/dre-mensual")({
  component: Page,
  head: () => ({
    meta: [
      { title: "DRE Mensual — GPS Gastronômico" },
      { name: "description", content: "Armá el resultado del mes de tu restaurante línea por línea y comparalo con las metas del método GPS." },
      { property: "og:title", content: "DRE Mensual — GPS Gastronômico" },
      { property: "og:description", content: "Ventas, CMV, gastos por categoría y márgenes reales del mes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function Page() {
  return (
    <ToolPage
      title="DRE Mensual"
      subtitle="El resultado del mes, línea por línea: ventas, CMV, gastos por categoría y tu margen real."
      icon={FileSpreadsheet}
    >
      <MonthlyDreTool />
    </ToolPage>
  );
}
