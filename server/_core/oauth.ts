import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState, encodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function kakaoRedirectUri(req: Request) {
  if (ENV.kakaoRedirectUri) return ENV.kakaoRedirectUri;
  const host = req.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? req.protocol : "https";
  return `${protocol}://${host}/api/auth/kakao/callback`;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/kakao/start", (req: Request, res: Response) => {
    if (!ENV.kakaoRestApiKey) {
      res.status(503).json({ error: "Kakao REST API key is not configured" });
      return;
    }
    const redirectUri = kakaoRedirectUri(req);
    const nonce = crypto.randomUUID();
    const state = encodeOAuthState({ redirectUri, nonce });
    const isSecure = kakaoRedirectUri(req).startsWith("https");
    res.cookie(OAUTH_STATE_COOKIE, nonce, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 600_000
    });
    const url = new URL("https://kauth.kakao.com/oauth/authorize");
    url.searchParams.set("client_id", ENV.kakaoRestApiKey);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    res.redirect(302, url.toString());
  });

  app.get("/api/auth/kakao/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const kakaoError = getQueryParam(req, "error");
    if (kakaoError) {
      res.redirect(302, `/?authError=${encodeURIComponent(kakaoError)}`);
      return;
    }
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const decodedState = decodeOAuthState(state);
    const currentRedirect = kakaoRedirectUri(req);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];

    // Check nonce if present, or allow if state decoded valid redirectUri
    if (!decodedState.redirectUri) {
      res.status(403).json({ error: "invalid kakao oauth state: missing redirectUri" });
      return;
    }
    if (expectedNonce && decodedState.nonce && decodedState.nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid kakao oauth state: nonce mismatch" });
      return;
    }
    const isSecure = currentRedirect.startsWith("https");
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: isSecure, sameSite: "lax" });

    try {
      const tokenBody = new URLSearchParams({ grant_type: "authorization_code", client_id: ENV.kakaoRestApiKey, redirect_uri: decodedState.redirectUri, code });
      if (ENV.kakaoClientSecret) tokenBody.set("client_secret", ENV.kakaoClientSecret);
      const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" }, body: tokenBody });
      const token = await tokenResponse.json() as { access_token?: string; error_description?: string };
      if (!tokenResponse.ok || !token.access_token) throw new Error(token.error_description || "Kakao token exchange failed");

      const profileResponse = await fetch("https://kapi.kakao.com/v2/user/me", { headers: { Authorization: `Bearer ${token.access_token}` } });
      const profile = await profileResponse.json() as { id?: number; kakao_account?: { email?: string; profile?: { nickname?: string } }; properties?: { nickname?: string } };
      if (!profileResponse.ok || !profile.id) throw new Error("Kakao profile lookup failed");
      const openId = `kakao:${profile.id}`;
      const name = profile.kakao_account?.profile?.nickname || profile.properties?.nickname || "카카오 사용자";
      await db.upsertUser({ openId, name, email: profile.kakao_account?.email ?? null, loginMethod: "kakao", lastSignedIn: new Date() });
      const sessionToken = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[Kakao OAuth] Callback failed:", errMsg, error);
      res.status(502).json({ error: "Kakao login failed", detail: errMsg });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) { res.status(400).json({ error: "code and state are required" }); return; }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) { res.status(403).json({ error: "invalid oauth state" }); return; }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) { res.status(400).json({ error: "openId missing from user info" }); return; }
      await db.upsertUser({ openId: userInfo.openId, name: userInfo.name || null, email: userInfo.email ?? null, loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null, lastSignedIn: new Date() });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, { name: userInfo.name || "", expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
