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
const MIN_SCALE = 0.1;
const MAX_SCALE = 1.0;

// Fixed decision block render order
const DECISION_BLOCK_ORDER = ['decision_summary', 'evidence_map', 'scenario_set', 'recommendation_panel'];

function getOrderedBlocks(blocks: TemplateBlock[]): TemplateBlock[] {
  const hasDecisionBlocks = blocks.some(b => DECISION_BLOCK_TYPES.includes(b.type as any));
  if (!hasDecisionBlocks) return blocks;
  
  const decisionBlocks: TemplateBlock[] = [];
  const otherBlocks: TemplateBlock[] = [];
  
  for (const block of blocks) {
    if (DECISION_BLOCK_TYPES.includes(block.type as any)) {
      decisionBlocks.push(block);
    } else {
      otherBlocks.push(block);
    }
  }
  
  decisionBlocks.sort((a, b) => {
    const aIndex = DECISION_BLOCK_ORDER.indexOf(a.type);
    const bIndex = DECISION_BLOCK_ORDER.indexOf(b.type);
    return aIndex - bIndex;
  });
  
  return [...decisionBlocks, ...otherBlocks];
}

export function TemplatePreview({ blocks, themeId = 'classic', className = '' }: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const orderedBlocks = useMemo(() => getOrderedBlocks(blocks), [blocks]);
  const previewBlocks = orderedBlocks.slice(0, 4);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // Calculate scale to fit while maintaining aspect ratio
        const scaleX = containerWidth / DESIGN_WIDTH;
        const scaleY = containerHeight / DESIGN_HEIGHT;
        const calculatedScale = Math.min(scaleX, scaleY);
        
        setScale(Math.min(Math.max(calculatedScale, MIN_SCALE), MAX_SCALE));
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
      className={`relative w-full bg-muted/5 rounded-lg overflow-hidden flex items-center justify-center border border-border/40 transition-all duration-300 ${className}`}
      style={{ aspectRatio: '16 / 9' }}
    >
      {/* Subtle dot grid overlay - same as examples */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern-preview" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern-preview)" />
      </svg>

      {/* Decorative accent glow like examples */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div
        className="relative origin-center overflow-hidden shrink-0 transition-transform duration-500 ease-out"
        style={{
          transform: `scale(${scale})`,
          width: `${DESIGN_WIDTH}px`,
          height: `${DESIGN_HEIGHT}px`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
        }}
      >
        <div className="w-full h-full flex flex-col gap-4 p-8 bg-background">
          {previewBlocks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Empty template
            </div>
          ) : (
            previewBlocks.map((block, index) => (
              <div key={`${block.id}-${index}`} className="flex-shrink-0">
                <TemplateBlockRenderer
                  block={block}
                  themeId={themeId}
                  isPreview
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
