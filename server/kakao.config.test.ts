import { describe, expect, it } from "vitest";

describe("Kakao OAuth configuration", () => {
  it("accepts a configured redirect URI with the Kakao callback path", () => {
    const redirectUri = process.env.KAKAO_REDIRECT_URI;
    expect(redirectUri, "KAKAO_REDIRECT_URI must be configured").toBeTruthy();
    const parsed = new URL(redirectUri as string);
    expect(["http:", "https:"].includes(parsed.protocol)).toBe(true);
    expect(parsed.pathname).toContain("/api/auth/kakao/callback");
  });
});
