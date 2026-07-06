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
  if (userTier === "premium") return true;
  return requiredTier === "basico";
}

export function planLabel(tier: PlanTier): string {
  return tier === "premium" ? "Premium" : "Básico";
}