import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeTextModel, parseModelJson } from "./aiProvider";
import { parseBrandBrief, serializeBrandBrief } from "@shared/brandBrief";
import { generateImage } from "./_core/imageGeneration";
import { createBrandProfile, getBrandProfile, updateBrandProfile, getSubscription, getToneProfile, listBrandProfiles, listDraftHistories, getDraftHistory, updateDraftHistory, saveDraftHistory, saveToneProfile, reserveDraftRegeneration, releaseDraftRegeneration, reserveMonthlyGeneration, releaseMonthlyGeneration, createPaymentRequest, listPaymentRequests, markPaymentSent, markPaymentPaid, reviewPaymentRequest, getMonthlyUsage } from "./db";
const brandBriefSchema = z.object({
  location: z.string().optional(), address: z.string().optional(), phone: z.string().optional(), website: z.string().optional(), businessHours: z.string().optional(), priceInfo: z.string().optional(), uniquePoints: z.string().optional(), brandStory: z.string().optional(), primaryKeywords: z.string().optional(), secondaryKeywords: z.string().optional(), customerQuestions: z.string().optional(), factsToUse: z.string().optional(), forbiddenClaims: z.string().optional(), toneNotes: z.string().optional(), callToAction: z.string().optional(),
  services: z.array(z.object({ name: z.string(), description: z.string().optional(), price: z.string().optional(), duration: z.string().optional(), audience: z.string().optional(), notes: z.string().optional() })).optional(), expertise: z.string().optional(), faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(), verifiedFacts: z.array(z.string()).optional(), sourceLinks: z.array(z.string().url()).optional(),
});

