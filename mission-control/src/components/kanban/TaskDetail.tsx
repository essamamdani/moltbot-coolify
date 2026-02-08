import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useTaskMessages, useTaskMutations } from "../../hooks/useTasks";
import { useAgents } from "../../hooks/useAgents";
import type { Task, TaskStatus } from "../../types";
import { TASK_STATUS_COLUMNS, PRIORITY_COLORS } from "../../types";

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

export default function TaskDetail({ task, onClose }: TaskDetailProps) {
  const messages = useTaskMessages(task._id);
  const { agents } = useAgents();
  const { moveTask, assignTask } = useTaskMutations();
  const [comment, setComment] = useState("");

  const handleStatusChange = (status: TaskStatus) => {
    moveTask(task._id, status);
  };

  const handleAssign = (agentId: string) => {
    assignTask(task._id, agentId);
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    // Comments are a Convex-only feature for now
    // In demo mode this is a no-op
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  PRIORITY_COLORS[task.priority]
                }`}
              />
              <span className="text-xs font-medium text-gray-500 uppercase">
                {task.priority}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Description
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Status & Assignment */}
          <div className="flex gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Status
              </h3>
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as TaskStatus)
                }
                className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white"
              >
                {TASK_STATUS_COLUMNS.map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Assigned To
              </h3>
              <select
                value={task.assignedTo ?? ""}
                onChange={(e) =>
                  e.target.value && handleAssign(e.target.value)
                }
                className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent.agentId}>
                    {agent.avatar ?? "🤖"} {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Tags
                </h3>
                <div className="flex gap-1">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {task.result && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Result
              </h3>
              <div className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-md p-3 whitespace-pre-wrap">
                {task.result}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Comments ({messages.length})
            </h3>
            <div className="space-y-3">
              {messages.map((msg: any) => {
                const sender = agents.find((a) => a.agentId === msg.from);
                return (
                  <div
                    key={msg._id}
                    className="bg-surface-50 rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">
                        {sender?.avatar ?? "👤"}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {sender?.name ?? msg.from}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(msg._creationTime, {
                          addSuffix: true,
                        })}
                      </span>
                      {msg.type !== "comment" && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 uppercase">
                          {msg.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-xs text-gray-400 py-2">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <button
              onClick={handleComment}
              disabled={!comment.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Use @jarvis or @developer to mention agents
          </p>
        </div>
      </div>
    </div>
  );
}
