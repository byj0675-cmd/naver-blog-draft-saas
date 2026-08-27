import { describe, expect, it } from "vitest";

describe("Kakao REST API key", () => {
  it("builds a valid Kakao OAuth authorize URL with the configured app key", () => {
    const appKey = process.env.KAKAO_REST_API_KEY;
    expect(appKey, "KAKAO_REST_API_KEY must be configured").toMatch(/^[a-f0-9]{32}$/i);
    const url = new URL("https://kauth.kakao.com/oauth/authorize");
    url.searchParams.set("client_id", appKey as string);
    url.searchParams.set("redirect_uri", "https://example.com/api/auth/kakao/callback");
    url.searchParams.set("response_type", "code");
    expect(url.hostname).toBe("kauth.kakao.com");
    expect(url.searchParams.get("client_id")).toBe(appKey);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("redirect_uri")).toContain("/api/auth/kakao/callback");
  });
});
