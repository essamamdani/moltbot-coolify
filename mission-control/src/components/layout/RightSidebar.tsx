import { useState } from "react";
import { format } from "date-fns";
import LiveFeed from "../feed/LiveFeed";
import { useAgents } from "../../hooks/useAgents";
import { useConfig } from "../../hooks/useConfig";
import type { FeedFilter } from "../../types";

interface RightSidebarProps {
  agentFilter: string | null;
  onAgentFilterChange: (agentId: string | null) => void;
}

export default function RightSidebar({
  agentFilter,
  onAgentFilterChange,
}: RightSidebarProps) {
  const { agents, activeCount } = useAgents();
  const { config, gatewayLink } = useConfig();
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const now = new Date();

  return (
    <aside className="w-[300px] bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Agency Status */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Agency Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-online" />
            <span className="text-sm font-medium text-gray-700">Online</span>
          </div>
          <div className="text-sm text-gray-500">
            {format(now, "EEEE, d MMMM yyyy")}
          </div>
          <div className="text-sm text-gray-500">
            {format(now, "HH:mm")}
          </div>
          <div className="text-sm text-gray-400">
            {activeCount} agent{activeCount !== 1 ? "s" : ""} active
          </div>
        </div>

        {/* Gateway Info */}
        {config && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Model:</span>
              <span className="text-xs font-mono text-gray-700">
                {config.model}
              </span>
            </div>
            {gatewayLink && (
              <a
                href={gatewayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dark transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Gateway: {config.gatewayUrl}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Live Feed */}
      <div className="flex-1 flex flex-col overflow-hidden border-b border-gray-100">
        <div className="p-4 pb-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Live Feed
          </h3>
          <div className="flex gap-1">
            {(
              [
                { key: "all", label: "All" },
                { key: "tasks", label: "Tasks" },
                { key: "comments", label: "Comments" },
                { key: "decisions", label: "Decisions" },
              ] as { key: FeedFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFeedFilter(key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  feedFilter === key
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <LiveFeed filter={feedFilter} />
        </div>
      </div>

      {/* Agent Filter */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Filter by Agent
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onAgentFilterChange(null)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              agentFilter === null
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {agents.map((agent) => (
            <button
              key={agent._id}
              onClick={() => onAgentFilterChange(agent.agentId)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                agentFilter === agent.agentId
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {agent.avatar && (
                <span className="mr-1">{agent.avatar}</span>
              )}
              {agent.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
