import type { Task, TaskStatus } from "../../types";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const STATUS_HEADER_COLORS: Record<TaskStatus, string> = {
  inbox: "border-t-gray-400",
  assigned: "border-t-blue-400",
  in_progress: "border-t-amber-400",
  review: "border-t-purple-400",
  done: "border-t-green-400",
};

export default function KanbanColumn({
  title,
  status,
  tasks,
  onTaskClick,
}: KanbanColumnProps) {
  return (
    <div
      className={`flex flex-col min-w-[220px] bg-surface-100 rounded-lg border-t-2 ${STATUS_HEADER_COLORS[status]}`}
    >
      <div className="p-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 pt-0 space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-400">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
