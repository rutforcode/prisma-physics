import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  MAX_BODY_CHARS,
  MAX_IMAGES,
  countNonFormulaChars,
} from "../lib/math-count";
import { topicValidator } from "./schema";
import { mutation, query, QueryCtx } from "./_generated/server";

/** True when the signed-in user holds the admin role. */
async function isAdminUser(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

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

/**
 * Attach author info, image URLs, and resolved mention references to posts.
 */
/** The storage ids attached to a post, incl. legacy single-image field. */
function postImages(post: Doc<"posts">) {
  const legacy = (post as { imageStorageId?: Id<"_storage"> }).imageStorageId;
  return [...(post.images ?? []), ...(legacy ? [legacy] : [])];
}

async function hydratePosts(ctx: QueryCtx, posts: Doc<"posts">[]) {
  const result = [];
  for (const post of posts) {
    const author = await ctx.db.get(post.authorId);
    const images = postImages(post);
    const imageUrls: (string | null)[] = [];
    for (const id of images) {
      imageUrls.push(await ctx.storage.getUrl(id));
    }

    const mentionedUsers: { userId: Id<"users">; name: string }[] = [];
    for (const id of post.mentionedUserIds ?? []) {
      const user = await ctx.db.get(id);
      if (user && (user.name || user.email)) {
        mentionedUsers.push({
          userId: id,
          name: user.name ?? user.email!.split("@")[0]!,
        });
      }
    }

    // Edit history — snapshots recorded on every update, newest first.
    const editHistory: {
      editedAt: number;
      editorId: Id<"users">;
      editorName: string;
      title: string;
      body: string;
      topic?: string;
    }[] = [];
    const edits = await ctx.db
      .query("postEdits")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    edits.sort((a, b) => b.editedAt - a.editedAt);
    for (const edit of edits.slice(0, 10)) {
      const editor = await ctx.db.get(edit.editorId);
      editHistory.push({
        editedAt: edit.editedAt,
        editorId: edit.editorId,
        editorName: editor?.name ?? editor?.email?.split("@")[0] ?? "Someone",
        title: edit.title,
        body: edit.body,
        topic: edit.topic,
      });
    }

    result.push({
      ...post,
      authorName: author?.name ?? author?.email?.split("@")[0] ?? "Student",
      authorImage: author?.image ?? null,
      images,
      imageUrls,
      mentionedUsers,
      editHistory,
      editedBy: editHistory[0]?.editorName ?? null,
      editCount: editHistory.length,
    });
  }
  return result;
}

/** List posts with optional topic filter and sort, joined with author info. */
export const list = query({
  args: {
    topic: v.optional(v.string()),
    sort: v.optional(
      v.union(v.literal("newest"), v.literal("oldest"), v.literal("likes")),
    ),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").collect();
    const filtered = posts.filter(
      (post) => !args.topic || post.topic === args.topic,
    );
    switch (args.sort ?? "newest") {
      case "oldest":
        filtered.sort((a, b) => a._creationTime - b._creationTime);
        break;
      case "likes":
        filtered.sort(
          (a, b) =>
            b.likedBy.length - a.likedBy.length ||
            b._creationTime - a._creationTime,
        );
        break;
      case "newest":
      default:
        filtered.sort((a, b) => b._creationTime - a._creationTime);
        break;
    }
    return await hydratePosts(ctx, filtered);
  },
});

/**
 * Promote or unpromote a community post to the main feed (admins only).
 * Promoting notifies the post's author.
 */
export const setPromoted = mutation({
  args: { postId: v.id("posts"), promoted: v.boolean() },
  handler: async (ctx, args) => {
    if (!(await isAdminUser(ctx))) {
      throw new Error("Only admins can promote posts.");
    }
    const userId = await getAuthUserId(ctx);
    const post = await ctx.db.get(args.postId);
    if (post === null) return;

    await ctx.db.patch(args.postId, {
      promotedAt: args.promoted ? Date.now() : undefined,
    });

    if (args.promoted && userId !== null && post.authorId !== userId) {
      await ctx.db.insert("notifications", {
        recipientId: post.authorId,
        actorId: userId,
        type: "promotion",
        postId: args.postId,
        read: false,
      });
    }
  },
});

/** Recently promoted community posts, most recently promoted first. */
export const promoted = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    const promotedPosts = posts
      .filter((post) => post.promotedAt !== undefined)
      .sort((a, b) => (b.promotedAt ?? 0) - (a.promotedAt ?? 0))
      .slice(0, 10);
    return await hydratePosts(ctx, promotedPosts);
  },
});

