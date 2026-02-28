import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Layers, Share2, Wand2, FileDown, Globe, Monitor, Type, BarChart3, MessageSquare } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";

/* ── Step data ──────────────────────────────────────────────── */

const steps = [
  {
    icon: Sparkles,
    title: "Describe Your Deck",
    description:
      "Enter a topic, paste a document, or describe your presentation goals. AXORA's AI analyzes your input and understands the context.",
    mockType: "typing" as const,
  },
  {
    icon: Layers,
    title: "AI Generates Your Slides",
    description:
      "Our AI creates a complete deck with executive-ready structure: headings, key points, tables, callouts, and visuals — all formatted for clarity.",
    mockType: "outline" as const,
  },
  {
    icon: Wand2,
    title: "Refine with AI Editing",
    description:
      "Select any block and use natural language to adjust tone, add data, or restructure. The AI preserves your formatting while updating content.",
    mockType: "editing" as const,
  },
  {
    icon: Share2,
    title: "Present or Export",
    description:
      "Share a live link, present directly in the browser, or export to PowerPoint. Your deck is ready for the boardroom in minutes.",
    mockType: "export" as const,
  },
];

/* ── Mock UI panels ─────────────────────────────────────────── */

function TypingMock({ active }: { active: boolean }) {
  const text = "Q4 board update covering revenue growth, product milestones, and 2026 strategic priorities";
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!active) { setDisplayText(""); return; }
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
        <span className="text-[10px] text-muted-foreground ml-2 font-mono">axora — new deck</span>
      </div>
      <div className="flex-1 rounded-lg bg-background/60 border border-border/50 p-4">
        <p className="text-xs text-muted-foreground mb-2 font-medium">What's your deck about?</p>
        <p className="text-sm text-foreground leading-relaxed min-h-[60px]">
          {displayText}
          {active && displayText.length < text.length && (
            <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5 align-middle" />
          )}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className={`h-9 rounded-lg px-4 flex items-center gap-2 text-xs font-medium transition-all duration-500 ${displayText.length >= text.length ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Sparkles className="h-3.5 w-3.5" />
          Generate
        </div>
      </div>
    </div>
  );
}

const OUTLINE_ITEMS = [
  { heading: "Financial Performance", count: 3 },
  { heading: "Strategic Milestones", count: 3 },
  { heading: "2026 Outlook & Key Asks", count: 2 },
  { heading: "Appendix — Metrics", count: 4 },
];

function OutlineMock({ active }: { active: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active) { setVisibleCount(0); return; }
    const timer = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= OUTLINE_ITEMS.length) { clearInterval(timer); return c; }
        return c + 1;
      });
    }, 500);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col">
      <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-3">Generated Outline</p>
      <div className="space-y-2.5 flex-1">
        {OUTLINE_ITEMS.slice(0, visibleCount).map((item, i) => (
          <div key={i} className="rounded-lg border border-border bg-background/60 p-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{item.heading}</span>
              <span className="text-[10px] text-muted-foreground">{item.count} points</span>
            </div>
            <div className="flex gap-1 mt-1.5">
              {Array.from({ length: item.count }).map((_, j) => (
                <div key={j} className="h-1 rounded-full bg-accent/20 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditingMock({ active }: { active: boolean }) {
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (!active) { setEdited(false); return; }
    const timer = setTimeout(() => setEdited(true), 1500);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-3.5 w-3.5 text-accent" />
        <span className="text-[10px] text-muted-foreground font-medium">AI Edit Mode</span>
      </div>
      {/* Mock slide block */}
      <div className={`rounded-lg border p-4 flex-1 transition-all duration-700 ${edited ? 'border-accent/40 bg-accent/5' : 'border-border bg-background/60'}`}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-foreground">Revenue Growth</span>
        </div>
        <div className="space-y-1.5">
          <div className={`h-2 rounded-full transition-all duration-700 ${edited ? 'bg-accent/40 w-[85%]' : 'bg-muted w-[70%]'}`} />
          <div className={`h-2 rounded-full transition-all duration-700 ${edited ? 'bg-accent/30 w-[65%]' : 'bg-muted w-[55%]'}`} />
          <div className={`h-2 rounded-full transition-all duration-700 ${edited ? 'bg-accent/20 w-[75%]' : 'bg-muted w-[45%]'}`} />
        </div>
      </div>
      {/* AI prompt */}
      <div className={`mt-3 rounded-lg border border-accent/20 bg-accent/5 p-2.5 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-[10px] text-accent font-medium">
          "Add 2024 actuals and increase emphasis on margin expansion"
        </p>
      </div>
    </div>
  );
}

