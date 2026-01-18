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
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine, BlockType } from "@/lib/ai-engine";
import { sanitizeContent, sanitizeListItems } from "@/lib/sanitize";

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

const SLIDE_COUNT_OPTIONS = [5, 8, 10, 12, 15];

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
  const [slideCount, setSlideCount] = useState(8);
  const [generating, setGenerating] = useState(false);

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
          slideCount,
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
      });

      if (result.blocks.length > 0) {
        const blocksToInsert = result.blocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: block.content as Record<string, unknown>,
          order_index: index,
        }));

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
    setSlideCount(8);
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

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="slideCount">Number of Slides</Label>
              <Select 
                value={String(slideCount)} 
                onValueChange={(v) => setSlideCount(Number(v))}
                disabled={generating}
              >
                <SelectTrigger id="slideCount" className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLIDE_COUNT_OPTIONS.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count} slides
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
