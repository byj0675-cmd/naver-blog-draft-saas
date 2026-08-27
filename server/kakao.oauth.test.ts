import express from "express";
import { describe, expect, it, vi, afterEach } from "vitest";
import { encodeOAuthState, COOKIE_NAME, OAUTH_STATE_COOKIE } from "../shared/const";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { registerOAuthRoutes } from "./_core/oauth";

afterEach(() => vi.restoreAllMocks());

describe("Kakao OAuth callback", () => {
  it("exchanges code, upserts the user, and issues the compatible session cookie", async () => {
    const app = express();
    registerOAuthRoutes(app);
    const nonce = "oauth-test-nonce";
    const redirectUri = process.env.KAKAO_REDIRECT_URI as string;
    const state = encodeOAuthState({ redirectUri, nonce });
    const upsertUser = vi.spyOn(db, "upsertUser").mockResolvedValue(undefined);
    vi.spyOn(sdk, "createSessionToken").mockResolvedValue("session-token");
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "kakao-access-token" }), { status: 200, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 12345, properties: { nickname: "테스트 사용자" }, kakao_account: { email: "test@example.com" } }), { status: 200, headers: { "content-type": "application/json" } }));

    const cookies: Array<{ name: string; value: string }> = [];
    let redirect = "";
    let statusCode = 200;
    const response = {
      cookie: (name: string, value: string) => cookies.push({ name, value }),
      clearCookie: vi.fn(),
      redirect: (_status: number, url: string) => { redirect = url; },
      status: (code: number) => { statusCode = code; return response; },
      json: vi.fn(),
    } as any;
    const request = {
      query: { code: "auth-code", state },
      headers: { cookie: `${OAUTH_STATE_COOKIE}=${nonce}` },
      protocol: "https",
      get: () => new URL(redirectUri).host,
    } as any;
    const routeLayer = (app as any)._router.stack.find((layer: any) => layer.route?.path === "/api/auth/kakao/callback");
    await routeLayer.route.stack[0].handle(request, response);

    expect(statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "kakao:12345", name: "테스트 사용자", email: "test@example.com", loginMethod: "kakao" }));
    expect(cookies).toContainEqual({ name: COOKIE_NAME, value: "session-token" });
    expect(redirect).toBe("/");
  });
});
