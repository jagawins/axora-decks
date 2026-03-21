import { Home, Sparkles, Layers, GalleryHorizontalEnd, User } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileNavTab = "home" | "generate" | "library" | "slides" | "settings";

const tabs: { id: MobileNavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "library", label: "My Decks", icon: Layers },
  { id: "slides", label: "Slides", icon: GalleryHorizontalEnd },
  { id: "settings", label: "Account", icon: User },
];

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] rounded-lg transition-colors touch-target",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
