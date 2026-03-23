import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Loader2, Zap, FileText, BarChart3, Target } from "lucide-react";
import { Link } from "react-router-dom";

/* ── Rotating word animation ───────────────────────────────── */
const ROTATING_WORDS = ["board decks", "pitch decks", "strategy docs", "investor updates", "GTM plans"];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

/* ── Prompt chips ──────────────────────────────────────────── */
const PROMPT_CHIPS = [
  { label: "Board update for Q4", icon: BarChart3 },
  { label: "Series A pitch deck", icon: Target },
  { label: "Product roadmap review", icon: FileText },
];

/* ── Demo outlines ─────────────────────────────────────────── */
const DEMO_OUTLINES: Record<string, { title: string; slides: { label: string; headline: string; detail: string; color: string }[] }> = {
  "Board update for Q4": {
    title: "Q4 2025 Board Update",
    slides: [
      { label: "Cover", headline: "Q4 2025 Board Update", detail: "Executive Summary — Confidential", color: "#3B82F6" },
      { label: "Financials", headline: "Revenue hit $34.2M", detail: "Exceeded forecast by 12% · Gross margin 72%", color: "#10B981" },
      { label: "Strategy", headline: "3 milestones delivered", detail: "Enterprise launch · SOC 2 · Partnership signed", color: "#8B5CF6" },
      { label: "Outlook", headline: "Targeting $52M ARR", detail: "28 new hires · $4M infrastructure investment", color: "#F59E0B" },
    ],
  },
  "Series A pitch deck": {
    title: "MedConnect — Series A",
    slides: [
      { label: "Cover", headline: "MedConnect", detail: "AI Clinical Copilot · Series A · $15M", color: "#EC4899" },
      { label: "Problem", headline: "2+ hours/day lost", detail: "$150B annual waste from EHR fragmentation", color: "#EF4444" },
      { label: "Traction", headline: "$2.4M ARR · 340% YoY", detail: "127 clinics · 94% net revenue retention", color: "#10B981" },
      { label: "The Ask", headline: "Raising $15M", detail: "Sales 45% · Product 35% · Ops 20%", color: "#6366F1" },
    ],
  },
  "Product roadmap review": {
    title: "CloudSync — Product Roadmap",
    slides: [
      { label: "Cover", headline: "2025 Product Roadmap", detail: "CloudSync · Engineering Review", color: "#06B6D4" },
      { label: "Q1 Shipped", headline: "Real-time sync engine", detail: "3x faster · 99.99% uptime", color: "#10B981" },
      { label: "Q2 Focus", headline: "Enterprise security", detail: "SSO · RBAC · Audit logs · SOC 2", color: "#F59E0B" },
      { label: "H2 Vision", headline: "AI data mesh", detail: "Auto-schema · Smart conflict resolution", color: "#8B5CF6" },
    ],
  },
};

/* ── Animated stat counter ─────────────────────────────────── */
function AnimatedStat({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 40;
          const stepVal = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += stepVal;
            if (current >= end) { setValue(end); clearInterval(timer); }
            else { setValue(Math.floor(current)); }
          }, 40);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

