import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const createBrandProfile = vi.fn();
const getBrandProfile = vi.fn();
const updateBrandProfile = vi.fn();

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, createBrandProfile, getBrandProfile, updateBrandProfile };
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
  beforeEach(() => { createBrandProfile.mockReset(); getBrandProfile.mockReset(); updateBrandProfile.mockReset(); });

  it("passes the brand form and authenticated user to the database helper", async () => {
    const saved = { id: 21, userId: 7, name: "새 매장", industry: "카페" };
    createBrandProfile.mockResolvedValue(saved);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context());

    await expect(caller.brands.create({ name: "새 매장", industry: "카페" })).resolves.toEqual(saved);
    expect(createBrandProfile).toHaveBeenCalledWith({ userId: 7, name: "새 매장", industry: "카페", services: undefined, audience: undefined, strengths: undefined, briefJson: JSON.stringify({ location: "", address: "", phone: "", website: "", businessHours: "", priceInfo: "", uniquePoints: "", brandStory: "", primaryKeywords: "", secondaryKeywords: "", customerQuestions: "", factsToUse: "", forbiddenClaims: "", toneNotes: "", callToAction: "", services: [], expertise: "", faqs: [], verifiedFacts: [], sourceLinks: [] }) });
  });

  it("exposes owner-scoped brand read and partial update procedures", async () => {
    const brand = { id: 21, userId: 7, name: "기존 매장", industry: "필라테스" };
    getBrandProfile.mockResolvedValue(brand);
    updateBrandProfile.mockResolvedValue({ ...brand, name: "수정 매장" });
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context());

    await expect(caller.brands.get({ brandId: 21 })).resolves.toEqual(brand);
    await expect(caller.brands.update({ brandId: 21, name: "수정 매장" })).resolves.toEqual({ ...brand, name: "수정 매장" });
    expect(getBrandProfile).toHaveBeenCalledWith(7, 21);
    expect(updateBrandProfile).toHaveBeenCalledWith(7, 21, expect.objectContaining({ name: "수정 매장" }));
  });
});
