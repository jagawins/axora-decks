import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Play, ArrowRight, X, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import { DEMO_SCENARIOS, type DemoScenario } from "@/data/demo-scenarios";

/* ── Phase enum ─────────────────────────────────── */
type Phase =
  | "choose"      // scenario picker
  | "typing"      // raw notes appearing
  | "structuring" // "Axora is structuring…"
  | "structured"  // MECE output + callouts
  | "slides"      // slide preview
  | "export"      // board-ready moment
  | "cta";        // try your own

/* ── Callout data ───────────────────────────────── */
const CALLOUTS = [
  { text: "Notice how themes are grouped.", delay: 0 },
  { text: "See how risk and finance are separated.", delay: 1800 },
  { text: "This is now MECE structured.", delay: 3600 },
];

/* ── Component ──────────────────────────────────── */
export default function Demo() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("choose");
  const [scenario, setScenario] = useState<DemoScenario | null>(null);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [structureProgress, setStructureProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState(0);
  const [activeCallout, setActiveCallout] = useState(-1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Autoplay orchestrator ──────────────────── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const scheduleNext = useCallback((fn: () => void, ms: number) => {
    clearTimer();
    timerRef.current = setTimeout(fn, ms);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  /* ── Phase: typing raw notes ────────────────── */
  useEffect(() => {
    if (phase !== "typing" || !scenario) return;
    const lines = scenario.rawNotes.split("\n").filter(Boolean);
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setTypedLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
        scheduleNext(() => setPhase("structuring"), 800);
      }
    }, autoplay ? 120 : 200);
    return () => clearInterval(interval);
  }, [phase, scenario, autoplay, scheduleNext]);

  /* ── Phase: structuring animation ───────────── */
  useEffect(() => {
    if (phase !== "structuring") return;
    let p = 0;
    const interval = setInterval(() => {
      p += autoplay ? 4 : 2;
      setStructureProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        scheduleNext(() => setPhase("structured"), 400);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [phase, autoplay, scheduleNext]);

  /* ── Phase: reveal structured sections + callouts ── */
  useEffect(() => {
    if (phase !== "structured" || !scenario) return;
    const sectionCount = scenario.structuredSections.length;
    let s = 0;
    const interval = setInterval(() => {
      s++;
      setVisibleSections(s);
      if (s >= sectionCount) {
        clearInterval(interval);
        // Start callouts
        CALLOUTS.forEach((c, i) => {
          setTimeout(() => setActiveCallout(i), c.delay + 600);
        });
        // Move to slides
        scheduleNext(() => {
          setActiveCallout(-1);
          setPhase("slides");
        }, autoplay ? 5000 : 7000);
      }
    }, autoplay ? 400 : 700);
    return () => clearInterval(interval);
  }, [phase, scenario, autoplay, scheduleNext]);

  /* ── Phase: slide auto-advance ──────────────── */
  useEffect(() => {
    if (phase !== "slides" || !scenario) return;
    const slideCount = scenario.slides.length;
    let s = 0;
    const interval = setInterval(() => {
      s++;
      if (s < slideCount) {
        setActiveSlide(s);
      } else {
        clearInterval(interval);
        scheduleNext(() => setPhase("export"), autoplay ? 1500 : 2500);
      }
    }, autoplay ? 2000 : 3000);
    return () => clearInterval(interval);
  }, [phase, scenario, autoplay, scheduleNext]);

  /* ── Phase: export → CTA ────────────────────── */
  useEffect(() => {
    if (phase !== "export") return;
    scheduleNext(() => setPhase("cta"), autoplay ? 3000 : 5000);
  }, [phase, autoplay, scheduleNext]);

  /* ── Scenario selection ─────────────────────── */
  const pickScenario = (s: DemoScenario, auto = false) => {
    setScenario(s);
    setTypedLines([]);
    setStructureProgress(0);
    setVisibleSections(0);
    setActiveCallout(-1);
    setActiveSlide(0);
    setAutoplay(auto);
    setPhase("typing");
  };

  const startAutoplay = () => {
    pickScenario(DEMO_SCENARIOS[0], true);
  };

  const resetDemo = () => {
    clearTimer();
    setPhase("choose");
    setScenario(null);
    setTypedLines([]);
    setStructureProgress(0);
    setVisibleSections(0);
    setActiveCallout(-1);
    setActiveSlide(0);
    setAutoplay(false);
  };

  /* ── Structuring status text ────────────────── */
  const structureLabel =
    structureProgress < 30 ? "Identifying themes…" :
    structureProgress < 60 ? "Grouping concepts…" :
    structureProgress < 90 ? "Building framework…" :
    "Finalizing structure…";

  const TAG_COLORS: Record<string, string> = {
    risk: "bg-destructive/15 text-destructive border-destructive/20",
    context: "bg-accent/15 text-accent border-accent/20",
    insight: "bg-warning/15 text-warning border-warning/20",
    action: "bg-success/15 text-success border-success/20",
  };

  const SLIDE_ICONS: Record<string, string> = {
    executive_summary: "📋",
    current_state: "📊",
    strategic_options: "🔀",
    recommended_path: "✅",
  };

  return (
    <>
      <Helmet>
        <title>Live Demo | AXORA — Executive Thinking Engine</title>
        <meta name="description" content="Watch Axora transform raw executive notes into board-ready presentations in 90 seconds." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen flex flex-col items-center px-4 pt-24 pb-20 relative">
        {/* Ambient background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-accent/8 rounded-full blur-[120px] opacity-40" />
        </div>

        {/* Exit button */}
        {phase !== "choose" && (
          <button
            onClick={resetDemo}
            className="fixed top-20 right-6 z-50 p-2 rounded-full bg-card/80 backdrop-blur border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Exit demo"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="w-full max-w-3xl mx-auto">
          {/* ═══ PHASE: CHOOSE ═══ */}
          {phase === "choose" && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-accent mb-3 tracking-wide uppercase">Live Demo</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
                  Choose a Scenario
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Watch Axora transform messy executive notes into structured, board-ready output.
                </p>
              </div>

              {/* Scenario cards */}
              <div className="grid gap-4 mb-8">
                {DEMO_SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickScenario(s)}
                    className={cn(
                      "group w-full text-left p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
                      "hover:border-accent/40 hover:bg-card/80 transition-all duration-200",
                      "flex items-center gap-5"
                    )}
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.subtitle}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>

              {/* Autoplay CTA */}
              <div className="text-center">
                <Button
                  variant="hero-outline"
                  size="lg"
                  onClick={startAutoplay}
                  className="group"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch 90-Second Demo
                </Button>
              </div>
            </div>
          )}

          {/* ═══ PHASE: TYPING ═══ */}
          {phase === "typing" && scenario && (
            <div className="animate-fade-in-up">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase text-center">
                Raw Executive Notes
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
                {scenario.title}
              </h2>

              <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6 sm:p-8 font-mono text-sm leading-relaxed min-h-[280px]">
                {typedLines.map((line, i) => (
                  <p
                    key={i}
                    className="text-muted-foreground animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {line}
                  </p>
                ))}
                <span className="inline-block w-2 h-4 bg-accent/60 animate-pulse ml-1" />
              </div>
            </div>
          )}

          {/* ═══ PHASE: STRUCTURING ═══ */}
          {phase === "structuring" && (
            <div className="animate-fade-in-up text-center">
              <p className="text-sm font-medium text-accent/80 mb-6 tracking-wide">
                Axora is structuring your thinking…
              </p>

              <div className="max-w-md mx-auto mb-6">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${structureProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-lg font-medium text-foreground">{structureLabel}</p>
            </div>
          )}

          {/* ═══ PHASE: STRUCTURED ═══ */}
          {phase === "structured" && scenario && (
            <div className="animate-fade-in-up relative">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase text-center">
                Structured Output
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
                MECE Framework
              </h2>

              <div className="space-y-4">
                {scenario.structuredSections.map((section, i) => (
                  <div
                    key={section.heading}
                    className={cn(
                      "bg-card/60 backdrop-blur border border-border/50 rounded-xl p-5 transition-all duration-500",
                      i < visibleSections ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", TAG_COLORS[section.tag] || "")}>
                        {section.tag.toUpperCase()}
                      </span>
                      <h3 className="font-semibold text-foreground">{section.heading}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {section.points.map((p, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-1 shrink-0">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Callouts */}
              {activeCallout >= 0 && activeCallout < CALLOUTS.length && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                  <div className="bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-medium shadow-xl">
                    {CALLOUTS[activeCallout].text}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PHASE: SLIDES ═══ */}
          {phase === "slides" && scenario && (
            <div className="animate-fade-in-up">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase text-center">
                Board-Ready Slides
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
                {scenario.slides.length} Slides Generated
              </h2>

              {/* Slide dots */}
              <div className="flex justify-center gap-2 mb-6">
                {scenario.slides.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === activeSlide ? "w-8 bg-accent" : "w-1.5 bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {/* Active slide */}
              <div className="bg-card/70 backdrop-blur border border-border/50 rounded-2xl p-8 sm:p-10 min-h-[300px] transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{SLIDE_ICONS[scenario.slides[activeSlide].type]}</span>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Slide {activeSlide + 1}
                    </p>
                    <h3 className="text-xl font-bold text-foreground">
                      {scenario.slides[activeSlide].title}
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3">
                  {scenario.slides[activeSlide].bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-muted-foreground animate-fade-in"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                      <span className="text-base leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ═══ PHASE: EXPORT ═══ */}
          {phase === "export" && (
            <div className="animate-fade-in-up text-center">
              {/* Mock thumbnail grid */}
              <div className="grid grid-cols-4 gap-3 mb-10 max-w-md mx-auto">
                {scenario?.slides.map((s, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] bg-card/70 border border-border/50 rounded-lg flex items-center justify-center animate-fade-in"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <span className="text-lg">{SLIDE_ICONS[s.type]}</span>
                  </div>
                ))}
              </div>

              {/* Mock download animation */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-success/10 border border-success/20 text-success mb-8 animate-fade-in animation-delay-300">
                <Download className="h-5 w-5" />
                <span className="font-semibold">Board-ready. No formatting required.</span>
              </div>
            </div>
          )}

          {/* ═══ PHASE: CTA ═══ */}
          {phase === "cta" && (
            <div className="animate-fade-in-up text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Try your own notes.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Paste your messy thinking. Axora structures it.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={() => navigate("/create")}
                  className="group"
                >
                  Start Creating
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="hero-outline"
                  size="lg"
                  onClick={resetDemo}
                >
                  Replay Demo
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
