import { formatDistanceToNow } from "date-fns";
import type { Activity } from "../../types";

interface FeedItemProps {
  activity: Activity;
}

const TYPE_ICONS: Record<string, string> = {
  task_created: "📋",
  task_assigned: "➡️",
  task_moved: "🔄",
  task_completed: "✅",
  comment_added: "💬",
  decision_made: "⚡",
  agent_online: "🟢",
  agent_offline: "🔴",
  heartbeat: "💓",
  system: "⚙️",
};

export default function FeedItem({ activity }: FeedItemProps) {
  const icon = TYPE_ICONS[activity.type] ?? "📌";

  return (
    <div className="px-4 py-2 hover:bg-surface-50 transition-colors">
      <div className="flex items-start gap-2">
        <span className="text-xs mt-0.5 flex-shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
            {activity.summary}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {formatDistanceToNow(activity._creationTime, {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
