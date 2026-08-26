import { describe, expect, it } from "vitest";
import { applySuccessfulPayment, paymentFailureMessage, planCatalog } from "../shared/payment";

describe("payment flow", () => {
  it("adds the selected plan credits after success", () => {
    expect(applySuccessfulPayment(68, "Growth")).toBe(168);
    expect(planCatalog.Studio.amount).toBe(79000);
  });
  it("returns a useful failure message", () => {
    expect(paymentFailureMessage("PAY_PROCESS_CANCELED")).toContain("PAY_PROCESS_CANCELED");
  });
});
