import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthSessionState {
  isReady: boolean;
  session: Session | null;
  user: User | null;
}

const initialState: AuthSessionState = {
  isReady: false,
  session: null,
  user: null,
};

export function useAuthSession() {
  const [state, setState] = useState<AuthSessionState>(initialState);

  useEffect(() => {
    let active = true;

    const syncSession = (session: Session | null) => {
      if (!active) return;
      setState({
        isReady: true,
        session,
        user: session?.user ?? null,
      });
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        syncSession(session);
      })
      .catch(() => {
        syncSession(null);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}