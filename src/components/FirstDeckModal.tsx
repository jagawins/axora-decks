import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, TrendingUp, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine } from "@/lib/ai-engine";

interface FirstDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const USE_CASES = [
  {
    id: "board-update",
    icon: BarChart3,
    title: "Board Update",
    description: "Quarterly performance review with KPIs and strategic outlook",
    topic: "Quarterly Board Update: Performance Review & Strategic Outlook",
    audience: "Board of Directors",
    tone: "executive" as const,
  },
  {
    id: "investor-pitch",
    icon: TrendingUp,
    title: "Investor Pitch",
    description: "Compelling narrative with market opportunity and traction",
    topic: "Investor Pitch: Market Opportunity, Traction & Growth Strategy",
    audience: "Investors and VCs",
    tone: "persuasive" as const,
  },
  {
    id: "strategic-initiative",
    icon: Target,
    title: "Strategic Initiative",
    description: "Proposal with evidence, scenarios, and recommendations",
    topic: "Strategic Initiative Proposal: Business Case & Implementation Plan",
    audience: "Executive Leadership Team",
    tone: "analytical" as const,
  },
];

export function FirstDeckModal({ open, onOpenChange }: FirstDeckModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleSelect = async (useCase: typeof USE_CASES[number]) => {
    if (!user) return;

    setGenerating(useCase.id);
    try {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: useCase.title,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError || !newProject) throw new Error("Failed to create project");

      const result = await aiEngine.generateFromPrompt({
        topic: useCase.topic,
        tone: useCase.tone,
      });

      if (result.blocks.length > 0) {
        const blocksToInsert = result.blocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: block.content as Record<string, unknown>,
          order_index: index,
        }));

        await supabase.from("blocks").insert(blocksToInsert as any);
      }

      onOpenChange(false);
      navigate(`/editor/${newProject.id}`);
      toast({ title: "Your first deck is ready!", description: "AI generated a complete draft for you." });
    } catch (error) {
      console.error("First deck generation error:", error);
      toast({
        title: "Generation failed",
        description: "Please try again or create manually.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">What are you building?</DialogTitle>
          <DialogDescription>
            Choose a use case and we'll generate a complete first draft instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            const isGenerating = generating === uc.id;
            return (
              <button
                key={uc.id}
                onClick={() => handleSelect(uc)}
                disabled={!!generating}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-accent/30 transition-all text-left disabled:opacity-50"
              >
                <div className="p-2 rounded-lg bg-accent/10">
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 text-accent animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{uc.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{uc.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs text-muted-foreground">
            Skip — I'll start from scratch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
