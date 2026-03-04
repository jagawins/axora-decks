import { useRef, useEffect, useState, useMemo } from 'react';
import { type TemplateBlock } from '@/lib/templates';
import { TemplateBlockRenderer } from './TemplateBlockRenderer';
import { DECISION_BLOCK_TYPES } from '@/lib/blocks';

interface TemplatePreviewProps {
  blocks: TemplateBlock[];
  themeId?: string;
  className?: string;
}

// Design size for the slide (16:9 aspect ratio)
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

// Fixed decision block render order
const DECISION_BLOCK_ORDER = ['decision_summary', 'evidence_map', 'scenario_set', 'recommendation_panel'];

/**
 * Detect if blocks contain decision blocks and sort them in fixed order if so
 */
function getOrderedBlocks(blocks: TemplateBlock[]): TemplateBlock[] {
  const hasDecisionBlocks = blocks.some(b => DECISION_BLOCK_TYPES.includes(b.type as any));
  
  if (!hasDecisionBlocks) {
    return blocks;
  }
  
  // Sort decision blocks in fixed order, non-decision blocks stay at end
  const decisionBlocks: TemplateBlock[] = [];
  const otherBlocks: TemplateBlock[] = [];
  
  for (const block of blocks) {
    if (DECISION_BLOCK_TYPES.includes(block.type as any)) {
      decisionBlocks.push(block);
    } else {
      otherBlocks.push(block);
    }
  }
  
  // Sort decision blocks by fixed order
  decisionBlocks.sort((a, b) => {
    const aIndex = DECISION_BLOCK_ORDER.indexOf(a.type);
    const bIndex = DECISION_BLOCK_ORDER.indexOf(b.type);
    return aIndex - bIndex;
  });
  
  return [...decisionBlocks, ...otherBlocks];
}

/**
 * Renders a scaled-down 16:9 preview of template blocks.
 * Shows first 3 blocks stacked vertically inside the slide canvas.
 * Decision blocks are rendered in fixed order when present.
 */
export function TemplatePreview({ 
  blocks, 
  themeId = 'classic',
  className = '' 
}: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  
  // Apply fixed order for decision blocks
  const orderedBlocks = useMemo(() => getOrderedBlocks(blocks), [blocks]);
  const previewBlocks = orderedBlocks.slice(0, 4);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / DESIGN_WIDTH);
      }
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`aspect-[16/9] w-full rounded-xl border border-border bg-[var(--deck-bg,hsl(var(--card)))] overflow-hidden relative ${className}`}
      data-theme={themeId}
    >
      {/* Scaled content container */}
      <div 
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: `${DESIGN_WIDTH}px`,
          height: `${DESIGN_HEIGHT}px`,
          transform: `scale(${scale})`,
        }}
      >
        <div className="w-full h-full p-16 flex flex-col justify-center gap-8" style={{ pointerEvents: 'auto' }}>
          {previewBlocks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[var(--deck-muted,hsl(var(--muted-foreground)))] text-4xl">
              Empty template
            </div>
          ) : (
            previewBlocks.map((block, index) => (
              <TemplateBlockRenderer
                key={block.id || index}
                block={block}
                readOnly
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
