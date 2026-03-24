import { useState } from "react";
import { Home, Sparkles, Layers, MoreHorizontal, Mic, CalendarDays, GalleryHorizontalEnd, Target, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type MobileNavTab = "home" | "generate" | "library" | "speech-prep" | "more";

const primaryTabs: { id: MobileNavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "library", label: "My Decks", icon: Layers },
  { id: "speech-prep", label: "Speech", icon: Mic },
  { id: "more", label: "More", icon: MoreHorizontal },
];

const moreItems: { id: string; label: string; icon: typeof Home }[] = [
  { id: "executive", label: "Executive Hub", icon: Target },
  { id: "timelines", label: "Timelines", icon: CalendarDays },
  { id: "slides", label: "Slide Library", icon: GalleryHorizontalEnd },
  { id: "settings", label: "Settings", icon: Settings },
];

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNav = ({ activeTab, onTabChange }: MobileBottomNavProps) => {
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreItems.some(item => item.id === activeTab);

  const handleTabClick = (tabId: string) => {
    if (tabId === "more") {
      setMoreOpen(true);
    } else {
      onTabChange(tabId);
    }
  };

  const handleMoreItemClick = (itemId: string) => {
    setMoreOpen(false);
    onTabChange(itemId);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around px-1 h-14">
          {primaryTabs.map((tab) => {
            const isActive = tab.id === "more" ? isMoreActive : activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[40px] rounded-lg transition-colors touch-target",
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

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-2 pb-8 pt-3">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base font-semibold text-center">More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2">
            {moreItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMoreItemClick(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:bg-muted"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
