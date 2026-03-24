import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, FileOutput, BarChart3, Timer, ExternalLink, MousePointerClick, LayoutGrid, GitBranch, Target, TrendingUp, Calendar, Layers, Image, ToggleLeft, Shield, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

const heroFeatures = [
  { label: "Delivery Coaching", icon: Target },
  { label: "Q&A Readiness", icon: Shield },
  { label: "Rehearsal Planner", icon: Calendar },
  { label: "23 Timelines", icon: Timer },
  { label: "PPTX Export", icon: FileOutput },
];

const featureBlocks = [
  { icon: Target, title: "Speech Prep + Delivery Coaching", subtitle: "No competitor has this — coaching built into deck generation", description: "Prepare what to say AND how to say it. Vocal coaching (pace, volume, strategic pausing), storytelling structure (head → heart → head, looping technique), body language tips, and a pre-flight checklist. Techniques from Vinh Giang, Simon Sinek, and Carmine Gallo — integrated into your workflow.", color: "#3B82F6", details: ["Vocal coaching: pace control, volume variation, strategic pauses", "Story structure: head → heart → head, looping, audience as hero", "Body language: eye contact rotation, purposeful movement, open with a question", "Pre-flight checklist: 5 items to verify before you present", "3 speech types: Get a decision, Drive change, Handle a crisis"], cta: { text: "Try Speech Prep", href: "/executive" } },
  { icon: Shield, title: "Q&A Readiness + Crisis", subtitle: "No competitor has this as a product feature", description: "AI generates anticipated questions from your deck. Build 3-message maps for high-stress moments. 4 crisis templates. Timed 30-second drill mode to build muscle memory.", color: "#EF4444", details: ["Q&A Bank: AI generates 8-15 questions with difficulty ratings", "Message Map: 3 key messages × 3 supporting facts (9-word limit)", "Crisis Templates: Layoff, Security, Outage, Regulatory", "Timed Drill: 30-second countdown, color-coded timer, show/hide answers", "Each crisis follows: Empathy → Facts → Action → Next Update"], cta: { text: "Try Q&A Readiness", href: "/executive" } },
  { icon: Calendar, title: "Rehearsal Planner", subtitle: "14-day preparation system with readiness scoring", description: "12-step checklist from Day 14 to post-delivery debrief. Color-coded categories: draft, rehearse, coach, Q&A, dress, deliver. Track readiness score and run-throughs.", color: "#F59E0B", details: ["12-step two-week rehearsal checklist", "Readiness score auto-calculated from completed steps", "Run-through counter to track full practice sessions", "Coaching notes capture for feedback", "6 color-coded categories: draft, rehearse, coach, qa, dress, deliver"], cta: { text: "Try Rehearsal Planner", href: "/executive" } },
  { icon: Timer, title: "23 Timeline Styles", subtitle: "The most advanced timeline generator available", description: "One dataset generates multiple narrative views. Enter events once, switch between Gantt charts, roadmaps, scenario branching, cause-effect chains, three-horizon models, and more.", color: "#10B981", details: ["Core: Horizontal, Vertical, Gantt, Milestones, Swim Lanes, Alternating", "Strategy: Strategic Phase, Three Horizon, Product Evolution, Decision Gate", "Visual: S-Curve, Calendar, Step Process, Layered Theme, Before/After", "Advanced: Scenario Branching, Impact Magnitude, Cause & Effect", "Viral: Life Journey, Company Story, Tech Evolution, Then vs Now, Future Prediction"], cta: { text: "Try Timeline Generator", href: "/templates" } },
  { icon: BarChart3, title: "Live Audience Polls", subtitle: "Built-in Slido alternative — no separate tool", description: "Add live polls, Q&A, word clouds, and surveys directly into your deck. Audience joins by scanning a QR code or entering a 6-digit code. Results update in real-time on screen. No downloads, no logins, no extra tools.", color: "#8B5CF6", details: ["Live polls: multiple choice, rating (1-5), yes/no vote with instant results", "Audience Q&A: submit and upvote questions, anonymous option, sorted by votes", "Word cloud: one-word submissions rendered live, bigger = more popular", "Feedback survey: post-presentation rating + text + yes/no questions", "QR code + 6-digit event code generated for each interaction block"], cta: { text: "Try Live Polls", href: "/executive" } },
  { icon: FileOutput, title: "Export + Integrations", subtitle: "PowerPoint, PDF, PNG, and shareable web links", description: "Native .pptx export with proper scaling. PDF for email. PNG for social. Live dashboard embeds (Google Sheets, PowerBI, Figma). CTA buttons for approvals.", color: "#06B6D4", details: ["PowerPoint (.pptx) with uniform scaling and autoFit", "Live Embeds: Google Sheets, PowerBI, Tableau, Figma, Miro", "CTA Buttons: Calendly, mailto, custom links", "Smart Executive Layouts: 6 consulting patterns", "Shareable web links with presenter mode"], cta: { text: "Start Free", href: "/auth" } },
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
