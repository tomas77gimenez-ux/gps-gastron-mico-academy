import { useEffect, useState } from "react";
import { Radio, CalendarClock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

interface LiveEvent {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  url: string | null;
}

const LOCALE_MAP = { es: "es-AR", en: "en-US", pt: "pt-BR" } as const;

export const formatLiveDate = (iso: string, lang: "es" | "en" | "pt" = "es") =>
  new Date(iso).toLocaleString(LOCALE_MAP[lang], {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ProximoEnVivoCard() {
  const { t, lang } = useI18n();
  const [event, setEvent] = useState<LiveEvent | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("live_events")
      .select("id, title, description, starts_at, url")
      .eq("is_active", true)
      .order("starts_at", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (active) setEvent(data?.[0] ?? null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!event) return null;

  return (
    <section className="border-b border-border py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-text">
                <Radio className="h-3.5 w-3.5" strokeWidth={1.5} /> {t("dash.proximoEnVivo")}
              </span>
              <h2 className="font-display text-2xl font-bold text-foreground">{event.title}</h2>
              {event.description && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{event.description}</p>
              )}
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-text">
                <CalendarClock className="h-4 w-4" strokeWidth={1.5} />
                {formatLiveDate(event.starts_at, lang)} <span className="text-muted-foreground">{t("dash.horaEt")}</span>
              </p>
            </div>
            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("dash.accederClase")} <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
