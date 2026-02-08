import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUnread = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_targetAgent", (q) =>
        q.eq("targetAgent", args.agentId)
      )
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
  },
});

export const getUndelivered = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_delivered", (q) => q.eq("delivered", false))
      .collect();
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
    return args.notificationId;
  },
});

export const markDelivered = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      delivered: true,
      deliveredAt: Date.now(),
    });
    return args.notificationId;
  },
});

export const markAllRead = mutation({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_targetAgent", (q) =>
        q.eq("targetAgent", args.agentId)
      )
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
    return unread.length;
  },
});

export const create = mutation({
  args: {
    targetAgent: v.string(),
    sourceAgent: v.string(),
    type: v.union(
      v.literal("mention"),
      v.literal("task_assigned"),
      v.literal("task_update"),
      v.literal("comment"),
      v.literal("review_request"),
      v.literal("system")
    ),
    taskId: v.optional(v.id("tasks")),
    messageId: v.optional(v.id("messages")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      delivered: false,
    });
  },
});
