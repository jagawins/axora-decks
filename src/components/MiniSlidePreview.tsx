import { useMemo } from 'react';
import { VisualBlockRenderer } from '@/components/blocks/VisualBlockRenderer';
import { cn } from '@/lib/utils';
import type { Json } from '@/integrations/supabase/types';

interface MiniBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order_index: number;
  block_payload?: Record<string, unknown> | null;
  block_meta?: Record<string, unknown> | null;
}

interface MiniSlidePreviewProps {
  blocks: MiniBlock[];
  className?: string;
  /** Scale factor for the miniature render (default 0.25) */
  scale?: number;
}

/**
 * Renders actual blocks at a miniature scale to produce a real
 * slide-like thumbnail. Uses CSS transform: scale() on a
 * full-size render container.
 */
export function MiniSlidePreview({ blocks, className, scale = 0.25 }: MiniSlidePreviewProps) {
  const visibleBlocks = useMemo(() => blocks.slice(0, 5), [blocks]);

  if (visibleBlocks.length === 0) {
    return (
      <div className={cn("aspect-video bg-muted/30 rounded-xl flex items-center justify-center", className)}>
        <span className="text-xs text-muted-foreground">No content</span>
      </div>
    );
  }

  // We render at a larger size then scale down
  const innerWidth = 960; // px
  const innerHeight = 540; // px

  return (
    <div
      className={cn("aspect-video overflow-hidden rounded-xl bg-background relative", className)}
      style={{ isolation: 'isolate' }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{
          width: innerWidth,
          height: innerHeight,
          transform: `scale(${scale})`,
        }}
      >
        <div className="w-full h-full p-8 flex flex-col gap-4 overflow-hidden">
          {visibleBlocks.map((block) => (
            <div key={block.id} className="flex-shrink-0 max-h-[160px] overflow-hidden">
              <VisualBlockRenderer
                block={{
                  id: block.id,
                  template_id: '',
                  type: block.type as any,
                  order_index: block.order_index,
                  block_payload: (block.block_payload || block.content) as any,
                  block_meta: (block.block_meta || {}) as any,
                  content: block.content as unknown as Json,
                }}
                readOnly
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
