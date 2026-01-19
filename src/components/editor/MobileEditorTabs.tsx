import { useState } from "react";
import { Layers, Edit3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTab = "blocks" | "edit" | "ai";

interface MobileEditorTabsProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasSelectedBlock: boolean;
}

const MobileEditorTabs = ({ activeTab, onTabChange, hasSelectedBlock }: MobileEditorTabsProps) => {
  const tabs = [
    { id: "blocks" as const, label: "Blocks", icon: Layers },
    { id: "edit" as const, label: "Edit", icon: Edit3, disabled: !hasSelectedBlock },
    { id: "ai" as const, label: "AI", icon: Sparkles, disabled: !hasSelectedBlock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
                isActive ? "text-accent" : "text-muted-foreground",
                tab.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileEditorTabs;
