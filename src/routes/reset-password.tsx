import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Nueva Contraseña — GPS Gastronômico" },
      { name: "description", content: "Establece una nueva contraseña para tu cuenta." },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from the auth link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate({ to: "/dashboard" }), 2000);
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4 text-center">
          <div className="rounded-xl border border-border bg-card p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">¡Contraseña actualizada!</h1>
            <p className="text-muted-foreground text-sm">Redirigiendo al dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display">Nueva Contraseña</h1>
          <p className="text-muted-foreground text-sm mt-2">Establece tu nueva contraseña</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nueva contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Mínimo 8 caracteres" required minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Repite la contraseña" required minLength={8}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Actualizando..." : "Cambiar Contraseña"}
            </Button>
          </form>

          <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
