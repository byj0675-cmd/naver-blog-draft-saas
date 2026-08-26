import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { createBrandProfile, getSubscription, getToneProfile, listBrandProfiles, listDraftHistories, saveDraftHistory, saveToneProfile } from "./db";

const draftSchema = z.object({
  brand: z.object({ name: z.string(), industry: z.string().optional(), services: z.string().optional(), audience: z.string().optional(), strengths: z.string().optional(), tone: z.string().optional() }),
  primaryKeyword: z.string().min(1), secondaryKeywords: z.array(z.string()).default([]), purpose: z.string(), length: z.string().default("1,500자"),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  brands: router({
    list: protectedProcedure.query(({ ctx }) => listBrandProfiles(ctx.user.id)),
    create: protectedProcedure.input(z.object({ name: z.string().min(1), industry: z.string().optional(), services: z.string().optional(), audience: z.string().optional(), strengths: z.string().optional() })).mutation(({ ctx, input }) => createBrandProfile({ ...input, userId: ctx.user.id })),
    tone: protectedProcedure.input(z.object({ brandId: z.number() })).query(({ input }) => getToneProfile(input.brandId)),
  }),
  content: router({
    generate: protectedProcedure.input(draftSchema).mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "당신은 네이버 블로그 편집자입니다. 검색엔진만을 위한 키워드 나열을 피하고 독자에게 유용한 한국어 콘텐츠를 작성합니다. 반드시 JSON 형식으로 title, intro, body, ending, hashtags를 반환합니다." },
          { role: "user", content: `브랜드: ${JSON.stringify(input.brand)}\n핵심 키워드: ${input.primaryKeyword}\n보조 키워드: ${input.secondaryKeywords.join(", ")}\n목적: ${input.purpose}\n분량: ${input.length}\n톤: ${input.brand.tone ?? "차분하고 진정성 있는 존댓말"}` },
        ],
        response_format: { type: "json_schema", json_schema: { name: "naver_blog_draft", strict: true, schema: { type: "object", properties: { title: { type: "string" }, intro: { type: "string" }, body: { type: "string" }, ending: { type: "string" }, hashtags: { type: "string" } }, required: ["title", "intro", "body", "ending", "hashtags"], additionalProperties: false } } },
      });
      const content = response.choices?.[0]?.message?.content;
      const draft = typeof content === "string" ? JSON.parse(content) : content;
      return { draft, creditsUsed: 1, userId: ctx.user.id };
    }),
    save: protectedProcedure.input(z.object({ brandId: z.number(), title: z.string(), intro: z.string(), body: z.string(), ending: z.string(), hashtags: z.string(), keywords: z.string(), seoScore: z.number() })).mutation(({ ctx, input }) => saveDraftHistory({ ...input, userId: ctx.user.id })),
    history: protectedProcedure.query(({ ctx }) => listDraftHistories(ctx.user.id)),
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
      const response = await invokeLLM({ messages: [{ role: "system", content: "한국어 블로그 글 샘플의 말투, 문장 길이, 구성, 표현 습관을 JSON으로 분석합니다." }, { role: "user", content: input.samples.join("\n\n") }], response_format: { type: "json_schema", json_schema: { name: "tone_profile", strict: true, schema: { type: "object", properties: { summary: { type: "string" }, sentenceLength: { type: "string" }, patterns: { type: "array", items: { type: "string" } } }, required: ["summary", "sentenceLength", "patterns"], additionalProperties: false } } } });
      const profileJson = typeof response.choices?.[0]?.message?.content === "string" ? response.choices[0].message.content : JSON.stringify(response.choices?.[0]?.message?.content ?? {});
      return saveToneProfile({ brandId: input.brandId, sampleCount: input.samples.length, profileJson });
    }),
  }),
  billing: router({ current: protectedProcedure.query(({ ctx }) => getSubscription(ctx.user.id)) }),
});

export type AppRouter = typeof appRouter;
