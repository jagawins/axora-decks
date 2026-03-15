import { Home, Library, LayoutTemplate, Settings, Crown, CreditCard, ChevronDown, Palette, Paintbrush, SwatchBook, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axivaWordmark from "@/assets/axiva-wordmark-dark.svg";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UsageMeter } from "@/components/UsageMeter";
import ReferralPanel from "@/components/ReferralPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Social icons as inline SVGs for brand accuracy
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SubstackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
  </svg>
);

interface LibrarySidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onManageSubscription: () => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "library", label: "Library", icon: Library },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "themes", label: "Themes", icon: SwatchBook },
  { id: "brand-kit", label: "Brand Kit", icon: Paintbrush, href: "/brand-kit" },
  { id: "settings", label: "Settings", icon: Settings },
];

const socialLinks = [
  { label: "X", href: "https://x.com/inaxiva", icon: XIcon },
  { label: "Instagram", href: "https://www.instagram.com/axivaexec/", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/111021149/", icon: LinkedInIcon },
  { label: "Substack", href: "https://axiva.substack.com", icon: SubstackIcon },
];

export const LibrarySidebar = ({ activeTab, onTabChange, onManageSubscription }: LibrarySidebarProps) => {
  const { subscription } = useSubscription();

  return (
    <aside className="w-64 border-r border-border bg-card/30 flex flex-col h-screen overflow-y-auto">
      {/* Workspace Dropdown */}
      <div className="p-4 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <img src={axivaWordmark} alt="AXIVA" className="h-6 w-auto" />
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Follow Axiva
            </DropdownMenuLabel>
            {socialLinks.map((link) => (
              <DropdownMenuItem key={link.label} asChild>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const navItem = item as typeof item & { href?: string };
          return (
            <button
              key={item.id}
              onClick={() => {
                if (navItem.href) {
                  window.location.href = navItem.href;
                } else {
                  onTabChange(item.id);
                }
              }}
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
          );
        })}
      </nav>

      {/* Subscription status */}
      {/* Usage meter & plan status */}
      <div className="border-t border-border">
        <UsageMeter />
        {!subscription.subscribed && (
          <div className="px-4 pb-3">
            <ReferralPanel />
          </div>
        )}
        {subscription.subscribed && (
          <div className="px-4 pb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs" 
              onClick={onManageSubscription}
            >
              <CreditCard className="h-3.5 w-3.5 mr-2" />
              Manage Subscription
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};
