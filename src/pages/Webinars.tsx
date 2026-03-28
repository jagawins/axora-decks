import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3, MessageSquare, Cloud, Sparkles, Check,
  ArrowRight, Users, Zap, FileText, Mic, Calendar,
  QrCode, Smartphone, Video, Shield, Clock, Star,
  Presentation, ChevronRight
} from "lucide-react";

/* ── Before / During / After timeline ───────────────────── */
const PHASES = [
  {
    phase: "Before",
    icon: Calendar,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    steps: [
      { title: "Write your speech", desc: "Use Speech Prep to structure your talk. Pick your goal: get a decision, drive change, or handle a crisis.", link: "/executive" },
      { title: "Generate your deck", desc: "AI builds slides from your speech with answer-first structure, consulting-grade visuals, action titles.", link: "/create" },
      { title: "Add audience polls", desc: "Insert live polls, Q&A, and word clouds directly into your deck. QR codes generate automatically.", link: "/dashboard?tab=live-polls" },
      { title: "Share the link early", desc: "Send the deck link to attendees before the webinar. They can submit questions in advance via the Q&A block." },
    ],
  },
  {
    phase: "During",
    icon: Presentation,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    steps: [
      { title: "Present your deck", desc: "Full-screen presenter mode. Your slides, polls, and Q&A are all in one place, no tab switching." },
      { title: "Run live polls", desc: "Audience scans QR code from the slide. Votes from their phone. Results update live on your screen." },
      { title: "Use delivery coaching", desc: "Vocal tips, strategic pauses, and story structure are built into your Speech Prep notes. Glance at them as you present." },
      { title: "Answer top questions", desc: "Q&A block sorts questions by upvotes. Address the most popular ones first. Mark as answered." },
    ],
  },
  {
    phase: "After",
    icon: BarChart3,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    steps: [
      { title: "Review poll results", desc: "All votes are saved. See percentages, vote counts, and participation rates in your dashboard." },
      { title: "Export unanswered questions", desc: "Questions you did not get to are still saved. Follow up by email or in the next session." },
      { title: "Share the deck", desc: "Send the deck link to attendees. They can review slides, see poll results, and submit follow-up questions." },
      { title: "Track outcomes", desc: "Log the event in your Executive Hub. Track whether the decision was made, deferred, or needs follow-up." },
    ],
  },
];

/* ── Comparison: AXIVA vs Slido + PowerPoint ────────────── */
const COMPARISON = [
  { feature: "Deck generation", axiva: true, combo: false },
  { feature: "Speech prep + delivery coaching", axiva: true, combo: false },
  { feature: "Live polls with QR code", axiva: true, combo: true },
  { feature: "Audience Q&A with upvoting", axiva: true, combo: true },
  { feature: "Word cloud", axiva: true, combo: true },
  { feature: "Pre-event question collection", axiva: true, combo: true },
  { feature: "Post-event analytics", axiva: true, combo: true },
  { feature: "AI-suggested polls from content", axiva: true, combo: false },
  { feature: "Everything in one tool", axiva: true, combo: false },
  { feature: "No extra subscription needed", axiva: true, combo: false },
  { feature: "PPTX export", axiva: true, combo: true },
];

/* ── Feature cards ──────────────────────────────────────── */
const FEATURES = [
  { icon: Sparkles, title: "AI builds your deck", desc: "Describe your webinar topic. AI generates structured slides with answer-first format, charts, and action titles." },
  { icon: Mic, title: "Speech prep with coaching", desc: "Write your speech, get vocal tips, story structure, and a pre-flight checklist. Know what to say AND how to say it." },
  { icon: QrCode, title: "Live polls built in", desc: "Polls, Q&A, word clouds, and surveys are deck blocks. QR code + event code generated automatically." },
  { icon: MessageSquare, title: "Pre-event Q&A", desc: "Share your deck link before the webinar. Attendees submit questions in advance. Most-upvoted rise to the top." },
  { icon: Shield, title: "Crisis-ready templates", desc: "Tough topic? Use crisis templates for layoffs, incidents, or regulatory announcements. Empathy-first structure." },
  { icon: BarChart3, title: "Post-event results", desc: "All votes, questions, and feedback saved to your dashboard. Export or follow up. Nothing gets lost." },
];

