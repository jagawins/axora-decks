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

/* ── Slide layout types for variety ──────────────────────────────── */

type SlideLayout = 
  | { layout: 'title'; headline: string; subline: string; badge: string; bullets: string[] }
  | { layout: 'stats'; title: string; stats: { value: string; label: string; trend?: 'up' | 'down' }[] }
  | { layout: 'chart'; title: string; bars: { label: string; pct: number }[]; footnote?: string }
  | { layout: 'quote'; quote: string; author: string; role: string }
  | { layout: 'pillars'; title: string; pillars: { icon: string; title: string; desc: string }[] }
  | { layout: 'timeline'; title: string; events: { date: string; text: string }[] }
  | { layout: 'two_col'; title: string; left: { heading: string; items: string[] }; right: { heading: string; items: string[] } };

interface DeckSlides {
  gradient: string;
  accent: string;
  accentLight: string;
  slides: SlideLayout[];
  title: string;
  industry: string;
  deckType: string;
  slideCount: number;
}

const DECKS: Record<string, DeckSlides> = {
  'example-mediflow-investor-pitch': {
    gradient: 'linear-gradient(135deg, #0B1628 0%, #0e1f3d 50%, #163060 100%)',
    accent: '#38bdf8', accentLight: '#38bdf820',
    title: 'MediFlow AI — Investor Pitch',
    industry: 'Healthcare SaaS', deckType: 'Investor Pitch', slideCount: 10,
    slides: [
      { layout: 'title', headline: 'MediFlow AI', subline: 'AI-Powered Clinical Workflow Automation', badge: 'SERIES A · $15M RAISE', bullets: ['Real-time AI clinical notes', 'Smart prior authorization', 'Population health analytics'] },
      { layout: 'stats', title: 'Key Metrics', stats: [{ value: '$2.4M', label: 'ARR', trend: 'up' }, { value: '340%', label: 'YoY Growth', trend: 'up' }, { value: '127', label: 'Clinics' }, { value: '94%', label: 'Retention' }] },
      { layout: 'chart', title: 'Revenue Growth', bars: [{ label: 'Q1', pct: 25 }, { label: 'Q2', pct: 42 }, { label: 'Q3', pct: 68 }, { label: 'Q4', pct: 92 }], footnote: 'ARR trajectory ($M)' },
      { layout: 'pillars', title: 'Product Suite', pillars: [{ icon: '🧠', title: 'AI Scribe', desc: 'Ambient clinical documentation' }, { icon: '⚡', title: 'Smart Auth', desc: 'Prior auth in <2 min' }, { icon: '📊', title: 'Pop Health', desc: 'Risk stratification engine' }] },
      { layout: 'timeline', title: 'Milestones', events: [{ date: 'Q1 2024', text: 'FDA 510(k) cleared' }, { date: 'Q2 2024', text: '100+ clinics onboarded' }, { date: 'Q3 2024', text: 'Series A closed' }, { date: 'Q4 2024', text: 'EHR integrations live' }] },
    ],
  },
  'example-fintech-board-update': {
    gradient: 'linear-gradient(135deg, #1A1A2E 0%, #1e1e3a 50%, #2d2d5a 100%)',
    accent: '#a78bfa', accentLight: '#a78bfa20',
    title: 'FinTech Capital — Board Update',
    industry: 'Finance', deckType: 'Board Update', slideCount: 8,
    slides: [
      { layout: 'title', headline: 'FinTech Capital', subline: 'Q4 2024 Board Update', badge: 'CONFIDENTIAL · BOARD ONLY', bullets: ['Revenue exceeded target by 7%', '3 portfolio cos profitable', 'Risk exposure down 22%'] },
      { layout: 'stats', title: 'Portfolio Performance', stats: [{ value: '$34.2M', label: 'Revenue', trend: 'up' }, { value: '+18%', label: 'QoQ Growth', trend: 'up' }, { value: '2.3x', label: 'MOIC' }, { value: '12', label: 'Portfolio Cos' }] },
      { layout: 'chart', title: 'Fund Returns vs Benchmark', bars: [{ label: 'Fund I', pct: 88 }, { label: 'Fund II', pct: 72 }, { label: 'Fund III', pct: 55 }, { label: 'S&P 500', pct: 40 }], footnote: 'Net IRR comparison (%)' },
      { layout: 'quote', quote: 'The portfolio is performing ahead of plan with 3 companies now EBITDA positive.', author: 'Sarah Chen', role: 'Managing Partner' },
      { layout: 'two_col', title: 'Risk & Opportunity', left: { heading: 'Key Risks', items: ['Rate sensitivity in Fund II', 'Regulatory headwinds', 'LP concentration (top 3 = 45%)'] }, right: { heading: 'Opportunities', items: ['AI infra demand surging', '2 portfolio cos at IPO stage', 'New LP pipeline $200M+'] } },
    ],
  },
  'example-cloudsync-gtm-strategy': {
    gradient: 'linear-gradient(135deg, #0F172A 0%, #131d38 50%, #1e3055 100%)',
    accent: '#818cf8', accentLight: '#818cf820',
    title: 'CloudSync Enterprise — GTM Strategy',
    industry: 'B2B SaaS', deckType: 'Go-to-Market', slideCount: 12,
    slides: [
      { layout: 'title', headline: 'CloudSync Enterprise', subline: '2025 Go-to-Market Strategy', badge: 'GTM STRATEGY · B2B SAAS', bullets: ['200+ pre-built connectors', 'Zero-code pipeline builder', 'SOC 2 + HIPAA compliant'] },
      { layout: 'stats', title: 'Market Opportunity', stats: [{ value: '$12.4B', label: 'TAM' }, { value: '19%', label: 'CAGR', trend: 'up' }, { value: '45K', label: 'Target Accounts' }, { value: '10x', label: 'Faster Deploy' }] },
      { layout: 'pillars', title: 'GTM Motions', pillars: [{ icon: '🎯', title: 'PLG', desc: 'Self-serve free tier driving 3K signups/mo' }, { icon: '🤝', title: 'Enterprise', desc: 'Named account team for $100K+ deals' }, { icon: '🔗', title: 'Partners', desc: 'SI channel for regulated verticals' }] },
      { layout: 'chart', title: 'Pipeline by Segment', bars: [{ label: 'SMB', pct: 35 }, { label: 'Mid-Market', pct: 60 }, { label: 'Enterprise', pct: 85 }, { label: 'Strategic', pct: 48 }], footnote: 'Weighted pipeline ($M)' },
      { layout: 'timeline', title: 'Launch Timeline', events: [{ date: 'Jan 2025', text: 'PLG v2 + free tier launch' }, { date: 'Mar 2025', text: 'Enterprise sales team hired' }, { date: 'Jun 2025', text: 'Partner program GA' }, { date: 'Sep 2025', text: '$10M ARR target' }] },
    ],
  },
  'example-city-innovation-quarterly': {
    gradient: 'linear-gradient(135deg, #0A1A0F 0%, #0e2216 50%, #1a3d28 100%)',
    accent: '#34d399', accentLight: '#34d39920',
    title: 'City Innovation Lab — Q1 Review',
    industry: 'Government', deckType: 'Quarterly Review', slideCount: 9,
    slides: [
      { layout: 'title', headline: 'City Innovation Lab', subline: 'Q1 2025 Quarterly Review', badge: 'GOVERNMENT · Q1 REVIEW', bullets: ['311 AI chatbot launched', 'Permit processing: 21→7 days', '47 open datasets published'] },
      { layout: 'stats', title: 'Q1 Impact', stats: [{ value: '34%', label: 'Automated', trend: 'up' }, { value: '67%', label: 'Faster', trend: 'up' }, { value: '4.2/5', label: 'Satisfaction' }, { value: '$2.1M', label: 'Savings' }] },
      { layout: 'chart', title: 'Service Digitization', bars: [{ label: 'Permits', pct: 82 }, { label: '311 Calls', pct: 65 }, { label: 'Inspections', pct: 48 }, { label: 'Payments', pct: 91 }], footnote: '% fully digital (Q1 2025)' },
      { layout: 'two_col', title: 'Wins & Blockers', left: { heading: 'Q1 Wins', items: ['AI chatbot: 89% resolution rate', 'Open data portal launched', 'Mobile inspections app live'] }, right: { heading: 'Blockers', items: ['Legacy ERP migration delayed', 'Cybersecurity audit pending', 'Budget for Q3 TBD'] } },
      { layout: 'quote', quote: 'Digital services saved our residents an estimated 140,000 hours of wait time this quarter.', author: 'Director Martinez', role: 'Chief Innovation Officer' },
    ],
  },
};

