import { describe, expect, it } from "vitest";
import { canApproveSubscription, collectionLabel } from "../shared/paymentWorkflow";

describe("payment collection workflow", () => {
  it("requires a paid collection state before subscription approval", () => {
    expect(canApproveSubscription("not_sent")).toBe(false);
    expect(canApproveSubscription("sent")).toBe(false);
    expect(canApproveSubscription("paid")).toBe(true);
  });

  it("labels the three operational collection states", () => {
    expect(collectionLabel("not_sent")).toBe("청구서 미발송");
    expect(collectionLabel("sent")).toBe("청구서 발송");
    expect(collectionLabel("paid")).toBe("수납 확인");
  });
});
