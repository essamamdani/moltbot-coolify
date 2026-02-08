import { useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import TopBar from "./components/layout/TopBar";
import LeftSidebar from "./components/layout/LeftSidebar";
import RightSidebar from "./components/layout/RightSidebar";
import KanbanBoard from "./components/kanban/KanbanBoard";

export default function App() {
  const [agentFilter, setAgentFilter] = useState<string | null>(null);

  return (
    <MainLayout
      topBar={<TopBar />}
      leftSidebar={<LeftSidebar />}
      center={<KanbanBoard agentFilter={agentFilter} />}
      rightSidebar={
        <RightSidebar
          agentFilter={agentFilter}
          onAgentFilterChange={setAgentFilter}
        />
      }
    />
  );
}
