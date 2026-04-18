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
import { Loader2, Sparkles, ArrowRight, ArrowLeft, Image, LayoutGrid, FileText, Pencil, BarChart3, Target, Lightbulb, Zap, Users, ChevronDown, Briefcase, TrendingUp, Rocket, Presentation, FileBarChart, Megaphone } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  /** Optional pre-filled topic (e.g., from a starter card). Set when modal opens. */
  initialTopic?: string;
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

const EXAMPLE_PROMPTS: { icon: React.ReactNode; label: string; prompt: string; tone: ToneType }[] = [
  { icon: <Briefcase className="w-4 h-4" />, label: "Q3 Board Update", prompt: "Q3 board update covering revenue growth, key wins, headcount changes, and strategic priorities for next quarter", tone: "executive" },
  { icon: <Rocket className="w-4 h-4" />, label: "Series A Pitch", prompt: "Series A pitch deck for an AI-powered B2B SaaS startup with $2M ARR, 18% MoM growth, and a path to $20M ARR", tone: "persuasive" },
  { icon: <TrendingUp className="w-4 h-4" />, label: "Product Launch Strategy", prompt: "Go-to-market strategy for launching a new enterprise product, including ICP, positioning, pricing, and 90-day plan", tone: "professional" },
  { icon: <FileBarChart className="w-4 h-4" />, label: "Sales QBR", prompt: "Quarterly business review for the sales team: pipeline health, win/loss analysis, top accounts, and Q4 forecast", tone: "analytical" },
  { icon: <Presentation className="w-4 h-4" />, label: "All-Hands Update", prompt: "Company all-hands update on progress against annual goals, team highlights, customer wins, and what's next", tone: "professional" },
  { icon: <Megaphone className="w-4 h-4" />, label: "Strategic Recommendation", prompt: "Recommendation to leadership on whether to expand into the European market, including evidence and risks", tone: "executive" },
];

// Classify slide intent for visual hints
function classifySlideIntent(heading: string): "data" | "strategy" | "decision" | "other" {
  const h = heading.toLowerCase();
  if (/pillar|framework|vision|approach|model|roadmap|strateg|priorit|principle|theme|focus|initiative|goal/i.test(h)) return "strategy";
  if (/recommend|decision|next.?step|action|conclude|conclusion|proposal|option|select|choose/i.test(h)) return "decision";
  if (/revenue|metric|performance|growth|result|stat|kpi|figure|number|cost|profit|loss|forecast|trend|data|rate|percent|roi/i.test(h)) return "data";
  return "other";
}

const INTENT_BADGES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  data: { label: "Data", icon: <BarChart3 className="w-3 h-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  strategy: { label: "Strategy", icon: <Target className="w-3 h-3" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  decision: { label: "Decision", icon: <Lightbulb className="w-3 h-3" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  other: { label: "Content", icon: <FileText className="w-3 h-3" />, color: "bg-muted text-muted-foreground" },
};

// Derive image slots from an outline's sections, preserving locked images from previous slots
function deriveImageSlots(
  sections: Array<{ heading: string; points: string[] }>,
  density: VisualDensity,
  existingSlots?: ImageSlot[]
): ImageSlot[] {
  const slots: ImageSlot[] = [];

  // Build lookup of locked assets from existing slots
  const lockedBySlide = new Map<number, ImageAsset>();
  if (existingSlots) {
    for (const slot of existingSlots) {
      if (slot.imageAsset?.locked) {
        lockedBySlide.set(slot.slideIndex, slot.imageAsset);
      }
    }
  }

  let imageRatio = 0.5;
  if (density === "minimal") imageRatio = 0.2;
  if (density === "visual") imageRatio = 1.0;

  sections.forEach((section, idx) => {
    const shouldHaveImage =
      density === "visual" ||
      (density === "balanced" && idx % 2 === 0) ||
      (density === "minimal" && idx === 0);

    // Always include slots that have locked images, even if density says no
    const hasLockedImage = lockedBySlide.has(idx);

    if ((shouldHaveImage && slots.length < Math.ceil(sections.length * imageRatio)) || hasLockedImage) {
      slots.push({
        id: `slot-${idx}`,
        slideIndex: idx,
        slideTitle: section.heading,
        placement: idx === 0 ? "hero" : "inline",
        suggestedQuery: section.heading,
        imageAsset: lockedBySlide.get(idx), // Carry forward locked images
      });
    }
  });

  return slots;
}

