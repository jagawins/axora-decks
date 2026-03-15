import { useRef, useEffect, useState } from 'react';
import { type TemplateBlock } from '@/lib/templates';
import { VisualBlockRenderer } from '@/components/blocks/VisualBlockRenderer';

interface TemplatePreviewProps {
  blocks: TemplateBlock[];
  themeId?: string;
  className?: string;
}

// Design size for the slide (16:9 aspect ratio)
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;
const MIN_SCALE = 0.08;
const MAX_SCALE = 1;

export function TemplatePreview({ blocks, themeId = 'classic', className = '' }: TemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(MIN_SCALE);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
      const widthScale = containerWidth / DESIGN_WIDTH;
      const heightScale = containerHeight / DESIGN_HEIGHT;
      const calculatedScale = Math.min(widthScale, heightScale);

      setScale(Math.min(Math.max(calculatedScale, MIN_SCALE), MAX_SCALE));
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
      data-theme={themeId}
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
          <div className="w-full h-full flex flex-col gap-5 px-12 py-10 bg-background overflow-hidden">
            {blocks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Empty template
              </div>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id || index} className={blocks.length === 1 ? 'flex-1 flex items-center' : 'min-h-0'}>
                  <VisualBlockRenderer block={block as any} readOnly />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
