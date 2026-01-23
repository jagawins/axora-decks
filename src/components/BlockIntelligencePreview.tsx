/**
 * Block Intelligence Preview Component
 * Displays block purpose, snippet, and recommended order before insertion
 */

import { useMemo } from "react";
import {
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Target,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Layers,
  Image,
  FileText,
  List,
  Table2,
  Type,
  MessageSquare,
  Columns,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Block, BlockType } from "@/lib/blocks";
import {
  BlockPurpose,
  IntelligentBlock,
  analyzeBlocks,
  getDeckIntelligence,
  sortByRecommendedOrder,
} from "@/lib/block-intelligence";

// Icons for each purpose
const PURPOSE_ICONS: Record<BlockPurpose, typeof Lightbulb> = {
  summary: Sparkles,
  problem: AlertTriangle,
  insight: Lightbulb,
  proof: BarChart3,
  action: Target,
  context: FileText,
  transition: ArrowRight,
  visual: Image,
  unknown: HelpCircle,
};

// Colors for each purpose
const PURPOSE_COLORS: Record<BlockPurpose, string> = {
  summary: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  problem: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  insight: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  proof: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  action: "bg-green-500/10 text-green-600 border-green-500/30",
  context: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  transition: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  visual: "bg-pink-500/10 text-pink-600 border-pink-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

// Block type icons
const BLOCK_TYPE_ICONS: Record<BlockType, typeof FileText> = {
  heading: Type,
  text: FileText,
  list: List,
  callout: MessageSquare,
  two_col: Columns,
  table: Table2,
  image: Image,
};

interface BlockIntelligencePreviewProps {
  blocks: Block[];
  showRecommendedOrder?: boolean;
  showDeckSummary?: boolean;
  compact?: boolean;
  onReorder?: (blocks: Block[]) => void;
}

/**
 * Get a snippet from block content
 */
function getSnippet(block: Block, maxLength = 60): string {
  const content = block.content;
  let text = "";
  
  if (typeof content.text === "string") {
    text = content.text;
  } else if (Array.isArray(content.items)) {
    text = content.items.slice(0, 2).join(", ");
    if (content.items.length > 2) text += "...";
  } else if (typeof content.left === "string") {
    text = content.left;
  } else if (Array.isArray(content.headers)) {
    text = content.headers.join(" | ");
  } else if (typeof content.caption === "string") {
    text = content.caption;
  } else if (typeof content.alt === "string") {
    text = content.alt;
  }
  
  if (text.length > maxLength) {
    return text.slice(0, maxLength).trim() + "...";
  }
  return text || "No content";
}

/**
 * Format read time
 */
function formatReadTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

/**
 * Single block preview item
 */
function BlockPreviewItem({
  block,
  index,
  compact,
}: {
  block: IntelligentBlock;
  index: number;
  compact?: boolean;
}) {
  const { metadata } = block;
  const PurposeIcon = PURPOSE_ICONS[metadata.purpose];
  const TypeIcon = BLOCK_TYPE_ICONS[block.type];
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-card border border-border">
        <span className="text-xs text-muted-foreground w-5">{index + 1}</span>
        <div className={`p-1 rounded ${PURPOSE_COLORS[metadata.purpose]}`}>
          <PurposeIcon className="h-3 w-3" />
        </div>
        <span className="text-sm truncate flex-1">{getSnippet(block, 40)}</span>
        <Badge variant="outline" className="text-xs">
          {metadata.clarityScore}%
        </Badge>
      </div>
    );
  }
  
  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
            {index + 1}
          </span>
          <Badge className={PURPOSE_COLORS[metadata.purpose]}>
            <PurposeIcon className="h-3 w-3 mr-1" />
            {metadata.purpose}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TypeIcon className="h-3 w-3" />
            {block.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatReadTime(metadata.readTime)}
          </span>
        </div>
      </div>
      
      {/* Snippet */}
      <p className="text-sm text-foreground/80 leading-relaxed">
        {getSnippet(block, 120)}
      </p>
      
      {/* Metrics */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Clarity</span>
            <span className="font-medium">{metadata.clarityScore}%</span>
          </div>
          <Progress value={metadata.clarityScore} className="h-1.5" />
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Exec Weight</span>
          <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-3 rounded-sm ${
                  i < metadata.executiveWeight
                    ? "bg-primary/80"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      {metadata.recommendations.length > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Recommendations:</p>
          <ul className="text-xs text-foreground/70 space-y-1">
            {metadata.recommendations.slice(0, 2).map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Deck summary component
 */
function DeckSummary({ blocks }: { blocks: IntelligentBlock[] }) {
  const intelligence = getDeckIntelligence(blocks);
  
  const purposeEntries = Object.entries(intelligence.purposeDistribution)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  
  return (
    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Deck Intelligence</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Avg. Clarity</p>
          <p className="text-xl font-semibold">{intelligence.averageClarity}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Read Time</p>
          <p className="text-xl font-semibold">{formatReadTime(intelligence.totalReadTime)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Blocks</p>
          <p className="text-xl font-semibold">{blocks.length}</p>
        </div>
      </div>
      
      {/* Purpose distribution */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Purpose Distribution</p>
        <div className="flex flex-wrap gap-1.5">
          {purposeEntries.map(([purpose, count]) => {
            const Icon = PURPOSE_ICONS[purpose as BlockPurpose];
            return (
              <Badge
                key={purpose}
                className={PURPOSE_COLORS[purpose as BlockPurpose]}
              >
                <Icon className="h-3 w-3 mr-1" />
                {purpose} ({count})
              </Badge>
            );
          })}
        </div>
      </div>
      
      {/* Top recommendations */}
      {intelligence.topRecommendations.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Top Recommendations</p>
          <ul className="text-xs space-y-1.5">
            {intelligence.topRecommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/80">
                <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Main preview component
 */
export function BlockIntelligencePreview({
  blocks,
  showRecommendedOrder = false,
  showDeckSummary = true,
  compact = false,
  onReorder,
}: BlockIntelligencePreviewProps) {
  // Analyze blocks
  const intelligentBlocks = useMemo(() => analyzeBlocks(blocks), [blocks]);
  
  // Optionally sort by recommended order
  const displayBlocks = useMemo(() => {
    if (showRecommendedOrder) {
      return sortByRecommendedOrder(intelligentBlocks);
    }
    return intelligentBlocks;
  }, [intelligentBlocks, showRecommendedOrder]);
  
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Layers className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No blocks to preview</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {showDeckSummary && !compact && (
        <>
          <DeckSummary blocks={displayBlocks} />
          <Separator />
        </>
      )}
      
      {showRecommendedOrder && !compact && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowUpDown className="h-4 w-4" />
          <span>Showing recommended order</span>
        </div>
      )}
      
      <ScrollArea className={compact ? "max-h-64" : "max-h-[500px]"}>
        <div className={compact ? "space-y-1.5" : "space-y-3"}>
          {displayBlocks.map((block, index) => (
            <BlockPreviewItem
              key={block.id}
              block={block}
              index={index}
              compact={compact}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default BlockIntelligencePreview;
