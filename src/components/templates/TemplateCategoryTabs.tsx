import { cn } from '@/lib/utils';
import { TEMPLATE_CATEGORIES } from '@/lib/templates';

interface TemplateCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  templateCounts: Record<string, number>;
}

export function TemplateCategoryTabs({
  activeCategory,
  onCategoryChange,
  templateCounts,
}: TemplateCategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATE_CATEGORIES.map((category) => {
        const count = category.id === 'all' 
          ? Object.values(templateCounts).reduce((a, b) => a + b, 0)
          : templateCounts[category.id] || 0;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeCategory === category.id
                ? "bg-accent text-accent-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {category.label}
            <span className={cn(
              "ml-1.5 text-xs",
              activeCategory === category.id ? "text-accent-foreground/70" : "text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