function ExportMock({ active }: { active: boolean }) {
  const formats = [
    { icon: FileDown, label: "PowerPoint", ext: ".pptx" },
    { icon: Globe, label: "Share Link", ext: "URL" },
    { icon: Monitor, label: "Present", ext: "Live" },
  ];
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    if (!active) { setActiveIdx(-1); return; }
    let i = -1;
    const timer = setInterval(() => {
      i++;
      if (i >= formats.length) { clearInterval(timer); return; }
      setActiveIdx(i);
    }, 600);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full flex flex-col justify-center">
      <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-4 text-center">Export & Share</p>
      <div className="space-y-3">
        {formats.map((fmt, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 flex items-center gap-3 transition-all duration-500 ${
              i <= activeIdx ? 'border-accent/30 bg-accent/5 scale-[1.02]' : 'border-border bg-background/60'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-500 ${i <= activeIdx ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
              <fmt.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{fmt.label}</p>
              <p className="text-[10px] text-muted-foreground">{fmt.ext}</p>
            </div>
            {i <= activeIdx && (
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center animate-fade-in-up">
                <span className="text-success text-[10px]">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCK_COMPONENTS = { typing: TypingMock, outline: OutlineMock, editing: EditingMock, export: ExportMock };

/* ── Main page ──────────────────────────────────────────────── */

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) setActiveStep(index);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-10% 0px -30% 0px" }
    );

    stepRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const jsonLd = {
    "@type": "HowTo",
    name: "How to Create AI-Powered Executive Presentations with AXORA",
    description:
      "Learn how to create professional executive presentations using AXORA's AI deck generator in four simple steps.",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <>
      <SeoHead
        title="How It Works | AXORA - AI Presentation Generator"
        description="Create executive presentations in 4 steps: describe your topic, generate structured slides, refine with AI, and present. See how AXORA works."
        canonicalPath="/how-it-works"
        keywords="how to create presentations, AI presentation generator, executive deck workflow, presentation software"
        jsonLd={jsonLd}
      />

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container-wide">
          {/* Hero */}
          <section className="text-center mb-16 sm:mb-24">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              From Idea to Executive Deck in Minutes
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              AXORA transforms how executives create presentations. No templates to fill, no slides to design — just describe what you need.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/create">
                Try It Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>

          {/* Interactive steps */}
          <section className="mb-20 space-y-8 sm:space-y-0">
            {steps.map((step, index) => {
              const MockComponent = MOCK_COMPONENTS[step.mockType];
              const isActive = activeStep === index;

              return (
                <div
                  key={step.title}
                  ref={(el) => { stepRefs.current[index] = el; }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center py-8 sm:py-16"
                >
                  {/* Left — description */}
                  <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'} ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-500 ${isActive ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-semibold transition-colors duration-500 ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg">
                      {step.description}
                    </p>
                  </div>

                  {/* Right — mock UI */}
                  <div className={`h-[280px] sm:h-[320px] transition-all duration-500 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-40'} ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <MockComponent active={isActive} />
                  </div>
                </div>
              );
            })}
          </section>

          {/* CTA */}
          <section className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Build Your First Deck?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join executives who create board-ready presentations in minutes, not hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/create">Start Creating</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/templates">Browse Templates</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Sticky CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border py-3 px-4">
        <div className="container-wide flex items-center justify-between">
          <p className="text-sm text-muted-foreground hidden sm:block">
            See it in action — create your first deck in under 2 minutes.
          </p>
          <Button asChild size="sm" className="ml-auto gap-2">
            <Link to="/create">
              Try It Free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      <MarketingFooter />
    </>
  );
}
