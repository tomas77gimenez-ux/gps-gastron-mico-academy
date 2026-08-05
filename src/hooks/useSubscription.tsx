import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { PlanTier } from "@/lib/admin-types";

interface SubscriptionState {
  loading: boolean;
  isAuthenticated: boolean;
  hasActive: boolean;
  isAdmin: boolean;
  productId: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  planTier: PlanTier | null;
  environment: string | null;
}

const initial: SubscriptionState = {
  loading: true,
  isAuthenticated: false,
  hasActive: false,
  isAdmin: false,
  productId: null,
  status: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  planTier: null,
  environment: null,
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
      const { data: adminFlag } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      const isAdmin = !!adminFlag;

      if (isAdmin) {
        // Admins têm acesso total a todo o conteúdo.
        setState({
          loading: false,
          isAuthenticated: true,
          hasActive: true,
          isAdmin: true,
          productId: null,
          status: "active",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          planTier: "premium",
          environment: "admin",
        });
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("product_id, status, current_period_end, cancel_at_period_end, environment, plan_tier")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Prefer any ACTIVE subscription first (manual grant, live, or sandbox);
      // Premium wins over Básico when both are active.
      const actives = (data ?? []).filter((item) =>
        isActive(item.status ?? null, item.current_period_end ?? null),
      );
      const preferredActive =
        actives.find((i) => i.plan_tier === "premium") ??
        actives.find((i) => i.environment === "manual") ??
        actives.find((i) => i.environment === preferredEnvironment) ??
        actives[0];

      const selectedSubscription = preferredActive ?? data?.[0] ?? null;

      setState({
        loading: false,
        isAuthenticated: true,
        hasActive: isActive(selectedSubscription?.status ?? null, selectedSubscription?.current_period_end ?? null),
        isAdmin: false,
        productId: selectedSubscription?.product_id ?? null,
        status: selectedSubscription?.status ?? null,
        currentPeriodEnd: selectedSubscription?.current_period_end ?? null,
        cancelAtPeriodEnd: !!selectedSubscription?.cancel_at_period_end,
        planTier: (selectedSubscription?.plan_tier as PlanTier | null | undefined) ?? null,
        environment: selectedSubscription?.environment ?? null,
      });
    } catch {
      setState({
        loading: false,
        isAuthenticated: true,
        hasActive: false,
        isAdmin: false,
        productId: null,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        planTier: null,
        environment: null,
      });
    }
  }

  useEffect(() => {
    if (!isReady) return;
    load(user?.id ?? null);
  }, [isReady, user?.id]);

  return state;
}
