import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateBlock } from '@/lib/templates';
import { TemplatePreview } from './TemplatePreview';

interface TemplateCardProps {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: string[];
  isFeatured: boolean;
  previewBlocks: TemplateBlock[];
  onSelect: (id: string) => void;
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
}: TemplateCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200",
        "hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1",
        isFeatured && "border-accent/30 ring-1 ring-accent/20"
      )}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="default" className="bg-accent text-accent-foreground gap-1 shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      {/* Preview thumbnail */}
      <button
        onClick={() => onSelect(id)}
        className="relative w-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
      >
        <TemplatePreview 
          blocks={previewBlocks} 
          className="border-0 rounded-none border-b"
        />
        
        {/* Hover overlay with CTA */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="hero" size="sm" className="gap-2 shadow-lg">
            Use Template
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </button>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Category & Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary" className="text-xs">
            {category.split(' ')[0]}
          </Badge>
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
