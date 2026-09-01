import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { summarizeNovedades, type NovedadKind } from "@/lib/novedades";

/**
 * Slim dismissible strip announcing content added in the last 30 days.
 * Dismissal is stored on profiles.novedades_dismissed_at, so the banner
 * comes back automatically as soon as newer content is published.
 */
export function NovedadesBanner() {
  const { isReady, user } = useAuthSession();
  const [summary, setSummary] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isReady || !user) return;
    let active = true;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    (async () => {
      const [profile, lessons, materials, recordings, cases] = await Promise.all([
        supabase.from("profiles").select("novedades_dismissed_at").eq("user_id", user.id).maybeSingle(),
        supabase.from("lessons").select("created_at").gte("created_at", since),
        supabase.from("course_materials").select("created_at").gte("created_at", since),
        supabase.from("pro_recordings").select("created_at").gte("created_at", since),
        supabase.from("pro_cases").select("created_at").gte("created_at", since),
      ]);
      if (!active) return;

      const groups: Array<[NovedadKind, string[]]> = [
        ["lesson", (lessons.data ?? []).map((r) => r.created_at)],
        ["material", (materials.data ?? []).map((r) => r.created_at)],
        ["recording", (recordings.data ?? []).map((r) => r.created_at)],
        ["case", (cases.data ?? []).map((r) => r.created_at)],
      ];

      const dismissedAt = profile.data?.novedades_dismissed_at ?? null;
      const counts = { lesson: 0, material: 0, recording: 0, case: 0 } as Record<NovedadKind, number>;
      let newest = "";
      for (const [kind, dates] of groups) {
        counts[kind] = dates.length;
        for (const d of dates) if (d > newest) newest = d;
      }

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      if (total === 0) return;
      if (dismissedAt && newest <= dismissedAt) return;

      setSummary(summarizeNovedades(counts));
    })();

    return () => { active = false; };
  }, [isReady, user?.id]);

  async function dismiss() {
    setHidden(true);
    if (!user) return;
    await supabase
      .from("profiles")
      .upsert({ user_id: user.id, novedades_dismissed_at: new Date().toISOString() }, { onConflict: "user_id" });
  }

  if (!summary || hidden) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5">
      <Sparkles className="h-4 w-4 shrink-0 text-primary-text" strokeWidth={1.75} />
      <p className="flex-1 text-sm text-foreground">
        <span className="font-semibold">Nuevo este mes:</span>{" "}
        <span className="text-muted-foreground">{summary}</span>{" "}
        <Link to="/" hash="novedades" className="font-semibold text-primary-text underline underline-offset-2">
          Ver novedades
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Ocultar aviso de novedades"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
