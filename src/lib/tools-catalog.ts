import { Compass, Calculator, ClipboardList, FileSpreadsheet, Wallet, LineChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToolMeta {
  to:
    | "/herramientas/dre"
    | "/herramientas/punto-equilibrio"
    | "/herramientas/fichas-tecnicas"
    | "/herramientas/dre-mensual"
    | "/herramientas/control-caja"
    | "/herramientas/monitor-cmv";
  name: string;
  description: string;
  icon: LucideIcon;
  status: string;
}

export const TOOLS: ToolMeta[] = [
  {
    to: "/herramientas/dre",
    name: "DRE",
    description:
      "¿Dónde está tu restaurante hoy? Hacelo al entrar y repetilo cada trimestre.",
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
  },
  {
    to: "/herramientas/dre-mensual",
    name: "DRE Mensual",
    description:
      "Armá el resultado del mes línea por línea y mirá tus márgenes reales.",
    icon: FileSpreadsheet,
    status: "Disponible",
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
