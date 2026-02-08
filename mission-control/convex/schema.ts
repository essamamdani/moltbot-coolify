import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    role: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("working"),
      v.literal("idle"),
      v.literal("offline")
    ),
    currentTask: v.optional(v.id("tasks")),
    lastHeartbeat: v.number(),
    heartbeatInterval: v.number(),
    description: v.string(),
    avatar: v.optional(v.string()),
  })
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"]),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    assignedTo: v.optional(v.string()),
    createdBy: v.string(),
    tags: v.optional(v.array(v.string())),
    completedAt: v.optional(v.number()),
    result: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"]),

  messages: defineTable({
    from: v.string(),
    to: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    content: v.string(),
    type: v.union(
      v.literal("comment"),
      v.literal("decision"),
      v.literal("question"),
      v.literal("update"),
      v.literal("mention"),
      v.literal("system")
    ),
    mentions: v.optional(v.array(v.string())),
    threadId: v.optional(v.string()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_from", ["from"])
    .index("by_threadId", ["threadId"]),

  activities: defineTable({
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
  })
    .index("by_agentId", ["agentId"])
    .index("by_type", ["type"]),

  notifications: defineTable({
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
    read: v.boolean(),
    delivered: v.boolean(),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_targetAgent", ["targetAgent"])
    .index("by_delivered", ["delivered"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("note"),
      v.literal("spec"),
      v.literal("report"),
      v.literal("reference")
    ),
    createdBy: v.string(),
    lastEditedBy: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    taskId: v.optional(v.id("tasks")),
  })
    .index("by_type", ["type"])
    .index("by_taskId", ["taskId"]),
});
