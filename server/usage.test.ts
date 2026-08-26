import { describe, expect, it } from "vitest";
import { DEFAULT_MONTHLY_GENERATION_LIMIT, DEFAULT_REGENERATION_LIMIT, isWithinLimit, usageLabel } from "../shared/usage";

describe("usage policy", () => {
  it("allows generation below the monthly limit and blocks the limit", () => {
    expect(isWithinLimit(11, DEFAULT_MONTHLY_GENERATION_LIMIT)).toBe(true);
    expect(isWithinLimit(12, DEFAULT_MONTHLY_GENERATION_LIMIT)).toBe(false);
    expect(usageLabel(12, DEFAULT_MONTHLY_GENERATION_LIMIT)).toBe("12/12");
  });

  it("allows up to three regenerations and blocks the fourth", () => {
    expect(isWithinLimit(0, DEFAULT_REGENERATION_LIMIT)).toBe(true);
    expect(isWithinLimit(2, DEFAULT_REGENERATION_LIMIT)).toBe(true);
    expect(isWithinLimit(3, DEFAULT_REGENERATION_LIMIT)).toBe(false);
  });
});
