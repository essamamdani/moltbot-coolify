import { useMCData } from "../demo-provider";

export function useAgents() {
  const { agents } = useMCData();
  const activeAgents = agents.filter((a) => a.status !== "offline");
  return { agents, activeAgents, activeCount: activeAgents.length };
}

export function useAgent(agentId: string) {
  const { agents } = useMCData();
  return agents.find((a) => a.agentId === agentId);
}
