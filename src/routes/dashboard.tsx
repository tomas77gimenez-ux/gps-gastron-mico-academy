import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DREQuestionnaire } from "@/components/DREQuestionnaire";
import { DashboardResults } from "@/components/DashboardResults";
import { calculateDRE, type DREData, type DREResults } from "@/lib/dre-questions";
import { LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — GPS Gastronômico" },
      { name: "description", content: "Analiza la salud financiera de tu restaurante con el DRE interactivo." },
    ],
  }),
});

function DashboardPage() {
  const [results, setResults] = useState<DREResults | null>(null);
  const [formData, setFormData] = useState<DREData | null>(null);

  function handleComplete(data: DREData) {
    setFormData(data);
    setResults(calculateDRE(data));
  }

  function handleReset() {
    setResults(null);
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {!results ? (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Financiero
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display">
                Diagnóstico de tu <span className="text-gradient-brand">Restaurante</span>
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Completa el cuestionario con los datos financieros de tu operación y obtén un análisis detallado con indicadores clave.
              </p>
            </div>
            <DREQuestionnaire onComplete={handleComplete} />
          </>
        ) : (
          <DashboardResults results={results} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
