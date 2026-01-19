import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "group relative text-left w-full rounded-xl border bg-card p-5 transition-all duration-200",
        "hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
        isFeatured && "border-accent/30 bg-gradient-to-br from-accent/5 to-transparent"
      )}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="default" className="bg-accent text-accent-foreground gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Category & Tags */}
        <div className="flex flex-wrap gap-1.5">
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

      {/* Hover indicator */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
    </button>
  );
}
