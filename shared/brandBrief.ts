export type BrandService = {
  name: string;
  description?: string;
  price?: string;
  duration?: string;
  audience?: string;
  notes?: string;
};

export type BrandFaq = {
  question: string;
  answer: string;
};

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
  services?: BrandService[];
  expertise?: string;
  faqs?: BrandFaq[];
  verifiedFacts?: string[];
  sourceLinks?: string[];
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
  services: [],
  expertise: "",
  faqs: [],
  verifiedFacts: [],
  sourceLinks: [],
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function parseBrandBrief(value?: string | null): BrandBrief {
  if (!value) return { ...emptyBrandBrief };
  try {
    const parsed = JSON.parse(value) as Partial<BrandBrief> & Record<string, unknown>;
    const services = Array.isArray(parsed.services)
      ? parsed.services.filter(item => item && typeof item === "object" && typeof (item as BrandService).name === "string") as BrandService[]
      : [];
    const faqs = Array.isArray(parsed.faqs)
      ? parsed.faqs.filter(item => item && typeof item === "object" && typeof (item as BrandFaq).question === "string" && typeof (item as BrandFaq).answer === "string") as BrandFaq[]
      : [];
    return {
      ...emptyBrandBrief,
      ...parsed,
      services,
      expertise: typeof parsed.expertise === "string" ? parsed.expertise : parsed.factsToUse ?? "",
      faqs,
      verifiedFacts: stringArray(parsed.verifiedFacts),
      sourceLinks: stringArray(parsed.sourceLinks),
    };
  } catch {
    return { ...emptyBrandBrief };
  }
}

export function serializeBrandBrief(brief: Partial<BrandBrief>): string {
  return JSON.stringify({ ...emptyBrandBrief, ...brief });
}
