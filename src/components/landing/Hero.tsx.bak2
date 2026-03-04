import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Animated typing prompt ─────────────────────────────────── */

const PROMPTS = [
  'Series A pitch deck for a healthcare AI startup…',
  'Q4 board update for our fintech portfolio…',
  'GTM strategy for enterprise data platform…',
  'Annual innovation review for city government…',
  'Product roadmap for B2B SaaS launch…',
];

function useTypingAnimation(prompts: string[], speed = 45, pause = 2200) {
  const [displayed, setDisplayed] = useState('');
  const [promptIdx, setPromptIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = prompts[promptIdx];

    if (!isDeleting && charIdx < current.length) {
      const timer = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, speed);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && charIdx === current.length) {
      const timer = setTimeout(() => setIsDeleting(true), pause);
      return () => clearTimeout(timer);
    }

    if (isDeleting && charIdx > 0) {
      const timer = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, speed / 2);
      return () => clearTimeout(timer);
    }

    if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPromptIdx((promptIdx + 1) % prompts.length);
    }
  }, [charIdx, isDeleting, promptIdx, prompts, speed, pause]);

  return displayed;
}

/* ── Floating slide cards ───────────────────────────────────── */

const SLIDE_CARDS = [
  { title: 'Revenue Forecast', color: '#38bdf8', stat: '$48M', sub: 'ARR by 2027' },
  { title: 'Market Analysis', color: '#a78bfa', stat: '23%', sub: 'CAGR Growth' },
  { title: 'Team Structure', color: '#34d399', stat: '4', sub: 'Key Hires' },
  { title: 'Go-to-Market', color: '#f97316', stat: '3x', sub: 'Pipeline' },
];

function FloatingCards() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {SLIDE_CARDS.map((card, i) => {
        const positions = [
          { top: '8%', right: '2%', rotate: '6deg', delay: '0s' },
          { top: '55%', right: '-2%', rotate: '-4deg', delay: '1s' },
          { top: '15%', left: '0%', rotate: '-8deg', delay: '0.5s' },
          { top: '60%', left: '-1%', rotate: '5deg', delay: '1.5s' },
        ];
        const pos = positions[i];

        return (
          <div
            key={i}
            className="absolute hidden lg:block w-[140px]"
            style={{
              top: pos.top,
              right: 'right' in pos ? pos.right : undefined,
              left: 'left' in pos ? pos.left : undefined,
              animation: `heroCardFloat 6s ease-in-out infinite`,
              animationDelay: pos.delay,
            }}
          >
            <div
              className="rounded-xl p-3 backdrop-blur-md border border-white/10 shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${card.color}15, ${card.color}08)`,
                transform: `rotate(${pos.rotate})`,
              }}
            >
              <div className="text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: card.color }}>
                {card.title}
              </div>
              <div className="text-lg font-bold text-white/90">{card.stat}</div>
              <div className="text-[10px] text-white/40">{card.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Styles injected once ───────────────────────────────────── */

const HERO_STYLES = `
@keyframes heroCardFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes heroGradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes heroPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}
@keyframes heroSlideIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-stagger-1 { animation: heroSlideIn 0.7s ease-out 0.1s both; }
.hero-stagger-2 { animation: heroSlideIn 0.7s ease-out 0.25s both; }
.hero-stagger-3 { animation: heroSlideIn 0.7s ease-out 0.4s both; }
.hero-stagger-4 { animation: heroSlideIn 0.7s ease-out 0.55s both; }
.hero-stagger-5 { animation: heroSlideIn 0.7s ease-out 0.7s both; }
.hero-stagger-6 { animation: heroSlideIn 0.7s ease-out 0.85s both; }
.hero-gradient-text {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #a78bfa 100%);
  background-size: 200% 200%;
  animation: heroGradientShift 4s ease-in-out infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-prompt-box {
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
}
.hero-prompt-box:hover {
  border-color: rgba(255,255,255,0.15);
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%);
}
`;

/* ── Main Hero ──────────────────────────────────────────────── */

const Hero = () => {
  const typed = useTypingAnimation(PROMPTS);
  const stylesRef = useRef(false);

  useEffect(() => {
    if (stylesRef.current) return;
    stylesRef.current = true;
    const el = document.createElement('style');
    el.textContent = HERO_STYLES;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      {/* Deep background */}
      <div className="absolute inset-0">
        <div
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[150px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(56,189,248,0.12) 0%, rgba(129,140,248,0.06) 50%, transparent 70%)',
            animation: 'heroPulse 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[5%] left-[15%] w-[500px] h-[400px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(167,139,250,0.08) 0%, transparent 70%)',
            animation: 'heroPulse 10s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute top-[30%] right-[10%] w-[400px] h-[350px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)',
            animation: 'heroPulse 12s ease-in-out infinite',
            animationDelay: '4s',
          }}
        />

        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      {/* Floating slide cards */}
      <FloatingCards />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="hero-stagger-1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-foreground/80">AI Presentation Generator</span>
          <span className="h-4 w-px bg-white/10" />
          <span className="text-accent text-xs font-semibold">60+ Templates</span>
        </div>

        {/* Headline */}
        <h1 className="hero-stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          Describe your idea.{' '}
          <br className="hidden sm:block" />
          Get a{' '}
          <span className="hero-gradient-text">board-ready deck</span>
          .
        </h1>

        {/* Subheadline */}
        <p className="hero-stagger-3 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          AXIVA turns a single prompt into polished presentations with data visualizations,
          executive layouts, and PowerPoint export — in under 2 minutes.
        </p>

        {/* Interactive prompt box */}
        <div className="hero-stagger-4 max-w-2xl mx-auto mb-8">
          <Link to="/create" className="block">
            <div className="hero-prompt-box rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Describe your presentation...</span>
              </div>
              <div className="text-left text-foreground/70 text-sm sm:text-base min-h-[28px] font-mono">
                {typed}<span className="inline-block w-0.5 h-5 bg-accent/60 ml-0.5 animate-pulse" />
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/60 bg-white/[0.04] px-2 py-1 rounded">Investor Pitch</span>
                  <span className="text-[11px] text-muted-foreground/60 bg-white/[0.04] px-2 py-1 rounded">Board Update</span>
                  <span className="text-[11px] text-muted-foreground/60 bg-white/[0.04] px-2 py-1 rounded hidden sm:inline-block">GTM Strategy</span>
                </div>
                <Button size="sm" className="rounded-full gap-1.5 px-5 text-xs font-semibold group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  Generate
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          </Link>
        </div>

        {/* CTA row */}
        <div className="hero-stagger-5 flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link to="/create">
            <Button variant="hero" size="xl" className="group gap-2">
              Create with AI
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button variant="hero-outline" size="xl" className="group gap-2">
              <Play className="h-4 w-4 fill-current" />
              Watch 90s Demo
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="hero-stagger-6 flex flex-col items-center gap-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-6 sm:gap-10 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">60+</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Templates</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">&lt;2 min</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Generation</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">15+</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Visual Blocks</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">1-Click</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">PPTX Export</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/50">
            No credit card required · Free tier forever
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
