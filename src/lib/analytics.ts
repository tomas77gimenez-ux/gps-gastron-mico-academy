export const GA_MEASUREMENT_ID = "G-WK01RB4K95";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    // no-op
  }
}

/**
 * SPA page_view. gtag('config') only fires one page_view on first load, so
 * client-side navigations need to be reported explicitly.
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: title ?? document.title,
    });
  } catch {
    // no-op
  }
}

/** Associates events with the signed-in user (no PII: id only). */
export function identifyUser(userId: string | null) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("set", { user_id: userId ?? undefined });
  } catch {
    // no-op
  }
}

/** Marks a step of the visit -> checkout -> subscription funnel. */
export function trackFunnelStep(
  step: "view_plans" | "checkout_opened" | "checkout_started" | "trial_started" | "subscribed",
  params: Record<string, unknown> = {},
) {
  trackEvent("funnel_step", { step, ...params });
}