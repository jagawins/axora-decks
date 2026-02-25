import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LayoutTemplate, Star, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Template, createDeckFromTemplate, TEMPLATE_CATEGORIES } from '@/lib/templates';
import { TemplateCard } from './TemplateCard';
import { SeedTemplatesButton } from './SeedTemplatesButton';
import { cn } from '@/lib/utils';

interface TemplatesGridProps {
  templates: Template[];
  loading: boolean;
  onRefresh?: () => void;
}

// Category display metadata
const CATEGORY_META: Record<string, { emoji: string; subtitle: string }> = {
  'Strategy and Leadership': { emoji: '🎯', subtitle: 'High-level decks for leadership and board presentations' },
  'Projects and Operations': { emoji: '⚡', subtitle: 'Templates to help you run your business' },
  'Product and Technology': { emoji: '🚀', subtitle: 'Ship better products with clear communication' },
  'Sales and Marketing': { emoji: '📈', subtitle: 'Win deals and drive growth' },
  'Startup and Fundraising': { emoji: '💰', subtitle: 'Pitch decks and investor materials' },
  'AI and Data': { emoji: '🤖', subtitle: 'Data-driven stories and AI project decks' },
};

function HorizontalRow({ title, subtitle, emoji, templates, onSelect, creatingId }: {
  title: string;
  subtitle: string;
  emoji: string;
  templates: Template[];
  onSelect: (id: string) => void;
  creatingId: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (templates.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            {title}
            <span className="text-base">{emoji}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "p-1.5 rounded-lg border border-border transition-colors",
              canScrollLeft ? "hover:bg-muted text-foreground" : "text-muted-foreground/30 cursor-default"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "p-1.5 rounded-lg border border-border transition-colors",
              canScrollRight ? "hover:bg-muted text-foreground" : "text-muted-foreground/30 cursor-default"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px] snap-start relative"
          >
            {creatingId === template.id && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            )}
            <TemplateCard
              id={template.id}
              title={template.title}
              description={template.description}
              category={template.category}
              tags={template.tags}
              isFeatured={template.is_featured}
              version={template.version}
              defaultThemeId={template.default_theme_id}
              previewBlocks={template.preview_blocks || []}
              previewUrl={template.thumbnail_url || template.preview_url}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TemplatesGrid({ templates, loading, onRefresh }: TemplatesGridProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);

  // Group templates by category
  const grouped = useMemo(() => {
    const map: Record<string, Template[]> = {};
    templates.forEach((t) => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, [templates]);

  // Featured (popular) templates
  const featured = useMemo(() => templates.filter((t) => t.is_featured), [templates]);

  // Ordered categories from the constant (skip 'all')
  const orderedCategories = useMemo(() => {
    return TEMPLATE_CATEGORIES
      .filter((c) => c.id !== 'all')
      .map((c) => c.id)
      .filter((id) => (grouped[id]?.length || 0) > 0);
  }, [grouped]);

  const handleSelectTemplate = async (templateId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setCreatingFromTemplate(templateId);
    try {
      const { projectId } = await createDeckFromTemplate(templateId, user.id);
      toast({
        title: 'Deck created!',
        description: 'A copy of the template is ready for editing.',
      });
      navigate(`/editor/${projectId}`);
    } catch (error) {
      console.error('Error creating deck from template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create deck from template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreatingFromTemplate(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-16 glass-card">
        <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No templates available</h3>
        <p className="text-muted-foreground mb-6">
          Templates need to be seeded into the database.
        </p>
        {onRefresh && <SeedTemplatesButton onSeeded={onRefresh} />}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Popular / Featured */}
      {featured.length > 0 && (
        <HorizontalRow
          title="Popular"
          subtitle="What's hot at Axora right now"
          emoji="🔥"
          templates={featured}
          onSelect={handleSelectTemplate}
          creatingId={creatingFromTemplate}
        />
      )}

      {/* Category rows */}
      {orderedCategories.map((catId) => {
        const meta = CATEGORY_META[catId] || { emoji: '📋', subtitle: '' };
        const label = TEMPLATE_CATEGORIES.find((c) => c.id === catId)?.label || catId;
        return (
          <HorizontalRow
            key={catId}
            title={label}
            subtitle={meta.subtitle}
            emoji={meta.emoji}
            templates={grouped[catId] || []}
            onSelect={handleSelectTemplate}
            creatingId={creatingFromTemplate}
          />
        );
      })}

      {/* Loading overlay */}
      {creatingFromTemplate && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50" />
      )}
    </div>
  );
}
