import { Compass, Calculator, ClipboardList, Wallet, LineChart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

export interface ToolMeta {
  to:
    | "/herramientas/dre"
    | "/herramientas/punto-equilibrio"
    | "/herramientas/fichas-tecnicas"
    | "/herramientas/control-caja"
    | "/herramientas/monitor-cmv";
  nameKey: TranslationKey;
  descKey: TranslationKey;
  icon: LucideIcon;
  statusKey: TranslationKey;
  requiresPremium?: boolean;
}

export const TOOLS: ToolMeta[] = [
  {
    to: "/herramientas/dre",
    nameKey: "tgrid.dre.name",
    descKey: "tgrid.dre.desc",
    icon: Compass,
    statusKey: "tgrid.status.puntoPartida",
  },
  {
    to: "/herramientas/punto-equilibrio",
    nameKey: "tgrid.pe.name",
    descKey: "tgrid.pe.desc",
    icon: Calculator,
    statusKey: "tgrid.status.disponible",
  },
  {
    to: "/herramientas/fichas-tecnicas",
    nameKey: "tgrid.sup.name",
    descKey: "tgrid.sup.desc",
    icon: ClipboardList,
    statusKey: "tgrid.status.disponible",
  },
  {
    to: "/herramientas/control-caja",
    nameKey: "tgrid.caja.name",
    descKey: "tgrid.caja.desc",
    icon: Wallet,
    statusKey: "tgrid.status.disponible",
  },
  {
    to: "/herramientas/monitor-cmv",
    nameKey: "tgrid.cmv.name",
    descKey: "tgrid.cmv.desc",
    icon: LineChart,
    statusKey: "tgrid.status.disponible",
  },
];

export const METODO_GPS_NOTE = "Método GPS · Gestión — Procesos — Sostenibilidad";
