import { describe, expect, it } from "vitest";

describe("DeepSeek generation configuration", () => {
  it("uses the configured provider and an available model", async () => {
    expect(process.env.TEXT_AI_PROVIDER).toBe("deepseek");
    expect(process.env.DEEPSEEK_MODEL).toBeTruthy();
    const response = await fetch("https://api.deepseek.com/models", {
      headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { data?: Array<{ id?: string }> };
    expect(payload.data?.some(model => model.id === process.env.DEEPSEEK_MODEL)).toBe(true);
  }, 15_000);
});
