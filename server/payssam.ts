import crypto from "node:crypto";

export type PayssamPlan = "starter" | "growth" | "studio";
export type PayssamPaymentStatus = "ready" | "paid" | "failed" | "cancelled";

export type PayssamPaymentRequest = {
  orderId: string;
  plan: PayssamPlan;
  amount: number;
  customerName: string;
  returnUrl: string;
};

export const PAYSSAM_PLAN_CATALOG: Record<PayssamPlan, { name: string; amount: number; monthlyCredits: number }> = {
  starter: { name: "Starter", amount: 19000, monthlyCredits: 30 },
  growth: { name: "Growth", amount: 39000, monthlyCredits: 100 },
  studio: { name: "Studio", amount: 79000, monthlyCredits: 300 },
};

export function buildPayssamRequest(input: PayssamPaymentRequest) {
  const plan = PAYSSAM_PLAN_CATALOG[input.plan];
  if (!plan || plan.amount !== input.amount) throw new Error("결제 상품 금액이 일치하지 않습니다.");
  return { orderId: input.orderId, productName: `blogmate ${plan.name}`, amount: plan.amount, customerName: input.customerName, returnUrl: input.returnUrl };
}

export function verifyPayssamSignature(rawBody: string, signature: string | undefined, secret: string | undefined) {
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function isPaidPayssamStatus(status: string): status is "paid" {
  return status === "paid";
}
