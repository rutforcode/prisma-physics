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
async function isAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

/**
 * True when the signed-in user may author feed posts: admins, plus any
 * user an admin has granted feed access to (a "post curator").
 */
async function canPostFeed(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return false;
  const user = await ctx.db.get(userId);
  return user?.role === "admin" || user?.canPostFeed === true;
}

/** True when the signed-in user may edit/delete a given feed post. */
async function canModerate(ctx: QueryCtx, post: Doc<"feedPosts">) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return false;
  const user = await ctx.db.get(userId);
  if (user?.role === "admin") return true;
  return user?.canPostFeed === true && post.authorId === userId;
}

async function hydrate(
  ctx: QueryCtx,
  posts: Doc<"feedPosts">[],
) {
  const result = [];
  for (const post of posts) {
    const author = post.authorId ? await ctx.db.get(post.authorId) : null;
    const images = post.images ?? [];
    const imageUrls: (string | null)[] = [];
    for (const id of images) {
      imageUrls.push(await ctx.storage.getUrl(id));
    }
    result.push({
      ...post,
      authorName: author?.name ?? author?.email?.split("@")[0] ?? "Prism Team",
      authorImage: author?.image ?? null,
      isTeamPost: author === null,
      images,
      imageUrls,
    });
  }
  return result;
}

function validate(args: { title: string; body: string; images: Id<"_storage">[] }) {
  const title = args.title.trim();
  const body = args.body.trim();
  if (title.length === 0 || body.length === 0) {
    throw new Error("Give the post a title and some text.");
  }
  if (title.length > 120) {
    throw new Error("Keep the title under 120 characters.");
  }
  // Formulas ($…$, $$…$$, \(…\), \[…\]) don't count toward the limit.
  if (countNonFormulaChars(body) > MAX_BODY_CHARS) {
    throw new Error(
      `Keep the post under ${MAX_BODY_CHARS.toLocaleString()} characters (formulas don't count).`,
    );
  }
  if (args.images.length > MAX_IMAGES) {
    throw new Error(`A post can have at most ${MAX_IMAGES} images.`);
  }
  return { title, body, images: args.images };
}

/** Admin/curator feed posts, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("feedPosts").collect();
    posts.sort((a, b) => b._creationTime - a._creationTime);
    return await hydrate(ctx, posts.slice(0, 20));
  },
});

/** Create a feed post (admins and admin-selected curators only). */
export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    topic: v.optional(topicValidator),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    if (!(await canPostFeed(ctx))) {
      throw new Error("Only admins and selected curators can post to the feed.");
    }
    const userId = (await getAuthUserId(ctx)) as Id<"users">;
    const { title, body, images } = validate({
      title: args.title,
      body: args.body,
      images: args.images ?? [],
    });
    return await ctx.db.insert("feedPosts", {
      authorId: userId,
      title,
      body,
      topic: args.topic || undefined,
      images: images.length > 0 ? images : undefined,
    });
  },
});

/**
 * Edit a feed post (admins may edit anything; curators their own posts).
 * Replaces title/body/topic/images wholesale; images dropped from the new
 * array are garbage-collected from storage.
 */
export const update = mutation({
  args: {
    id: v.id("feedPosts"),
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
    const post = await ctx.db.get(args.id);
    if (post === null) {
      throw new Error("Post not found.");
    }
    if (!(await canModerate(ctx, post))) {
      throw new Error("You can only edit your own feed posts.");
    }
    const { title, body, images } = validate({
      title: args.title,
      body: args.body,
      images: args.images ?? [],
    });

    // Free storage for images the author removed.
    const removed = (post.images ?? []).filter((id) => !images.includes(id));
    for (const id of removed) {
      try {
        await ctx.storage.delete(id);
      } catch {
        // Already gone — nothing to do.
      }
    }

    await ctx.db.patch(args.id, {
      title,
      body,
      topic: args.topic || undefined,
      images: images.length > 0 ? images : undefined,
      editedAt: Date.now(),
    });
  },
});

/** Delete a feed post (admins, or the author when they are a curator). */
export const remove = mutation({
  args: { id: v.id("feedPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (post === null) return;
    if (!(await canModerate(ctx, post))) {
      throw new Error("You can only delete your own feed posts.");
    }
    for (const id of post.images ?? []) {
      try {
        await ctx.storage.delete(id);
      } catch {
        // Already gone — nothing to do.
      }
    }
    await ctx.db.delete(args.id);
  },
});

/**
 * Grant or revoke feed-posting access for a user (admins only). This is the
 * "post curators" control — curators can publish to the feed like admins.
 */
export const setCurator = mutation({
  args: { userId: v.id("users"), canPostFeed: v.boolean() },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx))) {
      throw new Error("Only admins can manage feed curators.");
    }
    const target = await ctx.db.get(args.userId);
    if (target === null) {
      throw new Error("User not found.");
    }
    if (target.role === "admin") {
      throw new Error("Admins already have feed access.");
    }
    await ctx.db.patch(args.userId, {
      canPostFeed: args.canPostFeed ? true : undefined,
    });
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
