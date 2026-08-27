import { describe, expect, it } from "vitest";
import { parseJsonResponse, parseModelJson } from "./aiProvider";

describe("AI model JSON parsing", () => {
  it("parses a normal JSON string", () => {
    expect(parseModelJson<{ title: string }>(`{"title":"테스트"}`)).toEqual({ title: "테스트" });
  });

  it("parses JSON wrapped in a markdown code block", () => {
    expect(parseModelJson<{ title: string }>("```json\n{\"title\":\"테스트\"}\n```")).toEqual({ title: "테스트" });
  });

  it("rejects empty and non-JSON HTTP responses clearly", async () => {
    await expect(parseJsonResponse(new Response(""))).rejects.toThrow("DeepSeek API가 빈 응답을 반환했습니다");
    await expect(parseJsonResponse(new Response("not-json"))).rejects.toThrow("DeepSeek API가 JSON이 아닌 응답을 반환했습니다");
  });

  it("returns a clear error for an empty or truncated model response", () => {
    expect(() => parseModelJson("")).toThrow("AI 응답이 비어 있습니다");
    expect(() => parseModelJson('{"title":"테스트"')).toThrow("AI 응답이 완성되기 전에 종료되었습니다");
  });
});