function sortDecisionBlocks(blocks: Block[], isDecisionMode: boolean): Block[] {
  // Only reorder blocks when in explicit decision mode
  if (!isDecisionMode) return blocks;

  const decisionBlocks: Block[] = [];
  const otherBlocks: Block[] = [];
  for (const block of blocks) {
    if (DECISION_BLOCK_TYPES.includes(block.type as (typeof DECISION_BLOCK_TYPES)[number])) {
      decisionBlocks.push(block);
    } else {
      otherBlocks.push(block);
    }
  }
  if (decisionBlocks.length === 0) return blocks;
  decisionBlocks.sort(
    (a, b) => DECISION_BLOCK_ORDER.indexOf(a.type) - DECISION_BLOCK_ORDER.indexOf(b.type)
  );
  return [...decisionBlocks, ...otherBlocks];
}

// Inject selected images into blocks that support them
function injectImagesIntoBlocks(blocks: Block[], slots: ImageSlot[]): Block[] {
  // Build a lookup: slideIndex → ImageSlot (only slots with an imageAsset)
  // Prefer locked assets over unlocked when multiple slots share a slideIndex
  const slotBySlide = new Map<number, ImageSlot>();
  for (const slot of slots) {
    if (!slot.imageAsset) continue;
    const existing = slotBySlide.get(slot.slideIndex);
    if (!existing || (slot.imageAsset.locked && !existing.imageAsset?.locked)) {
      slotBySlide.set(slot.slideIndex, slot);
    }
  }

  return blocks.map((block) => {
    const content = block.content as Record<string, unknown>;
    const sectionIndex = content.sectionIndex as number | undefined;

    // Find the matching slot for this block's section
    const slot = typeof sectionIndex === "number" ? slotBySlide.get(sectionIndex) : undefined;
    if (!slot?.imageAsset) return block;

    const asset = slot.imageAsset;
    const imagePayload = {
      src: asset.url,
      alt: slot.slideTitle,
      credit: asset.credit,
    };

    // Hero header: inject as background image
    if (block.type === "hero_header") {
      return {
        ...block,
        content: { ...content, image: imagePayload, backgroundStyle: "image" },
      };
    }

    // Card grid, icon_text_block, exec_summary, framed_insight, cta_section:
    // attach image metadata for renderers that support it
    if (["card_grid", "icon_text_block", "exec_summary", "framed_insight", "cta_section", "stat_block"].includes(block.type)) {
      return {
        ...block,
        content: { ...content, image: imagePayload },
      };
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
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [editingHeading, setEditingHeading] = useState("");

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
    setEditingSectionIdx(null);
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
      setStep("outline");
    } catch (e) {
      console.error("Outline generation failed:", e);
      toast({ title: "Error", description: "Failed to generate outline. Please try again.", variant: "destructive" });
    } finally {
      setOutlineLoading(false);
    }
  };

  // Outline → Visual Builder (preserve locked images from previous derivation)
  const handleProceedToVisual = () => {
    if (!outline) return;
    setImageSlots(prev => deriveImageSlots(outline.sections, density, prev));
    setStep("visual");
  };

  // Inline editing for outline section headings
  const handleStartEditHeading = (idx: number) => {
    if (!outline) return;
    setEditingSectionIdx(idx);
    setEditingHeading(outline.sections[idx].heading);
  };

  const handleSaveHeading = () => {
    if (!outline || editingSectionIdx === null) return;
    const updated = { ...outline };
    updated.sections = [...updated.sections];
    updated.sections[editingSectionIdx] = {
      ...updated.sections[editingSectionIdx],
      heading: editingHeading.trim() || updated.sections[editingSectionIdx].heading,
    };
    setOutline(updated);
    setEditingSectionIdx(null);
  };

  const handleUpdateSlot = useCallback((slotId: string, asset: ImageAsset | undefined) => {
    setImageSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, imageAsset: asset } : s))
    );
  }, []);

  // Visual → Final: Generate blocks and save
  const handleGenerateDeck = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!outline) return;

    setStep("generating");
    setGenerating(true);

    try {
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({ title: topic.trim().substring(0, 100), user_id: user.id })
        .select()
        .single();

      if (projectError || !newProject) throw new Error("Failed to create project");

      const blocks = await aiEngine.generateBlocks(
        outline,
        true,
        decisionMode,
        effectiveSlideCount,
        density
      );

      if (blocks.length > 0) {
        const withImages = injectImagesIntoBlocks(blocks, imageSlots);
        const orderedBlocks = sortDecisionBlocks(withImages, decisionMode);

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

  const stepLabels = ["Setup", "Outline", "Images", "Generate"];
  const stepNumberMap: Record<WizardStep, number> = {
    setup: 1,
    outline: 2,
    visual: 3,
    generating: 4,
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
            <div className="flex items-center gap-1 mt-3">
              {stepLabels.map((label, i) => {
                const num = i + 1;
                const current = stepNumberMap[step];
                const active = current === num;
                const done = current > num;
                return (
                  <div key={label} className="flex items-center gap-1">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors",
                        done && "bg-primary text-primary-foreground",
                        active && "bg-accent text-accent-foreground",
                        !done && !active && "bg-muted text-muted-foreground"
                      )}
                    >
                      {num}
                    </div>
                    <span
                      className={cn(
                        "text-[11px]",
                        active ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                    {i < stepLabels.length - 1 && <div className="w-4 h-px bg-border/60 mx-0.5" />}
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
            <div className="space-y-5">
              {/* Hero headline + social proof */}
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Describe your deck. AI does the rest.
                </h2>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-accent" />
                    <span>Avg. 12 seconds</span>
                  </span>
                  <span className="text-border">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-accent" />
                    <span>2,400+ decks this week</span>
                  </span>
                  <span className="text-border">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <span>Consulting-grade structure</span>
                  </span>
                </div>
              </div>

              {/* Topic textarea */}
              <div className="space-y-2">
                <Textarea
                  id="topic"
                  placeholder="e.g., Q3 board update covering revenue, key wins, and Q4 priorities…"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-muted/50 min-h-[110px] text-base resize-none"
                  autoFocus
                />
              </div>

              {/* One-click example prompts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Try one of these — click to fill
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => {
                        setTopic(ex.prompt);
                        setTone(ex.tone);
                      }}
                      className="group rounded-lg border border-border/60 bg-muted/20 hover:border-accent/50 hover:bg-accent/5 p-3 text-left transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1 text-accent">
                        {ex.icon}
                        <span className="text-xs font-semibold text-foreground">{ex.label}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                        {ex.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced settings — collapsed by default */}
              <Collapsible>
                <CollapsibleTrigger className="group flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  <span>Advanced settings (audience, tone, slide count, density)</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
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
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* ── STEP 2: OUTLINE REVIEW ── */}
          {step === "outline" && outline && (
            <div className="space-y-4">
              {/* Title + summary */}
              <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                <p className="text-base font-semibold">{outline.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{outline.summary}</p>
              </div>

              {/* Sections with intent badges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Sections ({outline.sections.length} slides)</p>
                  <p className="text-xs text-muted-foreground">Click heading to edit</p>
                </div>
                <div className="space-y-2">
                  {outline.sections.map((section, idx) => {
                    const intent = classifySlideIntent(section.heading);
                    const badge = INTENT_BADGES[intent];
                    const isEditing = editingSectionIdx === idx;

                    return (
                      <div key={idx} className="rounded-lg border border-border/40 bg-background p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground font-mono mt-0.5 w-5 flex-shrink-0">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex gap-1.5">
                                <Input
                                  value={editingHeading}
                                  onChange={(e) => setEditingHeading(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveHeading();
                                    if (e.key === "Escape") setEditingSectionIdx(null);
                                  }}
                                  className="h-7 text-sm"
                                  autoFocus
                                />
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={handleSaveHeading}>
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEditHeading(idx)}
                                className="text-sm font-medium text-left hover:text-accent transition-colors flex items-center gap-1.5 group"
                              >
                                {section.heading}
                                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                              </button>
                            )}
                            <ul className="mt-1.5 space-y-0.5">
                              {section.points.slice(0, 3).map((pt, pi) => (
                                <li key={pi} className="text-xs text-muted-foreground pl-2 border-l border-border/40">
                                  {pt.length > 80 ? pt.slice(0, 77) + "…" : pt}
                                </li>
                              ))}
                              {section.points.length > 3 && (
                                <li className="text-xs text-muted-foreground/60 pl-2">
                                  +{section.points.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                          <span className={cn("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0", badge.color)}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>
                        {/* Visual hint */}
                        {intent !== "other" && (
                          <p className="text-[10px] text-muted-foreground/70 mt-1.5 ml-7 italic">
                            {intent === "data" && "→ Will generate chart_block or stat_block"}
                            {intent === "strategy" && "→ Will generate three_pillars or two_by_two_matrix"}
                            {intent === "decision" && "→ Will generate decision_next_steps"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key takeaways */}
              {outline.bullets.length > 0 && (
                <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Takeaways</p>
                  <ul className="space-y-0.5">
                    {outline.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: VISUAL BUILDER ── */}
          {step === "visual" && outline && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                <p className="text-sm font-semibold">{outline.title}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
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
                Lock 🔒 any image to preserve it across regenerations.
              </p>

              <VisualBuilder slots={imageSlots} onUpdateSlot={handleUpdateSlot} />
            </div>
          )}

          {/* ── STEP 4: GENERATING ── */}
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
            {step === "setup" && (
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
                      Next: Review Outline <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </>
            )}

            {step === "outline" && (
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
                  onClick={handleProceedToVisual}
                  className="gap-1.5"
                >
                  Next: Choose Images <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {step === "visual" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep("outline")}
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
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
