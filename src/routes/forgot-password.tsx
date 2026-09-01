import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useI18n, tFor } from "@/lib/i18n";
import { readPrefs } from "@/lib/prefs";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => {
    const t = tFor(readPrefs().lang);
    return {
      meta: [
        { title: t("fp.headTitle") },
        { name: "description", content: t("fp.headDesc") },
        { property: "og:title", content: t("fp.headTitle") },
        { property: "og:description", content: t("fp.headOgDesc") },
        { property: "og:url", content: "https://plataforma-test1.lovable.app/forgot-password" },
        { name: "robots", content: "noindex,nofollow" }
      ],
      links: [{ rel: "canonical", href: "https://plataforma-test1.lovable.app/forgot-password" }],
    };
  },
});

function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md px-4 text-center">
          <div className="rounded-xl border border-border bg-card p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-display mb-2">{t("fp.emailSent")}</h1>
            <p className="text-muted-foreground text-sm mb-6">
              {t("fp.emailSentDesc1")} <strong className="text-foreground">{email}</strong>, 
              {t("fp.emailSentDesc2")}
            </p>
            <Link to="/login" className="text-primary-text text-sm font-medium hover:underline">
              {t("fp.backToLogin")}
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
          <h1 className="text-3xl font-bold font-display">{t("fp.title")}</h1>
          <p className="text-muted-foreground text-sm mt-2">{t("fp.desc")}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("fp.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="tu@email.com" required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("fp.sending") : t("fp.sendLink")}
            </Button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("fp.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