const draftSchema = z.object({
  brand: z.object({ name: z.string(), industry: z.string().optional(), services: z.string().optional(), audience: z.string().optional(), strengths: z.string().optional(), tone: z.string().optional(), brief: brandBriefSchema.optional() }),
  brandId: z.number().int().positive().default(1), primaryKeyword: z.string().min(1), secondaryKeywords: z.array(z.string()).default([]), purpose: z.string(), length: z.string().default("1,500자"),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  brands: router({
    list: protectedProcedure.query(({ ctx }) => listBrandProfiles(ctx.user.id)),
    get: protectedProcedure.input(z.object({ brandId: z.number().int().positive() })).query(({ ctx, input }) => getBrandProfile(ctx.user.id, input.brandId)),
    create: protectedProcedure.input(z.object({ name: z.string().min(1), industry: z.string().optional(), services: z.string().optional(), audience: z.string().optional(), strengths: z.string().optional(), brief: brandBriefSchema.optional() })).mutation(({ ctx, input }) => createBrandProfile({ name: input.name, industry: input.industry, services: input.services, audience: input.audience, strengths: input.strengths, briefJson: serializeBrandBrief(input.brief ?? {}) , userId: ctx.user.id })),
    update: protectedProcedure.input(z.object({ brandId: z.number().int().positive(), name: z.string().min(1).optional(), industry: z.string().optional(), services: z.string().optional(), audience: z.string().optional(), strengths: z.string().optional(), brief: brandBriefSchema.optional() })).mutation(({ ctx, input }) => updateBrandProfile(ctx.user.id, input.brandId, { name: input.name, industry: input.industry, services: input.services, audience: input.audience, strengths: input.strengths, ...(input.brief ? { briefJson: serializeBrandBrief(input.brief) } : {}) })),
    tone: protectedProcedure.input(z.object({ brandId: z.number() })).query(({ input }) => getToneProfile(input.brandId)),
  }),
  content: router({
    generate: protectedProcedure.input(draftSchema.extend({ draftId: z.number().optional(), regenerate: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const subscription = await getSubscription(ctx.user.id);
      if (subscription?.isExpired) throw new TRPCError({ code: "FORBIDDEN", message: "구독 기간이 만료되었습니다. 결제 후 다시 이용해 주세요." });
      const storedBrand = await getBrandProfile(ctx.user.id, input.brandId);
      const brand = storedBrand ? { name: storedBrand.name, industry: storedBrand.industry ?? undefined, services: storedBrand.services ?? undefined, audience: storedBrand.audience ?? undefined, strengths: storedBrand.strengths ?? undefined, brief: parseBrandBrief(storedBrand.briefJson) } : input.brand;
      const monthly = await reserveMonthlyGeneration(ctx.user.id, input.brandId, 12);
      if (!monthly.allowed) throw new TRPCError({ code: "FORBIDDEN", message: "이번 달 생성 한도(12건)를 모두 사용했습니다." });
      let regenerationReserved = false;
      if (input.regenerate && input.draftId) {
        const regeneration = await reserveDraftRegeneration(ctx.user.id, input.draftId, 3);
        if (!regeneration.allowed) {
          await releaseMonthlyGeneration(ctx.user.id, input.brandId, monthly.periodKey);
          throw new TRPCError({ code: "FORBIDDEN", message: "이 초안의 재생성 한도(3회)를 모두 사용했습니다." });
        }
        regenerationReserved = true;
      }
      try {
      const response = await invokeTextModel({
        messages: [
          {
            role: "system",
            content: `당신은 네이버 블로그 전문 편집자입니다. 검색엔진만을 위한 단순 키워드 나열을 엄격히 피하고, 독자에게 신뢰를 주는 한국어 비즈니스 콘텐츠를 작성합니다.
다음의 [네이버 블로그 SEO 필수 8대 체크리스트]를 반드시 준수하여 작성해야 합니다:
1. 제목 작성: 핵심 키워드를 반드시 제목의 앞부분에 배치하고, 길이는 30~40자 이내로 간결하고 클릭하고 싶게 작성할 것 (후보 3개 모두 준수).
2. 도입부(intro): 첫 문단에 핵심 키워드를 반드시 자연스럽게 포함할 것.
3. 본문(body) 키워드: 본문 전체에 걸쳐 핵심 키워드를 어색하지 않게 2~3회 자연스럽게 반복할 것 (과도한 반복 금지).
4. 본문 구조: 명확한 소제목(소제목1, 소제목2 등)을 사용하여 내용을 3단계 이상 논리적으로 구조화할 것.
5. 이미지 배치: 본문 중간에 독자의 이해를 돕는 사진 삽입 위치(예: [사진 1: 현장 시공 전 모습], [사진 2: 세부 작업 과정], [사진 3: 완성된 공간 전경])를 3장 이상 명시할 것.
6. 관련 글 링크: 본문 끝이나 단락 사이에 자연스럽게 참고할 수 있는 [관련 글: 함께 읽으면 도움되는 시공/상담 사례 링크] 안내를 포함할 것.
7. 분량: 전체 글은 풍부한 정보와 현장감을 담아 1,500자 이상의 충분한 길이로 작성할 것.
8. 반환 형식: 반드시 JSON 형식으로 titleCandidates(제목 3개 배열), title, intro, body, ending, hashtags를 반환합니다.`
          },
          {
            role: "user",
            content: `브랜드: ${JSON.stringify(brand)}\n핵심 키워드: ${input.primaryKeyword}\n보조 키워드: ${input.secondaryKeywords.join(", ")}\n목적: ${input.purpose}\n분량: ${input.length}\n상세 업체 브리프: ${JSON.stringify(brand.brief ?? {})}\n톤: ${input.brand.tone ?? "차분하고 진정성 있는 존댓말"}\n\n위 정보를 바탕으로 8대 SEO 체크리스트(제목 앞 키워드 배치 및 30~40자 이내, 첫 문단 키워드 포함, 본문 키워드 2~3회, 소제목 구조화, 이미지 3장 이상 안내, 관련 링크 안내, 1,500자 이상)를 엄격히 적용해 작성해 주세요.`
          },
        ],
        response_format: { type: "json_schema", json_schema: { name: "naver_blog_draft", strict: true, schema: { type: "object", properties: { titleCandidates: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 }, title: { type: "string" }, intro: { type: "string" }, body: { type: "string" }, ending: { type: "string" }, hashtags: { type: "string" } }, required: ["titleCandidates", "title", "intro", "body", "ending", "hashtags"], additionalProperties: false } } },
      });
      const content = response.choices?.[0]?.message?.content;
      const draft = parseModelJson<{ titleCandidates: string[]; title: string; intro: string; body: string; ending: string; hashtags: string }>(content);
      return { draft, creditsUsed: 1, monthlyUsed: monthly.used, regenerationsUsed: regenerationReserved ? 1 : 0, userId: ctx.user.id };
      } catch (error) {
        await releaseMonthlyGeneration(ctx.user.id, input.brandId, monthly.periodKey);
        if (regenerationReserved && input.draftId) await releaseDraftRegeneration(ctx.user.id, input.draftId);
        throw error;
      }
    }),
    save: protectedProcedure.input(z.object({ brandId: z.number(), title: z.string(), intro: z.string(), body: z.string(), ending: z.string(), hashtags: z.string(), keywords: z.string(), seoScore: z.number() })).mutation(({ ctx, input }) => saveDraftHistory({ ...input, userId: ctx.user.id })),
    history: protectedProcedure.input(z.object({ brandId: z.number().optional() }).optional()).query(({ ctx, input }) => listDraftHistories(ctx.user.id, input?.brandId)),
    get: protectedProcedure.input(z.object({ draftId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const draft = await getDraftHistory(ctx.user.id, input.draftId);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "초안을 찾을 수 없습니다." });
      return draft;
    }),
    update: protectedProcedure.input(z.object({
      draftId: z.number().int().positive(),
      title: z.string().min(1),
      intro: z.string(),
      body: z.string().min(1),
      ending: z.string(),
      hashtags: z.string(),
      keywords: z.string().optional(),
      seoScore: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { draftId, ...data } = input;
      const updated = await updateDraftHistory(ctx.user.id, draftId, data);
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "수정할 초안을 찾을 수 없거나 수정 권한이 없습니다." });
      return { success: true, draft: updated };
    }),
    generateVisual: protectedProcedure.input(z.object({ prompt: z.string().min(1), originalImageUrl: z.string().url().optional() })).mutation(async ({ input }) => generateImage({ prompt: input.prompt, originalImages: input.originalImageUrl ? [{ url: input.originalImageUrl, mimeType: "image/jpeg" }] : undefined })),
    analyzeUrl: protectedProcedure.input(z.object({ url: z.string().url() })).mutation(async ({ input }) => {
      const parsed = new URL(input.url);
      if (!/(^|\\.)blog\\.naver\\.com$/.test(parsed.hostname) && parsed.hostname !== "m.blog.naver.com") throw new Error("네이버 블로그 URL만 분석할 수 있습니다.");
      const response = await fetch(input.url, { headers: { "User-Agent": "Mozilla/5.0 blogmate-content-reader" } });
      if (!response.ok) throw new Error(`본문을 가져오지 못했습니다. (${response.status})`);
      const html = await response.text();
      const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\\s+/g, " ").trim();
      if (text.length < 80) throw new Error("본문이 비어 있거나 수집할 수 없는 글입니다.");
      return { url: input.url, text: text.slice(0, 18000), characterCount: text.length };
    }),
    analyzeTone: protectedProcedure.input(z.object({ brandId: z.number(), samples: z.array(z.string()).min(1) })).mutation(async ({ input }) => {
      const response = await invokeTextModel({ messages: [{ role: "system", content: "한국어 블로그 글 샘플의 말투, 문장 길이, 구성, 표현 습관을 JSON으로 분석합니다." }, { role: "user", content: input.samples.join("\n\n") }], response_format: { type: "json_schema", json_schema: { name: "tone_profile", strict: true, schema: { type: "object", properties: { summary: { type: "string" }, sentenceLength: { type: "string" }, patterns: { type: "array", items: { type: "string" } } }, required: ["summary", "sentenceLength", "patterns"], additionalProperties: false } } } });
      const profile = parseModelJson<{ summary: string; sentenceLength: string; patterns: string[] }>(response.choices?.[0]?.message?.content);
      return saveToneProfile({ brandId: input.brandId, sampleCount: input.samples.length, profileJson: JSON.stringify(profile) });
    }),
  }),
  usage: router({
    current: protectedProcedure.input(z.object({ brandId: z.number().int().positive().default(1) }).optional()).query(({ ctx, input }) => getMonthlyUsage(ctx.user.id, input?.brandId ?? 1, 12)),
  }),
  billing: router({
    current: protectedProcedure.query(({ ctx }) => getSubscription(ctx.user.id)),
    requestManual: protectedProcedure.input(z.object({ plan: z.string().min(1), amount: z.number().int().positive(), payerName: z.string().min(1), businessName: z.string().optional(), phone: z.string().optional(), billingCycle: z.enum(["monthly", "yearly"]).default("monthly"), note: z.string().optional() })).mutation(({ ctx, input }) => createPaymentRequest({ ...input, userId: ctx.user.id, status: "pending" })),
    adminList: protectedProcedure.query(({ ctx }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return listPaymentRequests(); }),
    adminMarkSent: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return markPaymentSent(input.id); }),
    adminMarkPaid: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return markPaymentPaid(input.id); }),
    adminReview: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]), note: z.string().optional() })).mutation(({ ctx, input }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return reviewPaymentRequest(input.id, ctx.user.id, input.status, input.note); }),
  }),
});

export type AppRouter = typeof appRouter;
