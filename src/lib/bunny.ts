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
