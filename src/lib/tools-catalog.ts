import { Compass, Calculator, ClipboardList, Wallet, LineChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToolMeta {
  to:
    | "/herramientas/dre"
    | "/herramientas/punto-equilibrio"
    | "/herramientas/fichas-tecnicas"
    | "/herramientas/control-caja"
    | "/herramientas/monitor-cmv";
  name: string;
  description: string;
  icon: LucideIcon;
  status: string;
  requiresPremium?: boolean;
}

export const TOOLS: ToolMeta[] = [
  {
    to: "/herramientas/dre",
    name: "DRE",
    description:
      "El resultado de tu restaurante en tiempo real, mensual línea por línea o por trimestre/semestre/año.",
    icon: Compass,
    status: "Punto de partida",
  },
  {
    to: "/herramientas/punto-equilibrio",
    name: "Calculadora de Punto de Equilibrio",
    description:
      "Cuánto tenés que vender para no perder plata, y qué pasa si subís el ticket.",
    icon: Calculator,
    status: "Disponible",
  },
  {
    to: "/herramientas/fichas-tecnicas",
    name: "SUP",
    description:
      "Banco de ingredientes con costo real y precio sugerido por plato según tu CMV objetivo.",
    icon: ClipboardList,
    status: "Disponible",
    requiresPremium: true,
  },
  {
    to: "/herramientas/control-caja",
    name: "Control de Caja Diario",
    description:
      "Apertura, entradas, salidas y conciliación con el conteo físico del día.",
    icon: Wallet,
    status: "Disponible",
  },
  {
    to: "/herramientas/monitor-cmv",
    name: "Monitor de CMV",
    description:
      "Seguimiento semanal del costo de mercadería con alerta del dinero que se escapa.",
    icon: LineChart,
    status: "Disponible",
  },
];

export const METODO_GPS_NOTE = "Método GPS · Gestión — Procesos — Sostenibilidad";
