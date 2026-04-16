import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Iniciar Sesión — GPS Gastronômico" },
      { name: "description", content: "Accede a tu cuenta de GPS Gastronômico." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      if (err.message === "Invalid login credentials") {
        setError(t("login.emailIncorrecto"));
      } else if (err.message === "Email not confirmed") {
        setError(t("login.noVerificado"));
      } else {
        setError(err.message);
      }
      setLoading(false);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  async function handleGoogleLogin() {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <LogIn className="w-4 h-4" /> {t("login.bienvenido")}
          </div>
          <h1 className="text-3xl font-bold font-display">{t("login.titulo")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("login.desc")}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-secondary/50 py-2.5 px-4 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t("login.google")}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">{t("login.oConEmail")}</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("login.email")}</label>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">{t("login.contrasena")}</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("login.olvidaste")}</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("login.ingresando") : t("login.iniciar")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("login.noCuenta")}
            <Link to="/registro" className="text-primary font-medium hover:underline">{t("login.registrate")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
