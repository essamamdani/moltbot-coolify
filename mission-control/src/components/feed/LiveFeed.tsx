import { useActivities } from "../../hooks/useActivities";
import FeedItem from "./FeedItem";
import type { FeedFilter } from "../../types";

interface LiveFeedProps {
  filter: FeedFilter;
}

const FILTER_TO_TYPES: Record<FeedFilter, string | undefined> = {
  all: undefined,
  tasks: undefined,
  comments: "comment_added",
  decisions: "decision_made",
};

export default function LiveFeed({ filter }: LiveFeedProps) {
  const type = FILTER_TO_TYPES[filter];
  const activities = useActivities(30, type);

  const filtered =
    filter === "tasks"
      ? activities.filter((a) =>
          [
            "task_created",
            "task_assigned",
            "task_moved",
            "task_completed",
          ].includes(a.type)
        )
      : activities;

  return (
    <div className="divide-y divide-gray-50">
      {filtered.map((activity) => (
        <FeedItem key={activity._id} activity={activity} />
      ))}
      {filtered.length === 0 && (
        <div className="py-8 text-center text-xs text-gray-400">
          No activity yet
        </div>
      )}
    </div>
  );
}
