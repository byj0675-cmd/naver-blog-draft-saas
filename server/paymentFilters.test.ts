import { describe, expect, it } from "vitest";
import { filterPaymentRequests } from "../shared/paymentFilters";

describe("payment request filters", () => {
  const rows = [
    { status: "pending", paymentStatus: "paid", payerName: "김수진", businessName: "오늘의공방", phone: "010-0000-0000", userName: "김수진" },
    { status: "approved", paymentStatus: "paid", payerName: "박민준", businessName: "라이트영어", phone: "010-1111-1111", userName: "박민준" },
  ];

  it("searches the real account user name", () => {
    expect(filterPaymentRequests(rows, "박민준", "all")).toHaveLength(1);
  });

  it("combines status and query filters", () => {
    expect(filterPaymentRequests(rows, "공방", "paid")).toHaveLength(1);
    expect(filterPaymentRequests(rows, "공방", "approved")).toHaveLength(0);
  });
});
