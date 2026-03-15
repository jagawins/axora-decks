import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Download, Share2, BarChart3, PieChart,
  TrendingUp, GitBranch, Layers, Grid3x3, Table2, Target,
  ArrowRight, RefreshCw, Copy, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { VisualBlockRenderer } from "@/components/blocks/VisualBlockRenderer";
import { invokeFunction } from "@/lib/supabase-function-client";
import type { BlockType } from "@/lib/blocks";

/* ── Visual Types ───────────────────────────────────────────────── */

interface VisualType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  blockType: BlockType;
  promptHint: string;
}

const VISUAL_TYPES: VisualType[] = [
  {
    id: "bar-chart", label: "Bar Chart", icon: <BarChart3 className="h-5 w-5" />,
    description: "Compare values across categories",
    blockType: "chart_block",
    promptHint: "Include data with labels and values",
  },
  {
    id: "donut-chart", label: "Donut Chart", icon: <PieChart className="h-5 w-5" />,
    description: "Show proportions of a whole",
    blockType: "chart_block",
    promptHint: "Include percentage breakdowns",
  },
  {
    id: "kpi-dashboard", label: "KPI Dashboard", icon: <Grid3x3 className="h-5 w-5" />,
    description: "Key metrics with trends",
    blockType: "kpi_dashboard",
    promptHint: "Include 3-4 key metrics with values and trends",
  },
  {
    id: "comparison-table", label: "Comparison Table", icon: <Table2 className="h-5 w-5" />,
    description: "Side-by-side comparison matrix",
    blockType: "comparison_table",
    promptHint: "Include items to compare with criteria",
  },
  {
    id: "framework-matrix", label: "2×2 Matrix", icon: <Target className="h-5 w-5" />,
    description: "Framework with four quadrants",
    blockType: "two_by_two_matrix",
    promptHint: "Define the two axes and items per quadrant",
  },
  {
    id: "timeline", label: "Timeline", icon: <TrendingUp className="h-5 w-5" />,
    description: "Chronological events or milestones",
    blockType: "timeline_block",
    promptHint: "Include dates and event descriptions",
  },
  {
    id: "three-pillars", label: "Three Pillars", icon: <Layers className="h-5 w-5" />,
    description: "Three-column framework",
    blockType: "three_pillars",
    promptHint: "Define three categories with descriptions",
  },
  {
    id: "flow-diagram", label: "Flow Diagram", icon: <GitBranch className="h-5 w-5" />,
    description: "Process flow or pipeline",
    blockType: "flow_diagram",
    promptHint: "Describe the stages and steps in each",
  },
];

/* ── Quick Prompts ──────────────────────────────────────────────── */

const QUICK_PROMPTS = [
  { label: "AI Adoption Survey", prompt: "Survey results: 70% of enterprises have adopted AI in 2025. Breakdown: 35% production use, 25% pilot stage, 10% experimental, 30% no AI. Show as bar chart." },
  { label: "AI Governance Framework", prompt: "2x2 matrix for AI governance: X-axis is risk level (low to high), Y-axis is organizational maturity (low to high). Quadrants: Monitor (low risk, low maturity), Accelerate (low risk, high maturity), Remediate (high risk, low maturity), Transform (high risk, high maturity)." },
  { label: "Sovereign AI Comparison", prompt: "Comparison table of AI capability factors across US, China, UK, India, and EU. Factors: VC Investment, Talent Pool, Compute Infrastructure, Data Availability, Regulatory Framework, Research Output. Rate each High, Medium, or Low." },
  { label: "AI Startup Growth", prompt: "Timeline of AI company milestones: ElevenLabs reached $100M ARR in 23 months with 50 employees. Cursor (Anysphere) reached $100M in 21 months with 20 employees. Lovable reached $100M in 7 months with 45 employees. Gamma reached $100M in 30 months with 50 employees." },
  { label: "Gen AI ROI Metrics", prompt: "KPI dashboard showing Gen AI impact: 40% reduction in content creation time, 25% increase in employee productivity, $2.3M annual savings from automation, 3.2x ROI on AI investment. Show trends as up for all." },
  { label: "AI Risk Categories", prompt: "Three pillars framework for AI risk management: Pillar 1 'Technical Risks' covers model accuracy, bias, hallucination, security vulnerabilities. Pillar 2 'Operational Risks' covers data privacy, system reliability, vendor lock-in, cost overruns. Pillar 3 'Strategic Risks' covers regulatory compliance, competitive disruption, talent gaps, ethical concerns." },
];

/* ── Generated Visual Card ──────────────────────────────────────── */

interface GeneratedVisual {
  type: BlockType;
  content: Record<string, unknown>;
  title: string;
}

/* ── Main Component ─────────────────────────────────────────────── */

