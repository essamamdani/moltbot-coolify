export type AgentStatus = "online" | "working" | "idle" | "offline";

export type TaskStatus =
  | "inbox"
  | "assigned"
  | "in_progress"
  | "review"
  | "done";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type MessageType =
  | "comment"
  | "decision"
  | "question"
  | "update"
  | "mention"
  | "system";

export type ActivityType =
  | "task_created"
  | "task_assigned"
  | "task_moved"
  | "task_completed"
  | "comment_added"
  | "decision_made"
  | "agent_online"
  | "agent_offline"
  | "heartbeat"
  | "system";

export type FeedFilter = "all" | "tasks" | "comments" | "decisions";

export interface Agent {
  _id: any;
  _creationTime: number;
  agentId: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask?: any;
  lastHeartbeat: number;
  heartbeatInterval: number;
  description: string;
  avatar?: string;
}

export interface Task {
  _id: any;
  _creationTime: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  createdBy: string;
  tags?: string[];
  completedAt?: number;
  result?: string;
}

export interface Message {
  _id: any;
  _creationTime: number;
  from: string;
  to?: string;
  taskId?: any;
  content: string;
  type: MessageType;
  mentions?: string[];
  threadId?: string;
}

export interface Activity {
  _id: any;
  _creationTime: number;
  agentId: string;
  type: ActivityType;
  taskId?: any;
  summary: string;
}

export const TASK_STATUS_COLUMNS: {
  key: TaskStatus;
  label: string;
}[] = [
  { key: "inbox", label: "Inbox" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
  critical: "bg-priority-critical",
};

export const STATUS_COLORS: Record<AgentStatus, string> = {
  online: "bg-status-online",
  working: "bg-status-working",
  idle: "bg-status-idle",
  offline: "bg-status-offline",
};
