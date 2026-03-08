import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Download, Sparkles, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inferVisualCategory, getCategoryStyle } from './TemplateThumbnail';
import { TemplatePreviewImage } from './TemplatePreviewImage';
import { Skeleton } from '@/components/ui/skeleton';
import type { TemplateBlock } from '@/lib/templates';

interface TemplateCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[];
  isFeatured: boolean;
  previewBlocks?: TemplateBlock[];
  slideCount?: number;
  onSelect: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function TemplateCard({
  id,
  title,
  description,
  category,
  tags,
  isFeatured,
  previewBlocks,
  slideCount,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  const visualCat = inferVisualCategory(category, tags);
  const style = getCategoryStyle(visualCat);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy loading via IntersectionObserver
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handlePreview = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(id);
  }, [id, onPreview]);

  const handleUse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  }, [id, onSelect]);

  const effectiveSlideCount = slideCount || (previewBlocks?.length ?? 0);

  return (
    <div
      ref={cardRef}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer',
        'bg-card border border-border/50',
        'hover:shadow-2xl hover:shadow-black/8 hover:border-border hover:scale-[1.02] hover:-translate-y-1',
        isFeatured && 'ring-1 ring-accent/20'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePreview}
    >
      {/* Preview Image — dominant area, YouExec style */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted/20">
        {isVisible ? (
          <TemplatePreviewImage
            templateId={id}
            blocks={previewBlocks || []}
            title={title}
            category={category}
            tags={tags}
            className="w-full h-full rounded-none border-0"
          />
        ) : (
          <Skeleton className="w-full h-full rounded-none" />
        )}

        {/* Featured spark — top left */}
        {isFeatured && (
          <div className="absolute top-3 left-3 z-10">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </div>
          </div>
        )}

        {/* Hover overlay — clean centered actions */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300',
          isHovered
            ? 'opacity-100 bg-black/50 backdrop-blur-[2px]'
            : 'opacity-0 pointer-events-none'
        )}>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-white/95 hover:bg-white text-gray-900 border-0 shadow-lg rounded-full px-5 text-xs font-semibold"
            onClick={handlePreview}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground border-0 shadow-lg rounded-full px-5 text-xs font-semibold"
            onClick={handleUse}
          >
            Use Template
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content — minimal, YouExec-style bottom section */}
      <div className="px-4 py-3.5 flex flex-col gap-1.5 border-t border-border/30">
        <h3 className="font-semibold text-foreground line-clamp-1 text-[15px] leading-tight tracking-tight group-hover:text-accent transition-colors">
          {title}
        </h3>

        {/* Meta row: Category · Slides · PPTX */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span
            className="font-semibold"
            style={{ color: style.accent }}
          >
            {style.label}
          </span>
          {effectiveSlideCount > 0 && (
            <>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3 opacity-60" />
                {effectiveSlideCount} Slides
              </span>
            </>
          )}
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3 opacity-60" />
            PPTX
          </span>
        </div>
      </div>
    </div>
  );
}
