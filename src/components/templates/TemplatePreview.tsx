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
const MIN_SCALE = 0.05;
const MAX_SCALE = 1;

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
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="origin-top-center shrink-0"
          style={{
            transform: `scale(${scale})`,
            width: `${DESIGN_WIDTH}px`,
            height: `${DESIGN_HEIGHT}px`,
            transformOrigin: 'top center',
          }}
        >
          <div className="w-full h-full flex flex-col justify-center gap-6 px-16 py-12 bg-background">
            {previewBlocks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Empty template
              </div>
            ) : (
              previewBlocks.map((block, index) => (
              <div
                key={index}
                className={previewBlocks.length === 1
                  ? 'flex-1 flex flex-col justify-center min-h-0 [&>*]:scale-110 [&>*]:origin-center'
                  : ''
                }
              >
                <TemplateBlockRenderer
                  block={block}
                  readOnly
                />
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
