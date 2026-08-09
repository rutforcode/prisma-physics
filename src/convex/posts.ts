import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { topicValidator } from "./schema";
import { mutation, query, QueryCtx } from "./_generated/server";

/**
 * Resolve @Name mentions in post text to user ids. Matches display names and
 * email local-parts case-insensitively (exact first, then prefix).
 */
async function resolveMentions(
  ctx: QueryCtx,
  text: string,
): Promise<Id<"users">[]> {
  const users = await ctx.db.query("users").collect();
  const candidates = users.filter((u) => u.name || u.email);
  const resolved = new Map<Id<"users">, Id<"users">>();

  const mentionRegex =
    /(?:^|[\s(])@([A-Za-z0-9][A-Za-z0-9._ -]{0,39})(?=[\s.,!?;:)'")\]]|$)/g;
  let match: RegExpExecArray | null;
  while ((match = mentionRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    const lower = raw.toLowerCase();

    const exact = candidates.find(
      (u) =>
        (u.name && u.name.toLowerCase() === lower) ||
        (u.email && u.email.split("@")[0].toLowerCase() === lower),
    );
    const prefix = exact
      ? exact
      : candidates.find(
          (u) =>
            (u.name && u.name.toLowerCase().startsWith(lower)) ||
            (u.email && u.email.split("@")[0].toLowerCase().startsWith(lower)),
        );
    if (prefix) resolved.set(prefix._id, prefix._id);
  }
  return [...resolved.values()];
}

/**
 * Generate a signed upload URL for post images (Convex storage).
 * Call from the client, then POST the file to the returned URL to get a
 * storageId that can be passed to `create`.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in to upload files.");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

/** List posts newest-first, joined with author info and image URLs. */
export const list = query({
  args: { topic: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").collect();
    posts.sort((a, b) => b._creationTime - a._creationTime);

    const result = [];
    for (const post of posts) {
      if (args.topic && post.topic !== args.topic) continue;
      const author = await ctx.db.get(post.authorId);
      const imageUrl = post.imageStorageId
        ? await ctx.storage.getUrl(post.imageStorageId)
        : null;
      result.push({
        ...post,
        authorName:
          author?.name ?? author?.email?.split("@")[0] ?? "Student",
        authorImage: author?.image ?? null,
        imageUrl,
      });
    }
    return result;
  },
});

/** Create a new community post (title, body, optional topic + image). */
export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    topic: v.optional(topicValidator),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in to post.");
    }
    const title = args.title.trim();
    const body = args.body.trim();
    if (title.length === 0 || body.length === 0) {
      throw new Error("Give your post a title and some text.");
    }
    if (title.length > 120) {
      throw new Error("Keep the title under 120 characters.");
    }
    const postId = await ctx.db.insert("posts", {
      authorId: userId,
      title,
      body,
      topic: args.topic || undefined,
      imageStorageId: args.imageStorageId,
      likedBy: [],
    });

    // Resolve @mentions and notify everyone mentioned (except the author)
    const mentionedUserIds = await resolveMentions(ctx, `${title} ${body}`);
    if (mentionedUserIds.length > 0) {
      await ctx.db.patch(postId, { mentionedUserIds });
      for (const mentionedId of mentionedUserIds) {
        if (mentionedId === userId) continue;
        await ctx.db.insert("notifications", {
          recipientId: mentionedId,
          actorId: userId,
          type: "mention",
          postId,
          read: false,
        });
      }
    }
    return postId;
  },
});

/** Toggle the current user's like on a post. */
export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in to like posts.");
    }
    const post = await ctx.db.get(args.postId);
    if (post === null) return;

    const liked = post.likedBy.includes(userId);
    await ctx.db.patch(args.postId, {
      likedBy: liked
        ? post.likedBy.filter((id) => id !== userId)
        : [...post.likedBy, userId],
    });

    // Notify the author when their post is liked (not on un-like, not self)
    if (!liked && post.authorId !== userId) {
      await ctx.db.insert("notifications", {
        recipientId: post.authorId,
        actorId: userId,
        type: "like",
        postId: args.postId,
        read: false,
      });
    }
  },
});

/** Delete a post — only the author may delete it. */
export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in.");
    }
    const post = await ctx.db.get(args.postId);
    if (post === null) return;
    if (post.authorId !== userId) {
      throw new Error("You can only delete your own posts.");
    }
    if (post.imageStorageId) {
      await ctx.storage.delete(post.imageStorageId);
    }
    await ctx.db.delete(args.postId);
  },
});
