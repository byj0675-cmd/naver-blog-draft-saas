import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { buildPayssamRequest, verifyPayssamSignature } from "./payssam";

describe("Payssam payment contract", () => {
  it("maps a valid plan to a fixed payment request", () => {
    expect(buildPayssamRequest({ orderId: "ord_1", plan: "growth", amount: 39000, customerName: "홍길동", returnUrl: "https://example.com/paid" })).toMatchObject({ productName: "blogmate Growth", amount: 39000 });
  });

  it("rejects amount tampering and verifies signed callbacks", () => {
    expect(() => buildPayssamRequest({ orderId: "ord_1", plan: "growth", amount: 1, customerName: "홍길동", returnUrl: "https://example.com/paid" })).toThrow();
    const body = JSON.stringify({ orderId: "ord_1", status: "paid" });
    const secret = "test-secret";
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyPayssamSignature(body, signature, secret)).toBe(true);
    expect(verifyPayssamSignature(body, "bad", secret)).toBe(false);
  });
});
