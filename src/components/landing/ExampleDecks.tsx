import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Layers, TrendingUp, BarChart3, Target, Building2, Play } from 'lucide-react';
import { fetchExampleDecks, type Template, createDeckFromTemplate } from '@/lib/templates';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { EXAMPLE_DECK_META } from '@/data/example-decks.seed';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/* ── Static themed preview cards ────────────────────────────────── */

const DECK_PREVIEWS: Record<string, {
  gradient: string;
  accentColor: string;
  accentHex: string;
  icon: React.ReactNode;
  stats: Array<{ value: string; label: string }>;
  headline: string;
  subline: string;
}> = {
  'example-mediflow-investor-pitch': {
    gradient: 'from-[#0B1628] via-[#0e1f3d] to-[#122a52]',
    accentColor: 'text-sky-400',
    accentHex: '#38bdf8',
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
    accentHex: '#a78bfa',
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
    accentHex: '#818cf8',
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
    accentHex: '#34d399',
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

/* ── Animated shimmer CSS injected once ─────────────────────────── */

const SHIMMER_STYLES = `
@keyframes deckShimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}
@keyframes deckPulseGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
@keyframes deckStatReveal {
  0% { opacity: 0; transform: translateY(8px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes deckBorderGlow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}
@keyframes deckFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.deck-card-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 100%);
  animation: deckShimmer 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 5;
}
.deck-card-shimmer:nth-child(2)::after { animation-delay: 0.8s; }
.deck-card-shimmer:nth-child(3)::after { animation-delay: 1.6s; }
.deck-card-shimmer:nth-child(4)::after { animation-delay: 2.4s; }
`;

function DeckPreviewCard({ slug, isHovered }: { slug: string; isHovered: boolean }) {
  const preview = DECK_PREVIEWS[slug];
  if (!preview) return <div className="w-full h-full bg-muted/30 rounded-lg" />;

  return (
    <div className={`w-full h-full bg-gradient-to-br ${preview.gradient} rounded-t-2xl p-5 flex flex-col justify-between relative overflow-hidden`}>
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Radial glow on hover */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          opacity: isHovered ? 0.15 : 0.05,
          background: `radial-gradient(ellipse at 30% 20%, ${preview.accentHex}40 0%, transparent 70%)`,
        }}
      />

      {/* Pulsing accent orb */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{
          background: preview.accentHex,
          opacity: isHovered ? 0.12 : 0.04,
          animation: 'deckPulseGlow 3s ease-in-out infinite',
          transition: 'opacity 0.5s ease',
        }}
      />
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-md bg-white/[0.06] backdrop-blur-sm">
            {preview.icon}
          </div>
          <span className={`text-[10px] font-semibold ${preview.accentColor} uppercase tracking-[0.15em]`}>
            {preview.subline}
          </span>
        </div>
        <h4 className="text-base font-bold text-white/95 leading-tight tracking-tight">
          {preview.headline}
        </h4>
      </div>

      {/* Stats grid — animated reveal on hover */}
      <div className="relative z-10 grid grid-cols-4 gap-2 mt-auto">
        {preview.stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white/[0.07] backdrop-blur-sm rounded-lg px-2 py-2 text-center border border-white/[0.08] transition-all duration-300"
            style={{
              animation: isHovered ? `deckStatReveal 0.4s ease-out ${i * 0.08}s both` : 'none',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
              borderColor: isHovered ? `${preview.accentHex}25` : 'rgba(255,255,255,0.08)',
            }}
          >
            <div className={`text-sm font-bold ${preview.accentColor}`}>{stat.value}</div>
            <div className="text-[9px] text-white/40 leading-tight mt-0.5 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom accent glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${preview.accentHex}60, transparent)`,
          opacity: isHovered ? 1 : 0.3,
          animation: isHovered ? 'deckBorderGlow 2s ease-in-out infinite' : 'none',
        }}
      />
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const stylesRef = useRef(false);

  // Inject shimmer keyframes once
  useEffect(() => {
    if (stylesRef.current) return;
    stylesRef.current = true;
    const style = document.createElement('style');
    style.textContent = SHIMMER_STYLES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

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
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
      <div className="container-wide relative">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent font-semibold text-sm uppercase tracking-[0.2em] mb-3">
            Real Output Examples
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            See what you can build
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse complete decks generated with AXORA — real slide layouts, real data visualizations, real executive quality.
          </p>
        </div>

        {/* Cards grid — cinematic hover with shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const isHovered = hoveredCard === card.slug;
            const preview = DECK_PREVIEWS[card.slug];
            
            return (
              <div
                key={card.slug}
                className="deck-card-shimmer group relative flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden cursor-pointer"
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.3s ease',
                  transform: isHovered ? 'scale(1.04) translateY(-6px)' : 'scale(1) translateY(0)',
                  boxShadow: isHovered
                    ? `0 20px 60px -15px ${preview?.accentHex || '#000'}30, 0 8px 24px -8px rgba(0,0,0,0.3)`
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  borderColor: isHovered ? `${preview?.accentHex || '#888'}40` : undefined,
                }}
                onMouseEnter={() => setHoveredCard(card.slug)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => card.template && setPreviewTemplate(card.template)}
              >
                {/* Themed preview card — larger */}
                <div className="relative w-full h-[200px]">
                  <DeckPreviewCard slug={card.slug} isHovered={isHovered} />

                  {/* Hover overlay — centered play-style button */}
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-t-2xl transition-all duration-400 z-10"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      background: isHovered ? 'rgba(0,0,0,0.4)' : 'transparent',
                      backdropFilter: isHovered ? 'blur(2px)' : 'none',
                    }}
                  >
                    <Button
                      size="sm"
                      className="gap-2 rounded-full px-6 shadow-2xl bg-white/95 hover:bg-white text-gray-900 font-semibold text-xs"
                      style={{
                        transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(8px)',
                        transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease',
                        opacity: isHovered ? 1 : 0,
                      }}
                      disabled={!card.template}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Preview Deck
                    </Button>
                  </div>
                </div>

                {/* Content — clean bottom section */}
                <div className="p-4 flex-1 flex flex-col gap-2 border-t border-border/30">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-accent transition-colors duration-300">
                    {card.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full border-border/50 text-muted-foreground">
                      {card.industry}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full border-border/50 text-muted-foreground">
                      {card.deckType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1">
                    <Layers className="h-3 w-3" />
                    {card.slideCount} slides
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/templates">
            <Button variant="outline" size="lg" className="gap-2 group rounded-full px-8">
              Browse All 60+ Templates
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Preview Modal */}
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
