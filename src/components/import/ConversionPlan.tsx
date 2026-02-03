import { useMemo } from "react";
import { 
  FileText, BarChart3, Quote, Calendar, Grid3X3, 
  Rows3, ArrowRight, Lightbulb, Target, Type
} from "lucide-react";
import { detectContentType, DetectedContentType } from "./ContentTypeDetector";
import { cn } from "@/lib/utils";

interface ConversionPlanProps {
  content: string;
  enableVisualBlocks: boolean;
}

interface PredictedBlock {
  type: string;
  label: string;
  icon: typeof FileText;
  count: number;
  color: string;
}

const BLOCK_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  hero_header: { icon: Target, color: "text-accent" },
  exec_summary: { icon: Lightbulb, color: "text-green-500" },
  stat_block: { icon: BarChart3, color: "text-blue-500" },
  quote_block: { icon: Quote, color: "text-orange-500" },
  timeline_block: { icon: Calendar, color: "text-purple-500" },
  comparison_table: { icon: Grid3X3, color: "text-cyan-500" },
  card_grid: { icon: Rows3, color: "text-pink-500" },
  heading: { icon: Type, color: "text-foreground" },
  text: { icon: FileText, color: "text-muted-foreground" },
  list: { icon: Rows3, color: "text-muted-foreground" },
};

function predictBlocks(content: string, enableVisualBlocks: boolean): PredictedBlock[] {
  const text = content.trim();
  if (!text) return [];

  const lines = text.split("\n").filter(l => l.trim());
  const detectedType = detectContentType(content);
  const predictions: PredictedBlock[] = [];

  // Always predict a hero header for substantial content
  if (lines.length > 3) {
    predictions.push({
      type: "hero_header",
      label: "Hero Header",
      icon: BLOCK_ICONS.hero_header.icon,
      count: 1,
      color: BLOCK_ICONS.hero_header.color,
    });
  }

  // Predict based on content type and visual blocks setting
  if (enableVisualBlocks) {
    // Check for statistics
    const numberMatches = content.match(/\d+\.?\d*%?/g) || [];
    if (numberMatches.length >= 2) {
      predictions.push({
        type: "stat_block",
        label: "Statistics",
        icon: BLOCK_ICONS.stat_block.icon,
        count: Math.min(Math.ceil(numberMatches.length / 3), 3),
        color: BLOCK_ICONS.stat_block.color,
      });
    }

    // Check for quotes
    const quoteMatches = content.match(/[""]([^""]+)[""]|"([^"]+)"/g) || [];
    if (quoteMatches.length > 0) {
      predictions.push({
        type: "quote_block",
        label: "Quotes",
        icon: BLOCK_ICONS.quote_block.icon,
        count: Math.min(quoteMatches.length, 2),
        color: BLOCK_ICONS.quote_block.color,
      });
    }

    // Check for timeline/events
    if (detectedType === "timeline" || /\b(phase|step|stage|q[1-4])\b/i.test(text)) {
      predictions.push({
        type: "timeline_block",
        label: "Timeline",
        icon: BLOCK_ICONS.timeline_block.icon,
        count: 1,
        color: BLOCK_ICONS.timeline_block.color,
      });
    }

    // Check for comparison patterns
    if (/\bvs\.?\b|versus|compared to|before.*after/i.test(text)) {
      predictions.push({
        type: "comparison_table",
        label: "Comparison",
        icon: BLOCK_ICONS.comparison_table.icon,
        count: 1,
        color: BLOCK_ICONS.comparison_table.color,
      });
    }
  }

  // Always predict exec summary for longer content
  if (lines.length > 5) {
    predictions.push({
      type: "exec_summary",
      label: "Executive Summary",
      icon: BLOCK_ICONS.exec_summary.icon,
      count: 1,
      color: BLOCK_ICONS.exec_summary.color,
    });
  }

  // Predict text/list blocks
  const bulletLines = lines.filter(l => /^[\s]*[-•*]\s/.test(l));
  if (bulletLines.length > 2) {
    predictions.push({
      type: "list",
      label: "Lists",
      icon: BLOCK_ICONS.list.icon,
      count: Math.ceil(bulletLines.length / 4),
      color: BLOCK_ICONS.list.color,
    });
  }

  // Predict text blocks for remaining content
  const paragraphCount = Math.max(1, Math.ceil((lines.length - bulletLines.length) / 3));
  if (paragraphCount > 0) {
    predictions.push({
      type: "text",
      label: "Text Blocks",
      icon: BLOCK_ICONS.text.icon,
      count: paragraphCount,
      color: BLOCK_ICONS.text.color,
    });
  }

  return predictions;
}

export function ConversionPlan({ content, enableVisualBlocks }: ConversionPlanProps) {
  const predictions = useMemo(
    () => predictBlocks(content, enableVisualBlocks), 
    [content, enableVisualBlocks]
  );

  if (predictions.length === 0) return null;

  const totalBlocks = predictions.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Conversion Plan
        </h4>
        <span className="text-xs text-muted-foreground">
          ~{totalBlocks} block{totalBlocks !== 1 ? "s" : ""}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {predictions.map((block, idx) => {
          const Icon = block.icon;
          return (
            <div
              key={`${block.type}-${idx}`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/50"
            >
              <Icon className={cn("h-3 w-3", block.color)} />
              <span className="text-xs text-foreground">{block.label}</span>
              {block.count > 1 && (
                <span className="text-xs text-muted-foreground">×{block.count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
