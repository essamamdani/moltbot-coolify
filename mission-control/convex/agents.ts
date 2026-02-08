import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const getByAgentId = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return agents.filter((a) => a.status !== "offline");
  },
});

export const register = mutation({
  args: {
    agentId: v.string(),
    name: v.string(),
    role: v.string(),
    description: v.string(),
    heartbeatInterval: v.number(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        role: args.role,
        description: args.description,
        heartbeatInterval: args.heartbeatInterval,
        avatar: args.avatar,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("agents", {
      ...args,
      status: "offline",
      lastHeartbeat: Date.now(),
    });

    await ctx.db.insert("activities", {
      agentId: args.agentId,
      type: "system",
      summary: `Agent ${args.name} registered`,
    });

    return id;
  },
});

export const heartbeat = mutation({
  args: {
    agentId: v.string(),
    status: v.optional(
      v.union(
        v.literal("online"),
        v.literal("working"),
        v.literal("idle"),
        v.literal("offline")
      )
    ),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (!agent) return null;

    await ctx.db.patch(agent._id, {
      lastHeartbeat: Date.now(),
      status: args.status ?? "online",
    });

    return agent._id;
  },
});

export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("working"),
      v.literal("idle"),
      v.literal("offline")
    ),
    currentTask: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (!agent) return null;

    await ctx.db.patch(agent._id, {
      status: args.status,
      currentTask: args.currentTask,
    });

    const activityType =
      args.status === "offline" ? "agent_offline" : "agent_online";
    await ctx.db.insert("activities", {
      agentId: args.agentId,
      type: activityType as "agent_online" | "agent_offline",
      summary: `${agent.name} is now ${args.status}`,
    });

    return agent._id;
  },
});
