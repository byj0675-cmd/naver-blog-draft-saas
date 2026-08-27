import { invokeLLM } from "./_core/llm";

type LlmInput = Parameters<typeof invokeLLM>[0];

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
  const maxTokens = Math.min(2400, Math.max(900, Math.ceil(Number(requestedLength) * 0.75)));
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
  return response.json() as Promise<{ choices?: Array<{ message?: { content?: string } }> }>;
}
