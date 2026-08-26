import { describe, expect, it } from "vitest";
import { auditDraft } from "../shared/seo";

describe("auditDraft", () => {
  it("returns healthy results for a readable draft", () => {
    const result = auditDraft("성수동 도자기 원데이클래스를 소개합니다.\n\n초보자도 편하게 시작할 수 있어요.", "성수동 도자기");
    expect(result.keywordCount).toBe(1);
    expect(result.repetitionStatus).toBe("healthy");
    expect(result.readabilityStatus).toBe("healthy");
    expect(result.paragraphCount).toBe(2);
  });

  it("flags excessive keyword repetition", () => {
    const result = auditDraft(Array.from({ length: 11 }, () => "핵심 키워드").join(" "), "핵심 키워드");
    expect(result.repetitionStatus).toBe("review");
  });
});
