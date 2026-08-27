export type PaymentFilterStatus = "all" | "pending" | "paid" | "approved" | "rejected";

type PaymentRow = { status: string; paymentStatus: string; payerName: string; businessName: string | null; phone: string | null; userName?: string };

export function filterPaymentRequests<T extends PaymentRow>(rows: T[], query: string, status: PaymentFilterStatus) {
  const normalized = query.trim().toLowerCase();
  return rows.filter(row => {
    const statusMatch = status === "all" || row.status === status || row.paymentStatus === status;
    const searchMatch = !normalized || [row.userName ?? "", row.payerName, row.businessName ?? "", row.phone ?? ""].join(" ").toLowerCase().includes(normalized);
    return statusMatch && searchMatch;
  });
}
