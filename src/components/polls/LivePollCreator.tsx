/**
 * Live Poll Creator — Dashboard panel for creating audience interactions
 * 
 * Users create polls here, get the QR code + event code,
 * then present them or add them to decks.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3, MessageSquare, Cloud, ClipboardCheck,
  Plus, Sparkles, QrCode, Smartphone, Copy, Check,
  Star, ChevronUp, Send, Trash2, Play, ExternalLink
} from "lucide-react";

type PollType = "multiple-choice" | "yes-no" | "rating" | "qa" | "wordcloud" | "survey";

interface CreatedPoll {
  id: string;
  type: PollType;
  question: string;
  options?: string[];
  code: string;
  createdAt: Date;
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const POLL_TYPES: { id: PollType; label: string; icon: React.FC<any>; desc: string }[] = [
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
  const [polls, setPolls] = useState<CreatedPoll[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<PollType>("multiple-choice");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const createPoll = () => {
    if (!question.trim()) { toast({ title: "Enter a question" }); return; }
    const poll: CreatedPoll = {
      id: Date.now().toString(),
      type: selectedType,
      question: question.trim(),
      options: selectedType === "multiple-choice" ? options.filter(o => o.trim()) : undefined,
      code: generateCode(),
      createdAt: new Date(),
    };
    setPolls(prev => [poll, ...prev]);
    setQuestion("");
    setOptions(["", "", ""]);
    setCreating(false);
    toast({ title: "Poll created!", description: `Code: ${poll.code}` });
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

      {/* Existing polls */}
      {polls.length === 0 && !creating && (
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

      {polls.length > 0 && (
        <div className="space-y-4">
          {polls.map(poll => (
            <div key={poll.id} className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
              {/* Poll header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold uppercase">
                        {POLL_TYPES.find(t => t.id === poll.type)?.label}
                      </span>
                    </div>
                    <p className="text-base font-bold">{poll.question}</p>
                    {poll.options && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {poll.options.map((o, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-lg bg-muted/30 border border-border/30">{o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* QR code + event code section */}
              <div className="border-t border-border/30 bg-muted/10 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img src={qrUrl(poll.code)} alt="QR code" className="w-28 h-28 rounded-lg border border-border/30 shrink-0" />
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Smartphone className="h-4 w-4 text-accent" />
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">Share with audience</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Scan QR or go to <span className="font-mono font-semibold text-foreground">axiva.ai/live</span></p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <div className="flex gap-1">
                        {poll.code.split("").map((char, i) => (
                          <div key={i} className="w-7 h-9 rounded-lg border-2 border-accent/30 bg-accent/5 flex items-center justify-center text-base font-bold text-accent">
                            {char}
                          </div>
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
              <div className="border-t border-border/30 px-4 py-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                  <Play className="h-3.5 w-3.5" /> Present full screen
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => {
                  navigator.clipboard.writeText(`https://axiva.ai/live/${poll.code}`);
                  toast({ title: "Link copied!" });
                }}>
                  <ExternalLink className="h-3.5 w-3.5" /> Copy link
                </Button>
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 ml-auto text-red-500 hover:text-red-600"
                  onClick={() => setPolls(polls.filter(p => p.id !== poll.id))}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
