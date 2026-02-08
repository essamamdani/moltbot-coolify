import type { Agent } from "../../types";
import { STATUS_COLORS } from "../../types";

interface AgentCardProps {
  agent: Agent;
  selected: boolean;
  onClick: () => void;
}

export default function AgentCard({ agent, selected, onClick }: AgentCardProps) {
  const statusDot = STATUS_COLORS[agent.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        selected
          ? "bg-blue-50 border border-accent ring-1 ring-accent/20"
          : "bg-surface-50 border border-transparent hover:bg-surface-100 hover:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl flex-shrink-0">
          {agent.avatar ?? "🤖"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">
              {agent.name}
            </span>
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`}
              title={agent.status}
            />
          </div>
          <p className="text-xs text-gray-500 capitalize">{agent.status}</p>
        </div>
      </div>
    </button>
  );
}
