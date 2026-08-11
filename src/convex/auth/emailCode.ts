import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Shared verification-code email delivery for every auth flow (email OTP,
 * password sign-up verification, password reset). Emails go out through the
 * Freebuff mail service used by the rest of the platform.
 */
const FREEBUFF_OTP_URL = "https://auth.freebuff.app/send_otp";
const FREEBUFF_OTP_KEY = "fb_email_2crN1hqIArZP2bEfvjp5Qik4";

export async function sendCodeEmail(email: string, otp: string) {
  try {
    await axios.post(
      FREEBUFF_OTP_URL,
      {
        to: email,
        otp,
        appName: process.env.VLY_APP_NAME || "a freebuff.com application",
      },
      {
        headers: {
          "x-api-key": FREEBUFF_OTP_KEY,
        },
      },
    );
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
}

/**
 * Build an Auth.js `Email` provider that emails a 6-digit code.
 * Used with distinct ids so each flow's codes are independent.
 */
export function otpEmailProvider(id: string, maxAgeSeconds = 60 * 15) {
  return Email({
    id,
    maxAge: maxAgeSeconds, // 15 minutes
    async generateVerificationToken() {
      const random: RandomReader = {
        read(bytes: Uint8Array) {
          crypto.getRandomValues(bytes);
        },
      };
      return generateRandomString(random, "0123456789", 6);
    },
    async sendVerificationRequest({ identifier: email, token }) {
      await sendCodeEmail(email, token);
    },
  });
}
