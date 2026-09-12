import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activePath, onNavigate }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isDocumentsExplorer = activePath.startsWith('/documents');

  return (
    <div className="h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors overflow-hidden">
      <Navbar
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activePath={activePath}
        onNavigate={onNavigate}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar
          activePath={activePath}
          onNavigate={onNavigate}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main
          className={`flex-1 min-h-0 w-full ${
            isDocumentsExplorer
              ? 'p-2 sm:p-3 overflow-hidden flex flex-col max-w-[1800px] mx-auto'
              : 'overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
