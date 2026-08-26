export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Starts the server-side Kakao OAuth flow. */
export const startKakaoLogin = () => {
  window.location.href = "/api/auth/kakao/start";
};

/** Backwards-compatible login entrypoint used by the existing auth shell. */
export const startLogin = startKakaoLogin;
