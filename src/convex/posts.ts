import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { topicValidator } from "./schema";
import { mutation, query } from "./_generated/server";

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
    return await ctx.db.insert("posts", {
      authorId: userId,
      title,
      body,
      topic: args.topic || undefined,
      imageStorageId: args.imageStorageId,
      likedBy: [],
    });
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