/* ── Main Hero Component ───────────────────────────────────── */
const Hero = () => {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<typeof DEMO_OUTLINES[string] | null>(null);
  const [visibleSlides, setVisibleSlides] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = (text?: string) => {
    const topic = text || prompt.trim();
    if (!topic) return;
    setPrompt(topic);
    setGenerating(true);
    setResult(null);
    setVisibleSlides(0);

    const match = DEMO_OUTLINES[topic] || DEMO_OUTLINES["Board update for Q4"];
    setTimeout(() => {
      setGenerating(false);
      setResult(match);
      sessionStorage.setItem("axiva_prefill_prompt", topic);
    }, 2000);
  };

  useEffect(() => {
    if (!result || visibleSlides >= result.slides.length) return;
    const timer = setTimeout(() => setVisibleSlides((v) => v + 1), 350);
    return () => clearTimeout(timer);
  }, [result, visibleSlides]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [result]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12 px-4">
      {/* Layered background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-accent/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-[15%] w-[400px] h-[400px] bg-[#6366F1]/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-[15%] w-[350px] h-[350px] bg-[#10B981]/5 rounded-full blur-[80px]" />
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container-narrow relative z-10 max-w-5xl">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
            <Zap className="h-3.5 w-3.5" />
            <span>Executive Performance System · Message Architecture · Q&A Readiness · 23 Timelines · PPTX Export</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animation-delay-100">
            Create stunning{" "}
            <span className="text-accent">
              <RotatingWord />
            </span>
            <br className="hidden sm:block" />
            in minutes, not hours
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Describe your goal. AI builds the structure, narrative, and visuals.
            No credits to count. No complex setup. Just executive-grade decks in under 2 minutes.
          </p>

          {/* ── Gamma-style prompt box ──────────────── */}
          <div className="max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
            <div className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-2xl shadow-black/10 overflow-hidden">
              <div className="flex items-center gap-3 p-4 sm:p-5">
                <Sparkles className="h-5 w-5 text-accent shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Describe your deck — 'Q4 board update for SaaS startup'..."
                  className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/60 text-sm sm:text-base outline-none"
                />
                <Button
                  onClick={() => handleGenerate()}
                  disabled={!prompt.trim() || generating}
                  size="sm"
                  className="rounded-xl px-5 gap-2 shrink-0"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Generate
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Quick chips */}
              <div className="border-t border-border/30 px-4 sm:px-5 py-3 flex flex-wrap gap-2 bg-muted/20">
                <span className="text-xs text-muted-foreground mr-1 self-center">Try:</span>
                {PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleGenerate(chip.label)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-background/50 text-foreground/70 hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-all"
                  >
                    <chip.icon className="h-3 w-3" />
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Free to try · 3 free decks · No credit card · No credits to track
            </p>
          </div>

          {/* ── Live slide preview ────────────────── */}
          {(generating || result) && (
            <div ref={resultRef} className="mt-8 max-w-3xl mx-auto">
              {generating && !result && (
                <div className="flex items-center justify-center gap-3 py-12">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                    <Sparkles className="h-4 w-4 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-sm text-muted-foreground">Building your deck outline…</span>
                </div>
              )}

              {result && (
                <div className="space-y-3 text-left">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {result.slides.slice(0, visibleSlides).map((slide, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="h-1.5" style={{ background: slide.color }} />
                        <div className="p-3 sm:p-4">
                          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: slide.color }}>
                            {slide.label}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground mt-1.5 leading-tight line-clamp-2">
                            {slide.headline}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
                            {slide.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {visibleSlides >= result.slides.length && (
                    <div className="text-center pt-4 animate-fade-in-up">
                      <Link to="/create">
                        <Button variant="hero" size="lg" className="group gap-2 shadow-lg shadow-accent/20">
                          Build Full Deck
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Stats bar ────────────────────────── */}
          <div className="mt-16 pt-10 border-t border-border/20 animate-fade-in-up animation-delay-400">
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <AnimatedStat end={60} suffix="+" label="Templates" />
              <AnimatedStat end={15} suffix="+" label="Visual blocks" />
              <AnimatedStat end={2} suffix=" min" label="Avg. generation" />
            </div>
          </div>

          {/* Trust logos */}
          <div className="mt-8 animate-fade-in-up animation-delay-400">
            <p className="text-xs text-muted-foreground/50 mb-4 uppercase tracking-wider font-medium">
              Trusted by leaders at
            </p>
            <div className="flex items-center justify-center gap-6 sm:gap-10 opacity-30 flex-wrap">
              {["McKinsey", "BCG", "Deloitte", "Goldman", "Bain"].map((name) => (
                <span key={name} className="text-sm sm:text-base font-semibold tracking-wide">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
