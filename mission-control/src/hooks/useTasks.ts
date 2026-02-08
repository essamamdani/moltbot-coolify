import { useMCData } from "../demo-provider";
import type { TaskStatus } from "../types";

export function useTasks() {
  const { tasksByStatus, counts } = useMCData();
  return { tasksByStatus, counts };
}

export function useTaskMutations() {
  const { createTask, moveTask, assignTask } = useMCData();
  return { createTask, moveTask, assignTask };
}

export function useTaskMessages(_taskId: any) {
  // In demo mode, task messages are not supported
  // In Convex mode, this is handled by ConvexDataProvider
  return [];
}
