import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** List the current user's notifications, newest first (capped at 30). */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .order("desc")
      .take(30);

    const result = [];
    for (const notification of notifications) {
      const actor = await ctx.db.get(notification.actorId);
      const post = await ctx.db.get(notification.postId);
      result.push({
        ...notification,
        actorName:
          actor?.name ?? actor?.email?.split("@")[0] ?? "Someone",
        actorImage: actor?.image ?? null,
        postTitle: post?.title ?? "a post",
      });
    }
    return result;
  },
});

/** Number of unread notifications for the current user. */
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return 0;
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) =>
        q.eq("recipientId", userId).eq("read", false),
      )
      .collect();
    return rows.length;
  },
});

/** Mark a single notification as read (only the recipient may do this). */
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return;
    const notification = await ctx.db.get(args.id);
    if (notification === null || notification.recipientId !== userId) return;
    if (!notification.read) {
      await ctx.db.patch(args.id, { read: true });
    }
  },
});

/** Mark every unread notification as read for the current user. */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) =>
        q.eq("recipientId", userId).eq("read", false),
      )
      .collect();
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});
