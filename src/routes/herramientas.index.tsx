import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { ToolsFooterNote } from "@/components/tools/ToolUI";

export const Route = createFileRoute("/herramientas/")({
  component: ToolsIndexPage,
  head: () => ({
    meta: [
      { title: "Caja de Herramientas — GPS Gastronômico" },
      {
        name: "description",
        content:
          "Herramientas de gestión para restaurantes: punto de equilibrio, fichas técnicas, DRE mensual, control de caja y monitor de CMV.",
      },
      { property: "og:title", content: "Caja de Herramientas — GPS Gastronômico" },
      {
        property: "og:description",
        content: "Punto de equilibrio, fichas técnicas, DRE mensual, control de caja y monitor de CMV en un solo lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/herramientas" },
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/herramientas" }],
  }),
});

function ToolsIndexPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Wrench className="w-4 h-4" /> Caja de Herramientas
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display">
            Todo lo que necesitás para <span className="text-gradient-brand">gestionar con números</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Empezá por el DRE para saber dónde estás hoy, y después usá cada herramienta
            para corregir el rumbo con datos reales de tu operación.
          </p>
        </div>

        <ToolsGrid />
        <ToolsFooterNote />
      </div>
    </div>
  );
}
