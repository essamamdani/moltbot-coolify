import { useMemo } from "react";
import { useMCData } from "../demo-provider";

export function useActivities(limit?: number, type?: string) {
  const { activities } = useMCData();

  return useMemo(() => {
    let filtered = activities;

    if (type && type !== "all") {
      const typeMap: Record<string, string[]> = {
        tasks: ["task_created", "task_assigned", "task_moved", "task_completed"],
        comments: ["comment_added"],
        decisions: ["decision_made"],
      };
      const allowedTypes = typeMap[type];
      if (allowedTypes) {
        filtered = filtered.filter((a) => allowedTypes.includes(a.type));
      }
    }

    return filtered.slice(0, limit ?? 50);
  }, [activities, limit, type]);
}
