import { Users, Trophy, Gamepad2, Settings, Home } from "lucide-react";
import { useState } from "react";

interface BottomTaskbarProps {
  onNavigate?: (tab: string) => void;
  activeTab?: string;
}

export default function BottomTaskbar({ onNavigate, activeTab: propActiveTab }: BottomTaskbarProps) {
  const [activeTab, setActiveTab] = useState(propActiveTab || "home");

  const tabs = [
    { id: "friends", label: "Friends", icon: Users },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "home", label: "Home", icon: Home },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onNavigate?.(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] shadow-2xl">
      <div className="flex items-center justify-around h-16 md:h-20 max-w-2xl mx-auto w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 md:px-5 py-2 rounded-lg md:rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              title={tab.label}
            >
              <Icon
                size={22}
                className="md:hidden"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Icon
                size={24}
                className="hidden md:block"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-xs font-medium hidden sm:block">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
