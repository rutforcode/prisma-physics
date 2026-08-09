import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

/**
 * Internal — does any admin account already exist?
 */
export const existsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .take(1);
    return admin.length > 0;
  },
});

/**
 * Internal — find a user by exact email, returns their id or null.
 */
export const findByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .take(1);
    return user.length > 0 ? user[0]._id : null;
  },
});

/**
 * Internal — promote an existing user to admin.
 */
export const promoteToAdmin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { role: "admin" });
  },
});

/**
 * Seed the demo admin account with the given credentials. Idempotent:
 *  1. If any admin already exists, it does nothing (never overwrites roles
 *     or passwords of a live admin).
 *  2. If the email already belongs to a non-admin user, it promotes that
 *     user instead of creating a duplicate account.
 *  3. Otherwise it creates a brand-new password account via Convex Auth's
 *     server-side createAccount, stamped with role "admin".
 *
 * Called from the Admin tab on the auth page (works signed-out, so the
 * first admin can bootstrap themselves).
 */
export const ensureAdmin = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    // 1. An admin already exists — nothing to do.
    const adminExists = await ctx.runQuery(api.admin.existsAdmin);
    if (adminExists) {
      return { created: false, email };
    }

    // 2. Email already taken by a non-admin — promote instead of duplicate.
    const existingId = await ctx.runQuery(api.admin.findByEmail, { email });
    if (existingId !== null) {
      await ctx.runMutation(api.admin.promoteToAdmin, { userId: existingId });
      return { created: false, promoted: true, email };
    }

    // 3. Fresh account.
    const { user } = await createAccount(ctx, {
      provider: "password",
      account: { id: email, secret: args.password },
      profile: { email, name: "Admin", role: "admin" },
    });

    return { created: true, email, userId: user._id };
  },
});
