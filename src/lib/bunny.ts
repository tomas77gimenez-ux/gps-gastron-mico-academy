import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const BUNNY_LIBRARY_SETTING_KEY = "bunny_library_id";

/** Responsive Bunny Stream embed URL for a video inside a library. */
export function bunnyEmbedUrl(libraryId: string, videoId: string) {
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true&responsive=true`;
}

/** Reads the global Bunny Library ID configured by the admin. */
export function useBunnyLibraryId() {
  const [libraryId, setLibraryId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", BUNNY_LIBRARY_SETTING_KEY)
        .maybeSingle();
      if (!active) return;
      setLibraryId(((data as { value: string | null } | null)?.value ?? "").trim());
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { libraryId, loading, setLibraryId };
}

export async function saveBunnyLibraryId(value: string) {
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      { key: BUNNY_LIBRARY_SETTING_KEY, value: value.trim(), updated_at: new Date().toISOString() } as any,
      { onConflict: "key" },
    );
  if (error) throw error;
}

/**
 * Obtiene las URLs de reproducción de una lección desde el servidor.
 * El servidor valida la suscripción y firma la URL con Token Authentication
 * cuando el admin ya guardó la "Bunny Token Auth Key".
 */
export function useLessonEmbedUrls(lessonId: string | null, enabled: boolean) {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setUrls([]);
    setForbidden(false);
    if (!lessonId || !enabled) return;
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
        const res = await fetch("/api/public/lesson-embed", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lessonId }),
        });
        if (cancelled) return;
        if (res.status === 403 || res.status === 401) {
          setForbidden(true);
          return;
        }
        if (!res.ok) return;
        const payload = (await res.json()) as { urls?: string[] };
        if (!cancelled) setUrls(payload.urls ?? []);
      } catch {
        /* silencioso: el player muestra el estado vacío */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, enabled]);

  return { urls, loading, forbidden };
}
