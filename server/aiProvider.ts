import { invokeLLM } from "./_core/llm";

type LlmInput = Parameters<typeof invokeLLM>[0];

export function parseModelJson<T extends Record<string, unknown>>(content: unknown): T {
  if (content && typeof content === "object") return content as T;
  if (typeof content !== "string" || !content.trim()) throw new Error("AI 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.");
  const normalized = content.trim().replace(/^```(?:json)?\\s*/i, "").replace(/\\s*```$/, "").trim();
  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  if (start < 0) throw new Error("AI 응답이 올바른 JSON 형식이 아닙니다. 잠시 후 다시 시도해 주세요.");
  if (end < 0 || end <= start) throw new Error("AI 응답이 완성되기 전에 종료되었습니다. 글 생성을 다시 시도해 주세요.");
  try {
    return JSON.parse(normalized.slice(start, end + 1)) as T;
  } catch {
    throw new Error("AI 응답이 완성되기 전에 종료되었습니다. 글 생성을 다시 시도해 주세요.");
  }
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  if (!body.trim()) throw new Error("DeepSeek API가 빈 응답을 반환했습니다. 잠시 후 다시 시도해 주세요.");
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error("DeepSeek API가 JSON이 아닌 응답을 반환했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

function compactMessages(input: LlmInput) {
  return input.messages.map(message => ({
    role: message.role,
    content: typeof message.content === "string" ? message.content.trim() : JSON.stringify(message.content),
  }));
}

export async function invokeTextModel(input: LlmInput) {
  if (process.env.TEXT_AI_PROVIDER !== "deepseek" || !process.env.DEEPSEEK_API_KEY) return invokeLLM(input);
  const messages = compactMessages(input);
  const userText = messages.filter(message => message.role === "user").map(message => message.content).join(" ");
  const requestedLength = /([1-9],[0-9]{3})자/.exec(userText)?.[1]?.replace(",", "") ?? "1500";
  const maxTokens = Math.min(3600, Math.max(1800, Math.ceil(Number(requestedLength) * 1.1)));
  const response = await fetch(process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      messages,
      temperature: 0.65,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      stream: false,
    }),
  });
  if (!response.ok) throw new Error(`DeepSeek API 요청 실패 (${response.status})`);
  return parseJsonResponse<{ choices?: Array<{ message?: { content?: string } }> }>(response);
}
