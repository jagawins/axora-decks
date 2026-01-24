import { useRef, useEffect, useState } from 'react';
import { type TemplateBlock } from '@/lib/templates';
import { TemplateBlockRenderer } from './TemplateBlockRenderer';

interface TemplatePreviewProps {
  blocks: TemplateBlock[];
  themeId?: string;
  className?: string;
}

// Design size for the slide (16:9 aspect ratio)
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

/**
 * Renders a scaled-down 16:9 preview of template blocks.
 * Shows first 3 blocks stacked vertically inside the slide canvas.
 */
export function TemplatePreview({ 
  blocks, 
  themeId = 'classic',
  className = '' 
}: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const previewBlocks = blocks.slice(0, 3);

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
        <div className="w-full h-full p-16 flex flex-col justify-center gap-8">
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
