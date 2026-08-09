import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Generate a signed upload URL for a profile photo (Convex storage).
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in to upload a photo.");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Set the current user's profile photo from an uploaded storage file.
 */
export const updateProfileImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in.");
    }
    const url = await ctx.storage.getUrl(storageId);
    if (url === null) {
      throw new Error("Upload not found — please try again.");
    }
    await ctx.db.patch(userId, { image: url });
    return url;
  },
});

/**
 * Public profile info for a user id (used on profile pages).
 */
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    return {
      _id: user._id,
      name: user.name ?? null,
      email: user.email ?? null,
      image: user.image ?? null,
      createdAt: user._creationTime,
    };
  },
});

/**
 * List every user with their feed-posting (curator) status — admins only.
 * Powers the admin "post curators" manager on the study feed.
 */
export const all = query({
  args: {},
  handler: async (ctx) => {
    const me = await getAuthUserId(ctx);
    if (me === null) {
      throw new Error("You must be signed in.");
    }
    const self = await ctx.db.get(me);
    if (self?.role !== "admin") {
      throw new Error("Only admins can view all users.");
    }
    const users = await ctx.db.query("users").collect();
    return users
      .map((u) => ({
        _id: u._id,
        name: u.name ?? u.email?.split("@")[0] ?? "Student",
        email: u.email ?? undefined,
        image: u.image ?? undefined,
        role: u.role ?? undefined,
        canPostFeed: u.canPostFeed === true,
      }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  },
});

/**
 * Admin overview counts — users, curators, admins, posts, feed posts, and
 * promoted community posts. Admins only; powers the /admin page.
 */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const me = await getAuthUserId(ctx);
    if (me === null) {
      throw new Error("You must be signed in.");
    }
    const self = await ctx.db.get(me);
    if (self?.role !== "admin") {
      throw new Error("Only admins can view overview stats.");
    }
    const [users, posts, feedPosts] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("posts").collect(),
      ctx.db.query("feedPosts").collect(),
    ]);
    return {
      users: users.length,
      curators: users.filter((u) => u.canPostFeed === true).length,
      admins: users.filter((u) => u.role === "admin").length,
      posts: posts.length,
      feedPosts: feedPosts.length,
      promoted: posts.filter((p) => p.promotedAt !== undefined).length,
    };
  },
});

/**
 * Search for classmates to @-mention in posts (name or email prefix match).
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.trim().toLowerCase();
    const users = await ctx.db.query("users").collect();
    return users
      .filter(
        (u) =>
          (u.name || u.email) &&
          ((u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))),
      )
      .slice(0, 8)
      .map((u) => ({
        _id: u._id,
        name: u.name ?? u.email?.split("@")[0] ?? "Student",
        email: u.email ?? undefined,
      }));
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};
