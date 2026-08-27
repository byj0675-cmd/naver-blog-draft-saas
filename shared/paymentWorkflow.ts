export type PaymentCollectionStatus = "not_sent" | "sent" | "paid";

export function canApproveSubscription(paymentStatus: PaymentCollectionStatus) {
  return paymentStatus === "paid";
}

export function collectionLabel(paymentStatus: PaymentCollectionStatus) {
  if (paymentStatus === "paid") return "수납 확인";
  if (paymentStatus === "sent") return "청구서 발송";
  return "청구서 미발송";
}
