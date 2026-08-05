import { createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { GpsDiagnosticTool } from "@/components/tools/GpsDiagnosticTool";

export const Route = createFileRoute("/herramientas/dre")({
  component: Page,
  head: () => ({
    meta: [
      { title: "DRE — GPS Gastronômico" },
      { name: "description", content: "Diagnóstico DRE de tu restaurante: dónde estás hoy y qué palanca mover primero." },
      { property: "og:title", content: "DRE — GPS Gastronômico" },
      { property: "og:description", content: "Diagnóstico financiero en tiempo real de tu restaurante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function Page() {
  return (
    <ToolPage
      title="DRE"
      subtitle="El punto de partida: dónde está tu restaurante hoy. Hacelo al entrar y repetilo cada trimestre."
      icon={Compass}
    >
      <GpsDiagnosticTool />
    </ToolPage>
  );
}
