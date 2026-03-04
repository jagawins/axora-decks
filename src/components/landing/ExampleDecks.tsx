import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Play, Layers } from 'lucide-react';
import { fetchExampleDecks, type Template, createDeckFromTemplate } from '@/lib/templates';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { EXAMPLE_DECK_META } from '@/data/example-decks.seed';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/* ── YouExec-style slide preview cards ──────────────────────────── */
/* Instead of rendering actual blocks at tiny scales (which looks broken),
   we render hand-crafted slide representations that look like real
   presentation slides — like YouExec's screenshot thumbnails. */

interface SlidePreviewData {
  gradient: string;
  accent: string;
  accentLight: string;
  headline: string;
  subline: string;
  badge: string;
  stats: { value: string; label: string }[];
  bullets?: string[];
}

const SLIDES: Record<string, SlidePreviewData> = {
  'example-mediflow-investor-pitch': {
    gradient: 'linear-gradient(135deg, #0B1628 0%, #0e1f3d 50%, #163060 100%)',
    accent: '#38bdf8',
    accentLight: '#38bdf820',
    headline: 'MediFlow AI',
    subline: 'AI-Powered Clinical Workflow Automation',
    badge: 'SERIES A · $15M RAISE',
    stats: [
      { value: '$2.4M', label: 'ARR' },
      { value: '340%', label: 'YoY Growth' },
      { value: '127', label: 'Clinics' },
      { value: '94%', label: 'Retention' },
    ],
    bullets: ['Real-time AI clinical notes', 'Smart prior authorization', 'Population health analytics'],
  },
  'example-fintech-board-update': {
    gradient: 'linear-gradient(135deg, #1A1A2E 0%, #1e1e3a 50%, #2d2d5a 100%)',
    accent: '#a78bfa',
    accentLight: '#a78bfa20',
    headline: 'FinTech Capital',
    subline: 'Q4 2024 Board Update',
    badge: 'CONFIDENTIAL · BOARD ONLY',
    stats: [
      { value: '$34.2M', label: 'Revenue' },
      { value: '+18%', label: 'QoQ Growth' },
      { value: '2.3x', label: 'MOIC' },
      { value: '12', label: 'Portfolio' },
    ],
    bullets: ['Revenue exceeded target by 7%', '3 portfolio cos profitable', 'Risk exposure down 22%'],
  },
  'example-cloudsync-gtm-strategy': {
    gradient: 'linear-gradient(135deg, #0F172A 0%, #131d38 50%, #1e3055 100%)',
    accent: '#818cf8',
    accentLight: '#818cf820',
    headline: 'CloudSync Enterprise',
    subline: '2025 Go-to-Market Strategy',
    badge: 'GTM STRATEGY · B2B SAAS',
    stats: [
      { value: '$12.4B', label: 'Market' },
      { value: '19%', label: 'CAGR' },
      { value: '45K', label: 'Targets' },
      { value: '10x', label: 'Faster' },
    ],
    bullets: ['200+ pre-built connectors', 'Zero-code pipeline builder', 'SOC 2 + HIPAA compliant'],
  },
  'example-city-innovation-quarterly': {
    gradient: 'linear-gradient(135deg, #0A1A0F 0%, #0e2216 50%, #1a3d28 100%)',
    accent: '#34d399',
    accentLight: '#34d39920',
    headline: 'City Innovation Lab',
    subline: 'Q1 2025 Quarterly Review',
    badge: 'GOVERNMENT · Q1 REVIEW',
    stats: [
      { value: '34%', label: 'Automated' },
      { value: '67%', label: 'Faster' },
      { value: '4.2/5', label: 'Satisfaction' },
      { value: '$2.1M', label: 'Savings' },
    ],
    bullets: ['311 AI chatbot launched', 'Permit processing: 21→7 days', '47 open datasets published'],
  },
};

