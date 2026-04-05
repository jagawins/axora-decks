/**
 * WhatsNew — Feature showcase modal
 *
 * Shows on dashboard load (once per version) to highlight
 * AXIVA's key features and latest updates.
 *
 * Better than Gamma's version because:
 * - Each feature has a "Try it" CTA (not just text)
 * - Animated feature cards instead of static accordion
 * - Shows speed stats (no competitor does this)
 * - Dismisses and remembers (localStorage)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  X, Sparkles, Mic, BarChart3, Zap, QrCode,
  FileText, ArrowRight, Timer, Cloud, Video,
  Presentation, ChevronRight, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CURRENT_VERSION = "2026.04";
const STORAGE_KEY = "axiva_whats_new_dismissed";

interface Feature {
  icon: React.ElementType;
  badge?: string;
  title: string;
  description: string;
  color: string;
  cta: string;
  href: string;
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    badge: "NEW",
    title: "Smart Slides",
    description: "Slides that adapt in real-time. Type audience inputs or use voice recognition. Downstream slides regenerate with AI.",
    color: "#F59E0B",
    cta: "Create Smart Slide",
    href: "/create?prompt=Create+a+Smart+Slides+deck+with+live_input+and+adaptive_blocks",
  },
  {
    icon: Mic,
    title: "Speech Prep + Delivery Coaching",
    description: "Write your speech, get vocal tips, story structure, and a pre-flight checklist. The only tool that coaches you on delivery.",
    color: "#3B82F6",
    cta: "Try Speech Prep",
    href: "/executive",
  },
  {
    icon: QrCode,
    badge: "NEW",
    title: "Live Audience Polls",
    description: "Polls, Q&A, word clouds built into your deck. Audience scans QR code, votes from their phone. Results update live.",
    color: "#8B5CF6",
    cta: "Create a Poll",
    href: "/dashboard?tab=live-polls",
  },
  {
    icon: Video,
    title: "Webinar-Ready",
    description: "One tool for the entire webinar. Deck, speech, polls, coaching, results. Replace PowerPoint + Slido.",
    color: "#10B981",
    cta: "See How",
    href: "/webinars",
  },
  {
    icon: Timer,
    title: "98 Executive Templates",
    description: "Board decks, pitch decks, strategy briefs, crisis communication, vendor evaluation, and more. All AI-customizable.",
    color: "#EC4899",
    cta: "Browse Templates",
    href: "/templates",
  },
  {
    icon: MessageSquare,
    badge: "NEW",
    title: "Social Post Generator",
    description: "Generate LinkedIn and Twitter posts from your deck content. Every share grows your reach.",
    color: "#06B6D4",
    cta: "Generate Posts",
    href: "/dashboard?tab=social",
  },
];

const SPEED_STATS = [
  { value: "< 15s", label: "Deck generation" },
  { value: "3s", label: "Poll creation" },
  { value: "98", label: "Templates" },
  { value: "23", label: "Timeline styles" },
];

export default function WhatsNew() {
  const [visible, setVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== CURRENT_VERSION) {
      // Small delay so dashboard loads first
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
  };

  const handleCTA = (href: string) => {
    dismiss();
    navigate(href);
  };

  if (!visible) return null;

  const active = FEATURES[activeFeature];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative w-full max-w-[820px] max-h-[90vh] overflow-hidden rounded-3xl border border-border/40 bg-card shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close button */}
        <button onClick={dismiss} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left: Feature list */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[80vh]">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="h-3 w-3" /> What's new in AXIVA
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Win the room,<br />not just the slides
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                The only tool that helps you create, deliver, and interact.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-2">
              {FEATURES.map((f, i) => (
                <button
                  key={f.title}
                  onClick={() => setActiveFeature(i)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all duration-200",
                    activeFeature === i
                      ? "border-accent/30 bg-accent/5 shadow-sm"
                      : "border-transparent hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${f.color}15` }}>
                      <f.icon className="h-4 w-4" style={{ color: f.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{f.title}</p>
                        {f.badge && (
                          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{f.badge}</span>
                        )}
                      </div>
                      {activeFeature === i && (
                        <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCTA(f.href); }}
                            className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold hover:underline"
                            style={{ color: f.color }}
                          >
                            {f.cta} <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Speed stats */}
            <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-border/30">
              {SPEED_STATS.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold text-accent">{s.value}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="flex items-center gap-3 mt-6">
              <Button variant="hero" className="gap-2 flex-1" onClick={() => handleCTA("/create")}>
                <Sparkles className="h-4 w-4" /> Create a deck
              </Button>
              <Button variant="outline" onClick={dismiss}>
                Explore later
              </Button>
            </div>
          </div>

          {/* Right: Feature preview */}
          <div className="hidden md:flex w-[320px] bg-gradient-to-br from-accent/5 via-violet-500/5 to-blue-500/5 border-l border-border/30 flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Animated background dots */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="absolute w-1 h-1 rounded-full bg-accent animate-pulse"
                  style={{
                    top: `${15 + (i * 7) % 80}%`,
                    left: `${10 + (i * 13) % 80}%`,
                    animationDelay: `${i * 200}ms`,
                  }} />
              ))}
            </div>

            {/* Feature highlight card */}
            <div className="relative z-10 w-full rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm p-5 shadow-xl space-y-4 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${active.color}15` }}>
                <active.icon className="h-6 w-6" style={{ color: active.color }} />
              </div>
              <div>
                <p className="text-base font-bold">{active.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{active.description}</p>
              </div>
              <Button size="sm" className="w-full gap-1.5" onClick={() => handleCTA(active.href)}
                style={{ backgroundColor: active.color }}>
                {active.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* "No competitor has this" callout */}
            <div className="relative z-10 mt-4 text-center">
              <p className="text-[10px] text-muted-foreground">
                {activeFeature === 0 ? "No competitor has real-time adaptive slides" :
                 activeFeature === 1 ? "No competitor has delivery coaching built in" :
                 activeFeature === 2 ? "Replaces Slido as a separate tool" :
                 activeFeature === 3 ? "Replaces PowerPoint + Slido + speaker notes" :
                 activeFeature === 4 ? "All templates are AI-customizable" :
                 "Every share is free marketing for you"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
