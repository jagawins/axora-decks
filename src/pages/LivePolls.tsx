import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3, MessageSquare, Cloud, ClipboardCheck,
  QrCode, Smartphone, Users, Zap, Star, ChevronUp,
  ArrowRight, Check, Sparkles, Send, Crown
} from "lucide-react";

/* ── Mock interactive demos ─────────────────────────────── */

function PollDemo() {
  const [voted, setVoted] = useState<string | null>(null);
  const opts = [
    { label: "Approve EU expansion", pct: 68 },
    { label: "Delay to Q3", pct: 22 },
    { label: "Need more data", pct: 10 },
  ];
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live Poll</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">24 live</span>
        </div>
      </div>
      <p className="text-sm sm:text-base font-bold">Should we approve the EU expansion proposal?</p>
      <div className="space-y-2">
        {opts.map(o => (
          <button key={o.label} onClick={() => setVoted(o.label)}
            className={cn("w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden",
              voted === o.label ? "border-accent bg-accent/10" : voted ? "border-border/30 opacity-60" : "border-border/50 hover:border-accent/30 active:scale-[0.98]")}>
            {voted && <div className="absolute inset-y-0 left-0 bg-accent/15 transition-all duration-700" style={{ width: `${o.pct}%` }} />}
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-medium">{o.label}</span>
              {voted && <span className="text-sm font-bold text-accent">{o.pct}%</span>}
            </div>
          </button>
        ))}
      </div>
      {voted && <p className="text-[10px] text-muted-foreground text-center">24 votes · Results update live</p>}
    </div>
  );
}

function WordCloudDemo() {
  const words = [
    { w: "growth", s: 32 }, { w: "market", s: 28 }, { w: "risk", s: 24 }, { w: "timing", s: 20 },
    { w: "budget", s: 18 }, { w: "team", s: 16 }, { w: "execution", s: 18 }, { w: "competition", s: 15 },
    { w: "talent", s: 14 }, { w: "regulatory", s: 13 },
  ];
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Word Cloud</span>
      </div>
      <p className="text-sm font-bold">What is your biggest concern?</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center py-3">
        {words.map(({ w, s }) => (
          <span key={w} className="text-accent font-bold" style={{ fontSize: `${s}px`, opacity: 0.4 + (s / 32) * 0.6 }}>{w}</span>
        ))}
      </div>
    </div>
  );
}