/** Hand-crafted slide that looks like a real presentation screenshot */
function SlideCard({ slug, isHovered }: { slug: string; isHovered: boolean }) {
  const s = SLIDES[slug];
  if (!s) return null;

  return (
    <div
      className="w-full h-full relative overflow-hidden select-none"
      style={{ background: s.gradient }}
    >
      {/* Subtle dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${slug}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${slug})`} />
      </svg>

      {/* Decorative accent circle */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[60px] transition-opacity duration-700"
        style={{
          background: s.accent,
          opacity: isHovered ? 0.18 : 0.06,
        }}
      />

      {/* Content layout — mimics a real slide */}
      <div className="relative z-10 h-full flex flex-col p-5 sm:p-6">
        {/* Badge */}
        <div className="mb-3">
          <span
            className="inline-block text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
            style={{ color: s.accent, background: s.accentLight }}
          >
            {s.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight mb-1">
          {s.headline}
        </h3>
        <p className="text-[11px] sm:text-xs text-white/50 mb-4">{s.subline}</p>

        {/* Bullet points — like a real slide */}
        {s.bullets && (
          <div className="flex flex-col gap-1.5 mb-4">
            {s.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                  style={{ background: s.accent }}
                />
                <span className="text-[11px] text-white/65 leading-tight">{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* Spacer pushes stats to bottom */}
        <div className="flex-1" />

        {/* Stats row — bottom of slide like a real KPI bar */}
        <div className="grid grid-cols-4 gap-1.5">
          {s.stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-lg px-2 py-2 text-center transition-all duration-300"
              style={{
                background: isHovered ? `${s.accent}15` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isHovered ? s.accent + '30' : 'rgba(255,255,255,0.06)'}`,
                transform: isHovered ? 'translateY(-2px)' : 'none',
                transitionDelay: `${i * 50}ms`,
              }}
            >
              <div className="text-xs sm:text-sm font-bold" style={{ color: s.accent }}>
                {stat.value}
              </div>
              <div className="text-[8px] text-white/40 mt-0.5 font-medium leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${s.accent}60, transparent)`,
          opacity: isHovered ? 1 : 0.25,
        }}
      />
    </div>
  );
}

/* ── Shimmer animation CSS ──────────────────────────────────────── */

const STYLES = `
@keyframes exDeckShimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(250%) skewX(-12deg); }
}
.ex-deck-shimmer::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 60%, transparent 100%);
  animation: exDeckShimmer 5s ease-in-out infinite;
  pointer-events: none;
  z-index: 15;
  border-radius: inherit;
}
.ex-deck-shimmer:nth-child(2)::before { animation-delay: 1s; }
.ex-deck-shimmer:nth-child(3)::before { animation-delay: 2s; }
.ex-deck-shimmer:nth-child(4)::before { animation-delay: 3s; }
`;

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

  // Inject keyframes once
  useEffect(() => {
    if (stylesRef.current) return;
    stylesRef.current = true;
    const el = document.createElement('style');
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent" />
      <div className="container-wide relative">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent font-semibold text-sm uppercase tracking-[0.2em] mb-3">
            Real Output Examples
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            See what you can build
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Browse complete decks generated with AXORA — real slide layouts, real data visualizations, real executive quality.
          </p>
        </div>

        {/* Cards grid — YouExec 16:9 slide cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
          {cards.map((card) => {
            const isHovered = hoveredCard === card.slug;
            const slideData = SLIDES[card.slug];

            return (
              <div
                key={card.slug}
                className="ex-deck-shimmer group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  aspectRatio: '16 / 10',
                  transition: 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: isHovered ? 'scale(1.03) translateY(-4px)' : 'scale(1) translateY(0)',
                  boxShadow: isHovered
                    ? `0 24px 64px -16px ${slideData?.accent || '#000'}35, 0 12px 32px -8px rgba(0,0,0,0.25)`
                    : '0 4px 16px rgba(0,0,0,0.15)',
                }}
                onMouseEnter={() => setHoveredCard(card.slug)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => card.template && setPreviewTemplate(card.template)}
              >
                {/* Full-bleed slide preview */}
                <SlideCard slug={card.slug} isHovered={isHovered} />

                {/* Hover overlay with preview button */}
                <div
                  className="absolute inset-0 flex items-center justify-center z-20 transition-all duration-300"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    background: isHovered ? 'rgba(0,0,0,0.35)' : 'transparent',
                    backdropFilter: isHovered ? 'blur(2px)' : 'none',
                    pointerEvents: isHovered ? 'auto' : 'none',
                  }}
                >
                  <Button
                    size="default"
                    className="gap-2.5 rounded-full px-8 py-2.5 shadow-2xl bg-white hover:bg-white text-gray-900 font-semibold text-sm"
                    style={{
                      transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(12px)',
                      transition: 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease',
                      opacity: isHovered ? 1 : 0,
                    }}
                    disabled={!card.template}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Preview Full Deck
                  </Button>
                </div>

                {/* Bottom info bar — overlaid on slide like YouExec */}
                <div
                  className="absolute bottom-0 left-0 right-0 z-10 px-5 py-3 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
                    opacity: isHovered ? 0 : 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-sm font-semibold tracking-tight">{card.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/50 text-[11px]">{card.industry}</span>
                        <span className="text-white/30">·</span>
                        <span className="text-white/50 text-[11px]">{card.deckType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-white/40 text-xs">
                      <Layers className="h-3.5 w-3.5" />
                      {card.slideCount}
                    </div>
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
