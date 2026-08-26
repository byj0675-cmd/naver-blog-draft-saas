import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { createBrandProfile, listBrandProfiles, saveDraftHistory } from "./db";

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
  }),
});

export type AppRouter = typeof appRouter;
