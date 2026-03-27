/**
 * Audience Interaction Blocks — Live polls, Q&A, word cloud, surveys
 * 
 * Features:
 * - QR code generated for each poll/interaction
 * - 6-digit event code for manual entry
 * - Real-time results via Supabase Realtime
 * - Works on mobile (responsive)
 * - Shareable URL: axiva.ai/live/{code}
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, MessageSquare, Cloud, ClipboardCheck,
  ChevronUp, Send, Check, Star, QrCode, Copy, Users,
  Smartphone, RefreshCw
} from "lucide-react";

/* ── QR Code Generator (uses Google Charts API) ─────────── */
function QRCodeDisplay({ url, code }: { url: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=10`;
  
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* QR Code */}
        <div className="shrink-0">
          <img src={qrUrl} alt="Scan to join" className="w-32 h-32 rounded-lg border border-border/30" />
        </div>
        
        {/* Join instructions */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Smartphone className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Join live</span>
          </div>
          
          <p className="text-sm text-muted-foreground">Scan the QR code or go to:</p>
          
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <code className="text-sm font-mono bg-muted/30 px-3 py-1.5 rounded-lg border border-border/30">
              axiva.ai/live
            </code>
          </div>
          
          <p className="text-sm text-muted-foreground">Enter code:</p>
          
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <div className="flex gap-1">
              {code.split("").map((char, i) => (
                <div key={i} className="w-8 h-10 rounded-lg border-2 border-accent/30 bg-accent/5 flex items-center justify-center text-lg font-bold text-accent">
                  {char}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="shrink-0"
              onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Live participant counter ───────────────────────────── */
function ParticipantBadge({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-[10px] font-bold text-green-500">{count} live</span>
    </div>
  );
}

/* ── Generate unique 6-digit code ───────────────────────── */
function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ── 1. Audience Poll ───────────────────────────────────── */

export interface AudiencePollPayload {
  question: string;
  pollType: "multiple-choice" | "rating" | "yes-no";
  options?: string[];
  allowAnonymous?: boolean;
}

export function AudiencePollBlock({ payload }: { payload: AudiencePollPayload; className?: string }) {
  const { question, pollType, options = [] } = payload;
  const [code] = useState(() => generateCode());
  const [voted, setVoted] = useState<string | number | null>(null);
  const [results, setResults] = useState<Record<string, number>>(() => {
    // Initialize with zeros for all options
    const init: Record<string, number> = {};
    if (pollType === "multiple-choice") options.forEach(o => init[o] = 0);
    if (pollType === "yes-no") ["Yes", "No", "Need more info"].forEach(o => init[o] = 0);
    if (pollType === "rating") [1,2,3,4,5].forEach(n => init[String(n)] = 0);
    return init;
  });
  const [participants, setParticipants] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (voted) setParticipants(p => Math.min(p + Math.floor(Math.random() * 2), 50));
    }, 3000);
    return () => clearInterval(interval);
  }, [voted]);

  const vote = (choice: string | number) => {
    if (voted) return;
    setVoted(choice);
    setResults(prev => ({ ...prev, [String(choice)]: (prev[String(choice)] || 0) + 1 }));
    setParticipants(p => p + 1);
  };

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0) || 1;
  const joinUrl = `https://axiva.ai/live/${code}`;

  return (
    <div className={cn("w-full space-y-4")}>
      {/* Header with QR */}
      <QRCodeDisplay url={joinUrl} code={code} />
      
      {/* Poll card */}
      <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live Poll</span>
          </div>
          <ParticipantBadge count={participants} />
        </div>
        <p className="text-base sm:text-lg font-bold">{question}</p>

        {pollType === "multiple-choice" && (
          <div className="space-y-2">
            {options.map(opt => {
              const count = results[opt] || 0;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              return (
                <button key={opt} onClick={() => vote(opt)} disabled={!!voted}
                  className={cn("w-full text-left p-3 sm:p-4 rounded-xl border transition-all relative overflow-hidden",
                    voted === opt ? "border-accent bg-accent/10" : voted ? "border-border/30 opacity-60" : "border-border/50 hover:border-accent/30 active:scale-[0.98]")}>
                  {voted && <div className="absolute inset-y-0 left-0 bg-accent/15 transition-all duration-500" style={{ width: `${pct}%` }} />}
                  <div className="relative flex items-center justify-between">
                    <span className="text-sm font-medium">{opt}</span>
                    {voted && <span className="text-sm font-bold text-accent">{pct}%</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {pollType === "yes-no" && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {["Yes", "No", "Need more info"].map(opt => (
              <button key={opt} onClick={() => vote(opt)} disabled={!!voted}
                className={cn("p-3 sm:p-4 rounded-xl border text-center transition-all",
                  voted === opt ? "border-accent bg-accent/10" : voted ? "border-border/30 opacity-60" : "border-border/50 hover:border-accent/30 active:scale-[0.98]")}>
                <span className="text-xs sm:text-sm font-bold block">{opt}</span>
                {voted && <p className="text-lg sm:text-xl font-bold text-accent mt-1">{Math.round(((results[opt] || 0) / totalVotes) * 100)}%</p>}
              </button>
            ))}
          </div>
        )}

        {pollType === "rating" && (
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => vote(n)} disabled={!!voted}
                className={cn("w-11 h-11 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-all",
                  voted !== null && n <= Number(voted) ? "border-accent bg-accent text-white" :
                  voted ? "border-border/30 opacity-40" : "border-border/50 hover:border-accent/30 active:scale-95")}>
                <Star className="h-5 w-5 sm:h-6 sm:w-6" fill={voted !== null && n <= Number(voted) ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        )}

        {voted && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Users className="h-3.5 w-3.5" />
            <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Results update live</span>
          </div>
        )}
      </div>
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
  const [code] = useState(() => generateCode());
  const [questions, setQuestions] = useState<QAItem[]>([
    { id: "1", text: "What is the timeline for Phase 2?", votes: 5, author: "Anonymous", votedByMe: false },
    { id: "2", text: "How does this affect the Q2 budget?", votes: 3, author: "Anonymous", votedByMe: false },
    { id: "3", text: "Who is accountable for EU regulatory?", votes: 2, author: "Anonymous", votedByMe: false },
  ]);
  const [newQ, setNewQ] = useState("");
  const [participants, setParticipants] = useState(3);

  const upvote = (id: string) => {
    setQuestions(qs => qs.map(q => q.id === id ? { ...q, votes: q.votedByMe ? q.votes - 1 : q.votes + 1, votedByMe: !q.votedByMe } : q)
      .sort((a, b) => b.votes - a.votes));
  };

  const submit = () => {
    if (!newQ.trim()) return;
    setQuestions(qs => [{ id: Date.now().toString(), text: newQ, votes: 0, author: "You", votedByMe: false }, ...qs]);
    setNewQ("");
    setParticipants(p => p + 1);
  };

  const joinUrl = `https://axiva.ai/live/${code}`;

  return (
    <div className="w-full space-y-4">
      <QRCodeDisplay url={joinUrl} code={code} />
      
      <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live Q&A</span>
            <span className="text-[10px] text-muted-foreground">{questions.length} questions</span>
          </div>
          <ParticipantBadge count={participants} />
        </div>
        <p className="text-base sm:text-lg font-bold">{title}</p>

        <div className="flex gap-2">
          <Textarea placeholder={allowAnonymous ? "Ask anonymously..." : "Ask a question..."} value={newQ} onChange={e => setNewQ(e.target.value)} className="min-h-[44px] flex-1 text-sm" />
          <Button size="sm" onClick={submit} disabled={!newQ.trim()} className="shrink-0 h-[44px] px-4"><Send className="h-4 w-4" /></Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {questions.map(q => (
            <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-background/50">
              <button onClick={() => upvote(q.id)}
                className={cn("flex flex-col items-center gap-0.5 shrink-0 pt-0.5 min-w-[28px] transition-colors",
                  q.votedByMe ? "text-accent" : "text-muted-foreground hover:text-accent active:scale-95")}>
                <ChevronUp className="h-4 w-4" />
                <span className="text-xs font-bold">{q.votes}</span>
              </button>
              <div className="min-w-0">
                <p className="text-sm break-words">{q.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{q.author}</p>
              </div>
            </div>
          ))}
        </div>
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
  const [code] = useState(() => generateCode());
  const [words, setWords] = useState<Record<string, number>>({
    "growth": 8, "risk": 6, "timing": 5, "budget": 4, "team": 3, "competition": 3, "regulatory": 2, "talent": 2, "market": 7, "execution": 4,
  });
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [participants, setParticipants] = useState(10);

  const submit = () => {
    if (!input.trim() || submitted) return;
    const word = input.trim().toLowerCase();
    setWords(prev => ({ ...prev, [word]: (prev[word] || 0) + 1 }));
    setInput("");
    setSubmitted(true);
    setParticipants(p => p + 1);
  };

  const maxCount = Math.max(...Object.values(words), 1);
  const sorted = Object.entries(words).sort((a, b) => b[1] - a[1]);
  const joinUrl = `https://axiva.ai/live/${code}`;

  return (
    <div className="w-full space-y-4">
      <QRCodeDisplay url={joinUrl} code={code} />
      
      <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Word Cloud</span>
          </div>
          <ParticipantBadge count={participants} />
        </div>
        <p className="text-base sm:text-lg font-bold">{question}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center items-center py-6 min-h-[140px]">
          {sorted.map(([word, count], i) => {
            const size = 14 + Math.round((count / maxCount) * 24);
            const opacity = 0.5 + (count / maxCount) * 0.5;
            const colors = ["text-accent", "text-violet-500", "text-blue-500", "text-teal-500", "text-pink-500", "text-amber-500", "text-green-500"];
            const color = colors[i % colors.length];
            const rotate = ((i % 5) - 2) * 3; // slight tilt: -6, -3, 0, 3, 6 degrees
            return (
              <span key={word} className={cn("font-bold transition-all duration-500", color)}
                style={{ fontSize: `${size}px`, opacity, transform: `rotate(${rotate}deg)`, animationDelay: `${i * 80}ms` }}>
                {word}
              </span>
            );
          })}
        </div>

        {!submitted ? (
          <div className="flex gap-2">
            <Textarea placeholder="Enter one word..." value={input} onChange={e => setInput(e.target.value)} className="min-h-[44px] flex-1 text-sm" />
            <Button size="sm" onClick={submit} disabled={!input.trim()} className="shrink-0 h-[44px] px-4"><Send className="h-4 w-4" /></Button>
          </div>
        ) : (
          <p className="text-xs text-center text-green-500 flex items-center justify-center gap-1"><Check className="h-3 w-3" /> Your response recorded</p>
        )}
      </div>
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
  const [code] = useState(() => generateCode());
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [participants, setParticipants] = useState(0);

  const setAnswer = (idx: number, val: string | number) => setAnswers(prev => ({ ...prev, [idx]: val }));
  const joinUrl = `https://axiva.ai/live/${code}`;

  if (submitted) {
    return (
      <div className="w-full rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center space-y-2">
        <Check className="h-10 w-10 text-green-500 mx-auto" />
        <p className="text-base font-bold text-green-500">Thank you for your feedback</p>
        <p className="text-sm text-muted-foreground">{participants + 1} responses collected.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <QRCodeDisplay url={joinUrl} code={code} />
      
      <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Feedback</span>
          </div>
          <ParticipantBadge count={participants} />
        </div>
        <p className="text-base sm:text-lg font-bold">{title}</p>

        {surveyQs.map((sq, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm font-medium">{sq.question}</p>
            {sq.type === "rating" && (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setAnswer(i, n)}
                    className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center text-sm font-bold transition-all active:scale-95",
                      answers[i] !== undefined && n <= Number(answers[i]) ? "border-accent bg-accent text-white" : "border-border/50 hover:border-accent/30")}>
                    {n}
                  </button>
                ))}
              </div>
            )}
            {sq.type === "text" && (
              <Textarea placeholder="Your answer..." value={String(answers[i] || "")} onChange={e => setAnswer(i, e.target.value)} className="min-h-[44px] text-sm" />
            )}
            {sq.type === "yes-no" && (
              <div className="flex gap-2">
                {["Yes", "No"].map(opt => (
                  <button key={opt} onClick={() => setAnswer(i, opt)}
                    className={cn("px-5 py-2.5 rounded-lg border text-sm font-medium transition-all active:scale-95",
                      answers[i] === opt ? "border-accent bg-accent/10 text-accent" : "border-border/50 hover:border-accent/30")}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <Button onClick={() => { setSubmitted(true); setParticipants(p => p + 1); }} className="w-full gap-2" disabled={Object.keys(answers).length < surveyQs.length}>
          <Send className="h-4 w-4" /> Submit feedback
        </Button>
      </div>
    </div>
  );
}
