import { describe, expect, it } from "vitest";
import { getSubscriptionEndDate } from "../shared/billingPeriod";

describe("subscription billing period", () => {
  it("keeps yearly approvals active for one year", () => {
    expect(getSubscriptionEndDate(new Date("2026-03-20T00:00:00Z"), "yearly").toISOString()).toBe("2027-03-20T00:00:00.000Z");
  });

  it("keeps monthly approvals active for one month", () => {
    expect(getSubscriptionEndDate(new Date("2026-03-20T00:00:00Z"), "monthly").toISOString()).toBe("2026-04-20T00:00:00.000Z");
  });
});
