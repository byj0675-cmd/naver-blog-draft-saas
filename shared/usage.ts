export const DEFAULT_MONTHLY_GENERATION_LIMIT = 12;
export const DEFAULT_REGENERATION_LIMIT = 3;

export function isWithinLimit(used: number, limit: number) {
  return used < limit;
}

export function usageLabel(used: number, limit: number) {
  return `${used}/${limit}`;
}
