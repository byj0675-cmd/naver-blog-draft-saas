export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { serializeBillingSelection } from "@shared/billingSelection";

/** Starts the server-side Kakao OAuth flow. */
export const startKakaoLogin = (plan?: string, billingCycle: "monthly" | "yearly" = "monthly") => {
  if (plan) {
    sessionStorage.setItem("blogmate.pendingBilling", serializeBillingSelection({ plan, billingCycle }));
  }
  window.location.href = "/api/auth/kakao/start";
};

/** Backwards-compatible login entrypoint used by the existing auth shell. */
export const startLogin = startKakaoLogin;
