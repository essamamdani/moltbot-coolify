import { useState } from "react";
import { useTasks, useTaskMutations } from "../../hooks/useTasks";
import KanbanColumn from "./KanbanColumn";
import TaskDetail from "./TaskDetail";
import type { Task, TaskStatus, TaskPriority } from "../../types";
import { TASK_STATUS_COLUMNS } from "../../types";

interface KanbanBoardProps {
  agentFilter: string | null;
}

export default function KanbanBoard({ agentFilter }: KanbanBoardProps) {
  const { tasksByStatus } = useTasks();
  const { createTask } = useTaskMutations();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");

  const filterTasks = (tasks: Task[]): Task[] => {
    if (!agentFilter) return tasks;
    return tasks.filter((t) => t.assignedTo === agentFilter);
  };

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      createdBy: "human",
    });
    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setShowNewTask(false);
  };

  if (!tasksByStatus) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* New Task Button */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Task Board
          {agentFilter && (
            <span className="ml-2 text-accent normal-case">
              — filtered by {agentFilter}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowNewTask(true)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-dark transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-3 overflow-x-auto">
        {TASK_STATUS_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            title={col.label}
            status={col.key}
            tasks={filterTasks(
              tasksByStatus[col.key as keyof typeof tasksByStatus] ?? []
            )}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                New Task
              </h3>
              <button
                onClick={() => setShowNewTask(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title"
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                autoFocus
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description"
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
              />
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value as TaskPriority)
                  }
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 mt-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowNewTask(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTitle.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
