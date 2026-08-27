import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const createBrandProfile = vi.fn();

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, createBrandProfile };
});

function context(): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 7,
      openId: "brand-create-test",
      name: "Tester",
      email: "test@example.com",
      loginMethod: "test",
      role: "user",
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("brand create procedure", () => {
  beforeEach(() => createBrandProfile.mockReset());

  it("passes the brand form and authenticated user to the database helper", async () => {
    const saved = { id: 21, userId: 7, name: "새 매장", industry: "카페" };
    createBrandProfile.mockResolvedValue(saved);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context());

    await expect(caller.brands.create({ name: "새 매장", industry: "카페" })).resolves.toEqual(saved);
    expect(createBrandProfile).toHaveBeenCalledWith({ userId: 7, name: "새 매장", industry: "카페", services: undefined, audience: undefined, strengths: undefined, briefJson: "{}" });
  });
});
