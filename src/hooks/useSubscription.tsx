import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
const environment: "sandbox" | "live" = clientToken?.startsWith("pk_test_") ? "sandbox" : "live";

interface SubscriptionState {
  loading: boolean;
  isAuthenticated: boolean;
  hasActive: boolean;
  productId: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const initial: SubscriptionState = {
  loading: true,
  isAuthenticated: false,
  hasActive: false,
  productId: null,
  status: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

function isActive(status: string | null, periodEnd: string | null): boolean {
  if (!status) return false;
  const notExpired = !periodEnd || new Date(periodEnd).getTime() > Date.now();
  if ((status === "active" || status === "trialing") && notExpired) return true;
  if (status === "canceled" && periodEnd && new Date(periodEnd).getTime() > Date.now()) return true;
  return false;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(initial);

  async function load(userId: string | null) {
    if (!userId) {
      setState({ ...initial, loading: false });
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("product_id, status, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .eq("environment", environment)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setState({
      loading: false,
      isAuthenticated: true,
      hasActive: isActive(data?.status ?? null, data?.current_period_end ?? null),
      productId: data?.product_id ?? null,
      status: data?.status ?? null,
      currentPeriodEnd: data?.current_period_end ?? null,
      cancelAtPeriodEnd: !!data?.cancel_at_period_end,
    });
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      load(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      load(session?.user?.id ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
