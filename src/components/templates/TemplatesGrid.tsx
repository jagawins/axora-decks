import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LayoutTemplate, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Template, createDeckFromTemplate } from '@/lib/templates';
import { TemplateCard } from './TemplateCard';
import { TemplateCategoryTabs } from './TemplateCategoryTabs';
import { SeedTemplatesButton } from './SeedTemplatesButton';

interface TemplatesGridProps {
  templates: Template[];
  loading: boolean;
  onRefresh?: () => void;
}

export function TemplatesGrid({ templates, loading, onRefresh }: TemplatesGridProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);

  // Calculate template counts by category
  const templateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Featured templates
  const featuredTemplates = useMemo(() => {
    return templates.filter((t) => t.is_featured);
  }, [templates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return templates.filter((t) => !t.is_featured);
    }
    return templates.filter((t) => t.category === activeCategory && !t.is_featured);
  }, [templates, activeCategory]);

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
        description: 'Your deck has been created from the template.',
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
    <div className="space-y-8">
      {/* Category Tabs */}
      <TemplateCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        templateCounts={templateCounts}
      />

      {/* Featured Section */}
      {activeCategory === 'all' && featuredTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <h2 className="text-lg font-semibold">Featured Templates</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredTemplates.map((template) => (
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
        </div>
      )}

      {/* All Templates Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {activeCategory === 'all' ? 'All Templates' : activeCategory}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
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
          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No templates in this category.
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {creatingFromTemplate && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50" />
      )}
    </div>
  );
}
