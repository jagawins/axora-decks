/**
 * Executive Features Showcase — Landing Page Section
 *
 * Interactive demo showing the 3 executive block types in action:
 * Smart Layouts, Live Embeds, CTA Buttons
 * Plus the 23 Timeline Styles highlight
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  LayoutGrid, ExternalLink, MousePointerClick, CalendarDays,
  ArrowRight, TrendingUp, Target, AlertTriangle, CheckCircle,
  Calendar, Mail, Download, Clock, User, Crown, Sparkles
} from "lucide-react";

type Tab = "smart-layouts" | "live-embeds" | "cta-buttons" | "timelines";

const TABS: { id: Tab; label: string; icon: React.FC<any>; badge?: string }[] = [
  { id: "smart-layouts", label: "Smart Layouts", icon: LayoutGrid },
  { id: "live-embeds", label: "Live Embeds", icon: ExternalLink },
  { id: "cta-buttons", label: "CTA Buttons", icon: MousePointerClick },
  { id: "timelines", label: "23 Timelines", icon: CalendarDays, badge: "PRO" },
];

/* ── Smart Layouts Demo ─────────────────────────────────── */
function SmartLayoutsDemo() {
  const [layout, setLayout] = useState<string>("recommendation");
  const layouts = [
    { id: "recommendation", label: "Recommendation" },
    { id: "exec-summary", label: "Exec Summary" },
    { id: "metrics-commentary", label: "Metrics + Analysis" },
    { id: "agenda", label: "Agenda" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {layouts.map(l => (
          <button key={l.id} onClick={() => setLayout(l.id)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              layout === l.id ? "bg-accent text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground")}>
            {l.label}
          </button>
        ))}
      </div>

      {layout === "recommendation" && (
        <div className="space-y-3">
          <div className="rounded-xl bg-accent/10 border-2 border-accent/30 p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Recommendation</p>
                <p className="text-sm font-semibold mt-1">Expand to European market in Q2 2026 with a Berlin-first strategy</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <div><p className="text-xs font-semibold">EU market growing 34% YoY</p><p className="text-[10px] text-muted-foreground">Validated by Gartner Q4 report</p></div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <div><p className="text-xs font-semibold">Berlin has 3x lower CAC than London</p><p className="text-[10px] text-muted-foreground">Based on pilot campaign data</p></div>
          </div>
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="text-[10px] font-bold text-amber-500 uppercase">Risk</p><p className="text-[10px] text-muted-foreground">GDPR compliance requires $120K investment in data infrastructure</p></div>
          </div>
        </div>
      )}

      {layout === "exec-summary" && (
        <div className="space-y-3">
          <div className="rounded-xl bg-accent/5 border border-accent/20 p-3">
            <p className="text-sm font-medium">Q4 exceeded targets across all KPIs. Revenue up 23%, churn at all-time low. Recommend accelerating EU expansion.</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[{ v: "$14.2M", l: "ARR", s: "text-green-400 bg-green-500/10 border-green-500/20" }, { v: "+23%", l: "Growth", s: "text-green-400 bg-green-500/10 border-green-500/20" }, { v: "1.8%", l: "Churn", s: "text-blue-400 bg-blue-500/10 border-blue-500/20" }, { v: "142%", l: "NRR", s: "text-violet-400 bg-violet-500/10 border-violet-500/20" }].map((m, i) => (
              <div key={i} className={cn("rounded-lg border p-2.5 text-center", m.s)}>
                <p className="text-lg font-bold">{m.v}</p>
                <p className="text-[9px] opacity-70">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === "metrics-commentary" && (
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 grid grid-cols-2 gap-2">
            {[{ v: "$14.2M", l: "ARR", up: true }, { v: "2,847", l: "Customers", up: true }, { v: "1.8%", l: "Churn", up: false }, { v: "$52", l: "CAC", up: false }].map((m, i) => (
              <div key={i} className="rounded-lg border border-border/50 p-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp className={cn("h-3 w-3", m.up ? "text-green-500" : "text-red-500")} />
                  <span className="text-[9px] text-muted-foreground">{m.l}</span>
                </div>
                <p className="text-base font-bold">{m.v}</p>
              </div>
            ))}
          </div>
          <div className="col-span-2 rounded-lg border border-border/50 p-3">
            <p className="text-[10px] font-semibold mb-1.5">Analysis</p>
            <p className="text-[9px] text-muted-foreground leading-relaxed">Strong growth trajectory. CAC decreasing as brand awareness increases. Churn at all-time low driven by product improvements in Q3.</p>
          </div>
        </div>
      )}

      {layout === "agenda" && (
        <div className="space-y-2">
          {[{ t: "Financial Review", o: "CFO", time: "15 min" }, { t: "Product Update", o: "CTO", time: "20 min" }, { t: "EU Expansion Proposal", o: "CEO", time: "25 min" }, { t: "Q&A + Voting", o: "All", time: "15 min" }].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">{i + 1}</div>
              <p className="text-xs font-semibold flex-1">{item.t}</p>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><User className="h-3 w-3" />{item.o}</div>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><Clock className="h-3 w-3" />{item.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Live Embeds Demo ───────────────────────────────────── */
function LiveEmbedsDemo() {
  const providers = [
    { name: "Google Sheets", icon: "📊", desc: "Live KPI dashboards" },
    { name: "PowerBI", icon: "📈", desc: "Revenue reports" },
    { name: "Tableau", icon: "📉", desc: "Data visualizations" },
    { name: "Figma", icon: "🎨", desc: "Design prototypes" },
    { name: "Miro", icon: "🗺️", desc: "Whiteboard embeds" },
    { name: "Loom", icon: "🎥", desc: "Video walkthroughs" },
    { name: "YouTube", icon: "▶️", desc: "Video content" },
    { name: "Calendly", icon: "📅", desc: "Booking widgets" },
    { name: "Airtable", icon: "📋", desc: "Database views" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <p className="text-sm font-semibold">Q4 Revenue Dashboard</p>
          <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">LIVE</span>
        </div>
        <div className="rounded-lg bg-white/5 border border-border/30 h-32 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Paste any Google Sheets, PowerBI, or Tableau URL → auto-embeds</p>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-2 italic">Data updates in real-time — no manual refresh needed</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {providers.map(p => (
          <div key={p.name} className="flex items-center gap-2 p-2 rounded-lg border border-border/30 hover:border-accent/30 transition-colors">
            <span className="text-lg">{p.icon}</span>
            <div><p className="text-[10px] font-semibold">{p.name}</p><p className="text-[8px] text-muted-foreground">{p.desc}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CTA Buttons Demo ───────────────────────────────────── */
function CTAButtonsDemo() {
  return (
    <div className="space-y-5">
      {/* Horizontal layout */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Horizontal Layout</p>
        <div className="flex gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold"><Calendar className="h-3.5 w-3.5" /> Schedule Follow-up</div>
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-accent text-accent text-xs font-semibold"><Mail className="h-3.5 w-3.5" /> Email Board</div>
        </div>
      </div>

      {/* Card layout */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Card Layout</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ icon: Calendar, label: "Book a Demo", desc: "30-min Calendly call" }, { icon: Download, label: "Download Case Study", desc: "PDF with ROI data" }, { icon: Mail, label: "Contact Sales", desc: "Enterprise pricing" }, { icon: CheckCircle, label: "Approve Proposal", desc: "One-click approval" }].map((btn, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-border/50 hover:border-accent/30 transition-all cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <btn.icon className="h-4 w-4 text-accent" />
              </div>
              <div><p className="text-[11px] font-semibold">{btn.label}</p><p className="text-[9px] text-muted-foreground">{btn.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Timelines Demo ─────────────────────────────────────── */
function TimelinesDemo() {
  const categories = [
    { name: "Core", count: 6, styles: "Horizontal, Vertical, Gantt, Milestones, Swim Lanes, Alternating" },
    { name: "Strategy", count: 4, styles: "Strategic Phase, Three Horizon, Product Evolution, Decision Gate" },
    { name: "Visual", count: 5, styles: "S-Curve, Calendar, Step Process, Layered, Before/After" },
    { name: "Advanced", count: 3, styles: "Scenario Branching, Impact Magnitude, Cause & Effect" },
    { name: "Viral", count: 5, styles: "Life Journey, Company Story, Tech Evolution, Then vs Now, Future Prediction" },
  ];
  const colors = ["bg-blue-500", "bg-teal-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 text-center">
        <p className="text-lg font-bold">One Dataset → Multiple Narrative Views</p>
        <p className="text-xs text-muted-foreground mt-1">Enter events once. Switch between 23 styles with one click.</p>
      </div>
      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={cat.name} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold", colors[i])}>{cat.count}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold">{cat.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{cat.styles}</p>
            </div>
          </div>
        ))}
      </div>
      <Link to="/templates" className="flex items-center justify-center gap-2 text-xs text-accent font-semibold hover:underline">
        Try the Timeline Generator <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
const DEMOS: Record<Tab, React.FC> = {
  "smart-layouts": SmartLayoutsDemo,
  "live-embeds": LiveEmbedsDemo,
  "cta-buttons": CTAButtonsDemo,
  "timelines": TimelinesDemo,
};

export default function ExecutiveShowcase() {
  const [tab, setTab] = useState<Tab>("smart-layouts");
  const Demo = DEMOS[tab];

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.015] to-transparent" />
      <div className="container-wide relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Only tool with delivery coaching built in
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Not just slides. A speaking system.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Vocal coaching. Story structure. Q&A readiness. Smart layouts.
            Prepare what to say AND how to say it — in one workflow.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 justify-center flex-wrap">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all",
                  tab === t.id ? "bg-accent text-white shadow-md" : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border")}>
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                {t.badge && <span className="text-[8px] bg-amber-400/20 text-amber-400 px-1 py-0.5 rounded-full ml-0.5">{t.badge}</span>}
              </button>
            ))}
          </div>

          {/* Demo area */}
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 min-h-[340px]">
            <Demo />
          </div>
        </div>
      </div>
    </section>
  );
}
