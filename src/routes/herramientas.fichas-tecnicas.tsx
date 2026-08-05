import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { RecipeTool } from "@/components/tools/RecipeTool";

export const Route = createFileRoute("/herramientas/fichas-tecnicas")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Fichas Técnicas — GPS Gastronômico" },
      { name: "description", content: "Banco de ingredientes con costo real y fichas técnicas con precio sugerido." },
      { property: "og:title", content: "Fichas Técnicas — GPS Gastronômico" },
      { property: "og:description", content: "Costeá cada plato con rendimiento real y definí tu precio de venta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function Page() {
  return (
    <ToolPage
      title="Fichas Técnicas"
      subtitle="Primero armá tu banco de ingredientes con costo real; después costeá cada plato y definí su precio."
      icon={ClipboardList}
    >
      <RecipeTool />
    </ToolPage>
  );
}
