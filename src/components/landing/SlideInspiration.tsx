/**
 * Slide Inspiration Library
 * 
 * Browsable gallery of consulting-grade slide patterns.
 * Each slide shows a visual preview, category, and "Generate with AI" button.
 * Inspired by SlideStart but generates slides instead of just showing them.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sparkles, ArrowRight, BarChart3, Target, Layers, GitBranch,
  TrendingUp, Table2, LayoutGrid, PieChart, Calendar, Columns,
  CheckCircle, AlertTriangle, Clock, Lightbulb, Zap
} from "lucide-react";

/* ── Slide Pattern Data ────────────────────────────────── */

interface SlidePattern {
  id: string;
  title: string;
  category: string;
  source: string;
  description: string;
  blockType: string;
  prompt: string;
  visual: React.ReactNode;
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "data", label: "Data & Metrics" },
  { id: "strategy", label: "Strategy" },
  { id: "comparison", label: "Comparison" },
  { id: "timeline", label: "Timeline" },
  { id: "decision", label: "Decision" },
  { id: "executive", label: "Executive" },
];

const PATTERNS: SlidePattern[] = [
  // Data & Metrics
  {
    id: "kpi-dashboard",
    title: "KPI Dashboard",
    category: "data",
    source: "McKinsey-style",
    description: "4-6 key metrics with trends, color-coded status indicators",
    blockType: "stat_block",
    prompt: "Q4 board update with key metrics: $14.2M ARR, 23% growth, 1.8% churn, 142% NRR",
    visual: (
      <div className="grid grid-cols-2 gap-1.5 p-3">
        {[{ v: "$14.2M", l: "ARR", c: "text-green-400" }, { v: "+23%", l: "Growth", c: "text-green-400" }, { v: "1.8%", l: "Churn", c: "text-blue-400" }, { v: "142%", l: "NRR", c: "text-violet-400" }].map((m, i) => (
          <div key={i} className="rounded-md bg-white/5 border border-white/10 p-2 text-center">
            <p className={cn("text-sm font-bold", m.c)}>{m.v}</p>
            <p className="text-[7px] text-gray-400">{m.l}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "revenue-chart",
    title: "Revenue Trend",
    category: "data",
    source: "Goldman Sachs-style",
    description: "Line or bar chart showing revenue progression with annotations",
    blockType: "chart_block",
    prompt: "Quarterly revenue chart: Q1 $2.1M, Q2 $2.8M, Q3 $3.4M, Q4 $4.2M with growth annotations",
    visual: (
      <div className="p-3">
        <div className="flex items-end gap-1 h-16 justify-center">
          {[40, 55, 68, 85].map((h, i) => (
            <div key={i} className="w-8 rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-400" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex gap-1 justify-center mt-1">
          {["Q1", "Q2", "Q3", "Q4"].map(q => <span key={q} className="text-[7px] text-gray-400 w-8 text-center">{q}</span>)}
        </div>
      </div>
    ),
  },
  {
    id: "metrics-commentary",
    title: "Metrics + Commentary",
    category: "data",
    source: "BCG-style",
    description: "KPI grid on left, executive analysis on right",
    blockType: "smart_layout",
    prompt: "Financial metrics with analysis: revenue up 23%, customer count 2847, churn at 1.8%, CAC $52",
    visual: (
      <div className="p-3 flex gap-2">
        <div className="flex-1 grid grid-cols-2 gap-1">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-5 rounded bg-white/5 border border-white/10" />)}
        </div>
        <div className="w-[40%] rounded bg-white/5 border border-white/10 p-1.5">
          <div className="h-1 w-3/4 bg-gray-600 rounded mb-1" />
          <div className="h-1 w-full bg-gray-700 rounded mb-0.5" />
          <div className="h-1 w-2/3 bg-gray-700 rounded" />
        </div>
      </div>
    ),
  },
  // Strategy
  {
    id: "three-pillars",
    title: "Three Strategic Pillars",
    category: "strategy",
    source: "McKinsey-style",
    description: "Three key themes or priorities presented as equal columns",
    blockType: "three_pillars",
    prompt: "Our 2026 strategy rests on three pillars: Product-led growth, Enterprise expansion, and AI platform",
    visual: (
      <div className="p-3 flex gap-1.5">
        {["violet", "teal", "amber"].map((c, i) => (
          <div key={i} className={cn("flex-1 rounded-md p-2 border", `bg-${c}-500/10 border-${c}-500/20`)}>
            <div className={cn("w-4 h-4 rounded mb-1", `bg-${c}-500/30`)} />
            <div className="h-1 w-3/4 bg-gray-600 rounded mb-0.5" />
            <div className="h-1 w-full bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "two-by-two",
    title: "2×2 Matrix",
    category: "strategy",
    source: "BCG-style",
    description: "Four-quadrant strategic positioning (BCG matrix, prioritization)",
    blockType: "two_by_two_matrix",
    prompt: "Prioritization matrix for 2026 initiatives: AI copilot (high impact, low effort), EU expansion (high impact, high effort), Mobile app (low impact, low effort), Platform rebuild (low impact, high effort)",
    visual: (
      <div className="p-3">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-20">
          <div className="rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-green-500/40" /></div>
          <div className="rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-amber-500/40" /></div>
          <div className="rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-500/40" /></div>
          <div className="rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-red-500/40" /></div>
        </div>
      </div>
    ),
  },
  {
    id: "three-horizon",
    title: "Three Horizons",
    category: "strategy",
    source: "McKinsey-style",
    description: "McKinsey's three-horizon framework for growth planning",
    blockType: "timeline_block",
    prompt: "Three-horizon growth strategy: H1 defend core SaaS revenue, H2 build enterprise platform, H3 explore AI marketplace",
    visual: (
      <div className="p-3 space-y-1">
        {[{ w: "100%", c: "bg-blue-500/20 border-blue-500/30" }, { w: "70%", c: "bg-teal-500/20 border-teal-500/30" }, { w: "40%", c: "bg-violet-500/20 border-violet-500/30" }].map((h, i) => (
          <div key={i} className={cn("h-5 rounded border", h.c)} style={{ width: h.w }} />
        ))}
      </div>
    ),
  },
  // Comparison
  {
    id: "comparison-table",
    title: "Comparison Table",
    category: "comparison",
    source: "Deloitte-style",
    description: "Side-by-side feature or option comparison with checkmarks",
    blockType: "comparison_table",
    prompt: "Compare three cloud providers: AWS, Azure, GCP across pricing, AI features, enterprise support, global coverage",
    visual: (
      <div className="p-3">
        <div className="space-y-1">
          <div className="flex gap-1"><div className="w-14 h-3 bg-gray-700 rounded" /><div className="flex-1 h-3 bg-blue-500/20 rounded" /><div className="flex-1 h-3 bg-teal-500/20 rounded" /><div className="flex-1 h-3 bg-violet-500/20 rounded" /></div>
          {[1, 2, 3].map(i => <div key={i} className="flex gap-1"><div className="w-14 h-3 bg-gray-800 rounded" /><div className="flex-1 h-3 bg-white/5 rounded" /><div className="flex-1 h-3 bg-white/5 rounded" /><div className="flex-1 h-3 bg-white/5 rounded" /></div>)}
        </div>
      </div>
    ),
  },
  {
    id: "before-after",
    title: "Before / After",
    category: "comparison",
    source: "Consulting-style",
    description: "Split view comparing current state vs proposed future state",
    blockType: "smart_layout",
    prompt: "Before: manual reporting taking 3 days, 40% error rate. After: AI-automated reporting in 2 hours, 99.5% accuracy",
    visual: (
      <div className="p-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-gray-800/50 border border-gray-700 p-2"><p className="text-[7px] text-gray-400 font-bold">BEFORE</p><div className="mt-1 space-y-0.5">{[1, 2].map(i => <div key={i} className="h-1.5 bg-gray-700 rounded" />)}</div></div>
        <div className="rounded-md bg-accent/5 border border-accent/20 p-2"><p className="text-[7px] text-accent font-bold">AFTER</p><div className="mt-1 space-y-0.5">{[1, 2].map(i => <div key={i} className="h-1.5 bg-accent/20 rounded" />)}</div></div>
      </div>
    ),
  },
  // Timeline
  {
    id: "roadmap",
    title: "Product Roadmap",
    category: "timeline",
    source: "Product-style",
    description: "Quarterly or monthly roadmap with phases and milestones",
    blockType: "timeline_block",
    prompt: "2026 product roadmap: Q1 MVP launch, Q2 enterprise features, Q3 API platform, Q4 international expansion",
    visual: (
      <div className="p-3">
        <div className="relative"><div className="absolute top-3 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />
          <div className="flex justify-between relative">
            {[1, 2, 3, 4].map(i => (<div key={i} className="flex flex-col items-center"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-400 z-10" /><div className="h-1 w-8 bg-gray-700 rounded mt-1.5" /></div>))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "scenario-branching",
    title: "Scenario Branching",
    category: "timeline",
    source: "Strategy-style",
    description: "Decision point branching into 3 possible futures",
    blockType: "timeline_block",
    prompt: "2026 market scenarios: if regulation passes → market expands 40%. If delayed → flat growth. If reversed → contraction 15%.",
    visual: (
      <div className="p-3">
        <div className="flex flex-col items-center">
          <div className="w-8 h-4 rounded bg-accent/20 border border-accent/30 mb-1" />
          <div className="w-0.5 h-2 bg-gray-600" />
          <div className="flex gap-4">
            {["bg-green-500/20", "bg-amber-500/20", "bg-red-500/20"].map((c, i) => <div key={i} className={cn("w-6 h-4 rounded", c)} />)}
          </div>
        </div>
      </div>
    ),
  },
  // Decision
  {
    id: "recommendation",
    title: "Recommendation",
    category: "decision",
    source: "BCG-style",
    description: "Clear recommendation with supporting evidence and risk note",
    blockType: "smart_layout",
    prompt: "Recommend expanding to EU market in Q2 with Berlin-first strategy. Evidence: 34% market growth, 3x lower CAC. Risk: $120K GDPR compliance cost.",
    visual: (
      <div className="p-3 space-y-1.5">
        <div className="rounded-md bg-accent/10 border border-accent/20 p-2"><div className="h-1.5 w-3/4 bg-accent/30 rounded" /></div>
        {[1, 2].map(i => <div key={i} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500/30" /><div className="h-1.5 flex-1 bg-gray-700 rounded" /></div>)}
        <div className="rounded-md bg-amber-500/5 border border-amber-500/20 p-1.5"><div className="h-1 w-1/2 bg-amber-500/20 rounded" /></div>
      </div>
    ),
  },
  {
    id: "decision-gate",
    title: "Decision Gate",
    category: "decision",
    source: "Stage-gate-style",
    description: "Stage-gate process with go/no-go decision points",
    blockType: "timeline_block",
    prompt: "Product launch decision gates: Discovery → Feasibility → Development → Testing → Launch. Gate 2 pending approval.",
    visual: (
      <div className="p-3 flex items-center gap-1 justify-center">
        {[1, 2, 3].map(i => (<div key={i} className="flex items-center gap-1"><div className="w-10 h-5 rounded bg-blue-500/10 border border-blue-500/20" /><div className="w-2.5 h-2.5 rotate-45 border border-green-500/40 bg-green-500/10" /></div>))}
      </div>
    ),
  },
  // Executive
  {
    id: "exec-summary",
    title: "Executive Summary",
    category: "executive",
    source: "Board deck-style",
    description: "Key message + supporting metrics for C-suite presentation",
    blockType: "smart_layout",
    prompt: "Executive summary: Q4 exceeded all targets. ARR reached $14.2M (+23%). Recommend accelerating EU expansion with $2M investment.",
    visual: (
      <div className="p-3 space-y-1.5">
        <div className="rounded-md bg-accent/5 border border-accent/20 p-2"><div className="h-1.5 w-full bg-gray-600 rounded" /><div className="h-1 w-2/3 bg-gray-700 rounded mt-0.5" /></div>
        <div className="grid grid-cols-4 gap-1">{[1, 2, 3, 4].map(i => <div key={i} className="h-6 rounded bg-white/5 border border-white/10" />)}</div>
      </div>
    ),
  },
  {
    id: "agenda",
    title: "Board Agenda",
    category: "executive",
    source: "Board-style",
    description: "Numbered agenda items with owners and time allocations",
    blockType: "smart_layout",
    prompt: "Board meeting agenda: 1. Financial Review (CFO, 15min), 2. Product Update (CTO, 20min), 3. EU Expansion Vote (CEO, 25min), 4. Q&A (All, 15min)",
    visual: (
      <div className="p-3 space-y-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-accent/10 flex items-center justify-center text-[7px] text-accent font-bold">{i}</div>
            <div className="h-2 flex-1 bg-gray-800 rounded" />
            <div className="h-2 w-6 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    ),
  },
];

/* ── Main Component ────────────────────────────────────── */

export default function SlideInspiration() {
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  const filtered = category === "all" ? PATTERNS : PATTERNS.filter(p => p.category === category);

  return (
    <section className="section-padding relative">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
            <Lightbulb className="h-3.5 w-3.5" /> Slide Inspiration
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Consulting-grade slide patterns
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse real slide patterns used by McKinsey, BCG, and Goldman Sachs.
            Pick any pattern. AI generates it with your data.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 justify-center flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                category === c.id ? "bg-accent text-white" : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border")}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Slide grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(pattern => (
            <div key={pattern.id} className="group rounded-2xl border border-border/50 bg-card/30 overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-300">
              {/* Visual preview */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-950 relative overflow-hidden">
                {pattern.visual}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => navigate(`/create?prompt=${encodeURIComponent(pattern.prompt)}`)}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Sparkles className="h-3 w-3" /> Generate with AI
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[8px] font-bold text-accent uppercase tracking-wider">{pattern.source}</span>
                </div>
                <p className="text-sm font-semibold leading-tight">{pattern.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{pattern.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-muted-foreground text-sm mb-4">
            Don't just browse. Generate. Every pattern becomes a real slide in seconds.
          </p>
          <Link to="/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:opacity-90 transition-opacity">
            <Sparkles className="h-4 w-4" /> Create Your Deck <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
