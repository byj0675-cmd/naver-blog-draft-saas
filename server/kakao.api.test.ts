import { describe, expect, it } from "vitest";

describe("Kakao REST API key", () => {
  it("reaches the Kakao OAuth authorize endpoint with the configured app key", async () => {
    const appKey = process.env.KAKAO_REST_API_KEY;
    expect(appKey, "KAKAO_REST_API_KEY must be configured").toMatch(/^[a-f0-9]{32}$/i);
    const url = new URL("https://kauth.kakao.com/oauth/authorize");
    url.searchParams.set("client_id", appKey as string);
    url.searchParams.set("redirect_uri", "https://example.com/api/auth/kakao/callback");
    url.searchParams.set("response_type", "code");
    const response = await fetch(url, { redirect: "manual" });
    expect(response.status).toBeLessThan(500);
    const body = await response.text();
    expect(body.toLowerCase()).not.toContain("invalid_client");
  }, 15_000);
});
