import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Eye } from 'lucide-react';
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
  onSelect,
  onPreview,
}: TemplateCardProps) {
  const visualCat = inferVisualCategory(category, tags);
  const style = getCategoryStyle(visualCat);
  const [isVisible, setIsVisible] = useState(false);
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

  const visibleTags = tags.slice(0, 3);
  const extraTags = tags.length - 3;

  return (
    <div
      ref={cardRef}
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5',
        isFeatured && 'ring-1 ring-accent/20'
      )}
      style={{ borderColor: 'hsl(var(--border))' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = style.accent + '60';
        (e.currentTarget as HTMLDivElement).style.borderLeftWidth = '3px';
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = style.accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(var(--border))';
        (e.currentTarget as HTMLDivElement).style.borderLeftWidth = '1px';
      }}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-accent text-accent-foreground gap-1 shadow-lg text-[10px] px-1.5 py-0.5">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      {/* Category badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge
          className="text-[10px] px-1.5 py-0.5 font-bold text-white border-0"
          style={{ backgroundColor: style.accent }}
        >
          {style.label}
        </Badge>
      </div>

      {/* Thumbnail — real block preview with lazy loading */}
      <div className="relative w-full">
        {isVisible && previewBlocks ? (
          <TemplatePreviewImage
            templateId={id}
            blocks={previewBlocks}
            className="w-full h-[160px] rounded-none border-b border-border/50"
          />
        ) : (
          <Skeleton className="w-full h-[160px] rounded-none" />
        )}

        {/* Hover overlay with two actions */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shadow-lg"
              onClick={(e) => { e.stopPropagation(); onPreview(id); }}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
          )}
          <Button
            variant="hero"
            size="sm"
            className="gap-1.5 shadow-lg"
            onClick={(e) => { e.stopPropagation(); onSelect(id); }}
          >
            Use Template
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 min-h-0">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1 text-sm">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {extraTags > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{extraTags} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
