/**
 * Live Poll Participant Page — /live/:code
 *
 * Audience sees this after scanning QR code or entering event code.
 * Mobile-first, clean, instant voting.
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { cn } from "@/lib/utils";
import { BarChart3, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PollData {
  question: string;
  type: string;
  options: string[] | null;
  results: Record<string, number>;
}

export default function LivePollParticipant() {
  const { code } = useParams<{ code: string }>();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("live_polls" as any)
          .select("question, poll_type, options, results")
          .eq("code", code)
          .eq("is_active", true)
          .single();
        if (err || !data) {
          console.error("Poll query error:", err);
          setError("Poll not found. It may have ended or the code is incorrect.");
        } else {
          const d = data as any;
          setPoll({
            question: d.question,
            type: d.poll_type,
            options: d.options as string[] | null,
            results: (d.results || {}) as Record<string, number>,
          });
        }
      } catch (e: any) {
        console.error("Poll fetch error:", e);
        setError("Could not load poll. The database may not be set up yet.");
      }
      setLoading(false);
    })();
  }, [code]);

  // Determine voting options based on poll type
  const getVoteOptions = (): string[] => {
    if (!poll) return [];
    if (poll.type === "multiple-choice" && poll.options) return poll.options;
    if (poll.type === "yes-no") return ["Yes", "No", "Need more info"];
    if (poll.type === "rating") return ["1", "2", "3", "4", "5"];
    return Object.keys(poll.results);
  };

  const vote = async (choice: string) => {
    if (voted || voting || !code) return;
    setVoting(true);
    const { error: err } = await supabase.rpc("increment_poll_vote" as any, {
      poll_code: code,
      choice,
    });
    if (!err) {
      setVoted(choice);
      // Update local results for instant feedback
      if (poll) {
        setPoll({
          ...poll,
          results: {
            ...poll.results,
            [choice]: (poll.results[choice] || 0) + 1,
          },
        });
      }
    }
    setVoting(false);
  };

  const voteOptions = getVoteOptions();
  const totalVotes = poll ? Object.values(poll.results).reduce((a, b) => a + b, 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Poll Not Found</h1>
        <p className="text-sm text-muted-foreground">{error || "This poll doesn't exist or has ended."}</p>
      </div>
    );
  }

  const pollTitle = poll?.question || "Live Poll";
  const pollDesc = poll?.type === "multiple-choice" && poll?.options
    ? `Vote now: ${poll.options.slice(0, 3).join(" · ")}` 
    : poll?.type === "yes-no" ? "Vote: Yes, No, or Need more info"
    : poll?.type === "rating" ? "Rate from 1 to 5 stars"
    : "Vote now on AXIVA Live";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dynamic OG tags for link previews */}
      <Helmet>
        <title>{pollTitle} — AXIVA Live Poll</title>
        <meta name="description" content={pollDesc} />
        <meta property="og:title" content={`📊 ${pollTitle}`} />
        <meta property="og:description" content={`${pollDesc} — Tap to vote. No login needed.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://axiva.ai/live/${code}`} />
        <meta property="og:image" content="https://axiva.ai/og-live-poll.png" />
        <meta property="og:site_name" content="AXIVA Live" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`📊 ${pollTitle}`} />
        <meta name="twitter:description" content={`${pollDesc} — Tap to vote.`} />
      </Helmet>
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
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Live Poll</p>
          <h1 className="text-xl sm:text-2xl font-bold">{poll.question}</h1>
        </div>

        {/* Voting options */}
        {!voted ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Tap to vote:</p>
            {voteOptions.map(opt => (
              <button key={opt} onClick={() => vote(opt)} disabled={voting}
                className="w-full text-left p-4 rounded-2xl border-2 border-border/50 hover:border-accent/50 active:scale-[0.98] active:border-accent transition-all disabled:opacity-50">
                <span className="text-base font-medium">{poll.type === "rating" ? `${"★".repeat(Number(opt))}${"☆".repeat(5 - Number(opt))}` : opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500 font-semibold">Vote recorded</span>
            </div>
            {voteOptions.map(opt => {
              const count = poll.results[opt] || 0;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
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
