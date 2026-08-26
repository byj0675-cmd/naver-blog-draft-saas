export type PaymentStatus = "idle" | "pending" | "success" | "failed";
export type Plan = "Starter" | "Growth" | "Studio";

export const planCatalog: Record<Plan, { amount: number; credits: number }> = {
  Starter: { amount: 19000, credits: 30 },
  Growth: { amount: 39000, credits: 100 },
  Studio: { amount: 79000, credits: 300 },
};

export function applySuccessfulPayment(currentCredits: number, plan: Plan) {
  return currentCredits + planCatalog[plan].credits;
}

export function paymentFailureMessage(code?: string) {
  return code ? `결제가 완료되지 않았습니다. (${code})` : "결제가 완료되지 않았습니다. 다시 시도해 주세요.";
}