/* ── Individual slide layout renderers ──────────────────────────── */

function TitleSlide({ slide, accent, accentLight }: { slide: Extract<SlideLayout, { layout: 'title' }>; accent: string; accentLight: string }) {
  return (
    <div className="h-full flex flex-col p-5 sm:p-6">
      <div className="mb-3">
        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full" style={{ color: accent, background: accentLight }}>{slide.badge}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight mb-1">{slide.headline}</h3>
      <p className="text-[11px] sm:text-xs text-white/50 mb-4">{slide.subline}</p>
      <div className="flex flex-col gap-1.5 mb-4">
        {slide.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: accent }} />
            <span className="text-[11px] text-white/65 leading-tight">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsSlide({ slide, accent }: { slide: Extract<SlideLayout, { layout: 'stats' }>; accent: string }) {
  return (
    <div className="h-full flex flex-col p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-5">{slide.title}</p>
      <div className="flex-1 grid grid-cols-2 gap-3 content-center">
        {slide.stats.map((s, i) => (
          <div key={i} className="rounded-xl px-3 py-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-lg sm:text-xl font-bold mb-0.5" style={{ color: accent }}>{s.value}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider font-medium">{s.label}</div>
            {s.trend && (
              <div className={`text-[9px] mt-1 font-semibold ${s.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.trend === 'up' ? '▲' : '▼'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartSlide({ slide, accent }: { slide: Extract<SlideLayout, { layout: 'chart' }>; accent: string }) {
  const maxPct = Math.max(...slide.bars.map(b => b.pct));
  return (
    <div className="h-full flex flex-col p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">{slide.title}</p>
      <div className="flex-1 flex items-end gap-3 pb-2">
        {slide.bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold" style={{ color: accent }}>{bar.pct}%</span>
            <div className="w-full rounded-t-md relative overflow-hidden" style={{ height: `${(bar.pct / maxPct) * 100}%`, minHeight: '12px', background: `${accent}25`, border: `1px solid ${accent}40` }}>
              <div className="absolute inset-0 rounded-t-md" style={{ background: `linear-gradient(to top, ${accent}60, ${accent}20)` }} />
            </div>
            <span className="text-[8px] text-white/40 font-medium">{bar.label}</span>
          </div>
        ))}
      </div>
      {slide.footnote && <p className="text-[8px] text-white/30 text-center mt-2 italic">{slide.footnote}</p>}
    </div>
  );
}

function QuoteSlide({ slide, accent }: { slide: Extract<SlideLayout, { layout: 'quote' }>; accent: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
      <div className="text-3xl mb-3" style={{ color: accent, opacity: 0.5 }}>"</div>
      <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic max-w-[90%] mb-4">{slide.quote}</p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: `${accent}40` }}>
          {slide.author.charAt(0)}
        </div>
        <div className="text-left">
          <p className="text-[10px] text-white/70 font-semibold">{slide.author}</p>
          <p className="text-[8px] text-white/40">{slide.role}</p>
        </div>
      </div>
    </div>
  );
}

function PillarsSlide({ slide, accent }: { slide: Extract<SlideLayout, { layout: 'pillars' }>; accent: string }) {
  return (
    <div className="h-full flex flex-col p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">{slide.title}</p>
      <div className="flex-1 grid grid-cols-3 gap-2.5 content-center">
        {slide.pillars.map((p, i) => (
          <div key={i} className="rounded-xl p-3 flex flex-col items-center text-center gap-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-xl">{p.icon}</span>
            <p className="text-[10px] font-bold text-white/80">{p.title}</p>
            <p className="text-[8px] text-white/40 leading-tight">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineSlide({ slide, accent }: { slide: Extract<SlideLayout, { layout: 'timeline' }>; accent: string }) {
  return (
    <div className="h-full flex flex-col p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-5">{slide.title}</p>
      <div className="flex-1 flex flex-col justify-center gap-3">
        {slide.events.map((ev, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
              {i < slide.events.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: `${accent}30` }} />}
            </div>
            <div className="pb-1">
              <p className="text-[9px] font-bold" style={{ color: accent }}>{ev.date}</p>
              <p className="text-[10px] text-white/60 leading-tight">{ev.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TwoColSlide({ slide, accent }: { slide: Extract<SlideLayout, { layout: 'two_col' }>; accent: string }) {
  return (
    <div className="h-full flex flex-col p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">{slide.title}</p>
      <div className="flex-1 grid grid-cols-2 gap-3">
        {[slide.left, slide.right].map((col, ci) => (
          <div key={ci} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: accent }}>{col.heading}</p>
            <div className="flex flex-col gap-1.5">
              {col.items.map((item, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="w-1 h-1 rounded-full mt-1 shrink-0" style={{ background: accent }} />
                  <span className="text-[9px] text-white/55 leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideRenderer({ slide, accent, accentLight }: { slide: SlideLayout; accent: string; accentLight: string }) {
  switch (slide.layout) {
    case 'title': return <TitleSlide slide={slide} accent={accent} accentLight={accentLight} />;
    case 'stats': return <StatsSlide slide={slide} accent={accent} />;
    case 'chart': return <ChartSlide slide={slide} accent={accent} />;
    case 'quote': return <QuoteSlide slide={slide} accent={accent} />;
    case 'pillars': return <PillarsSlide slide={slide} accent={accent} />;
    case 'timeline': return <TimelineSlide slide={slide} accent={accent} />;
    case 'two_col': return <TwoColSlide slide={slide} accent={accent} />;
  }
}

/** Auto-cycling slideshow card that looks like a real presentation */
function SlideCard({ slug, isHovered }: { slug: string; isHovered: boolean }) {
  const deck = DECKS[slug];
  if (!deck) return null;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideCount = deck.slides.length;

  // Auto-advance every 4s, pause on hover
  useEffect(() => {
    if (isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(prev => (prev + 1) % slideCount);
        setTransitioning(false);
      }, 300);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isHovered, slideCount]);

  // Stagger start times per card
  useEffect(() => {
    const staggerMs = Object.keys(DECKS).indexOf(slug) * 1200;
    const timer = setTimeout(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(1 % slideCount);
        setTransitioning(false);
      }, 300);
    }, staggerMs + 2000);
    return () => clearTimeout(timer);
  }, [slug, slideCount]);

  return (
    <div className="w-full h-full relative overflow-hidden select-none" style={{ background: deck.gradient }}>
      {/* Subtle dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${slug}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${slug})`} />
      </svg>

      {/* Decorative accent glow */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[60px] transition-opacity duration-700"
        style={{ background: deck.accent, opacity: isHovered ? 0.18 : 0.06 }}
      />

      {/* Slide content with crossfade */}
      <div
        className="relative z-10 h-full transition-all duration-300 ease-in-out"
        style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(8px)' : 'translateY(0)' }}
      >
        <SlideRenderer slide={deck.slides[currentSlide]} accent={deck.accent} accentLight={deck.accentLight} />
      </div>

      {/* Slide dots indicator — bottom-right */}
      <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1">
        {deck.slides.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentSlide ? '14px' : '4px',
              height: '4px',
              background: i === currentSlide ? deck.accent : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${deck.accent}60, transparent)`,
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
            Browse complete decks generated with AXIVA — real slide layouts, real data visualizations, real executive quality.
          </p>
        </div>

        {/* Cards grid — YouExec 16:9 slide cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto">
          {cards.map((card) => {
            const isHovered = hoveredCard === card.slug;
            const deckData = DECKS[card.slug];

            return (
              <div
                key={card.slug}
                className="ex-deck-shimmer group relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  aspectRatio: '16 / 10',
                  transition: 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
                  transform: isHovered ? 'scale(1.03) translateY(-4px)' : 'scale(1) translateY(0)',
                  boxShadow: isHovered
                    ? `0 24px 64px -16px ${deckData?.accent || '#000'}35, 0 12px 32px -8px rgba(0,0,0,0.25)`
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
