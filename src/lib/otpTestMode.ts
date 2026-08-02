/**
 * This value is embedded at build time. It is intentionally disabled unless a
 * dedicated local or staging deployment opts in.
 */
export const isOtpTestModeEnabled = () => import.meta.env.VITE_ENABLE_TEST_OTP === "true";
