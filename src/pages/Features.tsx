import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, FileOutput, BarChart3, Timer, ExternalLink, MousePointerClick, LayoutGrid, GitBranch, Target, TrendingUp, Calendar, Layers, Image, ToggleLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

const heroFeatures = [
  { label: "23 Timeline Styles", icon: Timer },
  { label: "Live Embeds", icon: ExternalLink },
  { label: "Smart Layouts", icon: LayoutGrid },
  { label: "CTA Buttons", icon: MousePointerClick },
  { label: "PPTX Export", icon: FileOutput },
];

const featureBlocks = [
  { icon: Timer, title: "23 Timeline Styles", subtitle: "The most advanced timeline generator available", description: "One dataset generates multiple narrative views. Enter events once, switch between Gantt charts, roadmaps, scenario branching, cause-effect chains, three-horizon models, and more.", color: "#10B981", details: ["Core: Horizontal, Vertical, Gantt, Milestones, Swim Lanes, Alternating", "Strategy: Strategic Phase, Three Horizon, Product Evolution, Decision Gate", "Visual: S-Curve, Calendar, Step Process, Layered Theme, Before/After", "Advanced: Scenario Branching, Impact Magnitude, Cause & Effect", "Viral: Life Journey, Company Story, Tech Evolution, Then vs Now, Future Prediction"], cta: { text: "Try Timeline Generator", href: "/templates" } },
  { icon: LayoutGrid, title: "Smart Executive Layouts", subtitle: "6 named consulting patterns, not generic columns", description: "Executive Summary with metrics. Recommendation with evidence and risk notes. Metrics + Commentary side-by-side. Comparison columns. Spotlight. Agenda with owners.", color: "#8B5CF6", details: ["Executive Summary: Key message + 4 color-coded metric cards", "Metrics + Commentary: KPI grid left, analysis text right", "Recommendation: Recommendation box + evidence bullets + risk note", "Comparison Columns: 2-3 options side by side with color coding", "Spotlight: Large featured metric + supporting details", "Agenda: Numbered items with owners and time allocation"], cta: { text: "Create a Deck", href: "/create" } },
  { icon: ExternalLink, title: "Live Dashboard Embeds", subtitle: "Embed live data directly in your presentations", description: "Paste a Google Sheets, PowerBI, Tableau, Figma, or Miro URL. AXIVA auto-detects the provider and transforms it into an embedded widget.", color: "#F59E0B", details: ["Google Sheets → live KPI dashboard in your board deck", "PowerBI → revenue reports in quarterly reviews", "Figma → prototypes in product strategy presentations", "Miro → collaboration boards in workshop decks", "YouTube, Loom → video content in training decks", "Calendly → booking pages in sales decks"], cta: { text: "Try It Free", href: "/auth" } },
  { icon: MousePointerClick, title: "CTA Action Buttons", subtitle: "Turn shared decks into decision-making tools", description: "Add 'Approve This', 'Schedule Follow-up', or 'Book a Demo' buttons. 3 layouts, 4 styles, 10 icons. Card layout with descriptions.", color: "#EF4444", details: ["Calendly integration for scheduling follow-ups", "Mailto links for quick approvals", "Card layout with icons and descriptions", "Primary, secondary, outline, and ghost styles", "Horizontal, vertical, or card grid layouts"], cta: { text: "Create a Deck", href: "/create" } },
  { icon: Brain, title: "BCG & McKinsey Methodology", subtitle: "Consulting-grade structure built into every deck", description: "Every deck follows the Pyramid Principle. Action titles instead of topic labels. Answer-first structure. 70% visual density.", color: "#3B82F6", details: ["Pyramid Principle for logical slide structure", "Action titles that communicate the key message", "Answer-first: lead with conclusions, support with evidence", "70% visual density — charts and visuals, not text walls", "MECE structure for exhaustive analysis"], cta: { text: "See Consulting Templates", href: "/templates/consulting-deck-template" } },
  { icon: FileOutput, title: "Export Anywhere", subtitle: "PowerPoint, PDF, PNG, and shareable web links", description: "Native .pptx export with proper scaling. PDF for email. PNG for social. Shareable links with presenter mode.", color: "#06B6D4", details: ["PowerPoint (.pptx) with uniform scaling and autoFit", "PDF export for board packs", "PNG download for social media", "Shareable web links with presenter mode", "Watermark-free exports for Pro users"], cta: { text: "Start Free", href: "/auth" } },
];

const blockTypeGrid = [
  { icon: BarChart3, name: "KPI Dashboards", color: "#3B82F6" },
  { icon: Target, name: "Decision Panels", color: "#EF4444" },
  { icon: GitBranch, name: "Scenario Branching", color: "#7C3AED" },
  { icon: TrendingUp, name: "Chart Blocks", color: "#F97316" },
  { icon: Layers, name: "Three Pillars", color: "#10B981" },
  { icon: ToggleLeft, name: "Interactive Tabs", color: "#8B5CF6" },
  { icon: Calendar, name: "Calendar Timelines", color: "#06B6D4" },
  { icon: Image, name: "AI Images", color: "#EC4899" },
];

const Features = () => (
  <div className="min-h-screen bg-background">
    <MarketingHeader />
    <main>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden"><div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[120px] opacity-60" /></div>
        <div className="container-narrow relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium mb-8"><Sparkles className="h-4 w-4" /><span>Executive-Grade Features</span></div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">Everything executives need.{" "}<span className="text-gradient">Nothing they don't.</span></h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">Live dashboard embeds. 23 timeline styles. Smart consulting layouts. CTA buttons for approvals. Not just slides — a decision-making platform.</p>
          <div className="flex flex-wrap justify-center gap-3">{heroFeatures.map(f => (<div key={f.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 text-sm font-medium"><f.icon className="h-4 w-4 text-accent" />{f.label}</div>))}</div>
        </div>
      </section>

      <section className="py-20 border-t border-border/40">
        <div className="container-narrow space-y-24">
          {featureBlocks.map((feature, i) => (
            <div key={i} className={cn("flex flex-col gap-8", i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row")}>
              <div className="flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5" style={{ background: `${feature.color}15` }}><feature.icon className="h-6 w-6" style={{ color: feature.color }} /></div>
                <p className="text-accent text-sm font-medium uppercase tracking-wider mb-2">{feature.subtitle}</p>
                <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                <Link to={feature.cta.href}><Button variant="hero" className="group">{feature.cta.text}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Button></Link>
              </div>
              <div className="flex-1">
                <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-3">
                  {feature.details.map((d, j) => (<div key={j} className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: feature.color }} /><p className="text-sm text-foreground/80">{d}</p></div>))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 border-t border-border/40 bg-muted/20">
        <div className="container-narrow">
          <div className="text-center mb-12"><h2 className="text-3xl font-bold mb-3">25+ Specialized Block Types</h2><p className="text-muted-foreground">Every block designed for executive communication</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{blockTypeGrid.map(b => (<div key={b.name} className="p-4 rounded-xl border border-border/50 bg-card/40 text-center"><div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2" style={{ background: `${b.color}15` }}><b.icon className="h-5 w-5" style={{ color: b.color }} /></div><p className="text-sm font-medium">{b.name}</p></div>))}</div>
        </div>
      </section>

      <section className="py-20 border-t border-border/40">
        <div className="container-narrow">
          <div className="glass-card p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">See it in action</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Create a board-ready deck in under 2 minutes. 14-day free trial. No credit card required.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth"><Button variant="hero" size="xl" className="group">Try AXIVA Free<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></Button></Link>
              <Link to="/templates"><Button variant="outline" size="xl">Browse Templates</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Features;
