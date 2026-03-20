/**
 * Unified Visual Block Renderer
 * Renders all block types (legacy + visual + decision) with theme support
 */

import { type BlockPayload, type TemplateBlock } from '@/lib/templates';
import { Image as ImageIcon } from 'lucide-react';
import { SmartContentRenderer } from './SmartContentRenderer';

// Visual block components
import {
  StatBlock,
  QuoteBlock,
  TimelineBlock,
  ComparisonTable,
  CardGrid,
  HeroHeader,
  ExecSummary,
  CTASection,
  SectionDivider,
  IconTextBlock,
  FramedInsight,
  TwoColumnBlock,
} from '@/components/blocks';

// Decision block components
import { DecisionSummary } from './DecisionSummary';
import { EvidenceMap } from './EvidenceMap';
import { ScenarioSet } from './ScenarioSet';
import { RecommendationPanel } from './RecommendationPanel';

// New visual block components
import { ThreePillars } from './ThreePillars';
import { TwoByTwoMatrix } from './TwoByTwoMatrix';
import { DecisionNextSteps } from './DecisionNextSteps';
import { ChartBlock } from './ChartBlock';
import { KpiDashboard } from './KpiDashboard';
import { RelationshipMatrix } from './RelationshipMatrix';
import { FlowDiagram } from './FlowDiagram';
import { EmbedBlock } from './EmbedBlock';
import { CTAButtonBlock } from './CTAButtonBlock';
import { SmartLayoutBlock } from './SmartLayoutBlock';

// Interactive block components
import { TabsBlock } from './TabsBlock';
import { ToggleBlock } from './ToggleBlock';

import type {
  StatBlockPayload,
  QuoteBlockPayload,
  TimelineBlockPayload,
  ComparisonTablePayload,
  CardGridPayload,
  HeroHeaderPayload,
  ExecSummaryPayload,
  CTASectionPayload,
  SectionDividerPayload,
  IconTextBlockPayload,
  FramedInsightPayload,
  TwoColumnPayload,
  DecisionSummaryPayload,
  EvidenceMapPayload,
  ScenarioSetPayload,
  RecommendationPanelPayload,
  ThreePillarsPayload,
  TwoByTwoMatrixPayload,
  DecisionNextStepsPayload,
  ChartBlockPayload,
  TabsBlockPayload,
  ToggleBlockPayload,
  KpiDashboardPayload,
  RelationshipMatrixPayload,
  FlowDiagramPayload,
} from '@/components/blocks/types';

interface VisualBlockRendererProps {
  block: TemplateBlock;
  readOnly?: boolean;
  className?: string;
}

/**
 * Get payload from block, handling both new and legacy formats
 */
function getPayload(block: TemplateBlock): BlockPayload {
  return block.block_payload || (block.content as BlockPayload) || {};
}

/**
 * Get schema version from block metadata, defaulting to 1 if not present
 */
function getSchemaVersion(block: TemplateBlock): number {
  const meta = block.block_meta as { schema_version?: number } | undefined;
  return meta?.schema_version ?? 1;
}

