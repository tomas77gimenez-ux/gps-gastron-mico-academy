import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ProAccessState {
  loading: boolean;
  isAuthenticated: boolean;
  hasPro: boolean;
}

/**
 * Acceso a la Sala Pro. La verdad vive en el servidor:
 * `has_pro_access` (admin, flag "Acceso Pro" o suscripción Academy Pro vigente).
 * El resultado sólo controla la UI; las tablas están protegidas por RLS.
 */
export function useProAccess(): ProAccessState {
  const { isReady, user } = useAuthSession();
  const [state, setState] = useState<ProAccessState>({
    loading: true,
    isAuthenticated: false,
    hasPro: false,
  });

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      setState({ loading: false, isAuthenticated: false, hasPro: false });
      return;
    }
    let cancelled = false;
    supabase
      .rpc("has_pro_access", { _user_id: user.id })
      .then(({ data }) => {
        if (cancelled) return;
        setState({ loading: false, isAuthenticated: true, hasPro: !!data });
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  return state;
}
