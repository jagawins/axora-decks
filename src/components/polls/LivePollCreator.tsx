/**
 * Live Poll Creator — Dashboard panel for creating audience interactions
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3, MessageSquare, Cloud, ClipboardCheck,
  Plus, Sparkles, QrCode, Smartphone, Copy, Check,
  Star, ChevronUp, Send, Trash2, Play, ExternalLink,
  Download, Layers, Eye, ArrowRight
} from "lucide-react";
import PollCard from "./PollCard";

type PollType = "multiple-choice" | "yes-no" | "rating" | "qa" | "wordcloud" | "survey";

export interface LivePoll {
  id: string;
  type: PollType;
  question: string;
  options: string[] | null;
  code: string;
  results: Record<string, number>;
  is_active: boolean;
  created_at: string;
  user_id: string;
}

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
];

export default function LivePollCreator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [polls, setPolls] = useState<LivePoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<PollType>("multiple-choice");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch polls from DB on mount
  const fetchPolls = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("live_polls" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setPolls(data.map((p: any) => ({
        ...p,
        options: p.options as string[] | null,
        results: (p.results || {}) as Record<string, number>,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPolls(); }, [fetchPolls]);

  const createPoll = async () => {
    if (!question.trim() || !user) { toast({ title: "Enter a question" }); return; }
    const code = generateCode();
    const pollOptions = selectedType === "multiple-choice" ? options.filter(o => o.trim()) : null;
    
    // Build initial results object
    let initialResults: Record<string, number> = {};
    if (selectedType === "multiple-choice" && pollOptions) {
      pollOptions.forEach(o => { initialResults[o] = 0; });
    } else if (selectedType === "yes-no") {
      initialResults = { "Yes": 0, "No": 0, "Need more info": 0 };
    } else if (selectedType === "rating") {
      initialResults = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    }

    const { data, error } = await supabase
      .from("live_polls" as any)
      .insert({
        user_id: user.id,
        type: selectedType,
        question: question.trim(),
        options: pollOptions,
        code,
        results: initialResults,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Failed to create poll", description: error.message, variant: "destructive" });
      return;
    }

    const newPoll: LivePoll = {
      ...(data as any),
      options: (data as any).options as string[] | null,
      results: ((data as any).results || {}) as Record<string, number>,
    };
    setPolls(prev => [newPoll, ...prev]);
    setQuestion("");
    setOptions(["", "", ""]);
    setCreating(false);
    toast({ title: "Poll created!", description: `Code: ${code}` });
  };

  const deletePoll = async (id: string) => {
    const { error } = await supabase
      .from("live_polls" as any)
      .delete()
      .eq("id", id);
    if (!error) {
      setPolls(prev => prev.filter(p => p.id !== id));
      toast({ title: "Poll deleted" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const qrUrl = (code: string) => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://axiva.ai/live/${code}`)}&bgcolor=ffffff&color=000000&margin=8`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Live Polls</h2>
          <p className="text-sm text-muted-foreground">Create polls with QR codes. Audience votes from their phone.</p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2" disabled={creating}>
          <Plus className="h-4 w-4" /> New Poll
        </Button>
      </div>

      {/* Create new poll */}
      {creating && (
        <div className="rounded-2xl border border-accent/20 bg-accent/[0.02] p-5 space-y-5">
          <h3 className="text-base font-bold">Create a poll</h3>

          {/* Poll type selector */}
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

          {/* Question */}
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Your question</label>
            <Textarea placeholder={
              selectedType === "qa" ? "e.g., What questions do you have?" :
              selectedType === "wordcloud" ? "e.g., In one word, what is your biggest concern?" :
              selectedType === "rating" ? "e.g., How confident are you in this proposal?" :
              selectedType === "yes-no" ? "e.g., Should we approve the expansion?" :
              "e.g., Which direction should we pursue?"
            } value={question} onChange={e => setQuestion(e.target.value)} className="min-h-[56px]" />
          </div>

          {/* Options (for multiple choice) */}
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

          {/* Create / Cancel */}
          <div className="flex gap-2">
            <Button onClick={createPoll} className="gap-2 flex-1" disabled={!question.trim()}>
              <Sparkles className="h-4 w-4" /> Create Poll
            </Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading polls…</div>
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

      {/* Existing polls */}
      {!loading && polls.length > 0 && (
        <div className="space-y-4">
          {polls.map(poll => (
            <PollCard key={poll.id} poll={poll} qrUrl={qrUrl} copyCode={copyCode} copiedId={copiedId}
              onDelete={() => deletePoll(poll.id)}
              onRefresh={fetchPolls}
              onInsertToDeck={() => {
                navigate(`/create?prompt=${encodeURIComponent(`Create a presentation slide that includes a live audience poll:\n\nPoll type: ${poll.type}\nQuestion: ${poll.question}\n${poll.options ? `Options: ${poll.options.join(", ")}` : ""}\nEvent code: ${poll.code}\n\nInclude the QR code and event code prominently so audience can scan and vote. Use audience_poll block type.`)}`);
              }}
              toast={toast} />
          ))}
        </div>
      )}
    </div>
  );
}
