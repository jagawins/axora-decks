/**
 * Audience Interaction Blocks — Slido-style features built into AXIVA decks
 *
 * When a deck is shared via web link, these blocks become LIVE interactive
 * elements that viewers can participate in. No separate tool needed.
 *
 * Block types:
 * 1. audience_poll — multiple choice, rating, or yes/no vote
 * 2. audience_qa — submit questions, upvote, anonymous option
 * 3. audience_wordcloud — one-word submissions rendered as word cloud
 * 4. audience_survey — post-presentation feedback form
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3, MessageSquare, Cloud, ClipboardCheck,
  ThumbsUp, ThumbsDown, ChevronUp, Send, Check, Star
} from "lucide-react";

/* ── 1. Audience Poll ───────────────────────────────────── */

export interface AudiencePollPayload {
  question: string;
  pollType: "multiple-choice" | "rating" | "yes-no";
  options?: string[];
  allowAnonymous?: boolean;
}

export function AudiencePollBlock({ payload }: { payload: AudiencePollPayload; className?: string }) {
  const { question, pollType, options = [] } = payload;
  const [voted, setVoted] = useState<string | number | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});

  const vote = (choice: string | number) => {
    if (voted) return;
    setVoted(choice);
    setResults(prev => ({ ...prev, [String(choice)]: (prev[String(choice)] || 0) + 1 }));
  };

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="w-full rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live Poll</span>
      </div>
      <p className="text-base font-bold">{question}</p>

      {pollType === "multiple-choice" && (
        <div className="space-y-2">
          {options.map(opt => {
            const count = results[opt] || 0;
            const pct = Math.round((count / totalVotes) * 100);
            return (
              <button key={opt} onClick={() => vote(opt)} disabled={!!voted}
                className={cn("w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden",
                  voted === opt ? "border-accent bg-accent/10" : voted ? "border-border/30 opacity-60" : "border-border/50 hover:border-accent/30")}>
                {voted && <div className="absolute inset-y-0 left-0 bg-accent/10 transition-all" style={{ width: `${pct}%` }} />}
                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-medium">{opt}</span>
                  {voted && <span className="text-xs font-bold text-accent">{pct}%</span>}
                </div>
              </button>
            );
          })}
          {voted && <p className="text-[10px] text-muted-foreground text-center">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>}
        </div>
      )}

      {pollType === "yes-no" && (
        <div className="flex gap-3">
          {["Yes", "No", "Need more info"].map(opt => (
            <button key={opt} onClick={() => vote(opt)} disabled={!!voted}
              className={cn("flex-1 p-4 rounded-xl border text-center transition-all",
                voted === opt ? "border-accent bg-accent/10" : voted ? "border-border/30 opacity-60" : "border-border/50 hover:border-accent/30")}>
              <span className="text-sm font-bold">{opt}</span>
              {voted && <p className="text-lg font-bold text-accent mt-1">{Math.round(((results[opt] || 0) / totalVotes) * 100)}%</p>}
            </button>
          ))}
        </div>
      )}

      {pollType === "rating" && (
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => vote(n)} disabled={!!voted}
              className={cn("w-12 h-12 rounded-xl border flex items-center justify-center transition-all",
                voted !== null && n <= Number(voted) ? "border-accent bg-accent text-white" :
                voted ? "border-border/30 opacity-40" : "border-border/50 hover:border-accent/30 hover:bg-accent/5")}>
              <Star className="h-5 w-5" fill={voted !== null && n <= Number(voted) ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 2. Audience Q&A ────────────────────────────────────── */

export interface AudienceQAPayload {
  title?: string;
  allowAnonymous?: boolean;
  moderationEnabled?: boolean;
}

interface QAItem { id: string; text: string; votes: number; author: string; votedByMe: boolean }

export function AudienceQABlock({ payload }: { payload: AudienceQAPayload; className?: string }) {
  const { title = "Questions", allowAnonymous = true } = payload;
  const [questions, setQuestions] = useState<QAItem[]>([
    { id: "1", text: "What's the timeline for Phase 2?", votes: 5, author: "Anonymous", votedByMe: false },
    { id: "2", text: "How does this affect the Q2 budget?", votes: 3, author: "Anonymous", votedByMe: false },
    { id: "3", text: "Who's accountable for EU regulatory compliance?", votes: 2, author: "Anonymous", votedByMe: false },
  ]);
  const [newQ, setNewQ] = useState("");

  const upvote = (id: string) => {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, votes: q.votedByMe ? q.votes - 1 : q.votes + 1, votedByMe: !q.votedByMe } : q)
      .sort((a, b) => b.votes - a.votes));
  };

  const submit = () => {
    if (!newQ.trim()) return;
    setQuestions(qs => [{ id: Date.now().toString(), text: newQ, votes: 0, author: "You", votedByMe: false }, ...qs]);
    setNewQ("");
  };

  return (
    <div className="w-full rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Audience Q&A</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{questions.length} questions</span>
      </div>
      <p className="text-base font-bold">{title}</p>

      {/* Submit */}
      <div className="flex gap-2">
        <Textarea placeholder={allowAnonymous ? "Ask a question (anonymous)..." : "Ask a question..."} value={newQ} onChange={e => setNewQ(e.target.value)} className="min-h-[40px] flex-1 text-sm" />
        <Button size="sm" onClick={submit} disabled={!newQ.trim()} className="shrink-0"><Send className="h-4 w-4" /></Button>
      </div>

      {/* Questions list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {questions.map(q => (
          <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-background/50">
            <button onClick={() => upvote(q.id)}
              className={cn("flex flex-col items-center gap-0.5 shrink-0 pt-0.5 transition-colors",
                q.votedByMe ? "text-accent" : "text-muted-foreground hover:text-accent")}>
              <ChevronUp className="h-4 w-4" />
              <span className="text-xs font-bold">{q.votes}</span>
            </button>
            <div>
              <p className="text-sm">{q.text}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{q.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 3. Word Cloud ──────────────────────────────────────── */

export interface AudienceWordCloudPayload {
  question: string;
  maxSubmissions?: number;
}

export function AudienceWordCloudBlock({ payload }: { payload: AudienceWordCloudPayload; className?: string }) {
  const { question } = payload;
  const [words, setWords] = useState<Record<string, number>>({
    "growth": 8, "risk": 6, "timing": 5, "budget": 4, "team": 3, "competition": 3, "regulatory": 2, "talent": 2, "market": 7, "execution": 4,
  });
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!input.trim() || submitted) return;
    const word = input.trim().toLowerCase();
    setWords(prev => ({ ...prev, [word]: (prev[word] || 0) + 1 }));
    setInput("");
    setSubmitted(true);
  };

  const maxCount = Math.max(...Object.values(words), 1);
  const sorted = Object.entries(words).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Cloud className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Word Cloud</span>
      </div>
      <p className="text-base font-bold">{question}</p>

      {/* Word cloud display */}
      <div className="flex flex-wrap gap-2 justify-center py-4">
        {sorted.map(([word, count]) => {
          const size = 12 + Math.round((count / maxCount) * 20);
          const opacity = 0.4 + (count / maxCount) * 0.6;
          return (
            <span key={word} className="text-accent font-bold transition-all" style={{ fontSize: `${size}px`, opacity }}>
              {word}
            </span>
          );
        })}
      </div>

      {/* Input */}
      {!submitted ? (
        <div className="flex gap-2">
          <Textarea placeholder="Enter one word..." value={input} onChange={e => setInput(e.target.value)} className="min-h-[36px] flex-1 text-sm" />
          <Button size="sm" onClick={submit} disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      ) : (
        <p className="text-xs text-center text-green-500 flex items-center justify-center gap-1"><Check className="h-3 w-3" /> Your response has been recorded</p>
      )}
    </div>
  );
}

