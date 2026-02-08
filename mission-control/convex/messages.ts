import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();
  },
});

export const listByThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db.query("messages").order("desc").take(limit);
  },
});

export const send = mutation({
  args: {
    from: v.string(),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
    type: v.union(
      v.literal("comment"),
      v.literal("decision"),
      v.literal("question"),
      v.literal("update"),
      v.literal("mention"),
      v.literal("system")
    ),
    to: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(args.content)) !== null) {
      mentions.push(match[1]);
    }

    const messageId = await ctx.db.insert("messages", {
      from: args.from,
      to: args.to,
      taskId: args.taskId,
      content: args.content,
      type: args.type,
      mentions: mentions.length > 0 ? mentions : undefined,
      threadId: args.threadId,
    });

    for (const agentId of mentions) {
      await ctx.db.insert("notifications", {
        targetAgent: agentId,
        sourceAgent: args.from,
        type: "mention",
        taskId: args.taskId,
        messageId,
        content: `@${args.from} mentioned you: ${args.content.substring(0, 200)}`,
        read: false,
        delivered: false,
      });
    }

    await ctx.db.insert("activities", {
      agentId: args.from,
      type: args.type === "decision" ? "decision_made" : "comment_added",
      taskId: args.taskId,
      summary: `${args.from}: ${args.content.substring(0, 100)}`,
    });

    return messageId;
  },
});
