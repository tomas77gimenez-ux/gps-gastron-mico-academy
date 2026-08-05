import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { ToolPage } from "@/components/tools/ToolUI";
import { CashControlTool } from "@/components/tools/CashControlTool";

export const Route = createFileRoute("/herramientas/control-caja")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Control de Caja Diario — GPS Gastronômico" },
      { name: "description", content: "Apertura, entradas, salidas y conciliación de la caja diaria de tu restaurante." },
      { property: "og:title", content: "Control de Caja Diario — GPS Gastronômico" },
      { property: "og:description", content: "Registrá los movimientos del día y conciliá con el conteo físico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function Page() {
  return (
    <ToolPage
      title="Control de Caja Diario"
      subtitle="Abrí la caja, registrá cada entrada y salida, y conciliá con el conteo físico al cierre."
      icon={Wallet}
    >
      <CashControlTool />
    </ToolPage>
  );
}
