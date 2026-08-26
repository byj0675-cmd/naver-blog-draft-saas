import { describe, expect, it } from "vitest";
import { estimateDeepSeekUsd, monthlyTwelveDraftEstimate } from "../shared/aiCost";

describe("DeepSeek cost estimates", () => {
  it("calculates input and output token cost", () => {
    expect(estimateDeepSeekUsd({ inputTokens: 1_000_000, outputTokens: 1_000_000 })).toBeCloseTo(0.88);
  });
  it("estimates the twelve-draft monthly workload", () => {
    expect(monthlyTwelveDraftEstimate()).toBeCloseTo(0.06314, 5);
  });
});
