import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
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
import { Loader2, Sparkles, ArrowRight, ArrowLeft, Image, LayoutGrid } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine, Block } from "@/lib/ai-engine";
import { cn } from "@/lib/utils";
import { VisualBuilder } from "@/components/VisualBuilder";
import type { ImageSlot, ImageAsset, VisualDensity } from "@/types/visual-builder";

interface CreateDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate?: (params: {
    topic: string;
    audience?: string;
    goal?: string;
    tone: "professional" | "crisp" | "analytical" | "persuasive" | "executive" | "casual";
    slideCount: number;
  }) => Promise<void>;
}

type WizardStep = "setup" | "outline" | "visual" | "generating";
type ToneType = "professional" | "crisp" | "analytical" | "persuasive" | "executive" | "casual";

const TONE_OPTIONS: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "executive", label: "Executive" },
  { value: "persuasive", label: "Persuasive" },
  { value: "analytical", label: "Analytical" },
  { value: "crisp", label: "Crisp" },
  { value: "casual", label: "Casual" },
];

const PRESET_SLIDE_COUNTS = [5, 10, 12] as const;

const DENSITY_OPTIONS: { value: VisualDensity; label: string; description: string }[] = [
  { value: "minimal", label: "Minimal", description: "~20% image slides, fewer charts" },
  { value: "balanced", label: "Balanced", description: "~50% image slides, charts on data" },
  { value: "visual", label: "Visual", description: "Image on every appropriate slide + charts" },
];

const DECISION_BLOCK_TYPES = ["decision_summary", "evidence_map", "scenario_set", "recommendation_panel"] as const;
const DECISION_BLOCK_ORDER = ["decision_summary", "evidence_map", "scenario_set", "recommendation_panel"];

// Derive image slots from an outline's sections
function deriveImageSlots(
  sections: Array<{ heading: string; points: string[] }>,
  density: VisualDensity
): ImageSlot[] {
  const slots: ImageSlot[] = [];

  // Determine which sections get image slots based on density
  let imageRatio = 0.5;
  if (density === "minimal") imageRatio = 0.2;
  if (density === "visual") imageRatio = 1.0;

  sections.forEach((section, idx) => {
    const shouldHaveImage =
      density === "visual" ||
      (density === "balanced" && idx % 2 === 0) ||
      (density === "minimal" && idx === 0);

    if (shouldHaveImage && slots.length < Math.ceil(sections.length * imageRatio)) {
      slots.push({
        id: `slot-${idx}`,
        slideIndex: idx,
        slideTitle: section.heading,
        placement: idx === 0 ? "hero" : "inline",
        suggestedQuery: section.heading,
      });
    }
  });

  return slots;
}

function sortDecisionBlocks(blocks: Block[]): Block[] {
  const hasDecision = blocks.some((b) =>
    DECISION_BLOCK_TYPES.includes(b.type as (typeof DECISION_BLOCK_TYPES)[number])
  );
  if (!hasDecision) return blocks;

  const decisionBlocks: Block[] = [];
  const otherBlocks: Block[] = [];
  for (const block of blocks) {
    if (DECISION_BLOCK_TYPES.includes(block.type as (typeof DECISION_BLOCK_TYPES)[number])) {
      decisionBlocks.push(block);
    } else {
      otherBlocks.push(block);
    }
  }
  decisionBlocks.sort(
    (a, b) => DECISION_BLOCK_ORDER.indexOf(a.type) - DECISION_BLOCK_ORDER.indexOf(b.type)
  );
  return [...decisionBlocks, ...otherBlocks];
}

// Inject selected images into blocks that support them
function injectImagesIntoBlocks(blocks: Block[], slots: ImageSlot[]): Block[] {
  const lockedSlots = slots.filter((s) => s.imageAsset?.locked);
  const unlockedSlots = slots.filter((s) => s.imageAsset && !s.imageAsset.locked);

  // Try to inject hero images into hero_header or first exec_summary blocks
  let heroInjected = false;
  const heroSlot = slots.find((s) => s.placement === "hero" && s.imageAsset);

  return blocks.map((block, idx) => {
    // Inject hero image into the first hero_header block
    if (!heroInjected && heroSlot?.imageAsset && block.type === "hero_header") {
      heroInjected = true;
      const content = { ...(block.content as Record<string, unknown>) };
      content.image = {
        src: heroSlot.imageAsset.url,
        alt: heroSlot.slideTitle,
        credit: heroSlot.imageAsset.credit,
      };
      content.backgroundStyle = "image";
      return { ...block, content };
    }
    return block;
  });
}

