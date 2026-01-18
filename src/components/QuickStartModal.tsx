import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { aiEngine, Block, Outline } from "@/lib/ai-engine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickStartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AUDIENCES = [
  { value: "executive", label: "Executive Team" },
  { value: "board", label: "Board of Directors" },
  { value: "ops", label: "Operations Leaders" },
  { value: "investor", label: "Investors" },
  { value: "team", label: "Internal Team" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "crisp", label: "Crisp & Direct" },
  { value: "analytical", label: "Analytical" },
  { value: "persuasive", label: "Persuasive" },
  { value: "executive", label: "Executive" },
];

type GenerationStep = "idle" | "outline" | "blocks" | "saving" | "complete";

const QuickStartModal = ({ open, onOpenChange }: QuickStartModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("executive");
  const [tone, setTone] = useState<"professional" | "crisp" | "analytical" | "persuasive" | "executive">("professional");
  const [step, setStep] = useState<GenerationStep>("idle");
  const [progress, setProgress] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim() || !user) return;

    setStep("outline");
    setProgress("Analyzing your topic and creating structure...");

    try {
      // Build context prompt
      const audienceLabel = AUDIENCES.find(a => a.value === audience)?.label || "Executive Team";
      const contextPrompt = `
Target audience: ${audienceLabel}
${goal ? `Goal: ${goal}` : ""}
Create a presentation that is clear, impactful, and tailored for this audience.
      `.trim();

      // Step 1: Generate outline
      const outline = await aiEngine.generateOutline({
        topic: topic.trim(),
        prompt: contextPrompt,
        tone,
      });

      setStep("blocks");
      setProgress("Converting outline into presentation blocks...");

      // Step 2: Generate blocks
      const blocks = await aiEngine.generateBlocks(outline);

      setStep("saving");
      setProgress("Creating your project...");

      // Step 3: Create project in database
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: outline.title,
          description: outline.summary,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Step 4: Insert blocks - cast content to Json type
      const blocksToInsert = blocks.map((block, index) => ({
        project_id: project.id,
        type: block.type as "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout",
        content: block.content as unknown as import("@/integrations/supabase/types").Json,
        order_index: index,
      }));

      const { error: blocksError } = await supabase
        .from("blocks")
        .insert(blocksToInsert);

      if (blocksError) throw blocksError;

      setStep("complete");
      setProgress("Done!");

      toast({
        title: "Project created!",
        description: `"${outline.title}" is ready to edit.`,
      });

      // Reset and navigate
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
        navigate(`/editor/${project.id}`);
      }, 500);

    } catch (error) {
      console.error("Quick start error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setStep("idle");
      setProgress("");
    }
  };

  const resetForm = () => {
    setTopic("");
    setGoal("");
    setAudience("executive");
    setTone("professional");
    setStep("idle");
    setProgress("");
  };

  const isGenerating = step !== "idle";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isGenerating) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Quick Start with AI
          </DialogTitle>
          <DialogDescription>
            Describe your presentation topic and let AI create a complete draft for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Q4 Digital Transformation Roadmap"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-muted/50"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal (optional)</Label>
            <Textarea
              id="goal"
              placeholder="What do you want to achieve with this presentation?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="bg-muted/50 resize-none"
              rows={2}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience} disabled={isGenerating}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)} disabled={isGenerating}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isGenerating && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <div>
                <p className="font-medium text-sm">{progress}</p>
                <p className="text-xs text-muted-foreground">
                  {step === "outline" && "Step 1 of 3"}
                  {step === "blocks" && "Step 2 of 3"}
                  {step === "saving" && "Step 3 of 3"}
                  {step === "complete" && "Complete!"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => { resetForm(); onOpenChange(false); }}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickStartModal;
