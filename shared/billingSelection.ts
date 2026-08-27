export type BillingCycle = "monthly" | "yearly";

export type BillingSelection = {
  plan: string;
  billingCycle: BillingCycle;
};

export function serializeBillingSelection(selection: BillingSelection) {
  return JSON.stringify(selection);
}

export function parseBillingSelection(raw: string | null): BillingSelection | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BillingSelection>;
    if (typeof parsed.plan !== "string" || !parsed.plan) return null;
    if (parsed.billingCycle !== "monthly" && parsed.billingCycle !== "yearly") return null;
    return { plan: parsed.plan, billingCycle: parsed.billingCycle };
  } catch {
    return null;
  }
}
