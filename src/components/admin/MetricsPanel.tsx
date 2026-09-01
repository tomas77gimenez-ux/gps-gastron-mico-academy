import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Users, Crown, Star, DollarSign, Calendar } from "lucide-react";
import type { PlanTier } from "@/lib/admin-types";

interface UserRow {
  user_id: string;
  email: string;
  created_at: string;
  plan_tier: PlanTier | null;
  status: string | null;
  current_period_end: string | null;
  environment: string | null;
  subscription_id: string | null;
  is_admin: boolean;
}

const PRICES: Record<PlanTier, number> = { basico: 57, premium: 87, elite: 167 };

function StatCard({ icon: Icon, label, value, hint, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2">
        <Icon className={`w-4 h-4 ${accent ?? "text-primary-text"}`} /> {label}
      </div>
      <div className="text-2xl font-bold font-display">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function isActive(u: UserRow) {
  if (u.status !== "active" && u.status !== "trialing") return false;
  if (!u.current_period_end) return true;
  return new Date(u.current_period_end).getTime() > Date.now();
}

export function MetricsPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("admin_list_users").then(({ data, error: err }) => {
      if (err) setError(err.message);
      else setUsers((data as UserRow[]) ?? []);
      setLoading(false);
    });
  }, []);

  const metrics = useMemo(() => {
    const now = Date.now();
    const d30 = now - 30 * 24 * 60 * 60 * 1000;
    const d7 = now - 7 * 24 * 60 * 60 * 1000;

    const actives = users.filter(isActive);
    const basico = actives.filter((u) => u.plan_tier === "basico");
    const premium = actives.filter((u) => u.plan_tier === "premium");
    const elite = actives.filter((u) => u.plan_tier === "elite");
    const paying = actives.filter((u) => u.environment !== "manual");
    const manual = actives.filter((u) => u.environment === "manual");

    const mrr = paying.reduce((sum, u) => sum + (u.plan_tier ? PRICES[u.plan_tier] : 0), 0);

    const signups30 = users.filter((u) => new Date(u.created_at).getTime() > d30).length;
    const signups7 = users.filter((u) => new Date(u.created_at).getTime() > d7).length;

    // Last 30 days chart data
    const buckets: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now - i * 24 * 60 * 60 * 1000);
      const iso = day.toISOString().slice(0, 10);
      buckets.push({ date: iso, count: 0 });
    }
    for (const u of users) {
      const iso = new Date(u.created_at).toISOString().slice(0, 10);
      const b = buckets.find((x) => x.date === iso);
      if (b) b.count++;
    }
    const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

    const conversionRate = users.length > 0 ? (paying.length / users.length) * 100 : 0;

    return {
      total: users.length,
      actives: actives.length,
      basico: basico.length,
      premium: premium.length,
      elite: elite.length,
      paying: paying.length,
      manual: manual.length,
      mrr,
      arr: mrr * 12,
      signups30,
      signups7,
      buckets,
      maxBucket,
      conversionRate,
    };
  }, [users]);

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Cargando métricas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-text" /> Métricas del negocio
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Ingresos estimados en función de los precios de lista. Excluye accesos manuales.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="MRR"
          value={`$${metrics.mrr.toLocaleString("es")}`}
          hint={`ARR ~$${metrics.arr.toLocaleString("es")}`}
        />
        <StatCard
          icon={Users}
          label="Suscriptores activos"
          value={String(metrics.paying)}
          hint={`${metrics.manual} accesos manuales`}
        />
        <StatCard
          icon={Users}
          label="Usuarios totales"
          value={String(metrics.total)}
          hint={`${metrics.conversionRate.toFixed(1)}% conversión`}
        />
        <StatCard
          icon={Calendar}
          label="Registros (30d)"
          value={String(metrics.signups30)}
          hint={`${metrics.signups7} en los últimos 7 días`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-4">
            <Star className="w-4 h-4 text-blue-400" /> Distribución de planes activos
          </div>
          {metrics.actives === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin suscripciones activas.</p>
          ) : (
            <div className="space-y-4">
              <PlanBar label="Academy" count={metrics.basico} total={metrics.actives} icon={Star} color="bg-blue-500" />
              <PlanBar label="Academy Pro" count={metrics.premium} total={metrics.actives} icon={Crown} color="bg-primary" />
              <PlanBar label="Academy Élite" count={metrics.elite} total={metrics.actives} icon={Crown} color="bg-amber-400" />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-4">
            <TrendingUp className="w-4 h-4 text-green-400" /> Registros (últimos 30 días)
          </div>
          <div className="flex items-end gap-0.5 h-32">
            {metrics.buckets.map((b) => (
              <div
                key={b.date}
                className="flex-1 bg-primary/70 hover:bg-primary transition-colors rounded-t"
                style={{ height: `${(b.count / metrics.maxBucket) * 100}%`, minHeight: b.count > 0 ? "4px" : "1px" }}
                title={`${b.date}: ${b.count}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>{metrics.buckets[0].date.slice(5)}</span>
            <span>{metrics.buckets[metrics.buckets.length - 1].date.slice(5)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanBar({ label, count, total, icon: Icon, color }: {
  label: string;
  count: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
        <span className="text-muted-foreground text-xs">
          {count} <span className="opacity-70">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
