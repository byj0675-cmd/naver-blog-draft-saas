import { describe, expect, it } from "vitest";
import { calculateBrandPlan } from "../shared/brandBilling";

describe("brand billing policy", () => {
  it("gives each brand an independent 12-post allowance", () => {
    expect(calculateBrandPlan(2)).toMatchObject({ brandCount: 2, monthlyLimitPerBrand: 12, totalMonthlyLimit: 24, totalMonthlyPrice: 140000 });
  });

  it("never reduces the base plan for zero or fractional brands", () => {
    expect(calculateBrandPlan(0)).toMatchObject({ brandCount: 1, totalMonthlyPrice: 80000, totalMonthlyLimit: 12 });
    expect(calculateBrandPlan(2.9)).toMatchObject({ brandCount: 2, totalMonthlyPrice: 140000 });
  });
});
