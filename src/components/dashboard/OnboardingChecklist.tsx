import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Palette,
  Download,
  Share2,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action: () => void;
  actionLabel: string;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [completionState, setCompletionState] = useState({
    createdDeck: false,
    usedAI: false,
    appliedBrandKit: false,
    exportedDeck: false,
    sharedDeck: false,
  });

  // Don't show for paid users
  const isTrial = subscription.tier === "free";

  useEffect(() => {
    if (!user || !isTrial) return;

    const dismissedKey = `axiva_checklist_dismissed_${user.id}`;
    if (localStorage.getItem(dismissedKey) === "true") {
      setDismissed(true);
      return;
    }

    // Check completion status
    const checkCompletion = async () => {
      const [
        { count: deckCount },
        { count: blockCount },
        { count: exportCount },
        { data: sharedProjects },
        { data: profile },
      ] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("blocks").select("id", { count: "exact", head: true }),
        supabase.from("exports").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id, share_enabled").eq("share_enabled", true).limit(1),
        supabase.from("profiles").select("brand_kit").eq("user_id", user.id).maybeSingle(),
      ]);

      const hasBrandKit = profile?.brand_kit && 
        typeof profile.brand_kit === "object" && 
        Object.keys(profile.brand_kit as Record<string, unknown>).length > 0 &&
        ((profile.brand_kit as any)?.logoUrl || (profile.brand_kit as any)?.primaryColor);

      setCompletionState({
        createdDeck: (deckCount || 0) > 0,
        usedAI: (blockCount || 0) > 0,
        appliedBrandKit: !!hasBrandKit,
        exportedDeck: (exportCount || 0) > 0,
        sharedDeck: (sharedProjects || []).length > 0,
      });
    };

    checkCompletion();
  }, [user, isTrial]);

  if (!isTrial || dismissed) return null;

  const items: ChecklistItem[] = [
    {
      id: "create",
      label: "Create your first deck",
      description: "Generate a presentation with AI in under 2 minutes",
      icon: <FileText className="h-4 w-4" />,
      completed: completionState.createdDeck,
      action: () => navigate("/create"),
      actionLabel: "Create deck",
    },
    {
      id: "ai",
      label: "Generate slides with AI",
      description: "Let AI build a structured narrative for your topic",
      icon: <Sparkles className="h-4 w-4" />,
      completed: completionState.usedAI,
      action: () => navigate("/create"),
      actionLabel: "Try AI",
    },
    {
      id: "brand",
      label: "Set up your Brand Kit",
      description: "Add your logo, colors, and fonts for consistent branding",
      icon: <Palette className="h-4 w-4" />,
      completed: completionState.appliedBrandKit,
      action: () => navigate("/settings?tab=brand-kit"),
      actionLabel: "Add brand",
    },
    {
      id: "export",
      label: "Export a deck",
      description: "Download as PowerPoint, PDF, or image",
      icon: <Download className="h-4 w-4" />,
      completed: completionState.exportedDeck,
      action: () => {},
      actionLabel: "Open a deck",
    },
    {
      id: "share",
      label: "Share a deck",
      description: "Get a shareable link to present to stakeholders",
      icon: <Share2 className="h-4 w-4" />,
      completed: completionState.sharedDeck,
      action: () => {},
      actionLabel: "Open a deck",
    },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const progressPct = Math.round((completedCount / items.length) * 100);

  // Auto-dismiss when all complete
  if (completedCount === items.length) return null;

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`axiva_checklist_dismissed_${user.id}`, "true");
    }
    setDismissed(true);
  };

  return (
    <div className="glass-card border border-accent/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Rocket className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              Get started with Axiva
              <span className="text-xs font-normal text-muted-foreground">
                {completedCount}/{items.length}
              </span>
            </h3>
            <Progress value={progressPct} className="h-1.5 mt-1.5 w-40" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Checklist items */}
      {expanded && (
        <div className="px-4 pb-4 space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                item.completed
                  ? "opacity-60"
                  : "hover:bg-muted/50 cursor-pointer"
              }`}
              onClick={!item.completed ? item.action : undefined}
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? "line-through" : ""}`}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {!item.completed && (
                <Button variant="ghost" size="sm" className="text-xs text-accent shrink-0">
                  {item.actionLabel}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
