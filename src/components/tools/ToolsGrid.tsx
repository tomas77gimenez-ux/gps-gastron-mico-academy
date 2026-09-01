import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { TOOLS } from "@/lib/tools-catalog";
import { useToolsAccess } from "@/hooks/useToolsAccess";
import { Pill } from "./ToolUI";
import { useI18n } from "@/lib/i18n";

export function ToolsGrid({ compact = false }: { compact?: boolean }) {
  const access = useToolsAccess();
  const { t } = useI18n();

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "lg:grid-cols-3" : "lg:grid-cols-3"} gap-4`}>
      {TOOLS.map((tool) => (
        <Link
          key={tool.to}
          to={tool.to}
          className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors flex flex-col"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary-text flex items-center justify-center shrink-0">
              <tool.icon className="w-5 h-5" />
            </span>
            <Pill tone={tool.requiresPremium ? "primary" : access.hasAccess ? "success" : "neutral"}>
              {tool.requiresPremium
                ? t("tgrid.soloPremium")
                : access.loading
                  ? "…"
                  : access.hasAccess
                    ? t(tool.statusKey)
                    : t("tgrid.requierePlan")}
            </Pill>
          </div>
          <h3 className="font-display font-semibold mb-1.5">{t(tool.nameKey)}</h3>
          <p className="text-sm text-muted-foreground flex-1">{t(tool.descKey)}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-text">
            {t("tgrid.abrir")} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      ))}
    </div>
  );
}
