import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const listDraftHistories = vi.fn();
const getDraftHistory = vi.fn();
const updateDraftHistory = vi.fn();
const saveDraftHistory = vi.fn();

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    listDraftHistories,
    getDraftHistory,
    updateDraftHistory,
    saveDraftHistory,
  };
});

function context(userId = 7): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
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

describe("draft history procedures", () => {
  beforeEach(() => {
    listDraftHistories.mockReset();
    getDraftHistory.mockReset();
    updateDraftHistory.mockReset();
    saveDraftHistory.mockReset();
  });

  it("lists draft histories for the authenticated user and supports optional brandId", async () => {
    const mockDrafts = [
      { id: 101, userId: 7, brandId: 1, title: "첫 번째 초안", intro: "도입", body: "본문", ending: "마무리", hashtags: "#태그", keywords: "키워드", seoScore: 90, createdAt: new Date() },
    ];
    listDraftHistories.mockResolvedValue(mockDrafts);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context(7));

    const result = await caller.content.history();
    expect(result).toEqual(mockDrafts);
    expect(listDraftHistories).toHaveBeenCalledWith(7, undefined);

    await caller.content.history({ brandId: 2 });
    expect(listDraftHistories).toHaveBeenCalledWith(7, 2);
  });

  it("retrieves a single draft history with owner check", async () => {
    const mockDraft = { id: 101, userId: 7, brandId: 1, title: "단건 초안", intro: "도입", body: "본문", ending: "마무리", hashtags: "#태그", keywords: "키워드", seoScore: 92, createdAt: new Date() };
    getDraftHistory.mockResolvedValue(mockDraft);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context(7));

    const result = await caller.content.get({ draftId: 101 });
    expect(result).toEqual(mockDraft);
    expect(getDraftHistory).toHaveBeenCalledWith(7, 101);
  });

  it("throws NOT_FOUND when draft is missing or user does not own it", async () => {
    getDraftHistory.mockResolvedValue(null);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context(7));

    await expect(caller.content.get({ draftId: 999 })).rejects.toThrow("초안을 찾을 수 없습니다.");
  });

  it("updates an existing draft history with owner verification", async () => {
    const updatedDraft = { id: 101, userId: 7, brandId: 1, title: "수정된 제목", intro: "수정된 도입부", body: "수정된 본문", ending: "수정된 마무리", hashtags: "#수정태그", keywords: "새키워드", seoScore: 95, createdAt: new Date() };
    updateDraftHistory.mockResolvedValue(updatedDraft);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context(7));

    const result = await caller.content.update({
      draftId: 101,
      title: "수정된 제목",
      intro: "수정된 도입부",
      body: "수정된 본문",
      ending: "수정된 마무리",
      hashtags: "#수정태그",
      keywords: "새키워드",
      seoScore: 95,
    });

    expect(result).toEqual({ success: true, draft: updatedDraft });
    expect(updateDraftHistory).toHaveBeenCalledWith(7, 101, {
      title: "수정된 제목",
      intro: "수정된 도입부",
      body: "수정된 본문",
      ending: "수정된 마무리",
      hashtags: "#수정태그",
      keywords: "새키워드",
      seoScore: 95,
    });
  });

  it("rejects updating when draft does not belong to user", async () => {
    updateDraftHistory.mockResolvedValue(null);
    const { appRouter } = await import("./routers");
    const caller = appRouter.createCaller(context(7));

    await expect(
      caller.content.update({
        draftId: 102,
        title: "남의 초안 수정",
        intro: "도입",
        body: "본문",
        ending: "마무리",
        hashtags: "#태그",
      })
    ).rejects.toThrow("수정할 초안을 찾을 수 없거나 수정 권한이 없습니다.");
  });
});
