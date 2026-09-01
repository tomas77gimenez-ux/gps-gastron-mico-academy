import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Lock, LogIn, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToolsAccess } from "@/hooks/useToolsAccess";
import { useSubscription } from "@/hooks/useSubscription";
import { METODO_GPS_NOTE } from "@/lib/tools-catalog";
import { useI18n } from "@/lib/i18n";

export function ToolCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export function ToolSectionTitle({ icon: Icon, children, hint }: { icon?: LucideIcon; children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-display font-semibold text-lg flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary-text" />}
        {children}
      </h3>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground mt-1">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50";

export function NumberInput({
  value,
  onChange,
  placeholder,
  step = "any",
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  min?: number;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      min={min}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

type Tone = "success" | "warning" | "danger" | "neutral" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  neutral: "bg-secondary text-muted-foreground border-border",
  primary: "bg-primary/15 text-primary-text border-primary/30",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function Callout({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${toneClasses[tone]}`}>{children}</div>
  );
}

const barTone: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
};

export function Bar({ value, tone = "primary" }: { value: number; tone?: Tone }) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${barTone[tone]}`} style={{ width: `${w}%` }} />
    </div>
  );
}

export function HealthBar({
  label,
  value,
  tone,
  reference,
}: {
  label: string;
  value: number;
  tone: Tone;
  reference: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-medium">{label}</span>
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">{reference}</span>
          <span className="font-semibold">{value.toFixed(1)}%</span>
        </span>
      </div>
      <Bar value={Math.min(100, Math.abs(value) * 2)} tone={tone} />
    </div>
  );
}

export function KPI({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  const wrap: Record<Tone, string> = {
    primary: "border-primary/30 bg-primary/5",
    success: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    danger: "border-destructive/30 bg-destructive/5",
    neutral: "border-border bg-card",
  };
  const ic: Record<Tone, string> = {
    primary: "text-primary-text",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    neutral: "text-muted-foreground",
  };
  return (
    <div className={`rounded-xl border p-5 ${wrap[tone]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {Icon && <Icon className={`w-5 h-5 ${ic[tone]}`} />}
      </div>
      <p className="text-2xl font-bold font-display">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function ToolsFooterNote() {
  return (
    <p className="text-center text-xs text-muted-foreground mt-12 tracking-wide">{METODO_GPS_NOTE}</p>
  );
}

export function ToolsPaywall() {
  const { t } = useI18n();
  return (
    <ToolCard className="max-w-xl mx-auto text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary-text flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">{t("tool.paywall.titulo")}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t("tool.paywall.desc")}</p>
      <Link
        to="/planes"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-4 h-4" /> {t("tool.paywall.verPlanes")}
      </Link>
    </ToolCard>
  );
}

export function ToolsLoginWall() {
  const { t } = useI18n();
  return (
    <ToolCard className="max-w-xl mx-auto text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary-text flex items-center justify-center mx-auto mb-4">
        <LogIn className="w-6 h-6" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">{t("tool.login.titulo")}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t("tool.login.desc")}</p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <LogIn className="w-4 h-4" /> {t("tool.login.entrar")}
      </Link>
    </ToolCard>
  );
}

export function PremiumPaywall() {
  const { t } = useI18n();
  return (
    <ToolCard className="max-w-xl mx-auto text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary-text flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">{t("tool.premium.titulo")}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t("tool.premium.desc")}</p>
      <Link
        to="/planes"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-4 h-4" /> {t("tool.premium.cta")}
      </Link>
    </ToolCard>
  );
}

/** Envoltorio de página: encabezado, control de acceso y nota del método. */
export function ToolPage({
  title,
  subtitle,
  icon: Icon,
  requiresPremium = false,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  requiresPremium?: boolean;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const access = useToolsAccess();
  const subscription = useSubscription();
  const premiumBlocked = requiresPremium && !subscription.loading && subscription.planTier !== "premium";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <Link to="/herramientas" className="text-xs text-muted-foreground hover:text-primary-text transition-colors">
            {t("tool.volverCaja")}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold font-display mt-2 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary-text flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </span>
            {title}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">{subtitle}</p>
        </div>

        {access.loading || (requiresPremium && subscription.loading) ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {t("tool.cargando")}
          </div>
        ) : !access.isAuthenticated ? (
          <ToolsLoginWall />
        ) : !access.hasAccess ? (
          <ToolsPaywall />
        ) : premiumBlocked ? (
          <PremiumPaywall />
        ) : (
          children
        )}

        <ToolsFooterNote />
      </div>
    </div>
  );
}
