import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { BreakEvenTool } from "@/components/tools/BreakEvenTool";

export const Route = createFileRoute("/herramientas/punto-equilibrio")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Punto de Equilibrio — GPS Gastronômico" },
      { name: "description", content: "Calculá cuánto necesita vender tu restaurante para cubrir todos sus costos." },
      { property: "og:title", content: "Punto de Equilibrio — GPS Gastronômico" },
      { property: "og:description", content: "Margen de contribución, punto de equilibrio y simulador de escenarios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function Page() {
  return (
    <ToolPage
      title="Calculadora de Punto de Equilibrio"
      subtitle="Cuánto tenés que facturar para no perder plata. Cargá tus costos fijos, tu CMV y tu ticket medio."
      icon={Calculator}
    >
      <BreakEvenTool />
    </ToolPage>
  );
}
