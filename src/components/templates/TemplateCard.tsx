import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Sparkles, Layers, BarChart3, Clock, GitCompare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chunkTemplateBlocks } from '@/lib/template-slides';
import { inferVisualCategory, getCategoryStyle } from './TemplateThumbnail';
import { TemplatePreview } from './TemplatePreview';
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

// Map block types to icons for content richness hints
const BLOCK_TYPE_ICONS: Record<string, { icon: typeof BarChart3; label: string }> = {
  chart_block: { icon: BarChart3, label: 'Charts' },
  kpi_dashboard: { icon: BarChart3, label: 'KPIs' },
  timeline_block: { icon: Clock, label: 'Timeline' },
  comparison_table: { icon: GitCompare, label: 'Comparison' },
  flow_diagram: { icon: GitCompare, label: 'Flow' },
};

function getContentHints(blocks: TemplateBlock[]): { icon: typeof BarChart3; label: string }[] {
  const seen = new Set<string>();
  const hints: { icon: typeof BarChart3; label: string }[] = [];
  for (const b of blocks) {
    if (BLOCK_TYPE_ICONS[b.type] && !seen.has(b.type)) {
      seen.add(b.type);
      hints.push(BLOCK_TYPE_ICONS[b.type]);
      if (hints.length >= 2) break;
    }
  }
  return hints;
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

  const hasRealBlocks = previewBlocks && previewBlocks.length > 0;
  const previewSlideBlocks = useMemo(() => {
    const slides = chunkTemplateBlocks(previewBlocks || []);
    return slides[0] || [];
  }, [previewBlocks]);
  const contentHints = useMemo(() => getContentHints(previewBlocks || []), [previewBlocks]);

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
        'hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/30 hover:scale-[1.02] hover:-translate-y-1',
        isFeatured && 'ring-1 ring-accent/20'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePreview}
    >
      {/* Preview — real slide content or styled fallback */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted/10">
        {isVisible ? (
          hasRealBlocks ? (
            <div className="w-full h-full">
              <TemplatePreview
                blocks={previewSlideBlocks}
                className="shadow-none border-0 rounded-none w-full h-full"
              />
            </div>
          ) : (
            <TemplatePreviewImage
              templateId={id}
              blocks={previewBlocks || []}
              title={title}
              category={category}
              tags={tags}
              className="w-full h-full rounded-none border-0"
            />
          )
        ) : (
          <Skeleton className="w-full h-full rounded-none" />
        )}

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          {isFeatured && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </div>
          )}
        </div>

        {/* AI Customizable badge — top right */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-card/80 backdrop-blur-sm text-[9px] font-medium text-accent border border-accent/20">
            <Zap className="h-2.5 w-2.5" />
            AI Editable
          </div>
        </div>

        {/* Hover overlay */}
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

      {/* Content */}
      <div className="px-4 py-3.5 flex flex-col gap-1.5 border-t border-border/30">
        <h3 className="font-semibold text-foreground line-clamp-1 text-[15px] leading-tight tracking-tight group-hover:text-accent transition-colors">
          {title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-semibold" style={{ color: style.accent }}>
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
          {contentHints.length > 0 && (
            <>
              <span className="opacity-30">·</span>
              {contentHints.map((hint, i) => {
                const Icon = hint.icon;
                return (
                  <span key={i} className="flex items-center gap-0.5" title={hint.label}>
                    <Icon className="h-3 w-3 opacity-50" />
                  </span>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
