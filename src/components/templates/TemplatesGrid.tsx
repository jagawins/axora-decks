import { useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, LayoutTemplate, Search, X, SlidersHorizontal, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Template, createDeckFromTemplate } from '@/lib/templates';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { SeedTemplatesButton } from './SeedTemplatesButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DECK_TYPE_FILTERS,
  INDUSTRY_FILTERS,
  AUDIENCE_FILTERS,
  SORT_OPTIONS,
  getTemplateTaxonomy,
  type SortOption,
} from '@/lib/template-taxonomy';

interface TemplatesGridProps {
  templates: Template[];
  loading: boolean;
  onRefresh?: () => void;
}

export function TemplatesGrid({ templates, loading, onRefresh }: TemplatesGridProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Read filters from URL
  const activeType = searchParams.get('type') || 'all';
  const activeIndustry = searchParams.get('industry') || 'all';
  const activeAudience = searchParams.get('audience') || 'all';
  const activeSort = (searchParams.get('sort') || 'popular') as SortOption;
  const searchQuery = searchParams.get('q') || '';

  const updateParam = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === 'all' || value === '' || value === 'popular') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setSearchQuery = useCallback((q: string) => updateParam('q', q), [updateParam]);

  // Active filter chips
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (activeType !== 'all') {
      const f = DECK_TYPE_FILTERS.find((d) => d.id === activeType);
      if (f) chips.push({ key: 'type', label: f.label });
    }
    if (activeIndustry !== 'all') {
      const f = INDUSTRY_FILTERS.find((d) => d.id === activeIndustry);
      if (f) chips.push({ key: 'industry', label: f.label });
    }
    if (activeAudience !== 'all') {
      const f = AUDIENCE_FILTERS.find((d) => d.id === activeAudience);
      if (f) chips.push({ key: 'audience', label: f.label });
    }
    return chips;
  }, [activeType, activeIndustry, activeAudience]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...templates];

    // Deck type filter (by category)
    if (activeType !== 'all') {
      list = list.filter((t) => t.category === activeType);
    }

    // Industry filter
    if (activeIndustry !== 'all') {
      list = list.filter((t) => {
        const tax = getTemplateTaxonomy(t.slug);
        return tax.industry.includes(activeIndustry as any);
      });
    }

    // Audience filter
    if (activeAudience !== 'all') {
      list = list.filter((t) => {
        const tax = getTemplateTaxonomy(t.slug);
        return tax.audience.includes(activeAudience as any);
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    if (activeSort === 'popular') {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.title.localeCompare(b.title));
    } else if (activeSort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (activeSort === 'az') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [templates, activeType, activeIndustry, activeAudience, searchQuery, activeSort]);

  const handleSelectTemplate = async (templateId: string) => {
    if (!user) { navigate('/auth'); return; }
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

  const handlePreview = useCallback((id: string) => {
    const t = templates.find((t) => t.id === id);
    if (t) {
      setPreviewTemplate(t);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('preview', t.slug);
        return next;
      }, { replace: true });
    }
  }, [templates, setSearchParams]);

  const closePreview = useCallback(() => {
    setPreviewTemplate(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('preview');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Open preview from URL on mount
  useMemo(() => {
    const previewSlug = searchParams.get('preview');
    if (previewSlug && !previewTemplate && templates.length > 0) {
      const t = templates.find((t) => t.slug === previewSlug);
      if (t) setPreviewTemplate(t);
    }
  }, [searchParams, templates]);

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
    <div className="space-y-5">
      {/* Top row: Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${templates.length} templates...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={activeSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deck Type pills */}
      <div className="flex flex-wrap gap-2">
        {DECK_TYPE_FILTERS.map((cat) => {
          const count = cat.id === 'all'
            ? templates.length
            : templates.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => updateParam('type', cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeType === cat.id
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {cat.label}
              <span className={cn('ml-1.5 text-xs', activeType === cat.id ? 'opacity-70' : 'text-muted-foreground')}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary filters: Industry + Audience */}
      <div className="flex flex-wrap gap-3">
        <select
          value={activeIndustry}
          onChange={(e) => updateParam('industry', e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {INDUSTRY_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
        <select
          value={activeAudience}
          onChange={(e) => updateParam('audience', e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {AUDIENCE_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => updateParam(chip.key, 'all')}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <button
            onClick={() => {
              setSearchParams(new URLSearchParams(), { replace: true });
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-semibold">{filtered.length}</span> of {templates.length} templates
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <LayoutTemplate className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No templates match your filters</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Try adjusting your filters or request a custom template.
          </p>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="mailto:templates@axiva.ai?subject=Template%20Request">
              <Mail className="h-4 w-4" />
              Request This Template
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
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
                previewBlocks={template.preview_blocks}
                onSelect={handleSelectTemplate}
                onPreview={handlePreview}
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={closePreview}
        onUseTemplate={(id) => {
          closePreview();
          handleSelectTemplate(id);
        }}
      />

      {/* Loading overlay */}
      {creatingFromTemplate && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50" />
      )}
    </div>
  );
}
