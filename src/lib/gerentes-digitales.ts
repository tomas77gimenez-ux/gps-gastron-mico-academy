import { supabase } from "@/integrations/supabase/client";

export interface GerenteDigital {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  stripe_price_id: string | null;
  active: boolean;
  sort_order: number;
}

export interface GdFile {
  id: string;
  gd_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  sort_order: number;
}

/** Catálogo público (RLS deja ver sólo los activos). */
export async function listGerentesDigitales(): Promise<GerenteDigital[]> {
  const { data } = await supabase
    .from("gerentes_digitales")
    .select("id, slug, name, description, price_cents, stripe_price_id, active, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return (data as GerenteDigital[]) ?? [];
}

/** IDs de los Gerentes Digitales a los que el usuario tiene acceso. */
export async function listOwnedGdIds(userId: string, allIds: string[]): Promise<string[]> {
  const { data: elite } = await supabase.rpc("has_elite_access", { _user_id: userId });
  if (elite) return allIds;
  const { data } = await supabase.from("gd_entitlements").select("gd_id").eq("user_id", userId);
  return ((data as { gd_id: string }[]) ?? []).map((r) => r.gd_id);
}

export function formatGdPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}