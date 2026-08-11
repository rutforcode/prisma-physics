import { otpEmailProvider } from "./emailCode";

/**
 * Email-code (OTP) sign-in for students. Codes expire after 15 minutes and
 * are delivered by the shared Freebuff mail service (see ./emailCode.ts).
 */
export const emailOtp = otpEmailProvider("email-otp");
