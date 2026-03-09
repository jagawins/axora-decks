import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { aiEngine } from "@/lib/ai-engine";
import { sanitizeContent, sanitizeListItems } from "@/lib/sanitize";
import type {
  AlignmentData,
  ResearchBrief,
  OutlineSlide,
} from "@/types/research-mode";

interface GenerateStepProps {
  alignment: AlignmentData;
  brief: ResearchBrief;
  outline: OutlineSlide[];
  sessionId: string;
  onBack: () => void;
}

type FailureStage = "context" | "generation" | "save" | null;

export default function GenerateStep({
  alignment,
  brief,
  outline,
  sessionId,
  onBack,
}: GenerateStepProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [failStage, setFailStage] = useState<FailureStage>(null);
  const [failMessage, setFailMessage] = useState("");

  const generate = async (withResearch: boolean) => {
    if (!user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setFailStage(null);

    try {
      // Build structured prompt from outline + research
      let enhancedPrompt: string;

      if (withResearch) {
        const slideList = outline
          .map(
            (s, i) =>
              `Slide ${i + 1}: ${s.title}\n  - ${s.keyPoints.filter(Boolean).join("\n  - ")}${s.dataPoint ? `\n  Data: ${s.dataPoint}` : ""}`
          )
          .join("\n\n");

        const researchSummary = brief.findings
          .map(
            (f) =>
              `• ${f.title}: ${f.detail}${f.data_points.length ? ` [${f.data_points.join("; ")}]` : ""}`
          )
          .join("\n");

        enhancedPrompt = `Use the following research brief as your source of truth for all statistics and claims. Follow the approved outline exactly — do not add or remove slides.

AUDIENCE: ${alignment.audience}
GOAL: ${alignment.goal}
DESIRED OUTCOME: ${alignment.outcome}
${alignment.mustIncludeFacts ? `REQUIRED FACTS: ${alignment.mustIncludeFacts}` : ""}

APPROVED SLIDE OUTLINE:
${slideList}

RESEARCH BRIEF:
${researchSummary}

${brief.conflicts.length > 0 ? `CONFLICTING VIEWPOINTS TO ADDRESS:\n${brief.conflicts.map((c) => `- ${c.topic}`).join("\n")}` : ""}

Generate exactly ${outline.length} content slides following this outline precisely.`;
      } else {
        enhancedPrompt = `${alignment.goal}\n\nAudience: ${alignment.audience}\nOutcome: ${alignment.outcome}`;
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: alignment.goal.substring(0, 100),
          user_id: user.id,
          theme: "classic",
        })
        .select()
        .single();

      if (projectError || !project) {
        setFailStage("save");
        setFailMessage("Failed to create project");
        setGenerating(false);
        return;
      }

      // Generate blocks
      const result = await aiEngine.generateFromPrompt({
        topic: alignment.goal,
        prompt: enhancedPrompt,
        tone: "executive",
        slideCount: outline.length,
      });

      if (!result.blocks.length) {
        setFailStage("generation");
        setFailMessage("No blocks generated");
        setGenerating(false);
        return;
      }

      // Process blocks with research metadata
      const processedBlocks = result.blocks
        .slice(0, outline.length)
        .map((block, index) => {
          let content = sanitizeContent(block.content);
          if (block.type === "list" && Array.isArray(content.items)) {
            content.items = sanitizeListItems(content.items as string[]);
          }

          // Find matching research finding for block_meta
          const matchedSlide = outline[index];
          const matchedFinding = matchedSlide?.dataPoint
            ? brief.findings.find((f) =>
                f.data_points.some((dp) => dp === matchedSlide.dataPoint)
              )
            : null;

          return {
            project_id: project.id,
            type: block.type,
            content,
            order_index: index,
            // Note: block_meta is not in the blocks table schema currently,
            // but we store research context in content for now
            ...(withResearch && matchedFinding
              ? {
                  content: {
                    ...content,
                    _research_meta: {
                      schema_version: 1,
                      research_mode: true,
                      research_session_id: sessionId,
                      source_url: matchedFinding.source_url,
                      source_label: matchedFinding.source_label,
                    },
                  },
                }
              : {}),
          };
        });

      const { error: insertError } = await supabase
        .from("blocks")
        .insert(processedBlocks as any);

      if (insertError) {
        setFailStage("save");
        setFailMessage("Failed to save blocks");
        setGenerating(false);
        return;
      }

      toast({
        title: "Deck created!",
        description: "Your research-backed deck is ready.",
      });
      navigate(`/preview/${project.id}?new=1`);
    } catch (error) {
      console.error("Generation error:", error);
      setFailStage("generation");
      setFailMessage(
        error instanceof Error ? error.message : "Generation failed"
      );
    } finally {
      setGenerating(false);
    }
  };

  // Auto-start generation on mount
  useState(() => {
    generate(true);
  });

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Generating your deck…
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Building {outline.length} slides with research context from{" "}
            {brief.findings.length} findings
          </p>
        </div>
      </div>
    );
  }

  if (failStage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {failStage === "context"
              ? "Context injection failed"
              : failStage === "generation"
                ? "Block generation failed"
                : "Failed to save deck"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {failMessage}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Outline
          </Button>
          <Button variant="hero" onClick={() => generate(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="glass"
            onClick={() => generate(false)}
          >
            Generate Without Research
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
