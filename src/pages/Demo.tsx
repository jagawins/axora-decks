import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Play, ArrowRight, Sparkles, Loader2, ChevronRight, ChevronLeft,
  Download, Share2, Eye, Maximize2, BarChart3, Target, FileText,
  Palette, Layout, Zap, Check, MousePointerClick, RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";

/* ═══════════════════════════════════════════════════════════════
   DEMO DATA — Full deck simulations
   ═══════════════════════════════════════════════════════════════ */

interface DemoSlide {
  title: string;
  subtitle?: string;
  blockType: string;
  color: string;
  content: React.ReactNode;
}

interface DemoDeck {
  id: string;
  prompt: string;
  icon: string;
  label: string;
  category: string;
  theme: { bg: string; accent: string; fg: string; muted: string; card: string };
  logo: string;
  slides: DemoSlide[];
}

const DECKS: DemoDeck[] = [
  {
    id: "investor-pitch",
    prompt: "Series A pitch deck for an AI healthcare startup raising $15M",
    icon: "🚀",
    label: "Investor Pitch",
    category: "Fundraising",
    theme: { bg: "#0B1628", accent: "#38BDF8", fg: "#E2E8F0", muted: "#94A3B8", card: "#111D35" },
    logo: "MediFlow AI",
    slides: [
      {
        title: "MediFlow AI",
        subtitle: "AI-Powered Clinical Workflow Automation",
        blockType: "Title Slide",
        color: "#38BDF8",
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <div className="px-4 py-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-400 text-xs font-semibold tracking-wider uppercase">Series A · $15M Raise</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-sky-50 leading-tight">MediFlow AI</h2>
            <p className="text-sky-200/70 text-sm max-w-md">AI-Powered Clinical Workflow Automation · Transforming how clinicians document, diagnose, and deliver care.</p>
            <div className="flex gap-6 mt-4">
              {[{ v: "$2.4M", l: "ARR" }, { v: "340%", l: "YoY Growth" }, { v: "127", l: "Clinics" }, { v: "94%", l: "Retention" }].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-lg font-bold text-sky-400">{s.v}</div>
                  <div className="text-[10px] text-sky-300/50 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "The Problem",
        blockType: "KPI Cards",
        color: "#EF4444",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-sky-50">Healthcare Documentation Crisis</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: "49%", l: "Time on docs", sub: "of clinician hours" }, { v: "$150B", l: "Annual waste", sub: "from EHR fragmentation" }, { v: "78%", l: "Burnout rate", sub: "physician attrition" }].map(k => (
                <div key={k.l} className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">{k.v}</div>
                  <div className="text-xs text-sky-200 font-medium mt-1">{k.l}</div>
                  <div className="text-[10px] text-sky-300/40">{k.sub}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-sky-200/60 leading-relaxed">Current solutions automate forms — not clinical reasoning. Physicians need an AI that thinks like a clinician, not a data entry clerk.</p>
          </div>
        ),
      },
      {
        title: "Our Solution",
        blockType: "Comparison Table",
        color: "#10B981",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-sky-50">10× Better Clinical AI</h3>
            <div className="rounded-lg border border-sky-400/10 overflow-hidden">
              <div className="grid grid-cols-3 text-xs">
                <div className="p-2.5 bg-sky-400/5 font-semibold text-sky-300/60"></div>
                <div className="p-2.5 bg-sky-400/5 font-semibold text-sky-300 text-center">MediFlow</div>
                <div className="p-2.5 bg-sky-400/5 font-semibold text-sky-300/60 text-center">Legacy</div>
                {[["Doc Speed", "Real-time", "End of day"], ["Accuracy", "98.7%", "~85%"], ["Prior Auth", "2 hours", "14 days"], ["Analytics", "Predictive", "Retrospective"]].map(([feat, us, them]) => (
                  <>
                    <div className="p-2.5 text-sky-200/70 border-t border-sky-400/10">{feat}</div>
                    <div className="p-2.5 text-emerald-400 font-semibold border-t border-sky-400/10 text-center">{us}</div>
                    <div className="p-2.5 text-sky-300/40 border-t border-sky-400/10 text-center">{them}</div>
                  </>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Traction & Metrics",
        blockType: "Chart Block",
        color: "#8B5CF6",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-sky-50">Hockey-Stick Growth</h3>
            {/* Mini bar chart */}
            <div className="flex items-end gap-3 h-32 px-4">
              {[{ q: "Q1", v: 20 }, { q: "Q2", v: 35 }, { q: "Q3", v: 55 }, { q: "Q4", v: 100 }].map(b => (
                <div key={b.q} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-sky-300/60">{b.q === "Q4" ? "$2.4M" : ""}</div>
                  <div
                    className="w-full rounded-t-md transition-all duration-1000"
                    style={{ height: `${b.v}%`, background: `linear-gradient(to top, #6366F120, #8B5CF6)` }}
                  />
                  <span className="text-[10px] text-sky-300/50">{b.q}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 text-center">
                <div className="text-lg font-bold text-violet-400">340%</div>
                <div className="text-[10px] text-sky-200/60">YoY Revenue Growth</div>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">94%</div>
                <div className="text-[10px] text-sky-200/60">Net Revenue Retention</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "The Ask — $15M Series A",
        blockType: "Decision Panel",
        color: "#F59E0B",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-sky-50">Use of Funds</h3>
            <div className="space-y-3">
              {[{ area: "Sales & Marketing", pct: 45, color: "#38BDF8" }, { area: "Product & Engineering", pct: 35, color: "#8B5CF6" }, { area: "Operations", pct: 20, color: "#10B981" }].map(f => (
                <div key={f.area}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sky-200">{f.area}</span>
                    <span className="text-sky-300/60">{f.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-sky-400/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${f.pct}%`, backgroundColor: f.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 mt-4">
              <p className="text-xs font-semibold text-amber-400 mb-1">Key Milestones with This Capital:</p>
              <div className="space-y-1">
                {["5 health system enterprise partnerships (Q1)", "Epic & Cerner marketplace integration (Q2)", "3 specialty modules — cardiology, oncology, ortho (Q3)"].map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-sky-200/70">
                    <Check className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "board-update",
    prompt: "Q4 board update deck for FinTech Capital — performance, portfolio, risks",
    icon: "📊",
    label: "Board Update",
    category: "Strategy",
    theme: { bg: "#1A1A2E", accent: "#A78BFA", fg: "#E5E7EB", muted: "#9CA3AF", card: "#1E1E3A" },
    logo: "FinTech Capital",
    slides: [
      {
        title: "Q4 2024 Board Update",
        subtitle: "FinTech Capital — Executive Summary",
        blockType: "Title Slide",
        color: "#A78BFA",
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <div className="px-4 py-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-400 text-xs font-semibold tracking-wider uppercase">Confidential · Board Only</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-violet-50 leading-tight">Q4 2024 Board Update</h2>
            <p className="text-violet-200/70 text-sm">FinTech Capital · Investment Portfolio Performance & Strategic Outlook</p>
            <div className="flex gap-6 mt-4">
              {[{ v: "$34.2M", l: "Revenue" }, { v: "18%", l: "QoQ Growth" }, { v: "2.3×", l: "Fund II MOIC" }, { v: "92%", l: "Retention" }].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-lg font-bold text-violet-400">{s.v}</div>
                  <div className="text-[10px] text-violet-300/50 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "Financial Performance",
        blockType: "Chart Block",
        color: "#10B981",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-violet-50">Revenue Exceeds Forecast by 7%</h3>
            <div className="flex items-end gap-2 h-28 px-2">
              {[{ q: "Q1", v: 55, val: "$26.2M" }, { q: "Q2", v: 65, val: "$28.9M" }, { q: "Q3", v: 68, val: "$29.0M" }, { q: "Q4", v: 100, val: "$34.2M" }].map(b => (
                <div key={b.q} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[9px] text-violet-300/50">{b.val}</div>
                  <div className="w-full rounded-t-md" style={{ height: `${b.v}%`, background: `linear-gradient(to top, #10B98120, #10B981)` }} />
                  <span className="text-[10px] text-violet-300/50">{b.q}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">23.7%</div>
                <div className="text-[10px] text-violet-200/60">EBITDA Margin</div>
              </div>
              <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 text-center">
                <div className="text-lg font-bold text-violet-400">3</div>
                <div className="text-[10px] text-violet-200/60">Cos → Profitability</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Risk Assessment",
        blockType: "2×2 Matrix",
        color: "#F59E0B",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-violet-50">Risk Exposure Down 22%</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <div className="font-semibold text-red-400 mb-1">High Impact</div>
                <p className="text-violet-200/60">Interest rate volatility — Fed signaling 2 cuts</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="font-semibold text-amber-400 mb-1">Medium Impact</div>
                <p className="text-violet-200/60">EU regulatory changes — manageable with compliance team</p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div className="font-semibold text-emerald-400 mb-1">Mitigated</div>
                <p className="text-violet-200/60">Hedging refinement reduced exposure 22%</p>
              </div>
              <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3">
                <div className="font-semibold text-sky-400 mb-1">Monitoring</div>
                <p className="text-violet-200/60">Talent retention stable at 92%</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Board Resolutions",
        blockType: "Decision Panel",
        color: "#6366F1",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-violet-50">Decisions Required</h3>
            <div className="space-y-3">
              {[
                { title: "Approve Q1 Investment Pipeline", detail: "$45M allocation across 3 deals", status: "Vote Required", statusColor: "#F59E0B" },
                { title: "Adopt Updated Risk Framework", detail: "New hedging model for 2025", status: "Recommended", statusColor: "#10B981" },
                { title: "Confirm Fund III Close Timeline", detail: "$250M final close — January target", status: "On Track", statusColor: "#38BDF8" },
              ].map(r => (
                <div key={r.title} className="rounded-lg border border-violet-400/10 bg-violet-400/5 p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-violet-50">{r.title}</div>
                    <div className="text-xs text-violet-300/50">{r.detail}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ color: r.statusColor, backgroundColor: r.statusColor + "15", border: `1px solid ${r.statusColor}30` }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "gtm-strategy",
    prompt: "Go-to-market strategy deck for CloudSync targeting mid-market B2B SaaS",
    icon: "🎯",
    label: "GTM Strategy",
    category: "Sales",
    theme: { bg: "#0F172A", accent: "#6366F1", fg: "#E2E8F0", muted: "#94A3B8", card: "#1E293B" },
    logo: "CloudSync",
    slides: [
      {
        title: "2025 GTM Strategy",
        subtitle: "CloudSync — Go-to-Market Playbook",
        blockType: "Title Slide",
        color: "#6366F1",
        content: (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-8">
            <div className="px-4 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-400 text-xs font-semibold tracking-wider uppercase">GTM Playbook · 2025</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-50 leading-tight">CloudSync</h2>
            <p className="text-indigo-200/70 text-sm max-w-md">Data Integration for the Mid-Market · 10× Faster Setup · 60% Lower Cost</p>
            <div className="flex gap-6 mt-4">
              {[{ v: "$12.4B", l: "TAM" }, { v: "19%", l: "CAGR" }, { v: "45K", l: "Target Cos" }, { v: "$5.7M", l: "GTM Budget" }].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-lg font-bold text-indigo-400">{s.v}</div>
                  <div className="text-[10px] text-indigo-300/50 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "Market Opportunity",
        blockType: "KPI Cards",
        color: "#10B981",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-indigo-50">$12.4B Market · 19% CAGR</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: "$12.4B", l: "Total Market", sub: "Data integration" }, { v: "$2.1B", l: "Addressable", sub: "Mid-market segment" }, { v: "45K", l: "Target Cos", sub: "$50M–$500M revenue" }].map(k => (
                <div key={k.l} className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 text-center">
                  <div className="text-xl font-bold text-indigo-400">{k.v}</div>
                  <div className="text-xs text-indigo-200 font-medium mt-1">{k.l}</div>
                  <div className="text-[10px] text-indigo-300/40">{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "Channel Strategy",
        blockType: "Three Pillars",
        color: "#8B5CF6",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-indigo-50">Three-Channel Attack</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { title: "Direct Sales", icon: "🎯", detail: "8 AEs · $500K+ ACV", budget: "$2.4M", pct: "42%" },
                { title: "Partners", icon: "🤝", detail: "Accenture, Deloitte", budget: "$600K", pct: "11%" },
                { title: "Product-Led", icon: "🚀", detail: "Free tier → 30% pipeline", budget: "$900K", pct: "16%" },
              ].map(ch => (
                <div key={ch.title} className="rounded-lg border border-indigo-400/10 bg-indigo-400/5 p-3 text-center">
                  <div className="text-2xl mb-2">{ch.icon}</div>
                  <div className="text-xs font-bold text-indigo-200">{ch.title}</div>
                  <div className="text-[10px] text-indigo-300/50 mt-1">{ch.detail}</div>
                  <div className="mt-2 text-sm font-bold text-indigo-400">{ch.budget}</div>
                  <div className="text-[10px] text-indigo-300/40">{ch.pct} of budget</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "90-Day Launch Plan",
        blockType: "Timeline",
        color: "#F59E0B",
        content: (
          <div className="space-y-4 p-2">
            <h3 className="text-xl font-bold text-indigo-50">Execution Roadmap</h3>
            <div className="space-y-3 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500 via-violet-500 to-amber-500 opacity-30" />
              {[
                { phase: "Q1", title: "Brand Launch", items: ["Website relaunch", "Analyst briefings", "Sales enablement"], color: "#6366F1" },
                { phase: "Q2", title: "Content Engine", items: ["12 case studies", "6 webinars", "SEO campaign"], color: "#8B5CF6" },
                { phase: "Q3", title: "Event Circuit", items: ["AWS re:Invent", "Industry conferences", "Partner summit"], color: "#F59E0B" },
              ].map(p => (
                <div key={p.phase} className="flex gap-3 relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ backgroundColor: p.color + "20", color: p.color, border: `2px solid ${p.color}40` }}>{p.phase}</div>
                  <div className="flex-1 rounded-lg border border-indigo-400/10 bg-indigo-400/5 p-3">
                    <div className="text-sm font-semibold text-indigo-200">{p.title}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {p.items.map(item => (
                        <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-400/10 text-indigo-300/60">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN DEMO COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function Demo() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"pick" | "generating" | "viewing">("pick");
  const [selectedDeck, setSelectedDeck] = useState<DemoDeck | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [genLabel, setGenLabel] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Generation simulation ──────────────────── */
  const startGeneration = useCallback((deck: DemoDeck) => {
    setSelectedDeck(deck);
    setActiveSlide(0);
    setGenProgress(0);
    setStage("generating");

    const labels = ["Analyzing prompt…", "Building narrative structure…", "Creating visual blocks…", "Applying theme & brand…", "Finalizing slides…"];
    let progress = 0;
    let labelIdx = 0;
    setGenLabel(labels[0]);

    const interval = setInterval(() => {
      progress += 2 + Math.random() * 3;
      if (progress > 100) progress = 100;
      setGenProgress(progress);

      const newIdx = Math.min(Math.floor(progress / 20), labels.length - 1);
      if (newIdx !== labelIdx) {
        labelIdx = newIdx;
        setGenLabel(labels[labelIdx]);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStage("viewing"), 400);
      }
    }, 80);
  }, []);

  const reset = () => {
    setStage("pick");
    setSelectedDeck(null);
    setActiveSlide(0);
  };

  const prevSlide = () => setActiveSlide(i => Math.max(0, i - 1));
  const nextSlide = () => {
    if (!selectedDeck) return;
    setActiveSlide(i => Math.min(selectedDeck.slides.length - 1, i + 1));
  };

  /* ── Keyboard nav ───────────────────────────── */
  useEffect(() => {
    if (stage !== "viewing") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextSlide(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prevSlide(); }
      if (e.key === "Escape") reset();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage, selectedDeck]);

  return (
    <>
      <Helmet>
        <title>Interactive Demo | AXIVA — See AI Presentations in Action</title>
        <meta name="description" content="Try AXIVA's AI presentation generator live. Pick a scenario, watch AI build executive-grade slides in seconds, and explore the results." />
      </Helmet>

      <MarketingHeader />

      <main className="min-h-screen flex flex-col">
        {/* ═══ STAGE 1: PICK A SCENARIO ═══ */}
        {stage === "pick" && (
          <section className="flex-1 pt-28 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
              {/* Hero */}
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs sm:text-sm font-medium mb-6">
                  <MousePointerClick className="h-3.5 w-3.5" />
                  Interactive Demo — Try it yourself
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                  Watch AI build a deck
                  <br className="hidden sm:block" />
                  <span className="text-accent"> in real time</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Pick a scenario below. AXIVA will analyze the prompt, structure the narrative, and generate executive-ready slides — all in seconds.
                </p>
              </div>

              {/* Scenario cards */}
              <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {DECKS.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => startGeneration(deck)}
                    className="group relative text-left p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-accent/40 hover:bg-card/70 transition-all duration-300 overflow-hidden"
                  >
                    {/* Top glow on hover */}
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: deck.theme.accent }} />

                    <span className="text-3xl mb-4 block">{deck.icon}</span>
                    <div className="mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{deck.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{deck.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{deck.prompt}</p>

                    {/* Slide count + theme preview */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {deck.slides.slice(0, 4).map((s, i) => (
                          <div key={i} className="w-5 h-3.5 rounded-sm border border-background" style={{ backgroundColor: s.color + "40" }} />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{deck.slides.length} slides</span>
                    </div>

                    {/* Arrow */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 -translate-x-1">
                      <ArrowRight className="h-5 w-5 text-accent" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Bottom note */}
              <p className="text-center text-xs text-muted-foreground mt-8">
                Or <button onClick={() => navigate("/create")} className="text-accent hover:underline">create your own deck</button> from scratch — free, no sign-up required.
              </p>
            </div>
          </section>
        )}

        {/* ═══ STAGE 2: GENERATING ═══ */}
        {stage === "generating" && selectedDeck && (
          <section className="flex-1 flex items-center justify-center pt-24 pb-20 px-4">
            <div className="max-w-lg w-full text-center">
              {/* Animated logo */}
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-2xl border-2 border-accent/30 border-t-accent animate-spin" style={{ animationDuration: "1.5s" }} />
                <div className="absolute inset-3 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedDeck.theme.accent + "15" }}>
                  <Sparkles className="h-7 w-7" style={{ color: selectedDeck.theme.accent }} />
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden max-w-xs mx-auto">
                  <div
                    className="h-full rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${genProgress}%`, backgroundColor: selectedDeck.theme.accent }}
                  />
                </div>
              </div>

              <p className="text-sm font-medium text-foreground mb-1">{genLabel}</p>
              <p className="text-xs text-muted-foreground">"{selectedDeck.prompt}"</p>

              {/* Slide previews appearing */}
              <div className="flex justify-center gap-2 mt-8">
                {selectedDeck.slides.map((s, i) => (
                  <div
                    key={i}
                    className="w-12 h-8 rounded-md border transition-all duration-500"
                    style={{
                      backgroundColor: genProgress > (i + 1) * 20 ? selectedDeck.theme.bg : "transparent",
                      borderColor: genProgress > (i + 1) * 20 ? s.color + "60" : "rgba(255,255,255,0.1)",
                      opacity: genProgress > (i + 1) * 20 ? 1 : 0.2,
                      transform: genProgress > (i + 1) * 20 ? "translateY(0)" : "translateY(4px)",
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ STAGE 3: VIEWING ═══ */}
        {stage === "viewing" && selectedDeck && (
          <section ref={containerRef} className="flex-1 pt-20 pb-12 px-4">
            <div className="max-w-5xl mx-auto">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Try another
                  </button>
                  <span className="text-border">|</span>
                  <span className="text-sm font-semibold text-foreground">{selectedDeck.logo}</span>
                  <span className="text-xs text-muted-foreground">· {selectedDeck.slides.length} slides generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-muted-foreground px-2 py-1 rounded-md bg-muted/30">
                    <kbd className="font-mono bg-muted/50 px-1 rounded">←</kbd>
                    <kbd className="font-mono bg-muted/50 px-1 rounded">→</kbd>
                    Navigate
                  </span>
                  <Button size="sm" variant="hero" className="gap-1.5 text-xs" onClick={() => navigate("/create")}>
                    <Sparkles className="h-3 w-3" />
                    Create Your Own
                  </Button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[220px_1fr] gap-4">
                {/* Slide thumbnails sidebar */}
                <div className="hidden lg:flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedDeck.slides.map((slide, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={cn(
                        "relative text-left p-3 rounded-xl border transition-all duration-200",
                        i === activeSlide
                          ? "border-accent/50 bg-card/80 shadow-lg"
                          : "border-border/30 bg-card/20 hover:bg-card/40"
                      )}
                    >
                      {/* Active indicator */}
                      {i === activeSlide && (
                        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ backgroundColor: selectedDeck.theme.accent }} />
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{i + 1}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slide.color }} />
                      </div>
                      <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{slide.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{slide.blockType}</p>
                    </button>
                  ))}
                </div>

                {/* Main slide viewer */}
                <div className="relative">
                  {/* Slide canvas */}
                  <div
                    className="rounded-2xl overflow-hidden border shadow-2xl transition-colors duration-500 min-h-[400px] sm:min-h-[480px]"
                    style={{
                      backgroundColor: selectedDeck.theme.bg,
                      borderColor: selectedDeck.slides[activeSlide].color + "30",
                    }}
                  >
                    {/* Top chrome bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: selectedDeck.slides[activeSlide].color + "15" }}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedDeck.theme.accent + "40" }} />
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedDeck.theme.accent + "25" }} />
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedDeck.theme.accent + "15" }} />
                        </div>
                        <span className="text-[10px] font-mono ml-2" style={{ color: selectedDeck.theme.muted + "80" }}>
                          {selectedDeck.logo} — {selectedDeck.slides[activeSlide].blockType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-medium" style={{ color: selectedDeck.theme.accent }}>
                          {activeSlide + 1} / {selectedDeck.slides.length}
                        </span>
                      </div>
                    </div>

                    {/* Slide content */}
                    <div className="p-5 sm:p-8">
                      {selectedDeck.slides[activeSlide].content}
                    </div>

                    {/* Logo footer */}
                    <div className="flex items-center justify-between px-5 py-2 border-t" style={{ borderColor: selectedDeck.slides[activeSlide].color + "10" }}>
                      <span className="text-[9px] font-semibold tracking-wider" style={{ color: selectedDeck.theme.accent + "80" }}>
                        {selectedDeck.logo}
                      </span>
                      <span className="text-[9px]" style={{ color: selectedDeck.theme.muted + "50" }}>
                        Built with AXIVA
                      </span>
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevSlide}
                      disabled={activeSlide === 0}
                      className="gap-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </Button>

                    {/* Mobile dots */}
                    <div className="flex lg:hidden items-center gap-1.5">
                      {selectedDeck.slides.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className="transition-all duration-300"
                          style={{
                            width: i === activeSlide ? 24 : 6,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: i === activeSlide ? selectedDeck.theme.accent : "rgba(255,255,255,0.15)",
                          }}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextSlide}
                      disabled={activeSlide === selectedDeck.slides.length - 1}
                      className="gap-1.5"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Export bar */}
                  <div className="mt-6 rounded-xl border border-border/30 bg-card/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-accent" />
                      <span>{selectedDeck.slides.length} slides ready to export</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {["PowerPoint", "PDF", "Share Link"].map((fmt) => (
                        <span key={fmt} className="text-[10px] px-3 py-1.5 rounded-lg border border-border/30 bg-muted/20 text-foreground/70">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center mt-12 pt-10 border-t border-border/20">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Like what you see?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your own executive deck in minutes. Paste notes, describe your goal, or start from a template.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button variant="hero" size="lg" onClick={() => navigate("/create")} className="group gap-2">
                    Create Your Deck Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate("/templates")}>
                    Browse Templates
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">No credit card · No sign-up required to try</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
