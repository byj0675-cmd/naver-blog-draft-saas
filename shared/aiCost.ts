export type TokenUsage = { inputTokens: number; outputTokens: number };

export const DEEPSEEK_FLASH_OFF_PEAK = { inputPerMillion: 0.22, outputPerMillion: 0.66 };

export function estimateDeepSeekUsd(usage: TokenUsage, rates = DEEPSEEK_FLASH_OFF_PEAK) {
  return (usage.inputTokens / 1_000_000) * rates.inputPerMillion + (usage.outputTokens / 1_000_000) * rates.outputPerMillion;
}

export function monthlyTwelveDraftEstimate() {
  return estimateDeepSeekUsd({ inputTokens: 155_000, outputTokens: 44_000 });
}
