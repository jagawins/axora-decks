import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateThumbnail, inferVisualCategory, getCategoryStyle } from './TemplateThumbnail';

interface TemplateCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[];
  isFeatured: boolean;
  onSelect: (id: string) => void;
}

export function TemplateCard({
  id,
  title,
  description,
  category,
  tags,
  isFeatured,
  onSelect,
}: TemplateCardProps) {
  const visualCat = inferVisualCategory(category, tags);
  const style = getCategoryStyle(visualCat);

  const visibleTags = tags.slice(0, 3);
  const extraTags = tags.length - 3;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200',
        'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5',
        isFeatured && 'ring-1 ring-accent/20'
      )}
      style={{
        borderColor: 'hsl(var(--border))',
      }}
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

      {/* Thumbnail */}
      <button
        onClick={() => onSelect(id)}
        className="relative w-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
      >
        <TemplateThumbnail
          category={category}
          tags={tags}
          title={title}
          className="w-full h-[160px] rounded-none border-b border-border/50"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="hero" size="sm" className="gap-2 shadow-lg">
            Use Template
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </button>

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
