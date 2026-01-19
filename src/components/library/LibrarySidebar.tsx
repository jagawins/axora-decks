import { Home, Library, LayoutTemplate, Settings, Crown, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axoraIcon from "@/assets/axora-icon.svg";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface LibrarySidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onManageSubscription: () => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "library", label: "Library", icon: Library },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "settings", label: "Settings", icon: Settings },
];

export const LibrarySidebar = ({ activeTab, onTabChange, onManageSubscription }: LibrarySidebarProps) => {
  const { subscription } = useSubscription();

  return (
    <aside className="w-64 border-r border-border bg-card/30 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center gap-2">
        <img src={axoraIcon} alt="AXORA" className="h-8 w-8" />
        <span className="text-lg font-bold tracking-tight">AXORA</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Subscription status */}
      <div className="p-4 border-t border-border">
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            {subscription.tier === 'executive' && <Crown className="h-4 w-4 text-success" />}
            <span className={cn(
              "text-xs font-medium uppercase tracking-wider",
              subscription.tier === 'executive' 
                ? "text-success" 
                : subscription.tier === 'pro' 
                  ? "text-accent" 
                  : "text-muted-foreground"
            )}>
              {subscription.tier} Plan
            </span>
          </div>
          {subscription.subscribed ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start" 
              onClick={onManageSubscription}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          ) : (
            <Button 
              variant="hero-outline" 
              size="sm" 
              className="w-full"
              onClick={() => onTabChange('upgrade')}
            >
              Upgrade to Pro
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};
