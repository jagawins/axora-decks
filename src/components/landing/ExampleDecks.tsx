import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Eye, Layers } from 'lucide-react';
import { fetchExampleDecks, type Template } from '@/lib/templates';
import { TemplatePreviewImage } from '@/components/templates/TemplatePreviewImage';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { EXAMPLE_DECK_META } from '@/data/example-decks.seed';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createDeckFromTemplate } from '@/lib/templates';
import { useToast } from '@/hooks/use-toast';

export default function ExampleDecks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [examples, setExamples] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchExampleDecks()
      .then(setExamples)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUseTemplate = useCallback(async (templateId: string) => {
    if (!user) { navigate('/auth'); return; }
    try {
      const { projectId } = await createDeckFromTemplate(templateId, user.id);
      toast({ title: 'Deck created!', description: 'A copy of the example deck is ready.' });
      navigate(`/editor/${projectId}`);
    } catch {
      toast({ title: 'Error', description: 'Failed to create deck.', variant: 'destructive' });
    }
  }, [user, navigate, toast]);

  // Use static metadata as fallback while loading
  const cards = loading
    ? EXAMPLE_DECK_META.map((m) => ({ ...m, id: m.slug, template: null as Template | null }))
    : EXAMPLE_DECK_META.map((m) => {
        const t = examples.find((e) => e.slug === m.slug);
        return { ...m, id: t?.id || m.slug, template: t || null };
      });

  return (
    <section className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
      <div className="container-wide relative">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            Real Output Examples
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            See what you can build
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse complete decks generated with AXORA — real slide layouts, real data visualizations, real executive quality.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div
              key={card.slug}
              className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5"
            >
              {/* Thumbnail */}
              <div className="relative w-full">
                {loading || !card.template?.preview_blocks?.length ? (
                  <Skeleton className="w-full h-[160px] rounded-none" />
                ) : (
                  <TemplatePreviewImage
                    templateId={card.id}
                    blocks={card.template.preview_blocks}
                    className="w-full h-[160px] rounded-none border-b border-border/50"
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="hero"
                    size="sm"
                    className="gap-1.5 shadow-lg"
                    onClick={() => card.template && setPreviewTemplate(card.template)}
                    disabled={!card.template}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Full Deck
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                  {card.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {card.industry}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {card.deckType}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                  <Layers className="h-3 w-3" />
                  {card.slideCount} slides
                </div>
              </div>

              {/* Disclaimer watermark */}
              <div className="px-4 pb-3">
                <p className="text-[9px] text-muted-foreground/50 italic">
                  Example deck with placeholder data
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link to="/templates">
            <Button variant="outline" size="lg" className="gap-2 group">
              Browse All Templates
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Preview Modal — reuse existing */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={(id) => {
          setPreviewTemplate(null);
          handleUseTemplate(id);
        }}
      />
    </section>
  );
}
