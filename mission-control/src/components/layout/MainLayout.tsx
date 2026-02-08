import { ReactNode } from "react";

interface MainLayoutProps {
  topBar: ReactNode;
  leftSidebar: ReactNode;
  center: ReactNode;
  rightSidebar: ReactNode;
}

export default function MainLayout({
  topBar,
  leftSidebar,
  center,
  rightSidebar,
}: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {topBar}
      <div className="flex-1 flex overflow-hidden">
        {leftSidebar}
        <main className="flex-1 overflow-hidden bg-surface-50">
          {center}
        </main>
        {rightSidebar}
      </div>
    </div>
  );
}
