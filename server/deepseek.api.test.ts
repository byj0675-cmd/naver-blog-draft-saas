import { describe, expect, it } from "vitest";

describe("DeepSeek API configuration", () => {
  it("authenticates against the models endpoint", async () => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    expect(apiKey, "DEEPSEEK_API_KEY must be configured").toBeTruthy();
    const response = await fetch("https://api.deepseek.com/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(response.status).toBeLessThan(500);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  }, 15_000);
});
