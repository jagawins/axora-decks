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
const MIN_SCALE = 0.25;  // Increased from 0.2 for better visibility
const MAX_SCALE = 0.6;   // Cap max scale to prevent overflow

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
  const [scale, setScale] = useState(MIN_SCALE);

  const orderedBlocks = useMemo(() => getOrderedBlocks(blocks), [blocks]);
  const previewBlocks = orderedBlocks.slice(0, 4);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const calculatedScale = containerWidth / DESIGN_WIDTH;
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
      className={`relative w-full bg-background rounded-lg overflow-hidden shadow-md ${className}`}
      style={{ aspectRatio: '16 / 9' }}
    >
      <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
        <div
          className="origin-top-center shrink-0"
          style={{
            transform: `scale(${scale})`,
            width: `${DESIGN_WIDTH}px`,
            height: `${DESIGN_HEIGHT}px`,
            transformOrigin: 'top center',
          }}
        >
          <div className="w-full h-full flex flex-col gap-4 p-8 bg-background">
            {previewBlocks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Empty template
              </div>
            ) : (
              previewBlocks.map((block, index) => (
                <TemplateBlockRenderer
                  key={index}
                  block={block}
                  isPreview={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
