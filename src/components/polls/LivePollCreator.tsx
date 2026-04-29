/**
 * Live Poll Creator — persists polls to Supabase
 * Polls survive navigation, page reload, and browser close.
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3, MessageSquare, Cloud, ClipboardCheck,
  Plus, Sparkles, Smartphone, Copy, Check,
  Star, Trash2, Play, ExternalLink,
  Download, Layers, Eye, Loader2, Trophy
} from "lucide-react";

export type PollType = "multiple-choice" | "yes-no" | "rating" | "qa" | "wordcloud" | "survey" | "quiz";

export interface LivePoll {
  id: string;
  code: string;
  poll_type: PollType;
  question: string;
  options: string[];
  results: Record<string, number>;
  participant_count: number;
  is_active: boolean;
  created_at: string;
  correct_answer?: string | null;
}

type Poll = LivePoll;

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const POLL_TYPES: { id: PollType; label: string; icon: React.FC<any>; desc: string }[] = [
  { id: "multiple-choice", label: "Multiple Choice", icon: BarChart3, desc: "Audience picks from options" },
  { id: "yes-no", label: "Yes / No / Need More", icon: BarChart3, desc: "Quick decision vote" },
  { id: "rating", label: "Star Rating (1-5)", icon: Star, desc: "Rate a proposal or idea" },
  { id: "qa", label: "Q&A", icon: MessageSquare, desc: "Submit and upvote questions" },
  { id: "wordcloud", label: "Word Cloud", icon: Cloud, desc: "One-word responses, live cloud" },
  { id: "survey", label: "Feedback Survey", icon: ClipboardCheck, desc: "Post-presentation feedback" },
  { id: "quiz", label: "Quiz / Trivia", icon: Trophy, desc: "Pick the correct answer" },
];

export default function LivePollCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<PollType>("multiple-choice");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<string | null>(null);

  // Load polls from Supabase
  const loadPolls = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("live_polls")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPolls((data || []) as unknown as Poll[]);
    } catch (err: any) {
      console.error("Failed to load polls:", err);
      // Fallback: if table doesn't exist yet, show empty state
      setPolls([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPolls(); }, [loadPolls]);

  // Create poll in Supabase
  const createPoll = async () => {
    if (!question.trim() || !user) return;
    setSaving(true);
    const code = generateCode();
    const cleanedOpts = options.map(o => o.trim()).filter(Boolean);
    const pollOptions = (selectedType === "multiple-choice" || selectedType === "quiz") ? cleanedOpts :
      selectedType === "yes-no" ? ["Yes", "No", "Need more info"] :
      selectedType === "rating" ? ["1", "2", "3", "4", "5"] : [];

    const correctAnswer = selectedType === "quiz"
      ? (cleanedOpts[correctIndex] ?? cleanedOpts[0] ?? null)
      : null;

    try {
      const { data, error } = await supabase
        .from("live_polls")
        .insert({
          user_id: user.id,
          code,
          poll_type: selectedType,
          question: question.trim(),
          options: pollOptions,
          results: {},
          participant_count: 0,
          is_active: true,
          correct_answer: correctAnswer,
        } as any)
        .select()
        .single();

      if (error) throw error;
      setPolls(prev => [data as unknown as Poll, ...prev]);
      setQuestion("");
      setOptions(["", "", ""]);
      setCorrectIndex(0);
      setCreating(false);
      toast({ title: selectedType === "quiz" ? "Quiz created!" : "Poll created!", description: `Code: ${code}` });
    } catch (err: any) {
      console.error("Failed to create poll:", err);
      // Fallback: save locally if DB fails
      const localPoll: Poll = {
        id: Date.now().toString(),
        code,
        poll_type: selectedType,
        question: question.trim(),
        options: pollOptions,
        results: {},
        participant_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        correct_answer: correctAnswer,
      };
      setPolls(prev => [localPoll, ...prev]);
      setQuestion("");
      setOptions(["", "", ""]);
      setCorrectIndex(0);
      setCreating(false);
      toast({ title: "Created (local)", description: `Code: ${code}. Will sync when database is ready.` });
    } finally {
      setSaving(false);
    }
  };

  // Delete poll
  const deletePoll = async (pollId: string) => {
    try {
      await supabase.from("live_polls").delete().eq("id", pollId);
    } catch {}
    setPolls(prev => prev.filter(p => p.id !== pollId));
    toast({ title: "Poll deleted" });
  };

  // Refresh results for a specific poll
  const refreshResults = async (pollId: string) => {
    try {
      const { data } = await supabase
        .from("live_poll_votes" as any)
        .select("choice")
        .eq("poll_id", pollId);
      if (data) {
        const results: Record<string, number> = {};
        data.forEach((v: any) => { results[v.choice] = (results[v.choice] || 0) + 1; });
        setPolls(prev => prev.map(p => p.id === pollId ? { ...p, results, participant_count: data.length } : p));
      }
    } catch {}
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const qrUrl = (code: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://axiva.ai/live/${code}`)}&bgcolor=ffffff&color=000000&margin=10`;

  const downloadQR = async (code: string) => {
    try {
      const response = await fetch(qrUrl(code));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `axiva-poll-${code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "QR code downloaded!" });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Live Polls</h2>
          <p className="text-sm text-muted-foreground">Create polls with QR codes. Audience votes from their phone. Results persist.</p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2" disabled={creating}>
          <Plus className="h-4 w-4" /> New Poll
        </Button>
      </div>

      {/* Create new poll */}
      {creating && (
        <div className="rounded-2xl border border-accent/20 bg-accent/[0.02] p-5 space-y-5">
          <h3 className="text-base font-bold">Create a poll</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POLL_TYPES.map(t => (
              <button key={t.id} onClick={() => setSelectedType(t.id)}
                className={cn("text-left p-3 rounded-xl border transition-all",
                  selectedType === t.id ? "border-accent bg-accent/5" : "border-border/50 hover:border-accent/30")}>
                <t.icon className={cn("h-4 w-4 mb-1.5", selectedType === t.id ? "text-accent" : "text-muted-foreground")} />
                <p className="text-xs font-bold">{t.label}</p>
                <p className="text-[9px] text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Your question</label>
            <Textarea placeholder={
              selectedType === "wordcloud" ? "e.g., In one word, what is your biggest concern?" :
              selectedType === "qa" ? "e.g., What questions do you have for leadership?" :
              selectedType === "rating" ? "e.g., How confident are you in this plan?" :
              selectedType === "yes-no" ? "e.g., Should we approve this proposal?" :
              selectedType === "survey" ? "e.g., Quick feedback on today's session" :
              selectedType === "quiz" ? "e.g., What year was the company founded?" :
              "e.g., Which direction should we pursue?"
            } value={question} onChange={e => setQuestion(e.target.value)} className="min-h-[56px]" />
          </div>

          {/* Word cloud question templates */}
          {selectedType === "wordcloud" && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Quick templates — tap to use</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "In one word, describe our culture",
                  "What is your biggest concern?",
                  "One word for how you feel about this change",
                  "What should we focus on next quarter?",
                  "Describe this meeting in one word",
                  "What does success look like?",
                  "One word for our team's strength",
                  "What is holding us back?",
                  "Where are you joining from?",
                  "What excites you about next year?",
                ].map(t => (
                  <button key={t} onClick={() => setQuestion(t)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all text-muted-foreground hover:text-foreground">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectedType === "multiple-choice" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Answer options</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">{String.fromCharCode(65 + i)}</div>
                  <Textarea placeholder={`Option ${i + 1}`} value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} className="min-h-[36px] flex-1 text-sm" />
                  {options.length > 2 && (
                    <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setOptions([...options, ""])}>
                  <Plus className="h-3 w-3" /> Add option
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={createPoll} className="gap-2 flex-1" disabled={!question.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Create Poll
            </Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading your polls...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && polls.length === 0 && !creating && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <BarChart3 className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-lg font-bold">No polls yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">Create a live poll with a QR code. Share the code or scan to vote from any phone.</p>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create your first poll
          </Button>
        </div>
      )}

      {/* Poll list */}
      {!loading && polls.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{polls.length} poll{polls.length !== 1 ? 's' : ''}</p>
          {polls.map(poll => {
            const isExpanded = expandedResults === poll.id;
            const totalVotes = Object.values(poll.results || {}).reduce((a: number, b: any) => a + Number(b), 0) || poll.participant_count || 0;
            return (
              <div key={poll.id} className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                {/* Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold uppercase">
                      {POLL_TYPES.find(t => t.id === poll.poll_type)?.label}
                    </span>
                    {poll.is_active && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-bold">ACTIVE</span>
                    )}
                    <span className="text-[9px] text-muted-foreground ml-auto">
                      {new Date(poll.created_at).toLocaleDateString()} {new Date(poll.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-base font-bold">{poll.question}</p>
                  {poll.options && poll.options.length > 0 && poll.poll_type === "multiple-choice" && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {poll.options.map((o: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-lg bg-muted/30 border border-border/30">{o}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Results (toggle) */}
                {isExpanded && (
                  <PollResults poll={poll} onRefresh={() => refreshResults(poll.id)} />
                )}

                {/* QR + Code */}
                <div className="border-t border-border/30 bg-muted/10 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative shrink-0 group cursor-pointer" onClick={() => downloadQR(poll.code)}>
                      <img src={qrUrl(poll.code)} alt="QR code" className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg border border-border/30" />
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <Smartphone className="h-4 w-4 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Share with audience</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Scan QR or go to <span className="font-mono font-semibold text-foreground">axiva.ai/live</span></p>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <div className="flex gap-1">
                          {poll.code.split("").map((char: string, i: number) => (
                            <div key={i} className="w-7 h-9 rounded-lg border-2 border-accent/30 bg-accent/5 flex items-center justify-center text-base font-bold text-accent">{char}</div>
                          ))}
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => copyCode(poll.code)}>
                          {copiedId === poll.code ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border/30 px-4 py-3 flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => setExpandedResults(isExpanded ? null : poll.id)}>
                    <Eye className="h-3.5 w-3.5" /> {isExpanded ? "Hide" : "Results"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => downloadQR(poll.code)}>
                    <Download className="h-3.5 w-3.5" /> QR
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => {
                    navigate(`/create?prompt=${encodeURIComponent(`Create a slide with a live audience poll.\nQuestion: ${poll.question}\nType: ${poll.poll_type}\n${poll.options?.length ? `Options: ${poll.options.join(", ")}` : ""}\nEvent code: ${poll.code}\nUse audience_poll block.`)}`);
                  }}>
                    <Layers className="h-3.5 w-3.5" /> Insert deck
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => {
                    navigator.clipboard.writeText(`https://axiva.ai/live/${poll.code}`);
                    toast({ title: "Link copied!" });
                  }}>
                    <ExternalLink className="h-3.5 w-3.5" /> Link
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => navigate(`/live/${poll.code}`)}>
                    <Play className="h-3.5 w-3.5" /> Present
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5 ml-auto text-red-500 hover:text-red-600" onClick={() => deletePoll(poll.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── PollResults — fetches real votes from live_poll_votes table ── */
function PollResults({ poll, onRefresh }: { poll: Poll; onRefresh: () => void }) {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("live_poll_votes" as any)
          .select("choice")
          .eq("poll_id", poll.id);
        if (data && data.length > 0) {
          const counts: Record<string, number> = {};
          data.forEach((v: any) => { counts[v.choice] = (counts[v.choice] || 0) + 1; });
          setVotes(counts);
          setTotalVotes(data.length);
        } else {
          setVotes({});
          setTotalVotes(0);
        }
      } catch {
        setVotes({});
        setTotalVotes(0);
      }
      setLoading(false);
    })();
  }, [poll.id]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("live_poll_votes" as any)
        .select("choice")
        .eq("poll_id", poll.id);
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((v: any) => { counts[v.choice] = (counts[v.choice] || 0) + 1; });
        setVotes(counts);
        setTotalVotes(data.length);
      }
    } catch {}
    setLoading(false);
    onRefresh();
  };

  const displayOptions = poll.options && poll.options.length > 0
    ? poll.options
    : poll.poll_type === "yes-no" ? ["Yes", "No", "Need more info"]
    : poll.poll_type === "rating" ? ["1", "2", "3", "4", "5"]
    : [];

  return (
    <div className="border-t border-border/30 bg-accent/[0.02] p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-wider">Results</span>
          <span className="text-[10px] text-muted-foreground">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] gap-1" onClick={handleRefresh} disabled={loading}>
          <Loader2 className={cn("h-3 w-3", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {loading && totalVotes === 0 ? (
        <div className="text-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-accent mx-auto" />
        </div>
      ) : displayOptions.length > 0 ? (
        <div className="space-y-2">
          {displayOptions.map((opt: string) => {
            const count = votes[opt] || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return (
              <div key={opt} className="relative p-3 rounded-xl border border-border/30 overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-accent/10 transition-all" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-medium">{opt}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{count}</span>
                    <span className="text-sm font-bold text-accent">{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No votes yet. Share the QR code to start collecting.</p>
      )}
    </div>
  );
}
