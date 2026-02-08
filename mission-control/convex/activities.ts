import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(limit * 2);

    if (args.type) {
      return activities.filter((a) => a.type === args.type).slice(0, limit);
    }
    return activities.slice(0, limit);
  },
});

export const listByAgent = query({
  args: {
    agentId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("activities")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(limit);
  },
});

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    agentId: v.string(),
    type: v.union(
      v.literal("task_created"),
      v.literal("task_assigned"),
      v.literal("task_moved"),
      v.literal("task_completed"),
      v.literal("comment_added"),
      v.literal("decision_made"),
      v.literal("agent_online"),
      v.literal("agent_offline"),
      v.literal("heartbeat"),
      v.literal("system")
    ),
    taskId: v.optional(v.id("tasks")),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});
