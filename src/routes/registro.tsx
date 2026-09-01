import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Lock, Eye, EyeOff, User, CheckCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/registro")({
  component: RegistroPage,
  head: () => ({
    meta: [
      { title: "Registro — GPS Gastronômico" },
      { name: "description", content: "Crea tu cuenta en GPS Gastronômico." },
      { property: "og:title", content: 'Registro — GPS Gastronômico' },
      { property: "og:description", content: 'Crea tu cuenta gratis y comienza tu transformación gastronómica.' },
      { property: "og:url", content: "https://plataforma-test1.lovable.app/registro" }
    ],
    links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/registro" }],
  }),
});

function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: window.location.origin,
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    trackEvent("sign_up", { method: "email" });
  }

  async function handleGoogleSignup() {
    trackEvent("sign_up", { method: "google" });
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4 text-center">
          <div className="rounded-xl border border-border bg-card p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">¡Revisa tu email!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Enviamos un enlace de verificación a <strong className="text-foreground">{email}</strong>. 
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <Link to="/login" className="text-primary-text text-sm font-medium hover:underline">
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary-text text-sm font-medium mb-4">
            <UserPlus className="w-4 h-4" /> Únete a la comunidad
          </div>
          <h1 className="text-3xl font-bold font-display">Crear Cuenta</h1>
          <p className="text-muted-foreground text-sm mt-2">Comienza tu camino en la gastronomía</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-secondary/50 py-2.5 px-4 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Registrarse con Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">o con email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Tu nombre" required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="tu@email.com" required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Contraseña</label>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary-text font-medium hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
