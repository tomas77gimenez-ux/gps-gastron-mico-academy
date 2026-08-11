import type { PlanTier } from "./admin-types";

/**
 * Retorna true se o usuário com `userTier` tem acesso a conteúdo que requer `requiredTier`.
 * Premium desbloqueia tudo; Básico só desbloqueia Básico.
 * Se `userTier` for null, sem acesso.
 */
export function hasPlanAccess(
  userTier: PlanTier | null,
  requiredTier: PlanTier,
): boolean {
  if (!userTier) return false;
  if (userTier === "elite") return true;
  if (userTier === "premium") return requiredTier !== "elite";
  return requiredTier === "basico";
}

export function planLabel(tier: PlanTier): string {
  if (tier === "elite") return "Élite";
  return tier === "premium" ? "Premium" : "Básico";
}