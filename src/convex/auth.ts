// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import Google, { type GoogleProfile } from "@auth/core/providers/google";
import { type Value } from "convex/values";
import { emailOtp } from "./auth/emailOtp";

/**
 * Google OAuth for student accounts. Configure the OAuth client with:
 *   - Authorized redirect URI: <site URL>/api/auth/callback/google
 * Keys live in the project's Keys tab: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */
const google = Google({
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  profile(profile: GoogleProfile) {
    return {
      id: profile.sub,
      name: profile.name ?? profile.email?.split("@")[0] ?? "Student",
      email: profile.email,
      image: profile.picture,
    };
  },
});

/**
 * Email + password accounts for students (the same Password provider the
 * admin tab uses). The `profile` callback stores the display name students
 * enter at sign-up, falling back to the email local part otherwise.
 */
const password = Password({
  // The lib's profile return type requires an index signature over `Value`
  // (its users-table type is generic) — the cast is intentional.
  profile: (params) => {
    const email = String(params.email ?? "").trim().toLowerCase();
    const name =
      typeof params.name === "string" && params.name.trim()
        ? params.name.trim().slice(0, 40)
        : email.split("@")[0] || "Student";
    return { email, name } as unknown as { [key: string]: Value } & {
      email: string;
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [emailOtp, Anonymous, password, google],
});