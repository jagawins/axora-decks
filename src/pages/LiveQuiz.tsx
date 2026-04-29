import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SeoHead from "@/components/SeoHead";
import Navbar from "@/components/landing/Navbar";
import AIChatbot from "@/components/AIChatbot";
import MarketingFooter from "@/components/MarketingFooter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trophy, QrCode, Smartphone, Users, Zap,
  ArrowRight, Check, Sparkles, BarChart3, Brain, Timer, Award
} from "lucide-react";

/* ── Mock interactive quiz demo ─────────────────────────────── */

function QuizDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = "1998";
  const opts = [
    { label: "1995", pct: 12 },
    { label: "1998", pct: 64 },
    { label: "2001", pct: 18 },
    { label: "2004", pct: 6 },
  ];

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live Quiz</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">38 playing</span>
        </div>
      </div>
      <p className="text-sm sm:text-base font-bold">In what year was Google founded?</p>
      <div className="space-y-2">
        {opts.map(o => {
          const isCorrect = o.label === correct;
          const isYour = picked === o.label;
          return (
            <button key={o.label} onClick={() => setPicked(o.label)}
              className={cn("w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden",
                !picked ? "border-border/50 hover:border-accent/30 active:scale-[0.98]" :
                isCorrect ? "border-green-500/60 bg-green-500/5" :
                isYour ? "border-red-500/60 bg-red-500/5" :
                "border-border/30 opacity-60")}>
              {picked && (
                <div className={cn("absolute inset-y-0 left-0 transition-all duration-700",
                  isCorrect ? "bg-green-500/15" : isYour ? "bg-red-500/10" : "bg-accent/10")}
                  style={{ width: `${o.pct}%` }} />
              )}
              <div className="relative flex items-center justify-between">
                <span className="text-sm font-medium inline-flex items-center gap-2">
                  {picked && isCorrect && <Trophy className="h-3.5 w-3.5 text-green-500" />}
                  {o.label}
                </span>
                {picked && <span className={cn("text-sm font-bold", isCorrect ? "text-green-600" : "text-accent")}>{o.pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      {picked && (
        <p className="text-[10px] text-muted-foreground text-center">
          {picked === correct ? "🎉 Correct! 64% of the room got it." : `Not quite — the answer is ${correct}.`}
        </p>
      )}
    </div>
  );
}

function LeaderboardDemo() {
  const players = [
    { name: "Sara M.", score: 9, badge: "🥇" },
    { name: "Jamal R.", score: 8, badge: "🥈" },
    { name: "Priya K.", score: 8, badge: "🥉" },
    { name: "Alex T.", score: 7, badge: "" },
    { name: "Mei L.", score: 6, badge: "" },
  ];
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Leaderboard</span>
      </div>
      <p className="text-sm font-bold">After 10 questions</p>
      <div className="space-y-1.5">
        {players.map((p, i) => (
          <div key={p.name} className="flex items-center gap-2 p-2 rounded-lg border border-border/30 bg-background/50">
            <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
            <span className="text-base">{p.badge || "·"}</span>
            <span className="text-sm font-medium flex-1">{p.name}</span>
            <span className="text-sm font-bold text-accent">{p.score}<span className="text-[10px] text-muted-foreground">/10</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItScoresDemo() {
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">How it works</span>
      </div>
      <p className="text-sm font-bold">Pick the correct answer. See live results.</p>
      <ul className="space-y-2 text-xs text-muted-foreground">
        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" /><span>Mark the correct option when you create the quiz.</span></li>
        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" /><span>Audience scans the QR or enters the event code.</span></li>
        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" /><span>Each player sees right or wrong instantly after answering.</span></li>
        <li className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" /><span>Results update on screen for the whole room in real time.</span></li>
      </ul>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */

const FEATURES = [
  { icon: Trophy, title: "Right or wrong, instantly", desc: "Players see immediately whether their answer was correct, with the right answer revealed if they missed it." },
  { icon: QrCode, title: "QR code + event code", desc: "Audience scans to join. No app, no login. Works the same way as live polls." },
  { icon: Zap, title: "Results update live", desc: "The room sees the percentage of players choosing each option as votes come in." },
  { icon: Smartphone, title: "Works on any phone", desc: "Mobile-first. Players answer from their phone, tablet, or laptop." },
  { icon: Sparkles, title: "Built into your deck", desc: "A quiz is just another block in your AXIVA deck. Nothing extra to install." },
  { icon: Users, title: "Great for any room", desc: "Trainings, all-hands, conferences, classrooms, team offsites. Bring a bit of fun to any session." },
];

const USE_CASES = [
  { title: "Training & onboarding", desc: "Test what people retained after a session. Reinforces key facts in a low-stakes way." },
  { title: "Team meetings & all-hands", desc: "Open or close with a quick trivia round. Lifts energy in the room and gets everyone engaged." },
  { title: "Conferences & keynotes", desc: "Quiz the audience on industry stats or trivia tied to your topic. Memorable and shareable." },
  { title: "Classroom & workshops", desc: "Check understanding mid-lesson without the friction of a formal test." },
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
        <span className="text-sm font-semibold text-accent">Joining a quiz?</span>
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
              aria-label="Event code"
              className="w-28 sm:w-32 px-2 py-1.5 text-sm font-mono font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 uppercase"
            />
          </div>
          <button onClick={handleJoin} aria-label="Join quiz"
            className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 active:scale-95 transition-all">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default function LiveQuiz() {
  const { user } = useAuth();

  return (
    <>
      <SeoHead
        title="Live Quiz & Trivia for Meetings: QR Code Built Into Your Deck | AXIVA"
        description="Run a live quiz or trivia game during your meeting, training, or class. Audience scans a QR code, picks an answer, and sees right or wrong instantly. Built into your deck."
        canonicalPath="/live-quiz"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div className="container-wide text-center">
            <JoinBar />

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
              Bring a bit of fun with a <span className="text-accent">live quiz</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create a live quiz or trivia game and test your audience's knowledge in an interactive way.
              Works in trainings, all-hands, classrooms, and meetings. Built right into your deck.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <>
                  <Link to="/dashboard?tab=live-polls&create=true&type=quiz">
                    <Button variant="hero" size="lg" className="gap-2 px-8">
                      <Trophy className="h-5 w-5" /> Create a quiz
                    </Button>
                  </Link>
                  <Link to="/dashboard?tab=live-polls">
                    <Button variant="outline" size="lg" className="gap-2 px-8">
                      <BarChart3 className="h-5 w-5" /> My quizzes & polls
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
                  <Link to="/live-polls">
                    <Button variant="outline" size="lg" className="gap-2 px-8">
                      Compare with live polls
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Interactive demos */}
        <section className="pb-16 sm:pb-20">
          <div className="container-wide">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              <QuizDemo />
              <LeaderboardDemo />
              <HowItScoresDemo />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3 max-w-xl mx-auto">
              Live leaderboard shown for illustration. The current release scores each player's answer in real time and shows aggregate results to the room.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground mb-12 max-w-lg mx-auto">Three steps. Under a minute. Works in any meeting, in person, virtual, or hybrid.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Write the question and mark the answer", desc: "Open Live Polls in your dashboard, choose Quiz / Trivia, write your question and tap the trophy on the correct option." },
                { step: "2", title: "Show the QR code", desc: "Present your deck. Players scan the QR code or enter the 6-digit event code on their phone. No app, no login." },
                { step: "3", title: "Reveal right or wrong", desc: "Players see immediately if they got it right. The room sees live percentages for each option as answers come in." },
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

        {/* Feature cards */}
        <section className="py-16 sm:py-20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Everything you need for an interactive quiz</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">Same infrastructure as live polls. New, fun format.</p>
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

        {/* Use cases */}
        <section className="py-16 sm:py-20 bg-muted/20">
          <div className="container-wide">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Where teams use live quizzes</h2>
            <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">Anywhere you'd normally lecture, you can ask instead.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {USE_CASES.map(u => (
                <div key={u.title} className="p-6 rounded-2xl border border-border/50 bg-card/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-accent" />
                    <h3 className="text-base font-bold">{u.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="container-wide text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Make your next session interactive</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Free to start. Build a quiz in under a minute. Audience joins with no downloads.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <Link to="/dashboard?tab=live-polls&create=true&type=quiz">
                  <Button variant="hero" size="lg" className="gap-2 px-8">
                    <Trophy className="h-5 w-5" /> Create a quiz
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="gap-2 px-8">
                    <Sparkles className="h-5 w-5" /> Get started free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
      <AIChatbot />
    </>
  );
}
