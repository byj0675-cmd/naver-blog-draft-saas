import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const invokeTextModel = vi.fn();
const reserveMonthlyGeneration = vi.fn();
const releaseMonthlyGeneration = vi.fn();
const reserveDraftRegeneration = vi.fn();
const releaseDraftRegeneration = vi.fn();
const getBrandProfile = vi.fn().mockResolvedValue(null);
const updateBrandProfile = vi.fn();

vi.mock("./aiProvider", () => ({
  invokeTextModel,
  parseModelJson: (content: unknown) => {
    if (typeof content !== "string" || !content.trim()) throw new Error("AI 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.");
    return JSON.parse(content);
  },
}));

vi.mock("./db", () => ({
  getSubscription: vi.fn().mockResolvedValue({ isExpired: false }),
  getBrandProfile,
  updateBrandProfile,
  reserveMonthlyGeneration,
  releaseMonthlyGeneration,
  reserveDraftRegeneration,
  releaseDraftRegeneration,
}));

function context(): TrpcContext {
  const now = new Date();
  return {
    user: { id: 1, openId: "content-test", name: "Tester", email: "test@example.com", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("content.generate JSON response handling", () => {
  it("returns a parsed draft through the real tRPC procedure", async () => {
    reserveMonthlyGeneration.mockResolvedValue({ allowed: true, used: 1, periodKey: "2026-08" });
    invokeTextModel.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ title: "테스트 제목", intro: "도입", body: "본문", ending: "마무리", hashtags: "#테스트" }) } }] });
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context());
    await expect(caller.content.generate({ brandId: 1, brand: { name: "테스트 브랜드" }, primaryKeyword: "테스트", secondaryKeywords: [], purpose: "정보 제공", length: "1,500자", regenerate: false })).resolves.toMatchObject({ draft: { title: "테스트 제목" } });
  });

  it("releases the reserved usage and returns a clear error for an empty model response", async () => {
    reserveMonthlyGeneration.mockResolvedValue({ allowed: true, used: 1, periodKey: "2026-08" });
    invokeTextModel.mockResolvedValue({ choices: [{ message: { content: "" } }] });
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context());
    await expect(caller.content.generate({ brandId: 1, brand: { name: "테스트 브랜드" }, primaryKeyword: "테스트", secondaryKeywords: [], purpose: "정보 제공", length: "1,500자", regenerate: false })).rejects.toThrow("AI 응답이 비어 있습니다");
    expect(releaseMonthlyGeneration).toHaveBeenCalled();
  });
});
