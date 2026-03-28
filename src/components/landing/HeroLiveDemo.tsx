import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const QUICK_CHIPS = [
  "Board update for Q4",
  "Series A pitch deck",
  "GTM strategy presentation",
];

/* Pre-built demo outlines keyed by chip label */
const DEMO_OUTLINES: Record<string, { title: string; sections: Array<{ heading: string; points: string[] }> }> = {
  "Board update for Q4": {
    title: "Q4 2025 Board Update, Executive Summary",
    sections: [
      { heading: "Financial Performance", points: ["Revenue of $34.2M exceeded forecast by 12%", "Gross margin expanded to 72%, up 4 pts YoY", "Operating cash flow positive for third consecutive quarter"] },
      { heading: "Strategic Milestones", points: ["Enterprise tier launched with 14 design partners", "SOC 2 Type II certification completed ahead of schedule", "Partnership with Deloitte Digital signed for EMEA expansion"] },
      { heading: "2026 Outlook & Key Asks", points: ["Targeting $52M ARR with 85% gross margin", "Board approval requested for $4M infrastructure investment", "Hiring plan: 28 net new roles across engineering and GTM"] },
    ],
  },
  "Series A pitch deck": {
    title: "MedConnect, Series A Pitch Deck",
    sections: [
      { heading: "The Problem", points: ["Clinical documentation takes physicians 2+ hours per day", "EHR fragmentation creates $150B in annual waste", "Burnout-driven attrition costs $500K per departed physician"] },
      { heading: "Our Solution & Traction", points: ["AI-powered clinical copilot reduces documentation time by 68%", "$2.4M ARR with 340% YoY growth across 127 clinics", "94% net revenue retention with zero-touch onboarding"] },
      { heading: "The Ask", points: ["Raising $15M to expand into 3 new specialties", "Capital deployed across sales (45%), product (35%), ops (20%)", "Targeting $18M ARR by end of 2026"] },
    ],
  },
  "GTM strategy presentation": {
    title: "CloudSync, 2025 Go-to-Market Strategy",
    sections: [
      { heading: "Market Opportunity", points: ["$12.4B TAM growing at 19% CAGR through 2028", "Mid-market segment ($5M–$500M revenue) is fastest-growing", "Only 23% of target accounts have adopted modern sync tooling"] },
      { heading: "Channel & Motion", points: ["Product-led growth funnel converts 8.4% of free users to paid", "Outbound SDR team targeting top 2,000 ICP accounts", "Channel partnerships with AWS, Azure, and Snowflake marketplace"] },
      { heading: "90-Day Launch Plan", points: ["Week 1–4: Sales enablement rollout and competitive battle cards", "Week 5–8: Paid media campaign across LinkedIn and G2", "Week 9–12: First QBR with pipeline review and funnel optimization"] },
    ],
  },
};

const TYPING_SPEED = 18; // ms per character

export default function HeroLiveDemo() {
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [outline, setOutline] = useState<{ title: string; sections: Array<{ heading: string; points: string[] }> } | null>(null);
  const [visibleSections, setVisibleSections] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleChip = (chip: string) => {
    setInput(chip);
    runDemo(chip);
  };

  const handleGenerate = () => {
    if (!input.trim()) return;
    runDemo(input.trim());
  };

  const runDemo = (topic: string) => {
    setGenerating(true);
    setOutline(null);
    setVisibleSections(0);

    // Find matching demo or use the first one as fallback
    const match = DEMO_OUTLINES[topic] || DEMO_OUTLINES["Board update for Q4"];

    // Simulate generation delay
    setTimeout(() => {
      setGenerating(false);
      setOutline(match);
      // Store prompt for /create page
      sessionStorage.setItem("axiva_prefill_prompt", topic);
    }, 1800);
  };

  // Animate sections appearing one by one
  useEffect(() => {
    if (!outline) return;
    if (visibleSections >= outline.sections.length) return;

    const timer = setTimeout(() => {
      setVisibleSections((v) => v + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [outline, visibleSections]);

  // Scroll preview into view
  useEffect(() => {
    if (outline && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [outline]);

  return (
    <div className="mt-10 sm:mt-14 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
      {/* Input area */}
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Try it now, no sign-up needed</span>
        </div>

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your outline, meeting notes, or just describe your deck..."
          className="min-h-[80px] resize-none bg-background/60 border-border/50 text-sm"
          rows={3}
        />

        {/* Quick-start chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChip(chip)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-accent/20 bg-accent/5 text-accent hover:bg-accent/10 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!input.trim() || generating}
          className="mt-4 w-full sm:w-auto gap-2"
          variant="default"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating preview…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Preview
            </>
          )}
        </Button>
      </div>

      {/* Slide preview output */}
      {(generating || outline) && (
        <div ref={previewRef} className="mt-6 space-y-3">
          {generating && !outline && (
            <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span className="text-sm">Analyzing input and building outline…</span>
            </div>
          )}

          {outline && (
            <>
              {/* Title card */}
              <div className="rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 p-5 animate-fade-in-up">
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-1">Slide 1: Title</p>
                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                  {outline.title}
                </h3>
              </div>

              {/* Section cards */}
              {outline.sections.slice(0, visibleSections).map((section, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Slide {i + 2}
                  </p>
                  <h4 className="text-sm font-bold text-foreground mb-2">{section.heading}</h4>
                  <ul className="space-y-1">
                    {section.points.map((point, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="inline-block w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* CTA after preview */}
              {visibleSections >= outline.sections.length && (
                <div className="text-center pt-4 animate-fade-in-up">
                  <Link to="/create">
                    <Button variant="hero" size="lg" className="group gap-2">
                      Create Full Deck
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2">
                    Free, no credit card required
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
