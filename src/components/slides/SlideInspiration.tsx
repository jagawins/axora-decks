/**
 * Slide Inspiration Library
 *
 * Browsable library of consulting-grade slide patterns inspired by
 * McKinsey, BCG, Bain, Goldman Sachs, and top strategy firms.
 *
 * Each pattern is a visual preview + "Generate with AI" button
 * that creates the slide in a new or existing deck.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles, ArrowRight, Search, Filter, Crown,
  BarChart3, Target, Layers, TrendingUp, GitBranch,
  Calendar, LayoutGrid, PieChart, Table2, Columns,
  CheckCircle, AlertTriangle, Zap, Globe, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ── Slide Pattern Data ─────────────────────────────────── */

interface SlidePattern {
  id: string;
  title: string;
  category: string;
  source: string; // "McKinsey-style", "BCG-style", etc.
  description: string;
  blockType: string;
  prompt: string; // AI prompt to generate this slide
  preview: React.FC<{ className?: string }>; // Visual preview component
  pro: boolean;
  tags: string[];
}

/* ── Mini Preview Components ────────────────────────────── */

function KPIDashboardPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-2", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Q4 Performance Dashboard</div>
      <div className="grid grid-cols-4 gap-1.5">
        {[{ v: "$14.2M", l: "ARR", c: "text-green-400" }, { v: "+23%", l: "Growth", c: "text-green-400" }, { v: "1.8%", l: "Churn", c: "text-blue-400" }, { v: "142%", l: "NRR", c: "text-violet-400" }].map((m, i) => (
          <div key={i} className="rounded bg-muted/30 p-1.5 text-center">
            <p className={cn("text-[10px] font-bold", m.c)}>{m.v}</p>
            <p className="text-[7px] text-muted-foreground">{m.l}</p>
          </div>
        ))}
      </div>
      <div className="h-8 rounded bg-muted/20 flex items-end px-1 gap-0.5">
        {[40, 55, 45, 65, 60, 75, 70, 85, 80, 90, 88, 95].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-accent/40" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function ThreeHorizonPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1.5", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Strategic Three Horizons</div>
      {[{ l: "H1 — Maintain & Defend", c: "bg-blue-500/10 border-blue-500/20 text-blue-400" }, { l: "H2 — Build & Grow", c: "bg-teal-500/10 border-teal-500/20 text-teal-400" }, { l: "H3 — Explore & Create", c: "bg-violet-500/10 border-violet-500/20 text-violet-400" }].map((h, i) => (
        <div key={i} className={cn("rounded border p-1.5 flex items-center gap-1.5", h.c)}>
          <div className="w-4 h-4 rounded bg-current/20 flex items-center justify-center text-[7px] font-bold">{i + 1}</div>
          <span className="text-[8px] font-semibold">{h.l}</span>
        </div>
      ))}
    </div>
  );
}

function RecommendationPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1.5", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Recommendation</div>
      <div className="rounded bg-accent/10 border border-accent/20 p-1.5 flex items-start gap-1.5">
        <Target className="h-3 w-3 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-[7px] font-bold text-accent uppercase">Recommendation</p>
          <p className="text-[8px] font-semibold">Expand to EU market Q2 2026</p>
        </div>
      </div>
      <div className="flex items-start gap-1 p-1 rounded bg-muted/20">
        <CheckCircle className="h-2.5 w-2.5 text-green-500 shrink-0 mt-0.5" />
        <p className="text-[7px]">EU market growing 34% YoY</p>
      </div>
      <div className="flex items-start gap-1 p-1 rounded bg-amber-500/5 border border-amber-500/10">
        <AlertTriangle className="h-2.5 w-2.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[7px]">GDPR compliance: $120K investment</p>
      </div>
    </div>
  );
}

function ComparisonPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1.5", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Competitive Analysis</div>
      <div className="grid grid-cols-3 gap-1">
        {[{ t: "AXIVA", c: "border-accent/30 bg-accent/5" }, { t: "Gamma", c: "border-border/30" }, { t: "Canva", c: "border-border/30" }].map((col, i) => (
          <div key={i} className={cn("rounded border p-1.5 text-center", col.c)}>
            <p className="text-[8px] font-bold">{col.t}</p>
            {[1, 2, 3].map(r => <div key={r} className="h-1.5 rounded bg-muted/30 mt-1" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function WaterfallPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1.5", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Revenue Bridge</div>
      <div className="flex items-end gap-1 h-16 px-1">
        {[{ h: 60, c: "bg-blue-500" }, { h: 15, c: "bg-green-500", y: 60 }, { h: 10, c: "bg-green-500", y: 75 }, { h: 20, c: "bg-red-500", y: 65 }, { h: 85, c: "bg-blue-500" }].map((bar, i) => (
          <div key={i} className="flex-1 relative h-full">
            <div className={cn("absolute bottom-0 w-full rounded-t", bar.c)} style={{ height: `${bar.h}%`, bottom: bar.y ? `${100 - bar.y - bar.h}%` : 0 }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[6px] text-muted-foreground px-1">
        <span>Start</span><span>+New</span><span>+Expand</span><span>-Churn</span><span>End</span>
      </div>
    </div>
  );
}

function ScenarioPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1.5", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Scenario Analysis</div>
      <div className="flex justify-center">
        <div className="rounded bg-accent/10 border border-accent/20 px-2 py-1 text-[7px] font-semibold text-accent">Decision Point</div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[{ l: "Path A", c: "border-green-500/20 bg-green-500/5 text-green-400" }, { l: "Path B", c: "border-amber-500/20 bg-amber-500/5 text-amber-400" }, { l: "Path C", c: "border-red-500/20 bg-red-500/5 text-red-400" }].map((p, i) => (
          <div key={i} className={cn("rounded border p-1.5 text-center", p.c)}>
            <p className="text-[7px] font-bold">{p.l}</p>
            <div className="h-1 rounded bg-current/20 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelinePreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1.5", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Product Roadmap</div>
      <div className="relative">
        <div className="absolute top-2 left-0 right-0 h-0.5 bg-accent/30" />
        <div className="flex justify-between relative">
          {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={cn("w-2.5 h-2.5 rounded-full z-10 mb-1", i < 2 ? "bg-green-500" : i === 2 ? "bg-accent" : "bg-muted-foreground/30")} />
              <span className="text-[7px] font-semibold">{q}</span>
              <div className="h-1 w-8 rounded bg-muted/30 mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgendaPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Board Agenda</div>
      {[{ n: 1, t: "Financial Review", o: "CFO", time: "15m" }, { n: 2, t: "Product Update", o: "CTO", time: "20m" }, { n: 3, t: "Strategy Vote", o: "CEO", time: "25m" }].map(item => (
        <div key={item.n} className="flex items-center gap-1.5 p-1 rounded bg-muted/20">
          <div className="w-4 h-4 rounded bg-accent/10 flex items-center justify-center text-[7px] font-bold text-accent">{item.n}</div>
          <span className="text-[7px] font-semibold flex-1">{item.t}</span>
          <span className="text-[6px] text-muted-foreground">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

function TwoByTwoPreview({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 space-y-1.5", className)}>
      <div className="text-[8px] font-bold text-muted-foreground uppercase">Priority Matrix</div>
      <div className="grid grid-cols-2 gap-1 aspect-square">
        {[{ l: "Quick Wins", c: "bg-green-500/10" }, { l: "Big Bets", c: "bg-violet-500/10" }, { l: "Low Priority", c: "bg-muted/20" }, { l: "Thankless", c: "bg-amber-500/10" }].map((q, i) => (
          <div key={i} className={cn("rounded p-1.5 flex items-center justify-center", q.c)}>
            <span className="text-[7px] font-semibold text-center">{q.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── All Patterns ───────────────────────────────────────── */

const PATTERNS: SlidePattern[] = [
  {
    id: "kpi-dashboard", title: "KPI Dashboard", category: "Data", source: "McKinsey-style",
    description: "4 key metrics + trend chart. The most-used board slide format.", blockType: "stat_block",
    prompt: "Create a KPI dashboard slide with 4 key metrics (revenue, growth rate, churn, NRR) and a 12-month trend chart",
    preview: KPIDashboardPreview, pro: false, tags: ["metrics", "dashboard", "board", "KPI"],
  },
  {
    id: "three-horizon", title: "Three Horizons", category: "Strategy", source: "McKinsey-style",
    description: "McKinsey's Three Horizons framework for strategic planning.", blockType: "smart_layout",
    prompt: "Create a Three Horizons strategy slide: H1 maintain current business, H2 build emerging opportunities, H3 explore future growth",
    preview: ThreeHorizonPreview, pro: true, tags: ["strategy", "horizons", "McKinsey", "planning"],
  },
  {
    id: "recommendation", title: "Recommendation", category: "Decision", source: "BCG-style",
    description: "Recommendation box + evidence bullets + risk note. The consulting standard.", blockType: "smart_layout",
    prompt: "Create a recommendation slide with a clear recommendation, 3 supporting evidence points, and a risk note",
    preview: RecommendationPreview, pro: true, tags: ["recommendation", "decision", "BCG", "evidence"],
  },
  {
    id: "competitive-analysis", title: "Competitive Analysis", category: "Data", source: "Bain-style",
    description: "Side-by-side feature comparison across 3 competitors.", blockType: "comparison_table",
    prompt: "Create a competitive analysis comparison table with 3 competitors across 6 key dimensions",
    preview: ComparisonPreview, pro: false, tags: ["comparison", "competitive", "analysis", "Bain"],
  },
  {
    id: "revenue-bridge", title: "Revenue Bridge", category: "Data", source: "Goldman-style",
    description: "Waterfall chart showing revenue changes: starting ARR → new → expansion → churn → ending.", blockType: "chart_block",
    prompt: "Create a revenue bridge waterfall chart showing: Starting ARR, New Revenue, Expansion, Contraction, Churn, Ending ARR",
    preview: WaterfallPreview, pro: true, tags: ["waterfall", "revenue", "bridge", "Goldman", "finance"],
  },
  {
    id: "scenario-branching", title: "Scenario Branching", category: "Strategy", source: "McKinsey-style",
    description: "Decision point → 3 possible futures with probability labels.", blockType: "smart_layout",
    prompt: "Create a scenario branching slide with a key decision point and 3 possible outcomes: best case, base case, worst case",
    preview: ScenarioPreview, pro: true, tags: ["scenario", "branching", "futures", "risk"],
  },
  {
    id: "product-roadmap", title: "Product Roadmap", category: "Timeline", source: "Universal",
    description: "Quarterly roadmap with milestones and status indicators.", blockType: "timeline_block",
    prompt: "Create a product roadmap timeline with Q1-Q4 milestones, showing completed, in-progress, and upcoming phases",
    preview: TimelinePreview, pro: false, tags: ["roadmap", "timeline", "product", "quarterly"],
  },
  {
    id: "board-agenda", title: "Board Agenda", category: "Meeting", source: "Universal",
    description: "Numbered agenda items with owners and time allocation.", blockType: "smart_layout",
    prompt: "Create a board meeting agenda with 5 items, each with an owner and time allocation",
    preview: AgendaPreview, pro: false, tags: ["agenda", "board", "meeting", "owners"],
  },
  {
    id: "priority-matrix", title: "Priority Matrix", category: "Strategy", source: "BCG-style",
    description: "2×2 matrix for prioritization: impact vs effort.", blockType: "two_by_two_matrix",
    prompt: "Create a 2x2 priority matrix with axes Impact (high/low) and Effort (high/low), with items in each quadrant",
    preview: TwoByTwoPreview, pro: true, tags: ["matrix", "priority", "2x2", "BCG"],
  },
];

const CATEGORIES = ["All", "Data", "Strategy", "Decision", "Timeline", "Meeting"];

/* ── Main Component ─────────────────────────────────────── */

export default function SlideInspiration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = PATTERNS.filter(p => {
    if (category !== "All" && p.category !== category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.tags.some(t => t.includes(search.toLowerCase()))) return false;
    return true;
  });

  const handleGenerate = (pattern: SlidePattern) => {
    if (!user) { navigate("/auth"); return; }
    // Navigate to create page with pre-filled prompt
    navigate(`/create?prompt=${encodeURIComponent(pattern.prompt)}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
          <Sparkles className="h-3.5 w-3.5" /> Slide Inspiration Library
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Consulting-Grade Slide Patterns
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Browse slide patterns used by McKinsey, BCG, Bain, and Goldman Sachs.
          Click "Generate with AI" to create your own version instantly.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patterns (e.g. KPI, waterfall, matrix...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-card/50 text-sm focus:outline-none focus:border-accent/50"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              category === cat ? "bg-accent text-white" : "bg-muted/30 text-muted-foreground hover:text-foreground")}>
            {cat}
          </button>
        ))}
      </div>

      {/* Pattern grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {filtered.map(pattern => (
          <div key={pattern.id} className="group rounded-2xl border border-border/50 bg-card/30 hover:bg-card/60 hover:border-border overflow-hidden transition-all duration-300">
            {/* Preview */}
            <div className="relative bg-muted/10 border-b border-border/30 min-h-[140px]">
              <pattern.preview className="h-full" />
              {pattern.pro && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-[8px] border-amber-400/30 text-amber-400 gap-0.5 px-1.5 py-0.5">
                    <Crown className="h-2 w-2" /> PRO
                  </Badge>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className="text-[8px] bg-muted/80 backdrop-blur-sm text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">
                  {pattern.source}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-sm font-bold mb-1">{pattern.title}</h3>
              <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{pattern.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {pattern.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[8px] bg-muted/30 text-muted-foreground px-1.5 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>

              {/* Generate button */}
              <button
                onClick={() => handleGenerate(pattern)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
              >
                <Sparkles className="h-3 w-3" /> Generate with AI
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No patterns match your search.</p>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-3">
          Can't find what you need? Describe any slide and AI will generate it.
        </p>
        <Link to="/create" className="inline-flex items-center gap-2 text-accent text-sm font-semibold hover:underline">
          Create from scratch <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
