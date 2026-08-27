import { describe, expect, it } from "vitest";
import { canApproveSubscription, collectionLabel, transitionCollectionStatus } from "../shared/paymentWorkflow";

describe("payment collection workflow", () => {
  it("requires a paid collection state before subscription approval", () => {
    expect(canApproveSubscription("not_sent")).toBe(false);
    expect(canApproveSubscription("sent")).toBe(false);
    expect(canApproveSubscription("paid")).toBe(true);
  });

  it("supports the complete invoice-to-approval state sequence", () => {
    const sent = transitionCollectionStatus("not_sent", "sent");
    const paid = sent && transitionCollectionStatus(sent, "paid");
    expect(sent).toBe("sent");
    expect(paid).toBe("paid");
    expect(canApproveSubscription(paid!)).toBe(true);
    expect(transitionCollectionStatus("not_sent", "paid")).toBeNull();
  });

  it("labels the three operational collection states", () => {
    expect(collectionLabel("not_sent")).toBe("청구서 미발송");
    expect(collectionLabel("sent")).toBe("청구서 발송");
    expect(collectionLabel("paid")).toBe("수납 확인");
  });
});
