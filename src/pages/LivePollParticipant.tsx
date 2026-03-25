/**
 * Live Poll Participant Page — /live/:code
 *
 * This is what the audience sees after scanning the QR code
 * or entering the event code. Mobile-first, clean, instant voting.
 */

import { useState } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Check, Star, ChevronUp, Send, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function LivePollParticipant() {
  const { code } = useParams<{ code: string }>();
  const [voted, setVoted] = useState<string | number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [input, setInput] = useState("");

  // In production, this would fetch the poll data from Supabase using the code
  // For now, show a demo poll
  const poll = {
    type: "multiple-choice" as const,
    question: "Should we approve the EU expansion proposal?",
    options: ["Yes — approve now", "Delay to Q3", "Need more data"],
    results: { "Yes — approve now": 14, "Delay to Q3": 5, "Need more data": 3 },
    participants: 22,
  };

  const vote = (choice: string) => {
    if (voted) return;
    setVoted(choice);
    poll.results[choice as keyof typeof poll.results] = (poll.results[choice as keyof typeof poll.results] || 0) + 1;
  };

  const totalVotes = Object.values(poll.results).reduce((a, b) => a + b, 0) + (voted ? 1 : 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            <span className="text-sm font-bold">AXIVA Live</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">#{code}</span>
          </div>
        </div>
      </header>

      {/* Poll content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Question */}
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Live Poll</p>
          <h1 className="text-xl sm:text-2xl font-bold">{poll.question}</h1>
        </div>

        {/* Voting options */}
        {!voted ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Tap to vote:</p>
            {poll.options.map(opt => (
              <button key={opt} onClick={() => vote(opt)}
                className="w-full text-left p-4 rounded-2xl border-2 border-border/50 hover:border-accent/50 active:scale-[0.98] active:border-accent transition-all">
                <span className="text-base font-medium">{opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Results */}
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500 font-semibold">Vote recorded</span>
            </div>
            {poll.options.map(opt => {
              const count = poll.results[opt as keyof typeof poll.results] || 0;
              const pct = Math.round((count / totalVotes) * 100);
              return (
                <div key={opt} className={cn("p-4 rounded-2xl border-2 relative overflow-hidden transition-all",
                  voted === opt ? "border-accent bg-accent/5" : "border-border/30")}>
                  <div className="absolute inset-y-0 left-0 bg-accent/10 transition-all duration-700" style={{ width: `${pct}%` }} />
                  <div className="relative flex items-center justify-between">
                    <span className={cn("text-base font-medium", voted === opt && "font-bold")}>{opt}</span>
                    <span className="text-base font-bold text-accent">{pct}%</span>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground text-center pt-2">
              {totalVotes} votes · Results update live
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/50 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by <a href="https://axiva.ai" className="text-accent font-semibold hover:underline">AXIVA</a>
        </p>
      </footer>
    </div>
  );
}
