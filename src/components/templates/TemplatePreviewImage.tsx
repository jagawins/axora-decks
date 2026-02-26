import { type TemplateBlock } from '@/lib/templates';
import { cn } from '@/lib/utils';
import {
  BarChart3, Type, Image, Columns, Table, List, AlertCircle,
  TrendingUp, Quote, Clock, GitCompare, LayoutGrid, Star,
  FileText, MousePointerClick, Minus, Lightbulb, Layers,
  Grid3X3, ArrowRightCircle, PieChart, PanelTop, ToggleLeft,
  Scale, Map, Shuffle, CheckSquare
} from 'lucide-react';

interface TemplatePreviewImageProps {
  templateId: string;
  templateVersion?: number;
  themeId?: string;
  previewUrl?: string | null;
  blocks: TemplateBlock[];
  className?: string;
}

const BLOCK_ICON: Record<string, React.ElementType> = {
  heading: Type,
  text: FileText,
  image: Image,
  two_col: Columns,
  table: Table,
  list: List,
  callout: AlertCircle,
  stat_block: TrendingUp,
  quote_block: Quote,
  timeline_block: Clock,
  comparison_table: GitCompare,
  card_grid: LayoutGrid,
  hero_header: Star,
  exec_summary: FileText,
  cta_section: MousePointerClick,
  section_divider: Minus,
  icon_text_block: Lightbulb,
  framed_insight: Lightbulb,
  three_pillars: Layers,
  two_by_two_matrix: Grid3X3,
  decision_next_steps: ArrowRightCircle,
  chart_block: PieChart,
  tabs_block: PanelTop,
  toggle_block: ToggleLeft,
  decision_summary: CheckSquare,
  evidence_map: Map,
  scenario_set: Shuffle,
  recommendation_panel: Scale,
};

function getBlockLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Shows a stylized preview of template structure using block-type indicators.
 * Reliable, fast, and no html-to-image dependency.
 */
export function TemplatePreviewImage({
  previewUrl,
  blocks,
  className = '',
}: TemplatePreviewImageProps) {
  // If a real thumbnail exists, use it
  if (previewUrl) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-xl overflow-hidden", className)}>
        <img src={previewUrl} alt="Template preview" className="w-full h-full object-cover" />
      </div>
    );
  }

  const previewBlocks = blocks.slice(0, 5);

  return (
    <div
      className={cn(
        "relative aspect-video w-full rounded-xl overflow-hidden bg-card border border-border",
        className
      )}
    >
      {/* Decorative slide lines */}
      <div className="absolute inset-0 p-3 flex flex-col gap-1.5">
        {previewBlocks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs">
            Empty template
          </div>
        ) : (
          previewBlocks.map((block, i) => {
            const Icon = BLOCK_ICON[block.type] || FileText;
            const payload = block.block_payload || {};
            const title =
              (payload as any).text?.slice(0, 40) ||
              (payload as any).headline?.slice(0, 40) ||
              (payload as any).title?.slice(0, 40) ||
              getBlockLabel(block.type);

            return (
              <div
                key={block.id || i}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 text-muted-foreground",
                  i === 0 && "bg-accent/15 text-accent"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] leading-tight truncate font-medium">
                  {title}
                </span>
              </div>
            );
          })
        )}

        {blocks.length > 5 && (
          <div className="text-[10px] text-muted-foreground/60 text-center mt-auto">
            +{blocks.length - 5} more slides
          </div>
        )}
      </div>
    </div>
  );
}
