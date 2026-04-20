import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuthSession } from "@/hooks/useAuthSession";

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
  const { isReady, user } = useAuthSession();
  const [state, setState] = useState<SubscriptionState>(initial);

  async function load(userId: string | null) {
    if (!userId) {
      setState({ ...initial, loading: false });
      return;
    }
    try {
      const preferredEnvironment = getStripeEnvironment();
      const { data, error } = await supabase
        .from("subscriptions")
        .select("product_id, status, current_period_end, cancel_at_period_end, environment")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const selectedSubscription =
        data?.find((item) => item.environment === preferredEnvironment) ??
        data?.find((item) => isActive(item.status ?? null, item.current_period_end ?? null)) ??
        data?.[0] ??
        null;

      setState({
        loading: false,
        isAuthenticated: true,
        hasActive: isActive(selectedSubscription?.status ?? null, selectedSubscription?.current_period_end ?? null),
        productId: selectedSubscription?.product_id ?? null,
        status: selectedSubscription?.status ?? null,
        currentPeriodEnd: selectedSubscription?.current_period_end ?? null,
        cancelAtPeriodEnd: !!selectedSubscription?.cancel_at_period_end,
      });
    } catch {
      setState({
        loading: false,
        isAuthenticated: true,
        hasActive: false,
        productId: null,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }
  }

  useEffect(() => {
    if (!isReady) return;
    load(user?.id ?? null);
  }, [isReady, user?.id]);

  return state;
}
