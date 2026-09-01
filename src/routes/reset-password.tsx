import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("rp.headTitle") },
        { name: "description", content: t("rp.headDesc") },
        { property: "og:title", content: t("rp.headTitle") },
        { property: "og:description", content: t("rp.headOgDesc") },
        { property: "og:url", content: "https://plataforma-test1.lovable.app/reset-password" },
        { name: "robots", content: "noindex,nofollow" }
      ],
      links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/reset-password" }],
    };
  },
});

function ResetPasswordPage() {
  const { t } = useI18n();
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
      setError(t("rp.passwordMin"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("rp.passwordMismatch"));
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
            <h1 className="text-2xl font-bold font-display mb-2">{t("rp.updated")}</h1>
            <p className="text-muted-foreground text-sm">{t("rp.redirecting")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display">{t("rp.title")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("rp.desc")}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("rp.newPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={t("rp.passwordPlaceholder")} required minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("rp.confirmPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={t("rp.confirmPlaceholder")} required minLength={8}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("rp.updating") : t("rp.changePassword")}
            </Button>
          </form>

          <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("rp.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
