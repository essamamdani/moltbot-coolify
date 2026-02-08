import { formatDistanceToNow } from "date-fns";
import type { Agent } from "../../types";
import { STATUS_COLORS } from "../../types";

interface AgentDetailProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const statusDot = STATUS_COLORS[agent.status];

  return (
    <div className="p-4 bg-surface-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Agent Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          &times;
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{agent.avatar ?? "🤖"}</span>
          <div>
            <p className="font-medium text-gray-900">{agent.name}</p>
            <p className="text-xs text-gray-500 capitalize">{agent.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
          <span className="text-gray-700 capitalize">{agent.status}</span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {agent.description}
        </p>

        <div className="text-xs text-gray-400">
          Last heartbeat:{" "}
          {formatDistanceToNow(agent.lastHeartbeat, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