function QADemo() {
  const qs = [
    { q: "What is the timeline for Phase 2?", v: 7 },
    { q: "How does this affect Q2 budget?", v: 5 },
    { q: "Who owns EU regulatory?", v: 3 },
  ];
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live Q&A</span>
      </div>
      <p className="text-sm font-bold">Ask anything — anonymous, upvote what matters</p>
      <div className="space-y-2">
        {qs.map((q, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/30 bg-background/50">
            <div className="flex flex-col items-center gap-0.5 text-accent"><ChevronUp className="h-3.5 w-3.5" /><span className="text-[10px] font-bold">{q.v}</span></div>
            <p className="text-xs">{q.q}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */

const FEATURES = [
  { icon: QrCode, title: "QR code + event code", desc: "Audience scans to join instantly. No app, no login, no download. Just scan and vote." },
  { icon: Zap, title: "Results update live", desc: "Votes appear in real-time on the presenter's screen. Audience sees the crowd's response as it happens." },
  { icon: Smartphone, title: "Works on any phone", desc: "Responsive design. Participants vote from their phone, tablet, or laptop — whatever they have." },
  { icon: Sparkles, title: "Built into your deck", desc: "Not a separate tool. Polls, Q&A, and word clouds are blocks inside your presentation. No extra setup." },
  { icon: Users, title: "Anonymous or named", desc: "Participants can ask questions and vote anonymously — or use their name. You control the settings." },
  { icon: BarChart3, title: "4 interaction types", desc: "Multiple choice polls, yes/no votes, star ratings, audience Q&A with upvoting, word clouds, and feedback surveys." },
];

const COMPARISON = [
  { feature: "Built into the deck", axiva: true, slido: false },
  { feature: "QR code to join", axiva: true, slido: true },
  { feature: "No login for participants", axiva: true, slido: true },
  { feature: "Polls + Q&A + Word Cloud", axiva: true, slido: true },
  { feature: "AI deck generation", axiva: true, slido: false },
  { feature: "Speech prep + delivery coaching", axiva: true, slido: false },
  { feature: "PPTX export", axiva: true, slido: false },
  { feature: "Separate tool to install", axiva: false, slido: true },
  { feature: "Extra monthly cost", axiva: false, slido: true },
];

/* ── Join Bar — functional code entry ───────────────────── */
function JoinBar() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    const cleaned = code.trim().toUpperCase().replace(/\s/g, "");
    if (cleaned.length < 4) {
      setError("Enter a valid event code");
      return;
    }
    setError("");
    navigate(`/live/${cleaned}`);
  };

  return (
    <div className="mb-8">
      <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-4 sm:px-5 py-3 sm:py-2.5 rounded-2xl sm:rounded-full bg-accent/10 border border-accent/20">
        <span className="text-sm font-semibold text-accent">Joining as a participant?</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background rounded-full border border-border/50 overflow-hidden">
            <span className="text-sm text-muted-foreground pl-3">#</span>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              placeholder="Enter code"
              maxLength={8}
              className="w-28 sm:w-32 px-2 py-1.5 text-sm font-mono font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 uppercase"
            />
          </div>
          <button onClick={handleJoin}
            className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 active:scale-95 transition-all">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function LivePolls() {
  return (
    <>
      <SeoHead
        title="Live Audience Polls — QR Code Voting Built Into Your Deck | AXIVA"
        description="Run live polls, Q&A, word clouds, and surveys during your presentation. Audience scans a QR code and votes from their phone. Results update live. No separate tool — built into your deck."
        canonicalPath="/live-polls"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container-wide text-center">
            {/* Join bar — functional code entry */}
            <JoinBar />

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              Make your presentations <span className="text-accent">interactive</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Run live polls, Q&A, and word clouds during your talk. 
              Audience scans a QR code. Results update instantly.
              Built right into your deck — no extra tool needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            </div>
          </div>
        </section>

        {/* Interactive demos */}
        <section className="pb-16 sm:pb-20">
          <div className="container-wide">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              <PollDemo />
              <WordCloudDemo />
              <QADemo />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground mb-12 max-w-lg mx-auto">Three steps. Under a minute. Works in any meeting — in person, virtual, or hybrid.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Add a poll to your deck", desc: "Open your deck in AXIVA. Click Exec Prep → Audience Interaction → insert a Live Poll, Q&A, or Word Cloud." },
                { step: "2", title: "Show the QR code", desc: "Present your deck. The poll slide shows a QR code and 6-digit event code. Audience scans or enters the code on their phone." },
                { step: "3", title: "See results live", desc: "Votes come in. Results update instantly on your screen. The whole room sees the response in real-time." },
              ].map(s => (
                <div key={s.step} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent font-bold text-xl flex items-center justify-center mx-auto">{s.step}</div>
                  <h3 className="text-base font-bold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 Feature cards */}
        <section className="py-16 sm:py-20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Everything you need for audience interaction</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">No separate app. No QR code generator. No extra subscription. It is all inside your deck.</p>
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

        {/* Comparison table */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">AXIVA vs Slido</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">Slido is great — but it is a separate tool you pay extra for. AXIVA builds it in.</p>
            <div className="max-w-2xl mx-auto rounded-2xl border border-border/50 overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/30 p-3 sm:p-4 border-b border-border/30">
                <span className="text-xs font-semibold text-muted-foreground">Feature</span>
                <span className="text-xs font-bold text-accent text-center">AXIVA</span>
                <span className="text-xs font-bold text-muted-foreground text-center">Slido</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={i} className={cn("grid grid-cols-3 p-3 sm:p-4 items-center", i % 2 === 0 ? "bg-card/30" : "")}>
                  <span className="text-xs sm:text-sm">{row.feature}</span>
                  <div className="flex justify-center">
                    {row.axiva ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                  <div className="flex justify-center">
                    {row.slido ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Make your next presentation interactive</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Free to start. Add polls to your deck in under a minute. Audience joins with no downloads.</p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2 px-8">
                <Sparkles className="h-5 w-5" /> Get started free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
