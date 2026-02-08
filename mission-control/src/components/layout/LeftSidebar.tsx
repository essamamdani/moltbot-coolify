import { useAgents } from "../../hooks/useAgents";
import AgentCard from "../agents/AgentCard";
import AgentDetail from "../agents/AgentDetail";
import AddAgentModal from "../agents/AddAgentModal";
import type { Agent } from "../../types";
import { useState } from "react";

export default function LeftSidebar() {
  const { agents } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAddAgent, setShowAddAgent] = useState(false);

  return (
    <aside className="w-[250px] bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Agents
        </h2>
        <button
          onClick={() => setShowAddAgent(true)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-accent hover:bg-accent/10 transition-colors"
          title="Add new agent"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {agents.map((agent) => (
          <AgentCard
            key={agent._id}
            agent={agent}
            selected={selectedAgent?._id === agent._id}
            onClick={() =>
              setSelectedAgent(
                selectedAgent?._id === agent._id ? null : agent
              )
            }
          />
        ))}
        {agents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No agents registered
          </p>
        )}
      </div>

      {selectedAgent && (
        <div className="border-t border-gray-200">
          <AgentDetail
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
          />
        </div>
      )}

      {showAddAgent && (
        <AddAgentModal
          onClose={() => setShowAddAgent(false)}
          onCreated={(agent) => {
            console.log("Agent created:", agent);
            // In Convex mode, the agent list will auto-update via real-time subscription
            // In demo mode, a page refresh would be needed to see the new agent
          }}
        />
      )}
    </aside>
  );
}
