import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ToolsAccessState {
  loading: boolean;
  isAuthenticated: boolean;
  hasAccess: boolean;
}

export function useToolsAccess(): ToolsAccessState {
  const { isReady, user } = useAuthSession();
  const [state, setState] = useState<ToolsAccessState>({
    loading: true,
    isAuthenticated: false,
    hasAccess: false,
  });

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;

    if (!user) {
      setState({ loading: false, isAuthenticated: false, hasAccess: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    supabase
      .rpc("has_tools_access", { _user_id: user.id })
      .then(({ data }) => {
        if (cancelled) return;
        setState({ loading: false, isAuthenticated: true, hasAccess: !!data });
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, user?.id]);

  return state;
}
