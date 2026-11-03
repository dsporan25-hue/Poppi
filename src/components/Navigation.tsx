import React from 'react';
import { NavTab } from '../types';
import { Home, MessageSquare, Code2, Bell, GitBranch, FolderGit2, Settings } from 'lucide-react';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingApprovalsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  pendingApprovalsCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'coding', label: 'Coding', icon: <Code2 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    {
      id: 'messages',
      label: 'Messages',
      icon: <Bell className="w-4 h-4 sm:w-5 sm:h-5" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { id: 'github', label: 'GitHub', icon: <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'files', label: 'Files', icon: <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#09090e]/95 backdrop-blur-lg border-t border-red-950/80 px-2 py-1.5 sm:py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-red-400 bg-red-950/40 border border-red-600/40 glow-red-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-red-600 text-white text-[9px] font-bold rounded-full border border-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-xs font-mono mt-1 ${isActive ? 'font-bold text-red-200' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-red-500 rounded-full mt-0.5 shadow-sm glow-red-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
