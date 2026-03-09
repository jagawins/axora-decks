import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, Loader2, Presentation, Share2, Image, ImageOff, Wand2, LayoutTemplate, FileText, Zap, PenTool, Palette, FlaskConical } from "lucide-react";
import ResearchModeWizard from "@/components/create/ResearchModeWizard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileGenerationOverlay } from "@/components/MobileGenerationOverlay";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiEngine } from "@/lib/ai-engine";
import { sanitizeContent, sanitizeListItems } from "@/lib/sanitize";
import { THEMES, DEFAULT_THEME, type ThemeId } from "@/lib/themes";
import { Switch } from "@/components/ui/switch";
import { type BrandKit, isBrandKitConfigured } from "@/lib/brand";

// Types
type OutputType = "presentation" | "social";
type DensityLevel = "vibes" | "minimal" | "context" | "plenty";
type VisualsMode = "none" | "stock" | "ai" | "hybrid";

interface GenerationSpec {
  outputType: OutputType;
  cardsCount: number;
  theme: ThemeId;
  language: string;
  density: DensityLevel;
  visualsMode: VisualsMode;
  prompt: string;
}

// Constants
const CARD_COUNT_OPTIONS = [5, 8, 10, 12, 15, 20];

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

const DENSITY_OPTIONS: { value: DensityLevel; label: string; description: string }[] = [
  { value: "vibes", label: "Just vibes", description: "Images & headings, minimal text" },
  { value: "minimal", label: "Minimal text", description: "Max 3 bullets, short sentences" },
  { value: "context", label: "A little context", description: "3-5 bullets, one table allowed" },
  { value: "plenty", label: "Plenty of text", description: "Paragraphs and more tables" },
];

const VISUALS_OPTIONS: { value: VisualsMode; label: string; description: string; icon: typeof Image }[] = [
  { value: "none", label: "No images", description: "Text only", icon: ImageOff },
  { value: "stock", label: "Stock photos", description: "Pexels library", icon: Image },
  { value: "ai", label: "AI generated", description: "Custom visuals", icon: Wand2 },
  { value: "hybrid", label: "Hybrid", description: "Stock + AI fallback", icon: Sparkles },
];

const EXAMPLE_PROMPTS = [
  "Q3 2024 Sales Performance Review for the Board",
  "Product launch strategy for AI-powered CRM",
  "Cloud migration benefits for healthcare IT",
  "Series A pitch deck for fintech startup",
  "Team onboarding: Engineering culture and values",
  "Market analysis: Electric vehicle trends 2025",
];

const ENTRY_CARDS = [
  { id: "scratch", icon: Sparkles, title: "Start from scratch", description: "Describe your topic and let AI create" },
  { id: "template", icon: LayoutTemplate, title: "Use a template", description: "60+ executive-ready templates", href: "/templates" },
  { id: "import", icon: FileText, title: "Import content", description: "Paste notes, docs, or outlines" },
  { id: "quick", icon: Zap, title: "Quick deck", description: "One-click generation from topic" },
];

