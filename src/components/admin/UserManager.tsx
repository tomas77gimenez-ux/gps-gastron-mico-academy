import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Shield, Crown, Star, Loader2, Ban, Gift, Search, ShieldCheck, Wrench, Gem } from "lucide-react";
import { toast } from "sonner";
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
  tools_free_access: boolean;
  pro_access?: boolean;
  elite_access?: boolean;
}

const DURATIONS = [
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
  { value: 180, label: "6 meses" },
  { value: 365, label: "1 año" },
  { value: 0, label: "Vitalicio" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function planBadge(plan: PlanTier | null, env: string | null, status: string | null) {
  if (!plan || status !== "active" && status !== "trialing") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
        Sin acceso
      </span>
    );
  }
  if (plan === "elite") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-medium bg-accent/20 text-accent">
        <Gem className="w-3 h-3" />
        Academy Élite
        {env === "manual" && <span className="ml-1 text-[9px] opacity-70 uppercase">manual</span>}
      </span>
    );
  }
  const isPremium = plan === "premium";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-medium ${
        isPremium
          ? "bg-primary/15 text-primary"
          : "bg-blue-500/15 text-blue-300"
      }`}
    >
      {isPremium ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
      {isPremium ? "Academy Pro" : "Academy"}
      {env === "manual" && (
        <span className="ml-1 text-[9px] opacity-70 uppercase">manual</span>
      )}
    </span>
  );
}

export function UserManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [grantTarget, setGrantTarget] = useState<UserRow | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    plan: PlanTier;
    duration: number;
    notes: string;
  }>({ plan: "basico", duration: 30, notes: "" });

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("admin_list_users");
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    const { data: flagData } = await (supabase.rpc as unknown as (
      fn: string,
    ) => Promise<{ data: { user_id: string; pro_access: boolean; elite_access: boolean }[] | null }>)(
      "admin_list_access_flags",
    );
    const flagMap = new Map((flagData ?? []).map((r) => [r.user_id, r]));
    setUsers(
      ((data as UserRow[]) ?? []).map((u) => ({
        ...u,
        pro_access: flagMap.get(u.user_id)?.pro_access ?? false,
        elite_access: flagMap.get(u.user_id)?.elite_access ?? false,
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGrant() {
    if (!grantTarget) return;
    setSaving(true);
    const { error: err } = await supabase.rpc("grant_subscription", {
      _user_id: grantTarget.user_id,
      _plan: form.plan,
      _duration_days: form.duration,
      _notes: form.notes || undefined,
    });
    setSaving(false);
    if (err) {
      toast.error("Error al conceder acceso", { description: err.message });
      return;
    }
    toast.success(`Acceso ${form.plan} concedido a ${grantTarget.email}`);
    setGrantTarget(null);
    setForm({ plan: "basico", duration: 30, notes: "" });
    load();
  }

  async function handleRevoke() {
    if (!revokeTarget?.subscription_id) return;
    setSaving(true);
    const { error: err } = await supabase.rpc("revoke_subscription", {
      _subscription_id: revokeTarget.subscription_id,
    });
    setSaving(false);
    if (err) {
      toast.error("Error al revocar", { description: err.message });
      return;
    }
    toast.success(`Acceso revocado a ${revokeTarget.email}`);
    setRevokeTarget(null);
    load();
  }

  async function toggleToolsAccess(u: UserRow) {
    const next = !u.tools_free_access;
    setUsers((prev) =>
      prev.map((row) => (row.user_id === u.user_id ? { ...row, tools_free_access: next } : row)),
    );
    const { error: err } = await supabase.rpc("admin_set_tools_access", {
      _user_id: u.user_id,
      _enabled: next,
    });
    if (err) {
      setUsers((prev) =>
        prev.map((row) => (row.user_id === u.user_id ? { ...row, tools_free_access: !next } : row)),
      );
      toast.error("No se pudo actualizar el acceso a herramientas", { description: err.message });
      return;
    }
    toast.success(
      next
        ? `Acceso gratuito a herramientas activado para ${u.email}`
        : `Acceso gratuito a herramientas retirado a ${u.email}`,
    );
  }

  async function toggleProAccess(u: UserRow) {
    const next = !u.pro_access;
    setUsers((prev) => prev.map((row) => (row.user_id === u.user_id ? { ...row, pro_access: next } : row)));
    const { error: err } = await supabase.rpc("admin_set_pro_access", {
      _user_id: u.user_id,
      _enabled: next,
    });
    if (err) {
      setUsers((prev) => prev.map((row) => (row.user_id === u.user_id ? { ...row, pro_access: !next } : row)));
      toast.error("No se pudo actualizar el Acceso Pro", { description: err.message });
      return;
    }
    toast.success(
      next ? `Acceso Pro activado para ${u.email}` : `Acceso Pro retirado a ${u.email}`,
    );
  }

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalActive = users.filter(
    (u) => u.status === "active" || u.status === "trialing",
  ).length;

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> {users.length} usuarios
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {totalActive} con acceso activo
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email..."
            className="pl-9 pr-3 py-2 rounded-lg border border-input bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Usuario</th>
              <th className="text-left px-4 py-3 font-medium">Plan</th>
              <th className="text-left px-4 py-3 font-medium">Herramientas</th>
              <th className="text-left px-4 py-3 font-medium">Acceso Pro</th>
              <th className="text-left px-4 py-3 font-medium">Vence</th>
              <th className="text-left px-4 py-3 font-medium">Registro</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u) => (
              <tr key={u.user_id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate max-w-[260px]">{u.email}</span>
                    {u.is_admin && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {planBadge(u.plan_tier, u.environment, u.status)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleToolsAccess(u)}
                    disabled={u.is_admin}
                    title={
                      u.is_admin
                        ? "Los admins ya tienen acceso total"
                        : "Acceso gratuito a herramientas (mentoría)"
                    }
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                      u.tools_free_access || u.is_admin
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    {u.is_admin ? "admin" : u.tools_free_access ? "Gratis activo" : "Sin acceso libre"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleProAccess(u)}
                    disabled={u.is_admin}
                    title={
                      u.is_admin
                        ? "Los admins ya tienen acceso a la Sala Pro"
                        : "Acceso manual a la Sala Pro (fundadores / alumnos de mentoría)"
                    }
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                      u.pro_access || u.is_admin
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                    {u.is_admin ? "admin" : u.pro_access ? "Pro activo" : "Sin Pro"}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {u.current_period_end ? formatDate(u.current_period_end) : (u.plan_tier ? "Vitalicio" : "—")}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(u.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setGrantTarget(u);
                        setForm({
                          plan: u.plan_tier ?? "basico",
                          duration: 30,
                          notes: "",
                        });
                      }}
                      className="p-2 rounded hover:bg-primary/10 text-primary transition-colors"
                      title="Conceder / cambiar acceso"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                    {u.subscription_id && u.environment === "manual" && (
                      <button
                        onClick={() => setRevokeTarget(u)}
                        className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        title="Revocar acceso manual"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {search ? "Sin resultados." : "Sin usuarios."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grant dialog */}
      <Dialog open={!!grantTarget} onOpenChange={(open) => !open && setGrantTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> Conceder acceso
            </DialogTitle>
            <DialogDescription className="text-xs">
              {grantTarget?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wide">
                Plan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["basico", "premium"] as PlanTier[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setForm((f) => ({ ...f, plan: p }))}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      form.plan === p
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p === "premium" ? <Crown className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    {p === "premium" ? "Premium" : "Básico"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wide">
                Duración
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setForm((f) => ({ ...f, duration: d.value }))}
                    className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                      form.duration === d.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 uppercase tracking-wide">
                Notas (opcional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="ej: cortesía, embajador, reembolso, etc"
                className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {grantTarget?.plan_tier && (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-3 py-2 text-xs">
                Este usuario ya tiene un plan activo. Conceder uno nuevo cancelará las concesiones manuales anteriores.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGrantTarget(null)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button size="sm" onClick={handleGrant} disabled={saving}>
              {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              Conceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-destructive" /> Revocar acceso
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              ¿Confirmás revocar el acceso manual de <strong>{revokeTarget?.email}</strong>? El usuario perderá el acceso inmediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevokeTarget(null)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevoke}
              disabled={saving}
            >
              {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              Revocar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}