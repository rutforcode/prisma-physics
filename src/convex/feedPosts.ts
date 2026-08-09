import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { topicValidator } from "./schema";
import { mutation, query, QueryCtx } from "./_generated/server";

/** True when the signed-in user holds the admin role. */
async function isAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

async function hydrate(
  ctx: QueryCtx,
  posts: Doc<"feedPosts">[],
) {
  const result = [];
  for (const post of posts) {
    const author = post.authorId ? await ctx.db.get(post.authorId) : null;
    const imageUrl = post.imageStorageId
      ? await ctx.storage.getUrl(post.imageStorageId)
      : null;
    result.push({
      ...post,
      authorName: author?.name ?? author?.email?.split("@")[0] ?? "Prism Team",
      authorImage: author?.image ?? null,
      isTeamPost: author === null,
      imageUrl,
    });
  }
  return result;
}

/** Admin feed posts, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("feedPosts").collect();
    posts.sort((a, b) => b._creationTime - a._creationTime);
    return await hydrate(ctx, posts.slice(0, 20));
  },
});

/** Create an admin feed post (admins only). */
export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    topic: v.optional(topicValidator),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Only admins can post to the feed.");
    }
    const userId = (await getAuthUserId(ctx)) as Id<"users">;
    const title = args.title.trim();
    const body = args.body.trim();
    if (title.length === 0 || body.length === 0) {
      throw new Error("Give the post a title and some text.");
    }
    if (title.length > 120) {
      throw new Error("Keep the title under 120 characters.");
    }
    return await ctx.db.insert("feedPosts", {
      authorId: userId,
      title,
      body,
      topic: args.topic || undefined,
      imageStorageId: args.imageStorageId,
    });
  },
});

/** Delete an admin feed post (admins only). */
export const remove = mutation({
  args: { id: v.id("feedPosts") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Only admins can delete feed posts.");
    }
    const post = await ctx.db.get(args.id);
    if (post === null) return;
    if (post.imageStorageId) {
      await ctx.storage.delete(post.imageStorageId);
    }
    await ctx.db.delete(args.id);
  },
});

/** Seed demo announcements once (skips if posts already exist). */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("feedPosts").first();
    if (existing) return { seeded: 0 };

    const posts = [
      {
        title: "Welcome to Prism 👋",
        body: String.raw`This is your physics home base. Read concept explanations in the feed, ask questions in Community, and get @mentioned when classmates reply. Everything here renders LaTeX — try $E = mc^2$ or $\oint \vec{E} \cdot d\vec{A} = Q_{\text{enc}}/\varepsilon_0$.`,
        topic: undefined as undefined,
      },
      {
        title: "Exam-week survival guide",
        body: String.raw`A suggested review order: First Law → Entropy → Momentum → Simple Harmonic Motion. The one formula to keep close: $\Delta U = Q - W$. Good luck, you've got this!`,
        topic: "thermodynamics" as const,
      },
    ];

    for (const post of posts) {
      await ctx.db.insert("feedPosts", {
        authorId: undefined,
        title: post.title,
        body: post.body,
        topic: post.topic,
      });
    }
    return { seeded: posts.length };
  },
});
