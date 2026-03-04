import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Play, ArrowRight, X, Download, ChevronRight, Palette,
  Layout, Type, Image, MousePointerClick, Layers, Eye, EyeOff,
  BarChart3, Table2, ListChecks, PanelTop, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import { DEMO_SCENARIOS, type DemoScenario } from "@/data/demo-scenarios";

/* ── Phase enum ─────────────────────────────────── */
type Phase =
  | "choose"
  | "typing"
  | "structuring"
  | "template"     // NEW: pick template + theme
  | "branding"     // NEW: brand kit preview
  | "structured"
  | "slides"
  | "interactive"  // NEW: interactive blocks showcase
  | "export"
  | "cta";

/* ── Callout data ───────────────────────────────── */
const CALLOUTS = [
  { text: "Themes are grouped using MECE logic.", delay: 0 },
  { text: "Risk and finance are separated cleanly.", delay: 1800 },
  { text: "Structure is now board-ready.", delay: 3600 },
];

const BLOCK_TYPE_ICONS: Record<string, typeof BarChart3> = {
  exec_summary: ListChecks,
  chart_block: BarChart3,
  comparison_table: Table2,
  decision_summary: ListChecks,
  two_by_two_matrix: Layout,
  scenario_set: Layers,
  recommendation_panel: ListChecks,
  stat_block: BarChart3,
  three_pillars: Layers,
  decision_next_steps: ListChecks,
};

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
  const [brandStep, setBrandStep] = useState(0);
  const [activeInteractive, setActiveInteractive] = useState(0);
  const [interactiveState, setInteractiveState] = useState(0); // tab index or toggle state
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const scheduleNext = useCallback((fn: () => void, ms: number) => {
    clearTimer();
    timerRef.current = setTimeout(fn, ms);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  /* ── Phase: typing ──────────────────────────── */
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

  /* ── Phase: structuring ─────────────────────── */
  useEffect(() => {
    if (phase !== "structuring") return;
    let p = 0;
    const interval = setInterval(() => {
      p += autoplay ? 4 : 2;
      setStructureProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        scheduleNext(() => setPhase("template"), 400);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [phase, autoplay, scheduleNext]);

  /* ── Phase: template (auto-advance) ─────────── */
  useEffect(() => {
    if (phase !== "template") return;
    scheduleNext(() => setPhase("branding"), autoplay ? 2500 : 3500);
  }, [phase, autoplay, scheduleNext]);

  /* ── Phase: branding (step through 3 steps) ─── */
  useEffect(() => {
    if (phase !== "branding") return;
    setBrandStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setBrandStep(step);
      if (step >= 3) {
        clearInterval(interval);
        scheduleNext(() => setPhase("structured"), autoplay ? 1500 : 2500);
      }
    }, autoplay ? 800 : 1200);
    return () => clearInterval(interval);
  }, [phase, autoplay, scheduleNext]);

  /* ── Phase: structured sections + callouts ──── */
  useEffect(() => {
    if (phase !== "structured" || !scenario) return;
    const sectionCount = scenario.structuredSections.length;
    let s = 0;
    const interval = setInterval(() => {
      s++;
      setVisibleSections(s);
      if (s >= sectionCount) {
        clearInterval(interval);
        CALLOUTS.forEach((c, i) => {
          setTimeout(() => setActiveCallout(i), c.delay + 600);
        });
        scheduleNext(() => {
          setActiveCallout(-1);
          setPhase("slides");
        }, autoplay ? 5000 : 7000);
      }
    }, autoplay ? 400 : 700);
    return () => clearInterval(interval);
  }, [phase, scenario, autoplay, scheduleNext]);

  /* ── Phase: slides ──────────────────────────── */
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
        scheduleNext(() => {
          setActiveInteractive(0);
          setInteractiveState(0);
          setPhase("interactive");
        }, autoplay ? 1500 : 2500);
      }
    }, autoplay ? 2000 : 3000);
    return () => clearInterval(interval);
  }, [phase, scenario, autoplay, scheduleNext]);

  /* ── Phase: interactive blocks ──────────────── */
  useEffect(() => {
    if (phase !== "interactive" || !scenario) return;
    const blocks = scenario.interactiveBlocks;
    let bIdx = 0;
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      if (tick <= 2) {
        setInteractiveState(tick);
      } else {
        bIdx++;
        if (bIdx < blocks.length) {
          setActiveInteractive(bIdx);
          setInteractiveState(0);
          tick = 0;
        } else {
          clearInterval(interval);
          scheduleNext(() => setPhase("export"), autoplay ? 1500 : 2500);
        }
      }
    }, autoplay ? 1000 : 1500);
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
    setBrandStep(0);
    setActiveInteractive(0);
    setInteractiveState(0);
    setAutoplay(auto);
    setPhase("typing");
  };

  const startAutoplay = () => pickScenario(DEMO_SCENARIOS[0], true);

  const resetDemo = () => {
    clearTimer();
    setPhase("choose");
    setScenario(null);
    setTypedLines([]);
    setStructureProgress(0);
    setVisibleSections(0);
    setActiveCallout(-1);
    setActiveSlide(0);
    setBrandStep(0);
    setActiveInteractive(0);
    setInteractiveState(0);
    setAutoplay(false);
  };

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

  /* ── Progress bar ───────────────────────────── */
  const PHASES_ORDER: Phase[] = ["choose", "typing", "structuring", "template", "branding", "structured", "slides", "interactive", "export", "cta"];
  const currentIndex = PHASES_ORDER.indexOf(phase);
  const progressPercent = Math.round((currentIndex / (PHASES_ORDER.length - 1)) * 100);

  return (
    <>
      <Helmet>
        <title>Live Demo | AXIVA — Executive Thinking Engine</title>
        <meta name="description" content="Watch Axiva transform raw executive notes into board-ready presentations with templates, brand kits, AI images, and interactive blocks." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen flex flex-col items-center px-4 pt-24 pb-20 relative">
        {/* Ambient background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px] opacity-40 transition-colors duration-1000"
            style={{ backgroundColor: scenario?.themeColors.accent ?? "hsl(var(--accent))" }}
          />
        </div>

        {/* Top progress bar */}
        {phase !== "choose" && (
          <div className="fixed top-16 left-0 right-0 z-40 h-1 bg-muted/30">
            <div
              className="h-full bg-accent transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

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
          {/* ═══ CHOOSE ═══ */}
          {phase === "choose" && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-12">
                <p className="text-sm font-medium text-accent mb-3 tracking-wide uppercase">Live Demo</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
                  See AXIVA in Action
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Watch messy notes become themed, branded, interactive board decks — with AI images, custom fonts, and one-click export.
                </p>
              </div>

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
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                          {s.templateName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {s.themeName} theme
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>

              <div className="text-center">
                <Button variant="hero-outline" size="lg" onClick={startAutoplay} className="group">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Full Demo (2 min)
                </Button>
              </div>
            </div>
          )}

          {/* ═══ TYPING ═══ */}
          {phase === "typing" && scenario && (
            <div className="animate-fade-in-up">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase text-center">
                Step 1 · Paste Raw Notes
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
                {scenario.title}
              </h2>
              <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-6 sm:p-8 font-mono text-sm leading-relaxed min-h-[280px]">
                {typedLines.map((line, i) => (
                  <p key={i} className="text-muted-foreground animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    {line}
                  </p>
                ))}
                <span className="inline-block w-2 h-4 bg-accent/60 animate-pulse ml-1" />
              </div>
            </div>
          )}

          {/* ═══ STRUCTURING ═══ */}
          {phase === "structuring" && (
            <div className="animate-fade-in-up text-center">
              <p className="text-sm font-medium text-accent/80 mb-6 tracking-wide">
                Step 2 · AI Structuring
              </p>
              <div className="max-w-md mx-auto mb-6">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-100 ease-out" style={{ width: `${structureProgress}%` }} />
                </div>
              </div>
              <p className="text-lg font-medium text-foreground">{structureLabel}</p>
              <div className="flex justify-center gap-3 mt-6">
                {scenario?.themes.map((t, i) => (
                  <span
                    key={t}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-all duration-500",
                      structureProgress > (i + 1) * 25 ? "bg-accent/15 text-accent border-accent/30 scale-100" : "bg-muted/30 text-muted-foreground border-border/30 scale-90 opacity-50"
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ═══ TEMPLATE SELECTION ═══ */}
          {phase === "template" && scenario && (
            <div className="animate-fade-in-up text-center">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase">
                Step 3 · Choose Template & Theme
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                Applying Visual Identity
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {DEMO_SCENARIOS.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "rounded-xl border-2 p-4 transition-all duration-500",
                      s.id === scenario.id
                        ? "border-accent bg-accent/10 scale-105 shadow-lg shadow-accent/10"
                        : "border-border/30 bg-card/30 opacity-50"
                    )}
                  >
                    <div
                      className="aspect-[4/3] rounded-lg mb-3 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${s.themeColors.bg}, ${s.themeColors.accent}30)` }}
                    >
                      <Layout className="h-6 w-6" style={{ color: s.themeColors.accent }} />
                    </div>
                    <p className="text-xs font-medium text-foreground">{s.templateName}</p>
                    <p className="text-[10px] text-muted-foreground">{s.themeName}</p>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm animate-pulse">
                <Sparkles className="h-4 w-4" />
                Selected: {scenario.templateName} · {scenario.themeName}
              </div>
            </div>
          )}

          {/* ═══ BRANDING ═══ */}
          {phase === "branding" && scenario && (
            <div className="animate-fade-in-up text-center">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase">
                Step 4 · Brand Kit Applied
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                Your Brand, Your Deck
              </h2>

              <div className="space-y-4 max-w-md mx-auto">
                {/* Font */}
                <div className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                  brandStep >= 0 ? "border-accent/30 bg-card/60" : "border-border/20 bg-card/20 opacity-30"
                )}>
                  <Type className="h-5 w-5 text-accent shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-foreground">Typography</p>
                    <p className="text-xs text-muted-foreground">
                      Heading: <span className="text-accent">{scenario.brandKit.headingFont}</span> · Body: {scenario.brandKit.bodyFont}
                    </p>
                  </div>
                  {brandStep >= 1 && <span className="text-xs text-success">✓</span>}
                </div>

                {/* Colors */}
                <div className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                  brandStep >= 1 ? "border-accent/30 bg-card/60" : "border-border/20 bg-card/20 opacity-30"
                )}>
                  <Palette className="h-5 w-5 text-accent shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-foreground">Theme Colors</p>
                    <div className="flex gap-2 mt-1">
                      <span className="w-4 h-4 rounded-full border border-border/30" style={{ backgroundColor: scenario.themeColors.bg }} />
                      <span className="w-4 h-4 rounded-full border border-border/30" style={{ backgroundColor: scenario.themeColors.accent }} />
                      <span className="w-4 h-4 rounded-full border border-border/30" style={{ backgroundColor: scenario.themeColors.fg }} />
                    </div>
                  </div>
                  {brandStep >= 2 && <span className="text-xs text-success">✓</span>}
                </div>

                {/* Logo */}
                <div className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                  brandStep >= 2 ? "border-accent/30 bg-card/60" : "border-border/20 bg-card/20 opacity-30"
                )}>
                  <Image className="h-5 w-5 text-accent shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-foreground">Logo & Identity</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-accent font-semibold">
                        {scenario.brandKit.logoText}
                      </span>
                    </p>
                  </div>
                  {brandStep >= 3 && <span className="text-xs text-success">✓</span>}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STRUCTURED ═══ */}
          {phase === "structured" && scenario && (
            <div className="animate-fade-in-up relative">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase text-center">
                Step 5 · Structured Output
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
              {activeCallout >= 0 && activeCallout < CALLOUTS.length && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                  <div className="bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-medium shadow-xl">
                    {CALLOUTS[activeCallout].text}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ SLIDES ═══ */}
          {phase === "slides" && scenario && (
            <div className="animate-fade-in-up">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase text-center">
                Step 6 · Board-Ready Slides
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

              {/* Active slide — themed */}
              <div
                className="rounded-2xl p-8 sm:p-10 min-h-[300px] transition-all duration-500 border"
                style={{
                  backgroundColor: scenario.themeColors.bg,
                  borderColor: scenario.themeColors.accent + "30",
                  color: scenario.themeColors.fg,
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  {(() => {
                    const Icon = BLOCK_TYPE_ICONS[scenario.slides[activeSlide].blockType || ""] || ListChecks;
                    return <Icon className="h-5 w-5" style={{ color: scenario.themeColors.accent }} />;
                  })()}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                      Slide {activeSlide + 1} · {scenario.slides[activeSlide].blockType?.replace(/_/g, " ")}
                    </p>
                    <h3 className="text-xl font-bold">{scenario.slides[activeSlide].title}</h3>
                  </div>
                  <span
                    className="ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium"
                    style={{ borderColor: scenario.themeColors.accent + "40", color: scenario.themeColors.accent }}
                  >
                    {scenario.brandKit.logoText}
                  </span>
                </div>
                <ul className="space-y-3">
                  {scenario.slides[activeSlide].bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: scenario.themeColors.accent }} />
                      <span className="text-base leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                {scenario.slides[activeSlide].aiImageQuery && (
                  <div className="mt-6 flex items-center gap-2 text-xs opacity-50">
                    <Sparkles className="h-3 w-3" />
                    AI image: "{scenario.slides[activeSlide].aiImageQuery}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ INTERACTIVE BLOCKS ═══ */}
          {phase === "interactive" && scenario && (
            <div className="animate-fade-in-up">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase text-center">
                Step 7 · Interactive Blocks
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 text-center">
                Click, Toggle, Reveal
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Your audience can interact with live data — not just static slides.
              </p>

              <div className="space-y-4">
                {scenario.interactiveBlocks.map((block, bIdx) => {
                  const isActive = bIdx === activeInteractive;
                  const TypeIcon = block.type === "tabs" ? PanelTop : block.type === "toggle" ? Eye : MousePointerClick;

                  return (
                    <div
                      key={bIdx}
                      className={cn(
                        "rounded-xl border p-5 transition-all duration-500",
                        isActive ? "border-accent/40 bg-card/70 scale-[1.02]" : "border-border/30 bg-card/30 opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <TypeIcon className="h-4 w-4 text-accent" />
                        <span className="text-xs font-semibold text-accent uppercase">{block.type}</span>
                        <span className="text-sm font-medium text-foreground">{block.label}</span>
                      </div>

                      {block.type === "tabs" && (
                        <div className="flex gap-2 flex-wrap">
                          {block.preview.map((tab, tIdx) => (
                            <span
                              key={tIdx}
                              className={cn(
                                "text-xs px-3 py-1.5 rounded-lg border transition-all duration-300",
                                isActive && tIdx === interactiveState % block.preview.length
                                  ? "bg-accent text-accent-foreground border-accent"
                                  : "bg-muted/30 text-muted-foreground border-border/30"
                              )}
                            >
                              {tab}
                            </span>
                          ))}
                        </div>
                      )}

                      {block.type === "toggle" && (
                        <div className="flex gap-4">
                          {block.preview.map((val, vIdx) => (
                            <span
                              key={vIdx}
                              className={cn(
                                "text-sm px-4 py-2 rounded-lg border transition-all duration-300 flex-1 text-center",
                                isActive && vIdx === interactiveState % 2
                                  ? "bg-accent/15 text-accent border-accent/30 font-medium"
                                  : "bg-muted/20 text-muted-foreground border-border/20"
                              )}
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      )}

                      {block.type === "reveal" && (
                        <div className="space-y-2">
                          {block.preview.map((item, rIdx) => (
                            <div
                              key={rIdx}
                              className={cn(
                                "text-sm px-4 py-2 rounded-lg border transition-all duration-500",
                                isActive && rIdx <= interactiveState
                                  ? "bg-accent/10 text-foreground border-accent/20 opacity-100 translate-x-0"
                                  : "bg-muted/10 text-muted-foreground border-border/20 opacity-30 translate-x-2"
                              )}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ EXPORT ═══ */}
          {phase === "export" && scenario && (
            <div className="animate-fade-in-up text-center">
              <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase">
                Step 8 · Export
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
                One-Click Export
              </h2>

              {/* Themed thumbnails */}
              <div className="grid grid-cols-4 gap-3 mb-8 max-w-md mx-auto">
                {scenario.slides.map((s, i) => {
                  const Icon = BLOCK_TYPE_ICONS[s.blockType || ""] || ListChecks;
                  return (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg flex flex-col items-center justify-center gap-1 animate-fade-in border"
                      style={{
                        animationDelay: `${i * 200}ms`,
                        backgroundColor: scenario.themeColors.bg,
                        borderColor: scenario.themeColors.accent + "30",
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: scenario.themeColors.accent }} />
                      <span className="text-[8px] font-medium px-1 text-center" style={{ color: scenario.themeColors.fg }}>
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Format buttons */}
              <div className="flex justify-center gap-3 mb-8">
                {["PowerPoint", "PDF", "Web Link"].map((fmt, i) => (
                  <span
                    key={fmt}
                    className="text-xs px-4 py-2 rounded-lg border border-border/30 bg-card/50 text-foreground animate-fade-in"
                    style={{ animationDelay: `${i * 200 + 400}ms` }}
                  >
                    {fmt}
                  </span>
                ))}
              </div>

              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-success/10 border border-success/20 text-success mb-8 animate-fade-in animation-delay-300">
                <Download className="h-5 w-5" />
                <span className="font-semibold">Board-ready. Branded. Interactive.</span>
              </div>
            </div>
          )}

          {/* ═══ CTA ═══ */}
          {phase === "cta" && (
            <div className="animate-fade-in-up text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Try your own notes.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Templates. Themes. Brand kits. AI images. Interactive blocks. All in one platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" onClick={() => navigate("/create")} className="group">
                  Start Creating
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="hero-outline" size="lg" onClick={resetDemo}>
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
