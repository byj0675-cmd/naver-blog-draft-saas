import { invokeLLM } from "./_core/llm";

type LlmInput = Parameters<typeof invokeLLM>[0];

export async function invokeTextModel(input: LlmInput) {
  if (process.env.TEXT_AI_PROVIDER !== "deepseek" || !process.env.DEEPSEEK_API_KEY) return invokeLLM(input);
  const messages = input.messages.map(message => ({ role: message.role, content: typeof message.content === "string" ? message.content : JSON.stringify(message.content) }));
  const response = await fetch(process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash", messages, response_format: { type: "json_object" }, stream: false }),
  });
  if (!response.ok) throw new Error(`DeepSeek API 요청 실패 (${response.status})`);
  return response.json() as Promise<{ choices?: Array<{ message?: { content?: string } }> }>;
}
