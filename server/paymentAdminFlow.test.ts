import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function context(): TrpcContext {
  const now = new Date();
  return {
    user: { id: 7, openId: "admin-flow-test", name: "관리자", email: "admin@example.com", loginMethod: "test", role: "admin", createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("admin payment state transition procedures", () => {
  afterEach(() => vi.restoreAllMocks());

  it("runs adminMarkSent, adminMarkPaid, then adminReview approval in order", async () => {
    const request = { id: 41, userId: 12, status: "pending", paymentStatus: "not_sent", plan: "Starter", amount: 80000 };
    const sent = { ...request, paymentStatus: "sent" };
    const paid = { ...sent, paymentStatus: "paid", paidAt: new Date() };
    const approved = { ...paid, status: "approved" };
    const calls: string[] = [];

    vi.spyOn(db, "markPaymentSent").mockImplementation(async () => { calls.push("sent"); return sent as any; });
    vi.spyOn(db, "markPaymentPaid").mockImplementation(async () => { calls.push("paid"); return paid as any; });
    vi.spyOn(db, "reviewPaymentRequest").mockImplementation(async () => { calls.push("approved"); return approved as any; });

    const caller = appRouter.createCaller(context());
    await expect(caller.billing.adminMarkSent({ id: request.id })).resolves.toMatchObject({ paymentStatus: "sent" });
    await expect(caller.billing.adminMarkPaid({ id: request.id })).resolves.toMatchObject({ paymentStatus: "paid" });
    await expect(caller.billing.adminReview({ id: request.id, status: "approved" })).resolves.toMatchObject({ status: "approved" });
    expect(calls).toEqual(["sent", "paid", "approved"]);
  });
});