function normalizeBlockContent(type: string, content: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...content };
  
  switch (type) {
    case "list":
      if (!Array.isArray(normalized.items)) {
        if (Array.isArray(content.list)) normalized.items = content.list;
        else if (Array.isArray(content.points)) normalized.items = content.points;
        else if (Array.isArray(content.bullets)) normalized.items = content.bullets;
      }
      if (normalized.ordered === undefined) {
        normalized.ordered = false;
      }
      break;
    case "heading":
      if (normalized.level === undefined) {
        normalized.level = content.heading_level ?? content.size ?? 1;
      }
      if (normalized.text === undefined) {
        normalized.text = content.heading ?? content.title ?? content.value ?? "";
      }
      break;
    case "text":
      if (normalized.text === undefined) {
        normalized.text = content.paragraph ?? content.body ?? content.content ?? content.value ?? "";
      }
      break;
    case "callout":
      if (normalized.text === undefined) {
        normalized.text = content.message ?? content.content ?? content.body ?? "";
      }
      if (normalized.icon === undefined) {
        normalized.icon = content.type ?? content.variant ?? "info";
      }
      break;
    case "table":
      if (!Array.isArray(normalized.headers)) {
        normalized.headers = content.header ?? content.columns ?? [];
      }
      if (!Array.isArray(normalized.rows)) {
        normalized.rows = content.data ?? content.cells ?? [];
      }
      break;
    case "two_col":
      if (normalized.left === undefined) {
        normalized.left = content.left_column ?? content.column1 ?? content.col1 ?? "";
      }
      if (normalized.right === undefined) {
        normalized.right = content.right_column ?? content.column2 ?? content.col2 ?? "";
      }
      break;
    case "image":
      if (normalized.query === undefined) {
        normalized.query = content.search ?? content.keywords ?? content.topic ?? "";
      }
      if (normalized.alt === undefined) {
        normalized.alt = content.alt_text ?? content.description ?? "";
      }
      break;
  }
  
  return normalized;
}

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // State
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [researchMode, setResearchMode] = useState(false);
  const [outputType, setOutputType] = useState<OutputType>("presentation");
  const [cardsCount, setCardsCount] = useState(10);
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [language, setLanguage] = useState("en-US");
  const [density, setDensity] = useState<DensityLevel>("context");
  const [visualsMode, setVisualsMode] = useState<VisualsMode>("stock");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [useBrandKit, setUseBrandKit] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [mobileOverlayVisible, setMobileOverlayVisible] = useState(false);

  // iOS keyboard height detection via visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${window.innerHeight - vv.height}px`
      );
    };
    vv.addEventListener('resize', handler);
    return () => {
      vv.removeEventListener('resize', handler);
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    };
  }, []);

  // Load brand kit
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("brand_kit")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.brand_kit && isBrandKitConfigured(data.brand_kit as BrandKit)) {
          setBrandKit(data.brand_kit as BrandKit);
          setUseBrandKit(true); // default on if configured
        }
      });
  }, [user]);

  const selectedDensity = DENSITY_OPTIONS.find(d => d.value === density);
  const selectedVisuals = VISUALS_OPTIONS.find(v => v.value === visualsMode);

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const handleEntryClick = (cardId: string, href?: string) => {
    if (href) {
      navigate(href);
      return;
    }
    setActiveEntry(cardId);
  };

  const resolveImages = async (blocks: any[], projectId: string): Promise<any[]> => {
    if (visualsMode === "none") return blocks;
    
    // Collect image blocks that need resolution
    const imageBlocks = blocks
      .map((block, index) => ({ ...block, originalIndex: index }))
      .filter(block => block.type === "image" && block.content?.query);

    if (imageBlocks.length === 0) return blocks;

    try {
      const { data, error } = await supabase.functions.invoke("resolve-images", {
        body: {
          images: imageBlocks.map(block => ({
            blockIndex: block.originalIndex,
            query: block.content.query,
            alt: block.content.alt || block.content.query,
            caption: block.content.caption,
            aspect: block.content.aspect || "16:9",
          })),
          mode: visualsMode,
          projectId,
        },
      });

      if (error) throw error;

      // Update blocks with resolved images
      const resolvedImages = data?.images || [];
      const updatedBlocks = [...blocks];
      
      resolvedImages.forEach((resolved: any) => {
        const blockIndex = resolved.blockIndex;
        if (updatedBlocks[blockIndex]) {
          updatedBlocks[blockIndex].content = {
            ...updatedBlocks[blockIndex].content,
            src: resolved.src,
            provider: resolved.provider,
            credit: resolved.credit,
          };
        }
      });

      return updatedBlocks;
    } catch (error) {
      console.error("Image resolution error:", error);
      // Return blocks unchanged if image resolution fails
      return blocks;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Please sign in to create", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setGenerating(true);
    if (isMobile) setMobileOverlayVisible(true);

    try {
      // Build generation spec
      const spec: GenerationSpec = {
        outputType,
        cardsCount,
        theme,
        language,
        density,
        visualsMode,
        prompt: prompt.trim(),
      };

      // Create project first, applying brand kit if enabled
      const projectInsert: any = {
        title: prompt.trim().substring(0, 100),
        user_id: user.id,
        theme,
      };
      if (useBrandKit && brandKit) {
        projectInsert.brand_kit = brandKit;
      }

      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert(projectInsert)
        .select()
        .single();

      if (projectError || !newProject) {
        throw new Error("Failed to create project");
      }

      // Build enhanced prompt with density constraints
      const densityInstructions = getDensityInstructions(density);
      const visualsInstruction = visualsMode !== "none" 
        ? `\n\nInclude image blocks where visuals would enhance the presentation. Use descriptive search queries for images.`
        : "";
      const languageInstruction = language !== "en-US" 
        ? `\n\nLanguage: Generate all content in ${LANGUAGES.find(l => l.value === language)?.label || language}.` 
        : "";
      const brandInstruction = useBrandKit && brandKit?.brandName
        ? `\n\nBrand name: "${brandKit.brandName}". Use this name in the title slide and headers where appropriate.`
        : "";
      
      const enhancedPrompt = `${spec.prompt}

Content Style: ${selectedDensity?.label} - ${selectedDensity?.description}
${densityInstructions}
${visualsInstruction}
${languageInstruction}
${brandInstruction}

Create exactly ${cardsCount} slides/cards.`;

      // Generate using existing AI engine
      const result = await aiEngine.generateFromPrompt({
        topic: spec.prompt,
        prompt: enhancedPrompt,
        tone: "executive",
      });

      if (result.blocks.length > 0) {
        // Process and normalize blocks
        let processedBlocks = result.blocks.slice(0, cardsCount).map((block, index) => {
          let sanitized = sanitizeContent(block.content);
          sanitized = normalizeBlockContent(block.type, sanitized);

          if (block.type === "list" && Array.isArray(sanitized.items)) {
            sanitized.items = sanitizeListItems(sanitized.items);
            
            // Apply density constraints to lists
            if (density === "minimal" || density === "vibes") {
              sanitized.items = (sanitized.items as string[]).slice(0, 3);
            } else if (density === "context") {
              sanitized.items = (sanitized.items as string[]).slice(0, 5);
            }
          }

          return {
            project_id: newProject.id,
            type: block.type,
            content: sanitized,
            order_index: index,
          };
        });

        // Resolve images if needed
        processedBlocks = await resolveImages(processedBlocks, newProject.id);

        await supabase.from("blocks").insert(processedBlocks as any);
      }

      toast({ title: "Deck created!", description: "Your AI-generated deck is ready." });
      navigate(`/preview/${newProject.id}?new=1`);
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
      setMobileOverlayVisible(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create with AI | AXIVA</title>
        <meta
          name="description"
          content="Create executive-grade presentations with AI. Generate from scratch with full control over style, length, and content density."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen flex flex-col items-center px-4 pt-24 pb-16">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-accent/8 rounded-full blur-[100px] opacity-50" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-success/5 rounded-full blur-[80px]" />
        </div>

        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Create with AI
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose how you want to start
            </p>
          </div>

          {/* Entry Cards */}
          {!activeEntry && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {ENTRY_CARDS.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleEntryClick(card.id, card.href)}
                  className={cn(
                    "group p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
                    "hover:border-accent/50 hover:bg-card/80 transition-all duration-200",
                    "text-left flex flex-col items-start gap-3"
                  )}
                >
                  <div className="p-2.5 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Back button when in a flow */}
          {activeEntry && (
            <button
              onClick={() => setActiveEntry(null)}
              className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to options
            </button>
          )}

          {/* Studio Controls - shown when "scratch" is selected or directly */}
          {(activeEntry === "scratch" || activeEntry === "quick" || activeEntry === "import") && (
            <div className="space-y-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
              
              {/* Output Type Toggle */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Output Type</Label>
                <ToggleGroup
                  type="single"
                  value={outputType}
                  onValueChange={(v) => v && setOutputType(v as OutputType)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="presentation" className="gap-2 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                    <Presentation className="h-4 w-4" />
                    Presentation
                  </ToggleGroupItem>
                  <ToggleGroupItem value="social" className="gap-2 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
                    <Share2 className="h-4 w-4" />
                    Social Cards
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Options Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Cards Count */}
                <div className="space-y-2">
                  <Label htmlFor="cards-count" className="text-sm font-medium">Cards</Label>
                  <Select value={String(cardsCount)} onValueChange={(v) => setCardsCount(Number(v))}>
                    <SelectTrigger id="cards-count" className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_COUNT_OPTIONS.map((count) => (
                        <SelectItem key={count} value={String(count)}>
                          {count} cards
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                  <Select value={theme} onValueChange={(v) => setTheme(v as ThemeId)}>
                    <SelectTrigger id="theme" className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(THEMES).map(([id, { label }]) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Density */}
                <div className="space-y-2">
                  <Label htmlFor="density" className="text-sm font-medium">Density</Label>
                  <Select value={density} onValueChange={(v) => setDensity(v as DensityLevel)}>
                    <SelectTrigger id="density" className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DENSITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Visuals Mode */}
                <div className="space-y-2">
                  <Label htmlFor="visuals" className="text-sm font-medium">Visuals</Label>
                  <Select value={visualsMode} onValueChange={(v) => setVisualsMode(v as VisualsMode)}>
                    <SelectTrigger id="visuals" className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISUALS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview Badge */}
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                <Badge variant="secondary" className="text-xs">
                  {outputType === "presentation" ? "📊 Presentation" : "📱 Social"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {cardsCount} cards
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {THEMES[theme].label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {LANGUAGES.find(l => l.value === language)?.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {selectedDensity?.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {selectedVisuals?.label}
                </Badge>
              </div>

              {/* Brand Kit Toggle */}
              {brandKit && isBrandKitConfigured(brandKit) && (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Use My Brand Kit</p>
                      <p className="text-xs text-muted-foreground">
                        Apply {brandKit.brandName ? `"${brandKit.brandName}"` : "your"} brand colors, fonts & logo
                      </p>
                    </div>
                  </div>
                  <Switch checked={useBrandKit} onCheckedChange={setUseBrandKit} />
                </div>
              )}

              <div className="space-y-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--keyboard-height, 0px))', transition: 'padding-bottom 0.1s ease' }}>
                <Label htmlFor="prompt" className="text-sm font-medium">
                  What would you like to create?
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your presentation topic, key points, or paste your notes..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-muted/50 resize-none"
                  disabled={generating}
                />
              </div>

              {/* Example Prompts */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Example prompts
                </Label>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((example) => (
                    <button
                      key={example}
                      onClick={() => handleExampleClick(example)}
                      disabled={generating}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full border border-border/50",
                        "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        "transition-colors disabled:opacity-50"
                      )}
                    >
                      {example.length > 40 ? example.slice(0, 40) + "…" : example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Deck
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Mobile generation overlay */}
      <MobileGenerationOverlay visible={mobileOverlayVisible} promptText={prompt} />
    </>
  );
}

function getDensityInstructions(density: DensityLevel): string {
  switch (density) {
    case "vibes":
      return `
DENSITY CONSTRAINTS (STRICT):
- Prefer image blocks and large headings
- Minimal text content - only essential phrases
- No paragraphs or long sentences
- Lists: maximum 2-3 very short items
- No tables
- Focus on visual impact and bold statements`;
    
    case "minimal":
      return `
DENSITY CONSTRAINTS (STRICT):
- Maximum 3 bullet points per list
- Maximum 2 sentences per text block
- Keep all content concise and punchy
- No tables unless absolutely essential
- Prefer short, impactful statements`;
    
    case "context":
      return `
DENSITY CONSTRAINTS (STRICT):
- Lists: 3-5 bullet points allowed
- Allow one table if relevant
- Text blocks: 2-3 sentences max
- Balance between detail and readability
- Include supporting context but stay focused`;
    
    case "plenty":
      return `
DENSITY CONSTRAINTS:
- Allow longer paragraphs for detailed explanations
- Multiple tables permitted
- Lists can have 5+ items with descriptions
- Include comprehensive context and data
- Detailed analysis and supporting information welcome`;
    
    default:
      return "";
  }
}
