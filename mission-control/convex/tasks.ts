import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const listByStatus = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return {
      inbox: tasks.filter((t) => t.status === "inbox"),
      assigned: tasks.filter((t) => t.status === "assigned"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      review: tasks.filter((t) => t.status === "review"),
      done: tasks.filter((t) => t.status === "done"),
    };
  },
});

export const getByAssignee = query({
  args: {
    agentId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.agentId))
      .collect();

    if (args.status) {
      return tasks.filter((t) => t.status === args.status);
    }
    return tasks;
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    createdBy: v.string(),
    assignedTo: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done")
      )
    ),
  },
  handler: async (ctx, args) => {
    const status = args.assignedTo
      ? "assigned"
      : args.status ?? "inbox";

    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      priority: args.priority,
      createdBy: args.createdBy,
      assignedTo: args.assignedTo,
      tags: args.tags,
      status,
    });

    await ctx.db.insert("activities", {
      agentId: args.createdBy,
      type: "task_created",
      taskId,
      summary: `${args.createdBy} created task: ${args.title}`,
    });

    if (args.assignedTo) {
      await ctx.db.insert("activities", {
        agentId: args.createdBy,
        type: "task_assigned",
        taskId,
        summary: `${args.createdBy} assigned "${args.title}" to ${args.assignedTo}`,
      });

      await ctx.db.insert("notifications", {
        targetAgent: args.assignedTo,
        sourceAgent: args.createdBy,
        type: "task_assigned",
        taskId,
        content: `You have been assigned: ${args.title}`,
        read: false,
        delivered: false,
      });
    }

    return taskId;
  },
});

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    agentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    const updates: Record<string, unknown> = { status: args.status };
    if (args.status === "done") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.taskId, updates);

    const mover = args.agentId ?? task.assignedTo ?? "system";
    await ctx.db.insert("activities", {
      agentId: mover,
      type: args.status === "done" ? "task_completed" : "task_moved",
      taskId: args.taskId,
      summary: `${mover} moved "${task.title}" to ${args.status}`,
    });

    if (task.assignedTo && args.status === "review") {
      await ctx.db.insert("notifications", {
        targetAgent: task.createdBy,
        sourceAgent: task.assignedTo,
        type: "review_request",
        taskId: args.taskId,
        content: `"${task.title}" is ready for review`,
        read: false,
        delivered: false,
      });
    }

    return args.taskId;
  },
});

export const assign = mutation({
  args: {
    taskId: v.id("tasks"),
    assignedTo: v.string(),
    agentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    await ctx.db.patch(args.taskId, {
      assignedTo: args.assignedTo,
      status: task.status === "inbox" ? "assigned" : task.status,
    });

    const assigner = args.agentId ?? "system";
    await ctx.db.insert("activities", {
      agentId: assigner,
      type: "task_assigned",
      taskId: args.taskId,
      summary: `${assigner} assigned "${task.title}" to ${args.assignedTo}`,
    });

    await ctx.db.insert("notifications", {
      targetAgent: args.assignedTo,
      sourceAgent: assigner,
      type: "task_assigned",
      taskId: args.taskId,
      content: `You have been assigned: ${task.title}`,
      read: false,
      delivered: false,
    });

    return args.taskId;
  },
});

export const setResult = mutation({
  args: {
    taskId: v.id("tasks"),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { result: args.result });
    return args.taskId;
  },
});

export const countByStatus = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const queueCount = tasks.filter(
      (t) => t.status !== "done"
    ).length;
    return {
      total: tasks.length,
      queue: queueCount,
      inbox: tasks.filter((t) => t.status === "inbox").length,
      assigned: tasks.filter((t) => t.status === "assigned").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      review: tasks.filter((t) => t.status === "review").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  },
});
