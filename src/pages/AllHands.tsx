import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import AIChatbot from "@/components/AIChatbot";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3, MessageSquare, Cloud, Sparkles, Check,
  ArrowRight, Users, Zap, Shield, Mic, QrCode,
  ChevronUp, Star, Lock, Send, Eye, ClipboardCheck,
  ChevronRight
} from "lucide-react";

/* ── Interactive Q&A Demo ───────────────────────────────── */
function QADemo() {
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const qs = [
    { q: "What is the status of the new org structure?", v: 22, author: "Anonymous" },
    { q: "Are there any more layoffs planned?", v: 18, author: "Anonymous" },
    { q: "When will we hear about the promotion cycle?", v: 15, author: "Anonymous" },
    { q: "Can we get more clarity on the remote work policy?", v: 12, author: "Sarah M." },
  ];
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live Q&A</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">142 live</span>
        </div>
      </div>
      <p className="text-sm font-bold">Ask the leadership team anything</p>
      <div className="space-y-2">
        {qs.map((q, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/30 bg-background/50">
            <button onClick={() => setVoted(v => ({ ...v, [i]: !v[i] }))}
              className={cn("flex flex-col items-center gap-0.5 shrink-0 transition-colors", voted[i] ? "text-accent" : "text-muted-foreground")}>
              <ChevronUp className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold">{q.v + (voted[i] ? 1 : 0)}</span>
            </button>
            <div>
              <p className="text-xs">{q.q}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{q.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pulse Check Demo ───────────────────────────────────── */
function PulseDemo() {
  const [voted, setVoted] = useState(false);
  const opts = [
    { label: "Fully aligned", pct: 36 },
    { label: "Somewhat aligned", pct: 44 },
    { label: "Not aligned", pct: 14 },
    { label: "Not sure", pct: 6 },
  ];
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Pulse Check</span>
      </div>
      <p className="text-sm font-bold">I am aligned with our strategy for next year</p>
      <div className="space-y-2">
        {opts.map(o => (
          <button key={o.label} onClick={() => setVoted(true)}
            className={cn("w-full text-left p-2.5 rounded-xl border transition-all relative overflow-hidden",
              voted ? "border-border/30" : "border-border/50 hover:border-accent/30 active:scale-[0.98]")}>
            {voted && <div className="absolute inset-y-0 left-0 bg-accent/15 transition-all duration-700" style={{ width: `${o.pct}%` }} />}
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-medium">{o.label}</span>
              {voted && <span className="text-xs font-bold text-accent">{o.pct}%</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Word Cloud Demo ────────────────────────────────────── */
function WordCloudDemo() {
  const words = [
    { w: "transparency", s: 30 }, { w: "growth", s: 26 }, { w: "trust", s: 22 },
    { w: "communication", s: 20 }, { w: "clarity", s: 18 }, { w: "culture", s: 16 },
    { w: "teamwork", s: 15 }, { w: "innovation", s: 14 }, { w: "leadership", s: 13 },
  ];
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Word Cloud</span>
      </div>
      <p className="text-sm font-bold">Describe our culture in one word</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center py-3">
        {words.map(({ w, s }) => (
          <span key={w} className="text-accent font-bold" style={{ fontSize: `${s}px`, opacity: 0.4 + (s / 30) * 0.6 }}>{w}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Use cases ──────────────────────────────────────────── */
const USE_CASES = [
  {
    title: "Leadership Q&A",
    desc: "Employees submit questions anonymously. Most-upvoted rise to the top. Leadership addresses what matters most, not just the loudest voices.",
    icon: MessageSquare,
    polls: ["What is the status of the org restructure?", "Are more layoffs planned?", "When is the next promotion cycle?"],
  },
  {
    title: "Strategy alignment check",
    desc: "Run a quick pulse: 'Are you aligned with our direction?' See the real sentiment in the room, not what people say in front of their manager.",
    icon: BarChart3,
    polls: ["I am aligned with our strategy: Fully / Somewhat / Not at all", "How confident are you in our Q2 plan? (1-5 stars)"],
  },
  {
    title: "Company culture icebreaker",
    desc: "Open with a word cloud: 'Describe our culture in one word.' The room sees the responses build in real-time. Great energy starter.",
    icon: Cloud,
    polls: ["Describe our culture in one word", "What are you most proud of this quarter?"],
  },
  {
    title: "Change communication",
    desc: "Announcing a big change? Use Speech Prep to structure your talk. Add a poll: 'Do you feel informed about this change?' Track understanding.",
    icon: Zap,
    polls: ["Do you feel you have enough information about this change?", "What is your biggest concern?"],
  },
  {
    title: "Post-meeting feedback",
    desc: "End with a 3-question survey: 'Was this meeting useful? What should we cover next time? Rate this all-hands (1-5).' Improve every quarter.",
    icon: ClipboardCheck,
    polls: ["Was this all-hands useful? (Yes/No)", "What should we cover next time?", "Rate this meeting (1-5)"],
  },
  {
    title: "Crisis or hard news",
    desc: "Use the crisis template. Lead with empathy. State facts. Let employees ask questions anonymously. Show you are listening.",
    icon: Shield,
    polls: ["Do you feel the response has been adequate?", "What additional support do you need?"],
  },
];

/* ── Comparison ─────────────────────────────────────────── */
const COMPARISON = [
  { feature: "Anonymous Q&A with upvoting", axiva: true, slido: true },
  { feature: "Pre-meeting question collection", axiva: true, slido: true },
  { feature: "Pulse checks and sentiment polls", axiva: true, slido: true },
  { feature: "Word cloud icebreakers", axiva: true, slido: true },
  { feature: "AI generates the all-hands deck", axiva: true, slido: false },
  { feature: "Speech prep with delivery coaching", axiva: true, slido: false },
  { feature: "AI suggests polls from your content", axiva: true, slido: false },
  { feature: "Crisis communication templates", axiva: true, slido: false },
  { feature: "Everything in one tool (no extra app)", axiva: true, slido: false },
  { feature: "PPTX export for offline sharing", axiva: true, slido: false },
];

/* ── Main page ──────────────────────────────────────────── */
export default function AllHands() {
  const { user } = useAuth();

  return (
    <>
      <SeoHead
        title="All-Hands Meetings Made Interactive: Q&A, Polls, Word Clouds | AXIVA"
        description="Run better all-hands meetings. Anonymous Q&A, pulse checks, word cloud icebreakers, and AI-generated decks with delivery coaching. One tool replaces PowerPoint + Slido."
        canonicalPath="/all-hands"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container-wide text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
              <Users className="h-3.5 w-3.5" /> For all-hands, town halls, and company meetings
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              Give every employee<br className="hidden sm:block" /> <span className="text-accent">a voice</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Anonymous Q&A so people ask what they really want to know.
              Pulse checks so leadership sees real sentiment.
              AI builds the deck and coaches you on delivery. All in one tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={user ? "/executive" : "/auth"}>
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  <Sparkles className="h-5 w-5" /> {user ? "Prepare your all-hands" : "Get started free"}
                </Button>
              </Link>
              <Link to="/live-polls">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  <BarChart3 className="h-5 w-5" /> See Live Polls
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3 Interactive demos */}
        <section className="pb-16 sm:pb-20">
          <div className="container-wide">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              <QADemo />
              <PulseDemo />
              <WordCloudDemo />
            </div>
          </div>
        </section>

        {/* The problem */}
        <section className="py-12 sm:py-16 bg-muted/20">
          <div className="container-wide max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">The all-hands problem</h2>
            <p className="text-muted-foreground mb-6">
              Most all-hands meetings feel one-directional. Leadership talks. Employees listen.
              When Q&A opens, the same three people raise their hands.
              Everyone else stays quiet, not because they have nothing to ask,
              but because it feels risky to ask in front of 200 colleagues.
            </p>
            <p className="text-accent font-semibold">
              Anonymous Q&A changes this. When people can ask without being identified,
              the real questions surface.
            </p>
          </div>
        </section>

        {/* 6 Use cases */}
        <section className="py-16 sm:py-20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">6 ways to use AXIVA in your all-hands</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">Each use case comes with ready-to-use poll questions you can create in seconds.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {USE_CASES.map(uc => (
                <div key={uc.title} className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-3 hover:bg-card/60 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <uc.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-base font-bold">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground">{uc.desc}</p>
                  <div className="space-y-1 pt-2 border-t border-border/30">
                    <p className="text-[9px] font-bold text-accent uppercase tracking-wider">Sample polls</p>
                    {uc.polls.map((p, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-accent mt-0.5">•</span> {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How AXIVA is different */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">What Slido cannot do</h2>
            <p className="text-muted-foreground text-center mb-10">Slido is great for Q&A and polls. But it cannot build your deck, write your speech, or coach you on delivery.</p>
            <div className="rounded-2xl border border-border/50 overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/30 p-3 sm:p-4 border-b border-border/30">
                <span className="text-xs font-semibold text-muted-foreground">Feature</span>
                <span className="text-xs font-bold text-accent text-center">AXIVA</span>
                <span className="text-xs font-bold text-muted-foreground text-center">Slido</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={i} className={cn("grid grid-cols-3 p-3 sm:p-4 items-center", i % 2 === 0 ? "bg-card/30" : "")}>
                  <span className="text-xs sm:text-sm">{row.feature}</span>
                  <div className="flex justify-center">{row.axiva ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-xs text-muted-foreground">—</span>}</div>
                  <div className="flex justify-center">{row.slido ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-xs text-muted-foreground">—</span>}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-12">How to run your all-hands with AXIVA</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Write your speech", desc: "Use Speech Prep. Pick 'Drive change' or 'Get a decision'. AI suggests audience polls based on your content.", link: "/executive" },
                { step: "2", title: "Generate your deck", desc: "One click. AI builds structured slides with answer-first format and consulting-grade visuals.", link: "/create" },
                { step: "3", title: "Add polls and Q&A", desc: "Insert a Q&A block and pulse check directly into your deck. QR code generates automatically.", link: "/dashboard?tab=live-polls" },
                { step: "4", title: "Present and engage", desc: "Employees scan the QR code. Questions and votes come in live. Address the most-upvoted first." },
              ].map(s => (
                <div key={s.step} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent font-bold text-xl flex items-center justify-center mx-auto">{s.step}</div>
                  <h3 className="text-sm font-bold">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                  {s.link && (
                    <Link to={s.link} className="text-[10px] text-accent font-semibold hover:underline inline-flex items-center gap-0.5">
                      Try it <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Make your next all-hands matter</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Deck. Speech. Polls. Q&A. Delivery coaching. All in one tool. Free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={user ? "/executive" : "/auth"}>
                <Button variant="hero" size="lg" className="gap-2 px-8">
                  <Sparkles className="h-5 w-5" /> {user ? "Start preparing" : "Get started free"}
                </Button>
              </Link>
              <Link to="/webinars">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  See Webinar Solution
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <AIChatbot />
    </>
  );
}
