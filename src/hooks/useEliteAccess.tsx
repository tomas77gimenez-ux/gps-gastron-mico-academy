import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

interface EliteAccessState {
  loading: boolean;
  isAuthenticated: boolean;
  hasElite: boolean;
}

/**
 * Acceso Élite. La verdad vive en el servidor: `has_elite_access`
 * (admin, flag "Acceso Élite" o suscripción Academy Élite vigente).
 * El resultado sólo controla la UI; las tablas están protegidas por RLS.
 */
export function useEliteAccess(): EliteAccessState {
  const { isReady, user } = useAuthSession();
  const [state, setState] = useState<EliteAccessState>({
    loading: true,
    isAuthenticated: false,
    hasElite: false,
  });

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      setState({ loading: false, isAuthenticated: false, hasElite: false });
      return;
    }
    let cancelled = false;
    supabase.rpc("has_elite_access", { _user_id: user.id }).then(({ data }) => {
      if (cancelled) return;
      setState({ loading: false, isAuthenticated: true, hasElite: !!data });
    });
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  return state;
}