import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role: "user" | "admin"): TrpcContext {
  const now = new Date();
  return {
    user: { id: 99, openId: "billing-test", name: "Tester", email: "test@example.com", loginMethod: "test", role, createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("billing admin procedures", () => {
  it("blocks payment request listing for non-admin users", async () => {
    const caller = appRouter.createCaller(context("user"));
    await expect(caller.billing.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an admin to access the payment request list", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await expect(caller.billing.adminList()).resolves.toEqual([]);
  });
});