export default function DataVisualsGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [visuals, setVisuals] = useState<GeneratedVisual[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim()) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const visualType = VISUAL_TYPES.find(v => v.id === selectedType);
      const typeHint = visualType
        ? `Generate a ${visualType.label} (block type: ${visualType.blockType}). ${visualType.promptHint}.`
        : "Choose the most appropriate visual block type for this data.";

      const response = await invokeFunction<{ block?: { type: string; content: Record<string, unknown> } }>(
        "generate-block-content",
        {
          type: visualType?.blockType || "chart_block",
          prompt: `Create a data visualization for: ${finalPrompt}\n\n${typeHint}\n\nGenerate executive-grade content with real-looking data. Make it look like it belongs in Harvard Business Review or McKinsey Quarterly.`,
          context: "data-visuals-generator",
        }
      );

      if (response.error || !response.data?.block) {
        // Fallback: generate via outline pipeline for richer content
        const outlineRes = await invokeFunction<{ outline?: { title: string; sections: Array<{ heading: string; points: string[] }> } }>(
          "generate-outline",
          {
            topic: finalPrompt,
            tone: "analytical",
            cardsCount: 3,
          }
        );

        if (outlineRes.data?.outline) {
          const blocksRes = await invokeFunction<{ blocks?: Array<{ type: string; content: Record<string, unknown> }> }>(
            "generate-blocks",
            {
              outline: outlineRes.data.outline,
              enableVisualBlocks: true,
              targetSlideCount: 3,
              visualDensity: "visual",
            }
          );

          if (blocksRes.data?.blocks && blocksRes.data.blocks.length > 0) {
            const newVisuals = blocksRes.data.blocks
              .filter(b => !["heading", "text", "section_divider"].includes(b.type))
              .slice(0, 4)
              .map(b => ({
                type: b.type as BlockType,
                content: b.content,
                title: String((b.content as any).title || outlineRes.data!.outline.title),
              }));
            setVisuals(newVisuals);
            return;
          }
        }
        throw new Error(response.error || "Failed to generate visual");
      }

      const block = response.data.block;
      setVisuals([{
        type: block.type as BlockType,
        content: block.content,
        title: String((block.content as any).title || "Data Visual"),
      }]);
    } catch (e) {
      console.error("Data visual generation error:", e);
      setError(e instanceof Error ? e.message : "Failed to generate visual. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [prompt, selectedType, user, navigate]);

  const handleQuickPrompt = (qp: typeof QUICK_PROMPTS[0]) => {
    setPrompt(qp.prompt);
    handleGenerate(qp.prompt);
  };

  const handleShare = async (visual: GeneratedVisual) => {
    const text = `Check out this data visual: ${visual.title} — Generated with AXIVA (axiva.ai)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
          <BarChart3 className="h-3.5 w-3.5" />
          AI-Powered Data Visuals
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Data & Visuals Generator
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate HBR-quality charts, frameworks, and dashboards from a description. 
          Executive-grade data visualizations in seconds.
        </p>
      </div>

      {/* Visual type selector */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Choose a visual type (or let AI decide)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl mx-auto">
          {VISUAL_TYPES.map((vt) => (
            <button
              key={vt.id}
              onClick={() => setSelectedType(selectedType === vt.id ? null : vt.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                selectedType === vt.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border/50 bg-card/50 text-muted-foreground hover:border-accent/30 hover:text-foreground"
              )}
            >
              {vt.icon}
              <span className="text-xs font-medium">{vt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt input */}
      <div className="max-w-2xl mx-auto space-y-3">
        <Textarea
          placeholder="Describe the data or framework you want to visualize...&#10;&#10;Example: Survey results showing AI adoption rates across industries — healthcare 45%, finance 62%, retail 38%, manufacturing 55%. Show as a bar chart with industry comparisons."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] text-sm"
        />
        <div className="flex gap-2">
          <Button
            variant="hero"
            onClick={() => handleGenerate()}
            disabled={generating || !prompt.trim()}
            className="gap-2 flex-1"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generating..." : "Generate Visual"}
          </Button>
          {visuals.length > 0 && (
            <Button variant="outline" onClick={() => handleGenerate()} disabled={generating} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* Quick prompts */}
      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground text-center mb-3">Quick examples:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(qp)}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-card/50 text-muted-foreground hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Generated visuals */}
      {visuals.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-center">Generated Visuals</h3>
          <div className={cn(
            "grid gap-6 max-w-5xl mx-auto",
            visuals.length === 1 ? "grid-cols-1 max-w-3xl" : "grid-cols-1 md:grid-cols-2"
          )}>
            {visuals.map((visual, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg"
              >
                {/* Visual content */}
                <div className="p-6 bg-background">
                  <VisualBlockRenderer
                    block={{ type: visual.type, content: visual.content } as any}
                    readOnly
                  />
                </div>

                {/* Actions bar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-card/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {visual.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1 text-xs"
                      onClick={() => handleShare(visual)}
                    >
                      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Share2 className="h-3 w-3" />}
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 gap-1 text-xs"
                      onClick={() => {
                        // Navigate to editor with this visual as a starting block
                        navigate("/auth");
                      }}
                    >
                      <ArrowRight className="h-3 w-3" />
                      Add to deck
                    </Button>
                  </div>
                </div>

                {/* Watermark */}
                <div className="px-4 py-2 bg-muted/30 border-t border-border/30">
                  <p className="text-[9px] text-muted-foreground text-center">
                    Generated with <a href="https://axiva.ai" className="text-accent hover:underline font-medium">AXIVA</a> — AI Executive Deck Generator
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generating animation */}
      {generating && (
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-accent animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Generating your visual...</p>
              <p className="text-xs text-muted-foreground mt-1">AI is analyzing your data and building the visualization</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