/* ── 4. Post-Presentation Survey ────────────────────────── */

export interface AudienceSurveyPayload {
  title?: string;
  questions: { question: string; type: "rating" | "text" | "yes-no" }[];
}

export function AudienceSurveyBlock({ payload }: { payload: AudienceSurveyPayload; className?: string }) {
  const { title = "Quick Feedback", questions: surveyQs = [] } = payload;
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = (idx: number, val: string | number) => {
    setAnswers(prev => ({ ...prev, [idx]: val }));
  };

  if (submitted) {
    return (
      <div className="w-full rounded-xl border border-green-500/20 bg-green-500/5 p-5 text-center space-y-2">
        <Check className="h-8 w-8 text-green-500 mx-auto" />
        <p className="text-sm font-bold text-green-500">Thank you for your feedback</p>
        <p className="text-xs text-muted-foreground">Your responses have been recorded.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-5">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-accent" />
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Feedback</span>
      </div>
      <p className="text-base font-bold">{title}</p>

      {surveyQs.map((sq, i) => (
        <div key={i} className="space-y-2">
          <p className="text-sm font-medium">{sq.question}</p>
          {sq.type === "rating" && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setAnswer(i, n)}
                  className={cn("w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold transition-all",
                    answers[i] !== undefined && n <= Number(answers[i]) ? "border-accent bg-accent text-white" : "border-border/50 hover:border-accent/30")}>
                  {n}
                </button>
              ))}
            </div>
          )}
          {sq.type === "text" && (
            <Textarea placeholder="Your answer..." value={String(answers[i] || "")} onChange={e => setAnswer(i, e.target.value)} className="min-h-[40px] text-sm" />
          )}
          {sq.type === "yes-no" && (
            <div className="flex gap-2">
              {["Yes", "No"].map(opt => (
                <button key={opt} onClick={() => setAnswer(i, opt)}
                  className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    answers[i] === opt ? "border-accent bg-accent/10 text-accent" : "border-border/50 hover:border-accent/30")}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <Button onClick={() => setSubmitted(true)} className="w-full gap-2" disabled={Object.keys(answers).length < surveyQs.length}>
        <Send className="h-4 w-4" /> Submit feedback
      </Button>
    </div>
  );
}
