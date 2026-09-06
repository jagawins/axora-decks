import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowDown, ArrowRight, BarChart3, CheckCircle2, Layers, Target,
  MessageSquareQuote, X
} from "lucide-react";

/* ── Before / After comparison data ────────────────────────────── */

const BEFORE_AFTER = [
  {
    bad: "Market Overview",
    good: "Market grew 23% driven by digital transformation in APAC",
    label: "Topic labels → Action titles",
  },
  {
    bad: "Build to conclusion at the end",
    good: "Lead with the answer. Evidence follows.",
    label: "Build-up → Answer-first",
  },
  {
    bad: "5 bullet points per slide",
    good: "KPI dashboard + comparison chart + 2×2 matrix",
    label: "Text walls → Visual evidence",
  },
];

/* ── Methodology pillars ───────────────────────────────────────── */

const PILLARS = [
  {
    icon: <MessageSquareQuote className="h-5 w-5" />,
    title: "Answer-First Structure",
    desc: "Every deck starts with the answer. Executive summary first, evidence second.",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Action Titles",
    desc: "Slide headings are complete assertions, the takeaway, not a topic label.",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "70% Visual Density",
    desc: "Charts, frameworks, dashboards dominate. Text is minimized. Data is king.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Three-Layer Slides",
    desc: "Action title → sub-context → visual evidence. The consulting standard.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
];

/* ── Component ──────────────────────────────────────────────────── */

export default function ConsultingMethodology() {
  const [activeExample, setActiveExample] = useState(0);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Badge + heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-5">
            <BarChart3 className="h-3.5 w-3.5" />
            Consulting-Grade AI
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
            Structured the way strategy decks are structured
            <br className="hidden sm:block" />
            <span className="text-accent"> answer first, evidence second</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Topic-label headings and text walls do not move a decision.
            AXIVA applies answer-first structure, action titles and a visual-density
            floor by default, so each slide states a point rather than a subject.
          </p>
        </div>

        {/* Before / After — interactive */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BEFORE_AFTER.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveExample(i)}
                className={cn(
                  "text-left p-4 rounded-xl border transition-all",
                  activeExample === i
                    ? "border-accent bg-accent/5"
                    : "border-border/40 bg-card/30 hover:border-accent/30"
                )}
              >
                <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-3">{item.label}</p>

                {/* Bad */}
                <div className="flex items-start gap-2 mb-2">
                  <X className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground line-through decoration-red-400/40">{item.bad}</p>
                </div>

                {/* Good */}
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground font-medium">{item.good}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Four pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border/40 bg-card/30 hover:border-accent/20 transition-all group"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", p.bgColor, p.color)}>
                {p.icon}
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Consulting flow diagram */}
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-muted-foreground mb-4 uppercase tracking-wider font-semibold">How AXIVA structures every deck</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { step: "1", label: "Title", sub: "Core assertion" },
              { step: "2", label: "Exec Summary", sub: "Answer first" },
              { step: "3", label: "Context", sub: "Shared understanding" },
              { step: "4", label: "Evidence", sub: "Visual blocks" },
              { step: "5", label: "Implications", sub: "So what?" },
              { step: "6", label: "Next Steps", sub: "Who, what, when" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {s.step}
                  </div>
                  <p className="text-[10px] font-semibold mt-1.5">{s.label}</p>
                  <p className="text-[9px] text-muted-foreground">{s.sub}</p>
                </div>
                {i < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Social proof line */}
        <p className="text-center text-xs text-muted-foreground mt-12">
          Used by consultants, strategy teams, and executives who need decks that look like they came from a top-3 firm.
        </p>
      </div>
    </section>
  );
}
