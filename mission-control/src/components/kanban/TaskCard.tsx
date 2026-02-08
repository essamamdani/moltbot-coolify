import type { Task } from "../../types";
import { PRIORITY_COLORS } from "../../types";
import { useAgents } from "../../hooks/useAgents";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const { agents } = useAgents();
  const assignee = agents.find((a) => a.agentId === task.assignedTo);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
          {task.title}
        </h4>
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
            PRIORITY_COLORS[task.priority]
          }`}
          title={task.priority}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {task.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {assignee && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span>{assignee.avatar ?? "🤖"}</span>
            <span className="truncate max-w-[60px]">{assignee.name}</span>
          </span>
        )}
      </div>
    </button>
  );
}
