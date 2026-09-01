import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import type { DataQualitySignal } from "@/hooks/useMemberDashboard";
import { useI18n, type TranslationKey } from "@/lib/i18n";

export function DataQualityNotice({ signals }: { signals: DataQualitySignal[] }) {
  const { t } = useI18n();
  if (signals.length === 0) return null;
  const shown = signals.slice(0, 3);

  return (
    <div className="rounded-2xl border border-warning/40 bg-warning/10 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" strokeWidth={2} aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-foreground">{t("dq.titulo")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("dq.intro")}</p>
          <ul className="mt-3 space-y-1.5">
            {shown.map((s) => (
              <li key={s.id} className="flex gap-2 text-sm text-foreground/85">
                <span aria-hidden="true" className="text-warning">
                  •
                </span>
                <span>{t(`dq.${s.id}` as TranslationKey).replace("{pct}", String(s.value ?? 0))}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/herramientas/dre-mensual"
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-warning/50 bg-warning/15 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-warning/25"
          >
            {t("dq.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
