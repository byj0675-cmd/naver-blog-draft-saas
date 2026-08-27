export type BillingCycle = "monthly" | "yearly";

export function getSubscriptionEndDate(start: Date, cycle: BillingCycle) {
  const end = new Date(start);
  if (cycle === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}
