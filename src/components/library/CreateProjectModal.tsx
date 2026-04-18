import { useState } from "react";
import { Loader2, Sparkles, FileText, Briefcase, Rocket, TrendingUp, Presentation, Megaphone, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  /** Called when user clicks "Generate with AI" — opens the AI wizard with a pre-filled prompt */
  onUseAI?: (prefilledPrompt?: string) => void;
}

const STARTERS = [
  { icon: Briefcase, label: "Board Update", prompt: "Q3 board update covering revenue growth, key wins, headcount changes, and strategic priorities for next quarter" },
  { icon: Rocket, label: "Investor Pitch", prompt: "Series A pitch deck for an AI-powered B2B SaaS startup with $2M ARR, 18% MoM growth, and a path to $20M ARR" },
  { icon: TrendingUp, label: "Sales QBR", prompt: "Quarterly business review for the sales team: pipeline health, win/loss analysis, top accounts, and Q4 forecast" },
  { icon: Presentation, label: "All-Hands", prompt: "Company all-hands update on progress against annual goals, team highlights, customer wins, and what's next" },
  { icon: Megaphone, label: "Product Launch", prompt: "Go-to-market strategy for launching a new enterprise product, including ICP, positioning, pricing, and 90-day plan" },
  { icon: FileText, label: "Strategy Memo", prompt: "Strategic recommendation to leadership on whether to expand into the European market, including evidence and risks" },
];

export const CreateProjectModal = ({ open, onOpenChange, onSubmit, onUseAI }: CreateProjectModalProps) => {
  const [mode, setMode] = useState<"choose" | "blank">("choose");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setMode("choose");
    setTitle("");
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleBlankSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(title.trim(), "");
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarter = (prompt: string) => {
    if (onUseAI) {
      onUseAI(prompt);
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {mode === "choose" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-accent" />
                Start a new deck
              </DialogTitle>
              <DialogDescription className="flex items-center gap-3 text-xs flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Zap className="h-3 w-3 text-accent" />
                  Avg. 12 seconds
                </span>
                <span>•</span>
                <span>Pick a starter or describe your own</span>
              </DialogDescription>
            </DialogHeader>

            {/* Starter cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
              {STARTERS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleStarter(prompt)}
                  disabled={!onUseAI}
                  className={cn(
                    "group rounded-xl border border-border/60 bg-muted/20 p-4 text-left transition-all",
                    "hover:border-accent/50 hover:bg-accent/5 hover:shadow-md",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-sm font-semibold mb-0.5">{label}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                    {prompt}
                  </p>
                </button>
              ))}
            </div>

            {/* Generate with AI hero CTA */}
            {onUseAI && (
              <button
                type="button"
                onClick={() => { onUseAI(); reset(); onOpenChange(false); }}
                className="w-full rounded-xl border border-accent/40 bg-gradient-to-r from-accent/10 to-accent/5 p-4 flex items-center justify-between hover:from-accent/15 hover:to-accent/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Describe your own deck</p>
                    <p className="text-xs text-muted-foreground">Tell AI what you need — it builds a complete draft</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-accent transition-transform group-hover:translate-x-1" />
              </button>
            )}

            {/* Blank deck escape hatch */}
            <button
              type="button"
              onClick={() => setMode("blank")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Or start with a blank deck →
            </button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Start with a blank deck</DialogTitle>
              <DialogDescription>
                You can always add AI-generated slides later from the editor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Q4 Strategy Deck"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && title.trim()) handleBlankSubmit();
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setMode("choose")}>
                ← Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleBlankSubmit}
                  disabled={!title.trim() || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
