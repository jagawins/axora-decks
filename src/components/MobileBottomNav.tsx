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
      <div className="flex items-center justify-around px-1 h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[40px] min-h-[40px] rounded-lg transition-colors touch-target",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <tab.icon className="h-[18px] w-[18px]" />
              <span className="text-[9px] font-medium leading-none truncate max-w-[48px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
