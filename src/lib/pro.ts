import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProSession {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  meeting_url: string | null;
  is_active: boolean;
}

export interface ProRecording {
  id: string;
  title: string;
  session_date: string;
  bunny_video_id: string | null;
  notes: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
}

export interface ProMetric {
  label: string;
  before: string;
  after: string;
}

export interface ProCase {
  id: string;
  month: number;
  year: number;
  title: string;
  description: string | null;
  bunny_video_id: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  metrics: ProMetric[];
}

export const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function monthLabel(month: number, year: number) {
  return `${MONTHS_ES[Math.min(Math.max(month, 1), 12) - 1]} ${year}`;
}

export function parseMetrics(value: unknown): ProMetric[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((m): m is ProMetric => !!m && typeof m === "object")
    .map((m) => ({
      label: String((m as ProMetric).label ?? ""),
      before: String((m as ProMetric).before ?? ""),
      after: String((m as ProMetric).after ?? ""),
    }))
    .filter((m) => m.label.trim().length > 0);
}

/** URL firmada de Bunny para una grabación o un caso de la Sala Pro. */
export function useProEmbedUrl(kind: "recording" | "case", id: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setUrl(null);
    setForbidden(false);
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          if (!cancelled) setForbidden(true);
          return;
        }
        const res = await fetch("/api/public/pro-embed", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ kind, id }),
        });
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          setForbidden(true);
          return;
        }
        if (!res.ok) return;
        const payload = (await res.json()) as { urls?: string[] };
        if (!cancelled) setUrl(payload.urls?.[0] ?? null);
      } catch {
        /* el player muestra el estado vacío */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  return { url, loading, forbidden };
}
