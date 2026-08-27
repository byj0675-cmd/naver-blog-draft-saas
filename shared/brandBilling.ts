export const BRAND_MONTHLY_LIMIT = 12;
export const BASE_BRAND_PRICE = 80000;
export const ADDITIONAL_BRAND_PRICE = 60000;

export function calculateBrandPlan(brandCount: number, basePrice = BASE_BRAND_PRICE, additionalPrice = ADDITIONAL_BRAND_PRICE) {
  const normalizedCount = Math.max(1, Math.floor(brandCount));
  return {
    brandCount: normalizedCount,
    monthlyLimitPerBrand: BRAND_MONTHLY_LIMIT,
    totalMonthlyPrice: basePrice + Math.max(0, normalizedCount - 1) * additionalPrice,
    totalMonthlyLimit: normalizedCount * BRAND_MONTHLY_LIMIT,
  };
}
