import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine, BlockType, Block } from "@/lib/ai-engine";
import { cn } from "@/lib/utils";

interface CreateDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when generation is complete (for Editor integration) */
  onGenerate?: (params: {
    topic: string;
    audience?: string;
    goal?: string;
    tone: "professional" | "crisp" | "analytical" | "persuasive" | "executive" | "casual";
    slideCount: number;
  }) => Promise<void>;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "executive", label: "Executive" },
  { value: "persuasive", label: "Persuasive" },
  { value: "analytical", label: "Analytical" },
  { value: "crisp", label: "Crisp" },
  { value: "casual", label: "Casual" },
] as const;

const PRESET_SLIDE_COUNTS = [5, 10, 12] as const;

// Decision block types and ordering
const DECISION_BLOCK_TYPES = ['decision_summary', 'evidence_map', 'scenario_set', 'recommendation_panel'] as const;
const DECISION_BLOCK_ORDER = ['decision_summary', 'evidence_map', 'scenario_set', 'recommendation_panel'];
const VISUAL_BLOCK_TYPES = ['stat_block', 'quote_block', 'timeline_block', 'comparison_table', 'card_grid', 'hero_header', 'exec_summary', 'cta_section', 'section_divider', 'icon_text_block', 'framed_insight', 'chart_block', 'three_pillars', 'two_by_two_matrix', 'decision_next_steps'] as const;

export function CreateDeckModal({
  open,
  onOpenChange,
  onGenerate,
}: CreateDeckModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState<"professional" | "crisp" | "analytical" | "persuasive" | "executive" | "casual">("professional");
  const [slideCountPreset, setSlideCountPreset] = useState<5 | 10 | 12 | "custom">(10);
  const [customSlideCount, setCustomSlideCount] = useState(8);
  const [decisionMode, setDecisionMode] = useState(false);
  const [generating, setGenerating] = useState(false);

  const effectiveSlideCount = slideCountPreset === "custom" ? customSlideCount : slideCountPreset;

  // Sort decision blocks to fixed order
  const sortDecisionBlocks = (blocks: Block[]): Block[] => {
    const hasDecisionBlocks = blocks.some(b => DECISION_BLOCK_TYPES.includes(b.type as any));
    if (!hasDecisionBlocks) return blocks;

    const decisionBlocks: Block[] = [];
    const otherBlocks: Block[] = [];

    for (const block of blocks) {
      if (DECISION_BLOCK_TYPES.includes(block.type as any)) {
        decisionBlocks.push(block);
      } else {
        otherBlocks.push(block);
      }
    }

    decisionBlocks.sort((a, b) => {
      const aIndex = DECISION_BLOCK_ORDER.indexOf(a.type);
      const bIndex = DECISION_BLOCK_ORDER.indexOf(b.type);
      return aIndex - bIndex;
    });

    return [...decisionBlocks, ...otherBlocks];
  };

  const handleSubmit = async () => {
    if (!topic.trim()) return;

    // If onGenerate callback is provided (Editor mode), use it
    if (onGenerate) {
      setGenerating(true);
      try {
        await onGenerate({
          topic: topic.trim(),
          audience: audience.trim() || undefined,
          goal: goal.trim() || undefined,
          tone,
          slideCount: effectiveSlideCount,
        });
        resetForm();
      } finally {
        setGenerating(false);
      }
      return;
    }

    // Library mode: create new project first
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    setGenerating(true);
    try {
      // Create new project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: topic.trim().substring(0, 100),
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError || !newProject) {
        throw new Error('Failed to create project');
      }

      // Generate blocks using proper API
      const prompt = `${topic.trim()}${audience ? `. Target audience: ${audience}` : ''}${goal ? `. Goal: ${goal}` : ''}`;
      const result = await aiEngine.generateFromPrompt({
        topic: prompt,
        tone,
        decisionMode,
        slideCount: effectiveSlideCount,
      });

      if (result.blocks.length > 0) {
        // Apply decision ordering before saving
        const orderedBlocks = sortDecisionBlocks(result.blocks);
        const blocksToInsert = orderedBlocks.map((block, index) => {
          const payload = block.block_payload ?? block.content;
          return {
            project_id: newProject.id,
            type: block.type,
            content: payload as Record<string, unknown>,
            order_index: index,
          };
        });

        await supabase.from('blocks').insert(blocksToInsert as any);
      }

      resetForm();
      onOpenChange(false);
      navigate(`/preview/${newProject.id}`);
      toast({ title: 'Deck created!', description: 'Your AI-generated deck is ready.' });
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({ title: 'Error', description: 'Failed to create deck.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setTopic("");
    setAudience("");
    setGoal("");
    setTone("professional");
    setSlideCountPreset(10);
    setCustomSlideCount(8);
    setDecisionMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Create Deck with AI
          </DialogTitle>
          <DialogDescription>
            Describe your presentation topic and preferences. AI will generate a complete deck for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic">
              Topic <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="topic"
              placeholder="e.g., Q3 2024 Sales Performance Review, Product Launch Strategy, Cloud Migration Benefits..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-muted/50 min-h-[80px]"
              disabled={generating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience (optional)</Label>
              <Input
                id="audience"
                placeholder="e.g., Board of Directors, Sales Team"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="bg-muted/50"
                disabled={generating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Goal (optional)</Label>
              <Input
                id="goal"
                placeholder="e.g., Secure funding, Inform team"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="bg-muted/50"
                disabled={generating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)} disabled={generating}>
              <SelectTrigger id="tone" className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Slide Count Segmented Control */}
          <div className="space-y-2">
            <Label>Number of Slides</Label>
            <div className={cn("flex gap-1 rounded-lg border border-border/60 bg-muted/30 p-1", decisionMode && "opacity-50 pointer-events-none")}>
              {PRESET_SLIDE_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  disabled={generating || decisionMode}
                  onClick={() => setSlideCountPreset(count)}
                  className={cn(
                    "flex-1 rounded-md py-1.5 text-sm font-medium transition-all",
                    slideCountPreset === count
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {count}
                </button>
              ))}
              <button
                type="button"
                disabled={generating || decisionMode}
                onClick={() => setSlideCountPreset("custom")}
                className={cn(
                  "flex-1 rounded-md py-1.5 text-sm font-medium transition-all",
                  slideCountPreset === "custom"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Custom
              </button>
            </div>
            {slideCountPreset === "custom" && !decisionMode && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={3}
                  max={20}
                  value={customSlideCount}
                  onChange={(e) => setCustomSlideCount(Math.min(20, Math.max(3, parseInt(e.target.value) || 3)))}
                  className="bg-muted/50 w-24"
                  disabled={generating}
                />
                <span className="text-sm text-muted-foreground">slides (3–20)</span>
              </div>
            )}
          </div>

          {/* Decision Mode Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="decisionMode" className="text-sm font-medium cursor-pointer">
                Decision Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Generates an executive brief with evidence and recommendations
              </p>
            </div>
            <Switch
              id="decisionMode"
              checked={decisionMode}
              onCheckedChange={setDecisionMode}
              disabled={generating}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSubmit}
            disabled={!topic.trim() || generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Deck
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
