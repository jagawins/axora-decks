import { type TemplateBlock } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { MiniSlidePreview } from '@/components/MiniSlidePreview';

interface TemplatePreviewImageProps {
  templateId: string;
  templateVersion?: number;
  themeId?: string;
  previewUrl?: string | null;
  blocks: TemplateBlock[];
  className?: string;
}

/**
 * Template preview that renders actual blocks as a miniature slide.
 * Falls back to a themed gradient card if no blocks exist.
 */
export function TemplatePreviewImage({
  templateId,
  themeId,
  previewUrl,
  blocks,
  className = '',
}: TemplatePreviewImageProps) {
  if (previewUrl) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-xl overflow-hidden", className)}>
        <img src={previewUrl} alt="Template preview" className="w-full h-full object-cover" />
      </div>
    );
  }

  // If we have blocks, render them as a real mini preview
  if (blocks.length > 0) {
    const miniBlocks = blocks.slice(0, 5).map(b => ({
      id: b.id,
      type: b.type,
      content: (b.block_payload || b.content || {}) as Record<string, unknown>,
      order_index: b.order_index,
      block_payload: b.block_payload as Record<string, unknown> | null,
      block_meta: b.block_meta as Record<string, unknown> | null,
    }));

    return (
      <MiniSlidePreview
        blocks={miniBlocks}
        className={cn("border border-border", className)}
        scale={0.25}
      />
    );
  }

  // Fallback: themed gradient with template ID initial
  return (
    <div
      className={cn(
        "relative aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30",
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-muted-foreground/30">
          Template
        </span>
      </div>
    </div>
  );
}