/** Posts authored by a given user, newest first (for profile pages). */
export const byAuthor = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();
    posts.sort((a, b) => b._creationTime - a._creationTime);
    return await hydratePosts(ctx, posts);
  },
});

/** Posts in which a given user is @-mentioned, newest first (for profiles). */
export const mentionsOf = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const posts = await ctx.db.query("posts").collect();
    const mentioned = posts.filter((post) =>
      (post.mentionedUserIds ?? []).includes(userId),
    );
    mentioned.sort((a, b) => b._creationTime - a._creationTime);
    return await hydratePosts(ctx, mentioned.slice(0, 50));
  },
});

/** Create a new community post (title, body, optional topic + images). */
export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    topic: v.optional(topicValidator),
    images: v.optional(v.array(v.id("_storage"))),
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
    const images = args.images ?? [];
    if (images.length > MAX_IMAGES) {
      throw new Error(`A post can have at most ${MAX_IMAGES} images.`);
    }
    if (countNonFormulaChars(body) > MAX_BODY_CHARS) {
      throw new Error(
        `Keep the post under ${MAX_BODY_CHARS.toLocaleString()} characters (formulas don't count).`,
      );
    }
    const postId = await ctx.db.insert("posts", {
      authorId: userId,
      title,
      body,
      topic: args.topic || undefined,
      images: images.length > 0 ? images : undefined,
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

/**
 * Edit a community post (the author, or an admin moderating the community).
 * Replaces title/body/topic/images wholesale; images dropped from the new
 * array are garbage-collected from storage. Mentions are re-resolved from
 * the new text so @-tags stay accurate.
 */
export const update = mutation({
  args: {
    postId: v.id("posts"),
    title: v.string(),
    body: v.string(),
    topic: v.optional(topicValidator),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in.");
    }
    const post = await ctx.db.get(args.postId);
    if (post === null) {
      throw new Error("Post not found.");
    }
    if (post.authorId !== userId && !(await isAdminUser(ctx))) {
      throw new Error("You can only edit your own posts.");
    }
    const title = args.title.trim();
    const body = args.body.trim();
    if (title.length === 0 || body.length === 0) {
      throw new Error("Give your post a title and some text.");
    }
    if (title.length > 120) {
      throw new Error("Keep the title under 120 characters.");
    }
    const images = args.images ?? [];
    if (images.length > MAX_IMAGES) {
      throw new Error(`A post can have at most ${MAX_IMAGES} images.`);
    }
    if (countNonFormulaChars(body) > MAX_BODY_CHARS) {
      throw new Error(
        `Keep the post under ${MAX_BODY_CHARS.toLocaleString()} characters (formulas don't count).`,
      );
    }

    // Free storage for images the author removed.
    const removed = postImages(post).filter((id) => !images.includes(id));
    for (const id of removed) {
      try {
        await ctx.storage.delete(id);
      } catch {
        // Already gone — nothing to do.
      }
    }

    const editedAt = Date.now();
    await ctx.db.patch(args.postId, {
      title,
      body,
      topic: args.topic || undefined,
      images: images.length > 0 ? images : undefined,
      editedAt,
    });

    // Record a snapshot of this edit for the history timeline.
    await ctx.db.insert("postEdits", {
      postId: args.postId,
      editorId: userId,
      editedAt,
      title,
      body,
      topic: args.topic || undefined,
    });

    // Re-resolve @mentions from the new text and notify anyone newly mentioned.
    const mentionedUserIds = await resolveMentions(ctx, `${title} ${body}`);
    const previous = post.mentionedUserIds ?? [];
    await ctx.db.patch(args.postId, { mentionedUserIds });
    for (const mentionedId of mentionedUserIds) {
      if (mentionedId === userId || previous.includes(mentionedId)) continue;
      await ctx.db.insert("notifications", {
        recipientId: mentionedId,
        actorId: userId,
        type: "mention",
        postId: args.postId,
        read: false,
      });
    }
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

/** Delete a post — the author, or an admin moderating the community. */
export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in.");
    }
    const post = await ctx.db.get(args.postId);
    if (post === null) return;
    if (post.authorId !== userId && !(await isAdminUser(ctx))) {
      throw new Error("You can only delete your own posts.");
    }
    for (const id of postImages(post)) {
      try {
        await ctx.storage.delete(id);
      } catch {
        // Already gone — nothing to do.
      }
    }
    await ctx.db.delete(args.postId);
  },
});
