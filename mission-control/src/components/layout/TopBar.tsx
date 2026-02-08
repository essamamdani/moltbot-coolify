import { useAgents } from "../../hooks/useAgents";
import { useTasks } from "../../hooks/useTasks";
import { useConfig } from "../../hooks/useConfig";

export default function TopBar() {
  const { activeCount } = useAgents();
  const { counts } = useTasks();
  const { config, gatewayLink } = useConfig();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-status-online" />
          Active Agents: {activeCount}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          Mission Control
        </h1>
        {config && (
          <span className="text-xs text-gray-400 font-mono">
            {config.model}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Tasks in Queue: {counts?.queue ?? 0}
        </span>

        {gatewayLink && (
          <a
            href={gatewayLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-dark transition-colors"
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open Gateway
          </a>
        )}
      </div>
    </header>
  );
}
