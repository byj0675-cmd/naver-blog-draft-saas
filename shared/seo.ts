export type SeoAudit = {
  keywordCount: number;
  characterCount: number;
  paragraphCount: number;
  repetitionStatus: "healthy" | "review";
  readabilityStatus: "healthy" | "review";
};

export function auditDraft(text: string, keyword: string): SeoAudit {
  const normalized = text.trim();
  const keywordCount = keyword ? normalized.split(keyword).length - 1 : 0;
  const paragraphs = normalized.split(/\n\s*\n/).filter(Boolean);
  const averageParagraphLength = paragraphs.length ? normalized.length / paragraphs.length : 0;
  return {
    keywordCount,
    characterCount: normalized.length,
    paragraphCount: paragraphs.length,
    repetitionStatus: keywordCount <= 10 ? "healthy" : "review",
    readabilityStatus: averageParagraphLength <= 520 ? "healthy" : "review",
  };
}