export function VisualBlockRenderer({ 
  block, 
  readOnly = true,
  className = '' 
}: VisualBlockRendererProps) {
  const payload = getPayload(block);
  const type = block.type;
  const schemaVersion = getSchemaVersion(block);

  // Log schema version for debugging (can be removed in production)
  if (schemaVersion !== 1) {
    console.debug(`[VisualBlockRenderer] Block type=${type} using schema_version=${schemaVersion}`);
  }

  // Visual block types - cast through unknown for type safety
  switch (type) {
    case 'stat_block':
      return <StatBlock payload={payload as unknown as StatBlockPayload} readOnly={readOnly} className={className} />;
    case 'quote_block':
      return <QuoteBlock payload={payload as unknown as QuoteBlockPayload} readOnly={readOnly} className={className} />;
    case 'timeline_block':
      return <TimelineBlock payload={payload as unknown as TimelineBlockPayload} readOnly={readOnly} className={className} />;
    case 'comparison_table':
      return <ComparisonTable payload={payload as unknown as ComparisonTablePayload} readOnly={readOnly} className={className} />;
    case 'card_grid':
      return <CardGrid payload={payload as unknown as CardGridPayload} readOnly={readOnly} className={className} />;
    case 'hero_header':
      return <HeroHeader payload={payload as unknown as HeroHeaderPayload} readOnly={readOnly} className={className} />;
    case 'exec_summary':
      return <ExecSummary payload={payload as unknown as ExecSummaryPayload} readOnly={readOnly} className={className} />;
    case 'cta_section':
      return <CTASection payload={payload as unknown as CTASectionPayload} readOnly={readOnly} className={className} />;
    case 'section_divider':
      return <SectionDivider payload={payload as unknown as SectionDividerPayload} readOnly={readOnly} className={className} />;
    case 'icon_text_block':
      return <IconTextBlock payload={payload as unknown as IconTextBlockPayload} readOnly={readOnly} className={className} />;
    case 'framed_insight':
      return <FramedInsight payload={payload as unknown as FramedInsightPayload} readOnly={readOnly} className={className} />;
    
    // Decision block types
    case 'decision_summary':
      return <DecisionSummary payload={payload as unknown as DecisionSummaryPayload} readOnly={readOnly} className={className} />;
    case 'evidence_map':
      return <EvidenceMap payload={payload as unknown as EvidenceMapPayload} readOnly={readOnly} className={className} />;
    case 'scenario_set':
      return <ScenarioSet payload={payload as unknown as ScenarioSetPayload} readOnly={readOnly} className={className} />;
    case 'recommendation_panel':
      return <RecommendationPanel payload={payload as unknown as RecommendationPanelPayload} readOnly={readOnly} className={className} />;
    
    // New visual block types
    case 'three_pillars':
      return <ThreePillars payload={payload as unknown as ThreePillarsPayload} readOnly={readOnly} className={className} />;
    case 'two_by_two_matrix':
      return <TwoByTwoMatrix payload={payload as unknown as TwoByTwoMatrixPayload} readOnly={readOnly} className={className} />;
    case 'decision_next_steps':
      return <DecisionNextSteps payload={payload as unknown as DecisionNextStepsPayload} readOnly={readOnly} className={className} />;
    case 'chart_block':
      return <ChartBlock payload={payload as unknown as ChartBlockPayload} readOnly={readOnly} className={className} />;
    case 'kpi_dashboard':
      return <KpiDashboard payload={payload as unknown as KpiDashboardPayload} readOnly={readOnly} className={className} />;
    case 'relationship_matrix':
      return <RelationshipMatrix payload={payload as unknown as RelationshipMatrixPayload} readOnly={readOnly} className={className} />;
    case 'flow_diagram':
      return <FlowDiagram payload={payload as unknown as FlowDiagramPayload} readOnly={readOnly} className={className} />;
    
    // Executive feature blocks
    case 'embed_block':
      return <EmbedBlock payload={payload as any} readOnly={readOnly} className={className} />;
    case 'cta_button_block':
      return <CTAButtonBlock payload={payload as any} readOnly={readOnly} className={className} />;
    case 'smart_layout':
      return <SmartLayoutBlock payload={payload as any} readOnly={readOnly} className={className} />;
    
    // Interactive block types
    case 'tabs_block':
      return <TabsBlock payload={payload as unknown as TabsBlockPayload} readOnly={readOnly} className={className} />;
    case 'toggle_block':
      return <ToggleBlock payload={payload as unknown as ToggleBlockPayload} readOnly={readOnly} className={className} />;

    // Legacy block types
    case 'heading':
      return <HeadingBlock payload={payload} className={className} />;
    case 'text':
      return <TextBlock payload={payload} className={className} />;
    case 'list':
      return <ListBlock payload={payload} className={className} />;
    case 'callout':
      return <CalloutBlock payload={payload} className={className} />;
    case 'two_col':
      // Check if it's the new TwoColumnPayload format
      if ('left' in payload && typeof payload.left === 'object') {
        return <TwoColumnBlock payload={payload as unknown as TwoColumnPayload} readOnly={readOnly} className={className} />;
      }
      return <LegacyTwoColBlock payload={payload} className={className} />;
    case 'table':
      return <TableBlock payload={payload} className={className} />;
    case 'image':
      return <ImageBlock payload={payload} className={className} />;
    default:
      return null;
  }
}

// =============================================================================
// Legacy Block Type Components
// =============================================================================

function HeadingBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const level = payload.level || 2;
  const text = payload.text || '';
  
  const sizeClass = level === 1 
    ? 'text-fluid-5xl font-bold' 
    : level === 2 
    ? 'text-fluid-3xl font-semibold' 
    : 'text-fluid-2xl font-medium';
    
  return (
    <div className={`${sizeClass} truncate text-[var(--deck-fg,hsl(var(--foreground)))] ${className}`}>
      {text}
    </div>
  );
}

function TextBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const text = payload.text || '';
  
  return (
    <SmartContentRenderer
      text={text}
      className={className}
      fallback={(decoded) => (
        <p className={`text-fluid-lg leading-relaxed line-clamp-3 text-[var(--deck-muted,hsl(var(--muted-foreground)))]`}>
          {decoded}
        </p>
      )}
    />
  );
}

function ListBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const items = payload.items || [];
  const ordered = payload.ordered || false;
  
  // Check if list items together form numeric data or a diagram
  const joined = items.join('\n');
  
  return (
    <SmartContentRenderer
      text={joined}
      className={className}
      fallback={() => (
        <ul className={`text-fluid-base space-y-space-2`}>
          {items.slice(0, 4).map((item, i) => (
            <li key={i} className="flex items-start gap-space-3">
              <span className="text-[var(--deck-accent,hsl(var(--accent)))] flex-shrink-0">
                {ordered ? `${i + 1}.` : '•'}
              </span>
              <span className="truncate text-[var(--deck-fg,hsl(var(--foreground)))]">{item}</span>
            </li>
          ))}
          {items.length > 4 && (
            <li className="text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
              +{items.length - 4} more...
            </li>
          )}
        </ul>
      )}
    />
  );
}

function CalloutBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const icon = payload.icon || 'info';
  const text = payload.text || '';
  
  const colorClass = icon === 'warning'
    ? 'border-warning/50 bg-warning/10'
    : icon === 'success'
    ? 'border-success/50 bg-success/10'
    : 'border-[var(--deck-accent,hsl(var(--accent)))]/50 bg-[var(--deck-accent,hsl(var(--accent)))]/10';
    
  return (
    <div className={`p-space-6 rounded-radius-xl border-2 ${colorClass} ${className}`}>
      <p className="text-fluid-base line-clamp-2 text-[var(--deck-fg,hsl(var(--foreground)))]">{text}</p>
    </div>
  );
}

function LegacyTwoColBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const left = payload.left || '';
  const right = payload.right || '';
  
  return (
    <div className={`grid grid-cols-2 gap-space-8 ${className}`}>
      <div className="text-fluid-base line-clamp-2 text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{left}</div>
      <div className="text-fluid-base line-clamp-2 text-[var(--deck-muted,hsl(var(--muted-foreground)))]">{right}</div>
    </div>
  );
}

function TableBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const headers = payload.headers || [];
  const rows = payload.rows || [];
  
  return (
    <div className={`w-full overflow-hidden rounded-radius-lg border border-[var(--deck-border,hsl(var(--border)))] ${className}`}>
      <table className="w-full text-fluid-sm">
        <thead>
          <tr className="bg-[var(--deck-muted,hsl(var(--muted)))]/20">
            {headers.slice(0, 4).map((h, i) => (
              <th 
                key={i} 
                className="p-space-3 text-left font-semibold truncate border-r last:border-r-0 border-[var(--deck-border,hsl(var(--border)))] text-[var(--deck-fg,hsl(var(--foreground)))]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 2).map((row, ri) => (
            <tr key={ri} className="border-t border-[var(--deck-border,hsl(var(--border)))]">
              {row.slice(0, 4).map((cell, ci) => (
                <td 
                  key={ci} 
                  className="p-space-3 truncate border-r last:border-r-0 border-[var(--deck-border,hsl(var(--border)))] text-[var(--deck-fg,hsl(var(--foreground)))]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageBlock({ payload, className }: { payload: BlockPayload; className?: string }) {
  const src = payload.src;
  const alt = payload.alt || 'Image';
  const prompt = payload.prompt;
  const aspect = payload.aspect || '16:9';
  const fit = payload.fit || 'cover';
  
  const aspectClass = 
    aspect === '4:3' ? 'aspect-[4/3]' :
    aspect === '1:1' ? 'aspect-square' :
    'aspect-video';
  
  if (src) {
    return (
      <div className={`w-full ${aspectClass} overflow-hidden rounded-radius-lg ${className}`}>
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-${fit}`}
          loading="lazy"
        />
      </div>
    );
  }
  
  return (
    <div 
      className={`w-full ${aspectClass} bg-[var(--deck-muted,hsl(var(--muted)))]/20 rounded-radius-lg flex flex-col items-center justify-center gap-space-3 border-2 border-dashed border-[var(--deck-border,hsl(var(--border)))] ${className}`}
    >
      <ImageIcon className="h-12 w-12 text-[var(--deck-muted,hsl(var(--muted-foreground)))]" />
      {prompt ? (
        <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] text-center px-4 line-clamp-2">
          {prompt}
        </p>
      ) : (
        <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
          Image placeholder
        </p>
      )}
    </div>
  );
}

export { getPayload };