export default function Webinars() {
  const { user } = useAuth();

  return (
    <>
      <SeoHead
        title="Webinars Made Interactive: Deck + Polls + Speech Prep in One Tool | AXIVA"
        description="Run engaging webinars without juggling separate tools. AXIVA generates your deck, writes your speech, adds live polls with QR codes, and tracks results. All in one place."
        canonicalPath="/webinars"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container-wide text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
              <Video className="h-3.5 w-3.5" /> For webinars, town halls, and all-hands
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              One tool for the entire<br className="hidden sm:block" /> <span className="text-accent">webinar workflow</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Stop juggling PowerPoint, Slido, speaker notes, and follow-up emails.
              AXIVA generates your deck, writes your speech, runs live polls,
              and saves the results. In one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <>
                  <Link to="/executive">
                    <Button variant="hero" size="lg" className="gap-2 px-8">
                      <Mic className="h-5 w-5" /> Start with Speech Prep
                    </Button>
                  </Link>
                  <Link to="/dashboard?tab=live-polls">
                    <Button variant="outline" size="lg" className="gap-2 px-8">
                      <BarChart3 className="h-5 w-5" /> Create a Poll
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="hero" size="lg" className="gap-2 px-8">
                      <Sparkles className="h-5 w-5" /> Get started free
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="outline" size="lg" className="gap-2 px-8">
                      See it in action
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* The problem */}
        <section className="py-12 sm:py-16 bg-muted/20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">The webinar tool stack is broken</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Most people use 4-5 separate tools for one webinar.
              Each one costs money, takes time to set up, and creates another tab to manage during the live session.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { tool: "PowerPoint", for: "Slides" },
                { tool: "Slido", for: "Polls & Q&A" },
                { tool: "Google Docs", for: "Speaker notes" },
                { tool: "Excel", for: "Follow-up tracking" },
              ].map(t => (
                <div key={t.tool} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                  <p className="text-sm font-bold line-through text-muted-foreground">{t.tool}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.for}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-accent font-semibold">
              <ArrowRight className="h-4 w-4" />
              <span>Replace all of them with AXIVA</span>
            </div>
          </div>
        </section>

        {/* Before / During / After */}
        <section className="py-16 sm:py-20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Your webinar in 3 phases</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">Everything you need, before, during, and after. In one tool.</p>

            <div className="max-w-4xl mx-auto space-y-8">
              {PHASES.map(phase => (
                <div key={phase.phase} className={cn("rounded-2xl border p-6 sm:p-8", phase.border, phase.bg.replace("/10", "/[0.03]"))}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", phase.bg)}>
                      <phase.icon className={cn("h-5 w-5", phase.color)} />
                    </div>
                    <h3 className="text-xl font-bold">{phase.phase}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {phase.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5", phase.bg, phase.color)}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{step.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                          {step.link && (
                            <Link to={step.link} className={cn("text-[10px] font-semibold mt-1 inline-flex items-center gap-0.5 hover:underline", phase.color)}>
                              Try it <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 Features */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Everything for your webinar, in one place</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">No extra tools. No extra subscriptions. No tab-switching during your live session.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {FEATURES.map(f => (
                <div key={f.title} className="p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/60 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 sm:py-20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">AXIVA vs PowerPoint + Slido</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">One tool vs two tools + two subscriptions + two learning curves.</p>
            <div className="max-w-2xl mx-auto rounded-2xl border border-border/50 overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/30 p-3 sm:p-4 border-b border-border/30">
                <span className="text-xs font-semibold text-muted-foreground">Feature</span>
                <span className="text-xs font-bold text-accent text-center">AXIVA</span>
                <span className="text-xs font-bold text-muted-foreground text-center">PPT + Slido</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={i} className={cn("grid grid-cols-3 p-3 sm:p-4 items-center", i % 2 === 0 ? "bg-card/30" : "")}>
                  <span className="text-xs sm:text-sm">{row.feature}</span>
                  <div className="flex justify-center">
                    {row.axiva ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                  <div className="flex justify-center">
                    {row.combo ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Run your next webinar with one tool</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Deck. Speech. Polls. Results. All in AXIVA. Free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={user ? "/executive" : "/auth"}>
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  <Sparkles className="h-5 w-5" /> {user ? "Start with Speech Prep" : "Get started free"}
                </Button>
              </Link>
              <Link to="/live-polls">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  Learn about Live Polls
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