export function CreateDeckModal({ open, onOpenChange, onGenerate }: CreateDeckModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step state
  const [step, setStep] = useState<WizardStep>("setup");

  // Setup form
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");
  const [slideCountPreset, setSlideCountPreset] = useState<5 | 10 | 12 | "custom">(10);
  const [customSlideCount, setCustomSlideCount] = useState(8);
  const [decisionMode, setDecisionMode] = useState(false);
  const [density, setDensity] = useState<VisualDensity>("balanced");

  // Outline + visual builder state
  const [outline, setOutline] = useState<{ title: string; sections: Array<{ heading: string; points: string[] }>; bullets: string[]; summary: string } | null>(null);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);
  const [outlineLoading, setOutlineLoading] = useState(false);

  // Final generation
  const [generating, setGenerating] = useState(false);

  const effectiveSlideCount = slideCountPreset === "custom" ? customSlideCount : slideCountPreset;

  const resetForm = () => {
    setStep("setup");
    setTopic("");
    setAudience("");
    setGoal("");
    setTone("professional");
    setSlideCountPreset(10);
    setCustomSlideCount(8);
    setDecisionMode(false);
    setDensity("balanced");
    setOutline(null);
    setImageSlots([]);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  // Step 1 → 2: Generate outline
  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;

    // Editor mode: skip the wizard and delegate directly
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

    setOutlineLoading(true);
    try {
      const prompt = `${topic.trim()}${audience ? `. Target audience: ${audience}` : ""}${goal ? `. Goal: ${goal}` : ""}`;
      const generatedOutline = await aiEngine.generateOutline({
        topic: prompt,
        tone,
        slideCount: effectiveSlideCount,
      });
      setOutline(generatedOutline);
      // Derive image slots from the outline sections
      setImageSlots(deriveImageSlots(generatedOutline.sections, density));
      setStep("visual");
    } catch (e) {
      console.error("Outline generation failed:", e);
      toast({ title: "Error", description: "Failed to generate outline. Please try again.", variant: "destructive" });
    } finally {
      setOutlineLoading(false);
    }
  };

  const handleUpdateSlot = useCallback((slotId: string, asset: ImageAsset | undefined) => {
    setImageSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, imageAsset: asset } : s))
    );
  }, []);

  // Step 2 → Final: Generate blocks and save
  const handleGenerateDeck = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!outline) return;

    setStep("generating");
    setGenerating(true);

    try {
      // Create project
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({ title: topic.trim().substring(0, 100), user_id: user.id })
        .select()
        .single();

      if (projectError || !newProject) throw new Error("Failed to create project");

      // Generate blocks from the already-generated outline
      const blocks = await aiEngine.generateBlocks(
        outline,
        true,
        decisionMode,
        effectiveSlideCount,
        density
      );

      if (blocks.length > 0) {
        // Inject locked/selected images into blocks
        const withImages = injectImagesIntoBlocks(blocks, imageSlots);
        const orderedBlocks = sortDecisionBlocks(withImages);

        const blocksToInsert = orderedBlocks.map((block, index) => ({
          project_id: newProject.id,
          type: block.type,
          content: (block.block_payload ?? block.content) as Record<string, unknown>,
          order_index: index,
        }));

        await supabase.from("blocks").insert(blocksToInsert as any);
      }

      resetForm();
      onOpenChange(false);
      navigate(`/preview/${newProject.id}`);
      toast({ title: "Deck created!", description: "Your AI-generated deck is ready." });
    } catch (error) {
      console.error("Error creating deck:", error);
      toast({ title: "Error", description: "Failed to create deck.", variant: "destructive" });
      setStep("visual");
    } finally {
      setGenerating(false);
    }
  };

  const stepTitles: Record<WizardStep, string> = {
    setup: "Create Deck with AI",
    outline: "Review Outline",
    visual: "Choose Images",
    generating: "Building Your Deck",
  };

  const stepNumbers: Record<WizardStep, number> = {
    setup: 1,
    outline: 2,
    visual: 2,
    generating: 3,
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <DialogTitle>{stepTitles[step]}</DialogTitle>
          </div>
          {/* Step indicator */}
          {!onGenerate && (
            <div className="flex items-center gap-1.5 mt-3">
              {["Setup", "Visual Builder", "Generate"].map((label, i) => {
                const num = i + 1;
                const current = stepNumbers[step];
                const active = current === num;
                const done = current > num;
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                        done && "bg-primary text-primary-foreground",
                        active && "bg-accent text-accent-foreground",
                        !done && !active && "bg-muted text-muted-foreground"
                      )}
                    >
                      {num}
                    </div>
                    <span
                      className={cn(
                        "text-xs",
                        active ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                    {i < 2 && <div className="w-8 h-px bg-border/60 mx-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── STEP 1: SETUP ── */}
          {step === "setup" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">
                  Topic <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="topic"
                  placeholder="e.g., Q3 2024 Sales Performance Review, Product Launch Strategy..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-muted/50 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Board of Directors"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal</Label>
                  <Input
                    id="goal"
                    placeholder="e.g., Secure funding"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Slide count */}
              <div className="space-y-2">
                <Label>Number of Slides</Label>
                <div
                  className={cn(
                    "flex gap-1 rounded-lg border border-border/60 bg-muted/30 p-1",
                    decisionMode && "opacity-50 pointer-events-none"
                  )}
                >
                  {PRESET_SLIDE_COUNTS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      disabled={decisionMode}
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
                    disabled={decisionMode}
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
                      onChange={(e) =>
                        setCustomSlideCount(Math.min(20, Math.max(3, parseInt(e.target.value) || 3)))
                      }
                      className="bg-muted/50 w-24"
                    />
                    <span className="text-sm text-muted-foreground">slides (3–20)</span>
                  </div>
                )}
              </div>

              {/* Visual density */}
              <div className="space-y-2">
                <Label>Visual Density</Label>
                <div className="grid grid-cols-3 gap-2">
                  {DENSITY_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDensity(d.value)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all",
                        density === d.value
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span className="text-sm font-medium">{d.label}</span>
                      </div>
                      <p className="text-xs leading-snug">{d.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decision mode */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="decisionMode" className="text-sm font-medium cursor-pointer">
                    Decision Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Executive brief with evidence and recommendations
                  </p>
                </div>
                <Switch
                  id="decisionMode"
                  checked={decisionMode}
                  onCheckedChange={setDecisionMode}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: VISUAL BUILDER ── */}
          {step === "visual" && outline && (
            <div className="space-y-4">
              {/* Outline summary */}
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <p className="text-sm font-semibold mb-1">{outline.title}</p>
                <p className="text-xs text-muted-foreground">{outline.summary}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {outline.sections.map((s, i) => (
                    <span key={i} className="text-xs bg-muted rounded px-2 py-0.5">
                      {s.heading}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-accent" />
                <p className="text-sm font-medium">
                  Select images for your slides{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </p>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Lock 🔒 any image to preserve it across regenerations. Images will be embedded
                into the relevant slide.
              </p>

              <VisualBuilder slots={imageSlots} onUpdateSlot={handleUpdateSlot} />
            </div>
          )}

          {/* ── STEP 3: GENERATING ── */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-accent" />
              <div className="text-center">
                <p className="font-semibold">Building your deck…</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generating visual blocks and applying your images
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "generating" && (
          <div className="px-6 py-4 border-t border-border/40 flex justify-between gap-3 flex-shrink-0">
            {step === "visual" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep("setup")}
                  className="gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  variant="hero"
                  onClick={handleGenerateDeck}
                  disabled={generating}
                  className="gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Deck
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleGenerateOutline}
                  disabled={!topic.trim() || outlineLoading || generating}
                  className="gap-1.5"
                >
                  {outlineLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Building outline…
                    </>
                  ) : onGenerate ? (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Deck
                    </>
                  ) : (
                    <>
                      Next: Choose Images <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
