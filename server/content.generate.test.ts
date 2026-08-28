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
    invokeTextModel.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ titleCandidates: ["테스트 제목 1", "테스트 제목 2", "테스트 제목 3"], title: "테스트 제목 1", intro: "도입", body: "본문", ending: "마무리", hashtags: "#테스트" }) } }] });
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context());
    await expect(caller.content.generate({ brandId: 1, brand: { name: "테스트 브랜드" }, primaryKeyword: "테스트", secondaryKeywords: [], purpose: "정보 제공", length: "1,500자", regenerate: false })).resolves.toMatchObject({ draft: { title: "테스트 제목 1", titleCandidates: ["테스트 제목 1", "테스트 제목 2", "테스트 제목 3"] } });
  });

  it("uses the latest owner-scoped brand brief when generating", async () => {
    getBrandProfile.mockResolvedValue({ id: 1, userId: 1, name: "최신 업체", industry: "필라테스", services: "개인레슨", audience: "직장인", strengths: "초보자 상담", briefJson: JSON.stringify({ expertise: "체형 교정 전문", verifiedFacts: ["강사 자격 보유"] }) });
    reserveMonthlyGeneration.mockResolvedValue({ allowed: true, used: 1, periodKey: "2026-08" });
    invokeTextModel.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ titleCandidates: ["제목1", "제목2", "제목3"], title: "제목1", intro: "도입", body: "본문", ending: "마무리", hashtags: "#태그" }) } }] });
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context());
    await caller.content.generate({ brandId: 1, brand: { name: "오래된 입력" }, primaryKeyword: "필라테스", secondaryKeywords: [], purpose: "정보 제공", length: "1,500자", regenerate: false });
    expect(invokeTextModel).toHaveBeenLastCalledWith(expect.objectContaining({ messages: expect.arrayContaining([expect.objectContaining({ content: expect.stringContaining("체형 교정 전문") })]) }));
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
