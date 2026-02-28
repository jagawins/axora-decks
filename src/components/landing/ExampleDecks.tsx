import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Layers, TrendingUp, BarChart3, Target, Building2 } from 'lucide-react';
import { fetchExampleDecks, type Template, createDeckFromTemplate } from '@/lib/templates';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { EXAMPLE_DECK_META } from '@/data/example-decks.seed';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/* ── Static themed preview cards ────────────────────────────────── */

const DECK_PREVIEWS: Record<string, {
  gradient: string;
  accentColor: string;
  icon: React.ReactNode;
  stats: Array<{ value: string; label: string }>;
  headline: string;
  subline: string;
}> = {
  'example-mediflow-investor-pitch': {
    gradient: 'from-[#0B1628] via-[#0e1f3d] to-[#122a52]',
    accentColor: 'text-sky-400',
    icon: <TrendingUp className="h-5 w-5 text-sky-400" />,
    stats: [
      { value: '$2.4M', label: 'ARR' },
      { value: '340%', label: 'YoY' },
      { value: '127', label: 'Clinics' },
      { value: '94%', label: 'Retention' },
    ],
    headline: 'MediFlow AI',
    subline: 'Series A · $15M Raise',
  },
  'example-fintech-board-update': {
    gradient: 'from-[#1A1A2E] via-[#1e1e3a] to-[#252550]',
    accentColor: 'text-violet-400',
    icon: <BarChart3 className="h-5 w-5 text-violet-400" />,
    stats: [
      { value: '$34.2M', label: 'Revenue' },
      { value: '+18%', label: 'QoQ' },
      { value: '2.3x', label: 'MOIC' },
      { value: '12', label: 'Portfolio' },
    ],
    headline: 'FinTech Capital',
    subline: 'Q4 Board Update',
  },
  'example-cloudsync-gtm-strategy': {
    gradient: 'from-[#0F172A] via-[#131d38] to-[#1a2847]',
    accentColor: 'text-indigo-400',
    icon: <Target className="h-5 w-5 text-indigo-400" />,
    stats: [
      { value: '$12.4B', label: 'Market' },
      { value: '19%', label: 'CAGR' },
      { value: '45K', label: 'Targets' },
      { value: '10x', label: 'Faster' },
    ],
    headline: 'CloudSync',
    subline: '2025 GTM Strategy',
  },
  'example-city-innovation-quarterly': {
    gradient: 'from-[#0A1A0F] via-[#0e2216] to-[#142d1e]',
    accentColor: 'text-emerald-400',
    icon: <Building2 className="h-5 w-5 text-emerald-400" />,
    stats: [
      { value: '311', label: 'AI Chatbot' },
      { value: '34%', label: 'Faster' },
      { value: '47', label: 'Datasets' },
      { value: '12K', label: 'Monthly' },
    ],
    headline: 'City Innovation Lab',
    subline: 'Q1 Quarterly Review',
  },
};

function DeckPreviewCard({ slug }: { slug: string }) {
  const preview = DECK_PREVIEWS[slug];
  if (!preview) return <div className="w-full h-full bg-muted/30 rounded-lg" />;

  return (
    <div className={`w-full h-full bg-gradient-to-br ${preview.gradient} rounded-t-xl p-4 flex flex-col justify-between relative overflow-hidden`}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-1">
          {preview.icon}
          <span className={`text-[10px] font-medium ${preview.accentColor} uppercase tracking-wider`}>
            {preview.subline}
          </span>
        </div>
        <h4 className="text-sm font-bold text-white/90 leading-tight">
          {preview.headline}
        </h4>
      </div>

      {/* Stats grid */}
      <div className="relative z-10 grid grid-cols-4 gap-1.5 mt-auto">
        {preview.stats.map((stat, i) => (
          <div key={i} className="bg-white/[0.06] backdrop-blur-sm rounded-md px-1.5 py-1.5 text-center border border-white/[0.06]">
            <div className={`text-xs font-bold ${preview.accentColor}`}>{stat.value}</div>
            <div className="text-[8px] text-white/40 leading-tight mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Decorative accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${preview.accentColor.replace('text-', 'via-')}/30 to-transparent`} />
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */

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

  const cards = EXAMPLE_DECK_META.map((m) => {
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
              className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-accent/5 hover:scale-[1.02] hover:-translate-y-0.5 cursor-pointer"
              onClick={() => card.template && setPreviewTemplate(card.template)}
            >
              {/* Themed preview card */}
              <div className="relative w-full h-[180px]">
                <DeckPreviewCard slug={card.slug} />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-t-xl">
                  <Button
                    variant="hero"
                    size="sm"
                    className="gap-1.5 shadow-lg"
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1">
                  <Layers className="h-3 w-3" />
                  {card.slideCount} slides
                </div>
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
