import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("documents")
        .withIndex("by_type", (q) =>
          q.eq(
            "type",
            args.type as "note" | "spec" | "report" | "reference"
          )
        )
        .order("desc")
        .collect();
    }
    return await ctx.db.query("documents").order("desc").collect();
  },
});

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("note"),
      v.literal("spec"),
      v.literal("report"),
      v.literal("reference")
    ),
    createdBy: v.string(),
    taskId: v.optional(v.id("tasks")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("documents", args);

    await ctx.db.insert("activities", {
      agentId: args.createdBy,
      type: "system",
      taskId: args.taskId,
      summary: `${args.createdBy} created document: ${args.title}`,
    });

    return docId;
  },
});

export const update = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.optional(v.string()),
    title: v.optional(v.string()),
    lastEditedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      lastEditedBy: args.lastEditedBy,
    };
    if (args.content !== undefined) updates.content = args.content;
    if (args.title !== undefined) updates.title = args.title;

    await ctx.db.patch(args.documentId, updates);
    return args.documentId;
  },
});
