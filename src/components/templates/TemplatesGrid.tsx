import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LayoutTemplate, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Template, createDeckFromTemplate } from '@/lib/templates';
import { TemplateCard } from './TemplateCard';
import { SeedTemplatesButton } from './SeedTemplatesButton';
import { cn } from '@/lib/utils';
import { inferVisualCategory, type TemplateVisualCategory } from './TemplateThumbnail';

interface TemplatesGridProps {
  templates: Template[];
  loading: boolean;
  onRefresh?: () => void;
}

const FILTER_CATEGORIES: { id: string; label: string; match: TemplateVisualCategory[] }[] = [
  { id: 'all', label: 'All', match: [] },
  { id: 'strategy', label: 'Strategy', match: ['strategy'] },
  { id: 'financial', label: 'Financial', match: ['financial'] },
  { id: 'board', label: 'Board', match: ['board'] },
  { id: 'sales', label: 'Sales & Pitch', match: ['sales'] },
  { id: 'marketing', label: 'Marketing', match: ['marketing'] },
  { id: 'operations', label: 'Operations', match: ['operations'] },
  { id: 'comparison', label: 'Comparison', match: ['comparison'] },
];

export function TemplatesGrid({ templates, loading, onRefresh }: TemplatesGridProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign visual category to every template
  const templatesWithCat = useMemo(() =>
    templates.map((t) => ({
      ...t,
      visualCategory: inferVisualCategory(t.category, t.tags),
    })),
    [templates]
  );

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    for (const t of templatesWithCat) {
      counts[t.visualCategory] = (counts[t.visualCategory] || 0) + 1;
    }
    return counts;
  }, [templatesWithCat, templates.length]);

  // Filter + search
  const filtered = useMemo(() => {
    let list = templatesWithCat;

    if (activeFilter !== 'all') {
      const filterDef = FILTER_CATEGORIES.find((f) => f.id === activeFilter);
      if (filterDef) {
        list = list.filter((t) => filterDef.match.includes(t.visualCategory));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return list;
  }, [templatesWithCat, activeFilter, searchQuery]);

  const handleSelectTemplate = async (templateId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setCreatingFromTemplate(templateId);
    try {
      const { projectId } = await createDeckFromTemplate(templateId, user.id);
      toast({ title: 'Deck created!', description: 'A copy of the template is ready for editing.' });
      navigate(`/editor/${projectId}`);
    } catch (error) {
      console.error('Error creating deck from template:', error);
      toast({ title: 'Error', description: 'Failed to create deck from template.', variant: 'destructive' });
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
        <p className="text-muted-foreground mb-6">Templates need to be seeded into the database.</p>
        {onRefresh && <SeedTemplatesButton onSeeded={onRefresh} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Count */}
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-semibold">{templates.length} templates</span> — pick one and start building
      </p>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${templates.length} templates...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {FILTER_CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? categoryCounts.all || 0
            : cat.match.reduce((sum, m) => sum + (categoryCounts[m] || 0), 0);

          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeFilter === cat.id
                  ? 'text-white'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              style={activeFilter === cat.id ? { backgroundColor: '#7C3AED' } : undefined}
            >
              {cat.label}
              <span className={cn('ml-1.5 text-xs', activeFilter === cat.id ? 'text-white/70' : 'text-muted-foreground')}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {filtered.map((template) => (
            <div key={template.id} className="relative">
              {creatingFromTemplate === template.id && (
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
                onSelect={handleSelectTemplate}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {creatingFromTemplate && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50" />
      )}
    </div>
  );
}
