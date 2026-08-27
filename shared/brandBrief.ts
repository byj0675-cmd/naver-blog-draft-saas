export type BrandBrief = {
  location: string;
  address: string;
  phone: string;
  website: string;
  businessHours: string;
  priceInfo: string;
  uniquePoints: string;
  brandStory: string;
  primaryKeywords: string;
  secondaryKeywords: string;
  customerQuestions: string;
  factsToUse: string;
  forbiddenClaims: string;
  toneNotes: string;
  callToAction: string;
};

export const emptyBrandBrief: BrandBrief = {
  location: "",
  address: "",
  phone: "",
  website: "",
  businessHours: "",
  priceInfo: "",
  uniquePoints: "",
  brandStory: "",
  primaryKeywords: "",
  secondaryKeywords: "",
  customerQuestions: "",
  factsToUse: "",
  forbiddenClaims: "",
  toneNotes: "",
  callToAction: "",
};

export function parseBrandBrief(value?: string | null): BrandBrief {
  if (!value) return { ...emptyBrandBrief };
  try {
    const parsed = JSON.parse(value) as Partial<BrandBrief>;
    return { ...emptyBrandBrief, ...parsed };
  } catch {
    return { ...emptyBrandBrief };
  }
}
