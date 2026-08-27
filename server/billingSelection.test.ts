import { describe, expect, it } from "vitest";
import { parseBillingSelection, serializeBillingSelection } from "../shared/billingSelection";

describe("billing selection handoff", () => {
  it("preserves the selected plan and monthly cycle", () => {
    const raw = serializeBillingSelection({ plan: "Starter", billingCycle: "monthly" });
    expect(parseBillingSelection(raw)).toEqual({ plan: "Starter", billingCycle: "monthly" });
  });

  it("preserves the selected yearly cycle", () => {
    const raw = serializeBillingSelection({ plan: "Growth", billingCycle: "yearly" });
    expect(parseBillingSelection(raw)).toEqual({ plan: "Growth", billingCycle: "yearly" });
  });

  it("rejects malformed selections", () => {
    expect(parseBillingSelection('{"plan":"Growth","billingCycle":"weekly"}')).toBeNull();
  });
});
