import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Lock, LogIn, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToolsAccess } from "@/hooks/useToolsAccess";
import { METODO_GPS_NOTE } from "@/lib/tools-catalog";

export function ToolCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export function ToolSectionTitle({ icon: Icon, children, hint }: { icon?: LucideIcon; children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-display font-semibold text-lg flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
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
  primary: "bg-primary/15 text-primary border-primary/30",
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
    primary: "text-primary",
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
  return (
    <ToolCard className="max-w-xl mx-auto text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">Caja de Herramientas</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Las herramientas de gestión están incluidas en cualquier plan activo (Básico o Premium).
        Activá tu suscripción para usarlas con tus datos reales.
      </p>
      <Link
        to="/planes"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-4 h-4" /> Ver planes
      </Link>
    </ToolCard>
  );
}

export function ToolsLoginWall() {
  return (
    <ToolCard className="max-w-xl mx-auto text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
        <LogIn className="w-6 h-6" />
      </div>
      <h2 className="font-display text-xl font-bold mb-2">Iniciá sesión</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Necesitás una cuenta para guardar los datos de tus herramientas.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <LogIn className="w-4 h-4" /> Entrar
      </Link>
    </ToolCard>
  );
}

/** Envoltorio de página: encabezado, control de acceso y nota del método. */
export function ToolPage({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const access = useToolsAccess();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <Link to="/herramientas" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Caja de Herramientas
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold font-display mt-2 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </span>
            {title}
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-2xl">{subtitle}</p>
        </div>

        {access.loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Cargando...
          </div>
        ) : !access.isAuthenticated ? (
          <ToolsLoginWall />
        ) : !access.hasAccess ? (
          <ToolsPaywall />
        ) : (
          children
        )}

        <ToolsFooterNote />
      </div>
    </div>
  );
}
