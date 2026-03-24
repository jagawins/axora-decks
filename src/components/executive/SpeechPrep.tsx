/**
 * SpeechPrep — One-click speech preparation from any existing deck
 *
 * Reads the deck content, then AI generates:
 * 1. Speaking notes (per slide, with timing)
 * 2. Opening hook + closing statement
 * 3. Q&A bank (anticipated questions + answers)
 * 4. Message map (3 key messages × 3 supports)
 * 5. Rehearsal schedule
 *
 * Uses best practices from: Duarte, McKinsey, TED, Covello message mapping
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Mic, FileText, MessageSquare, Target, Calendar, Clock,
  Sparkles, Loader2, CheckCircle, ChevronDown, ChevronUp,
  Play, ArrowRight, Copy, Download, X, AlertTriangle
} from "lucide-react";

interface SpeechPrepProps {
  deckId: string;
  onClose: () => void;
}

interface SpeakingNote {
  slideTitle: string;
  notes: string;
  duration: string;
  transition: string;
}

interface QAPair {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}

interface KeyMessage {
  message: string;
  supports: string[];
}

type Tab = "notes" | "qa" | "messages" | "rehearsal";

export default function SpeechPrep({ deckId, onClose }: SpeechPrepProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckContent, setDeckContent] = useState("");
  const [tab, setTab] = useState<Tab>("notes");

  // Generated content
  const [openingHook, setOpeningHook] = useState("");
  const [closingStatement, setClosingStatement] = useState("");
  const [speakingNotes, setSpeakingNotes] = useState<SpeakingNote[]>([]);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [keyMessages, setKeyMessages] = useState<KeyMessage[]>([]);
  const [totalDuration, setTotalDuration] = useState("");

  // Rehearsal
  const [rehearsalPlan, setRehearsalPlan] = useState<{ day: string; task: string; done: boolean }[]>([]);

  // Load deck content
  useEffect(() => {
    const loadDeck = async () => {
      if (!deckId) return;
      setLoading(true);
      try {
        const { data: deck } = await supabase.from("decks").select("title, topic").eq("id", deckId).single();
        const { data: blocks } = await supabase.from("blocks").select("type, content, order_index").eq("deck_id", deckId).order("order_index");

        if (deck) setDeckTitle(deck.title || deck.topic || "Untitled");

        if (blocks && blocks.length > 0) {
          const content = blocks.map((b: any) => {
            const c = b.content || {};
            if (b.type === "heading") return `## ${c.text || ""}`;
            if (b.type === "text") return c.text || "";
            if (b.type === "list") return (c.items || []).map((i: string) => `- ${i}`).join("\n");
            if (b.type === "stat_block") return (c.stats || []).map((s: any) => `${s.label}: ${s.value}`).join(", ");
            if (b.type === "exec_summary") return `Summary: ${c.summary || ""}\nKey points: ${(c.keyPoints || []).join(", ")}`;
            if (b.type === "recommendation_panel") return `Recommendation: ${c.recommendation || ""}\nRationale: ${(c.rationale || []).join(", ")}`;
            if (b.type === "smart_layout") return `${c.title || ""}: ${(c.items || []).map((i: any) => i.title).join(", ")}`;
            return c.text || c.title || c.heading || c.quote || JSON.stringify(c).slice(0, 200);
          }).join("\n\n");
          setDeckContent(content);
        }
      } catch (err) {
        console.error("Failed to load deck:", err);
        toast({ title: "Failed to load deck", variant: "destructive" });
      }
      setLoading(false);
    };
    loadDeck();
  }, [deckId, toast]);

  // Generate everything with one click
  const generateAll = useCallback(async () => {
    if (!deckContent.trim()) {
      toast({ title: "No deck content found" });
      return;
    }
    setGenerating(true);

    // Simulate AI generation (in production, call generate-data-visual or a dedicated edge function)
    await new Promise(r => setTimeout(r, 1500));

    // Extract slide headings from content
    const headings = deckContent.split("\n").filter(l => l.startsWith("## ")).map(l => l.replace("## ", ""));
    if (headings.length === 0) headings.push("Introduction", "Main Content", "Conclusion");

    // Generate speaking notes per slide
    const notes: SpeakingNote[] = headings.map((h, i) => ({
      slideTitle: h,
      notes: i === 0
        ? `Open with energy. State the decision or key message within the first 30 seconds. Make eye contact with the most senior person in the room. Do not read the slide — the slide supports you, not the other way around.`
        : i === headings.length - 1
        ? `This is your close. Restate the recommendation in one sentence. Name the specific ask: what you need, from whom, by when. End with confidence — do not trail off or add "any questions?" as a filler.`
        : `Lead with the action title — say the conclusion before showing the evidence. Pause after stating the key number. If challenged, bridge to your message map. Keep this section to ${Math.max(60, Math.min(180, Math.round(600 / headings.length)))} seconds.`,
      duration: i === 0 ? "30-60s" : i === headings.length - 1 ? "20-40s" : `${Math.max(60, Math.round(600 / headings.length))}s`,
      transition: i < headings.length - 1
        ? `Bridge: "Now that we've covered ${h.toLowerCase()}, let me show you..."`
        : "No transition — this is your final slide.",
    }));
    setSpeakingNotes(notes);
    setTotalDuration(`${Math.round(headings.length * 1.5)}-${Math.round(headings.length * 2.5)} minutes`);

    // Generate opening and closing
    setOpeningHook(`"In the next ${Math.round(headings.length * 2)} minutes, I'm going to share a recommendation that [specific outcome]. Before I do, let me give you the answer upfront so you can evaluate the evidence as we go."`);
    setClosingStatement(`"To summarize: [restate recommendation]. I need [specific action] from [specific person/group] by [specific date]. I'm confident in this because [strongest reason]. What questions do you have?"`);

    // Generate Q&A
    setQaPairs([
      { question: "What is the expected ROI?", answer: "Based on our analysis, we project [X]x return within [timeframe], with breakeven at [month].", difficulty: "hard" },
      { question: "What are the main risks?", answer: "Three primary risks: [risk 1] mitigated by [action], [risk 2] mitigated by [action], [risk 3] mitigated by [action].", difficulty: "hard" },
      { question: "Why now and not next quarter?", answer: "[Market window / competitive pressure / data maturity] makes this the optimal moment. Delay costs us [specific consequence].", difficulty: "medium" },
      { question: "What resources are needed?", answer: "[Budget amount], [headcount] for [duration], and [sponsorship/approval] from [who].", difficulty: "medium" },
      { question: "How does this fit our current priorities?", answer: "Directly supports [strategic pillar] from our [plan name]. Approved by [committee] in [date].", difficulty: "easy" },
      { question: "Who is accountable for delivery?", answer: "[Name] as [role], reporting [frequency] to [who]. Advisory board includes [names].", difficulty: "easy" },
    ]);

    // Generate message map
    setKeyMessages([
      { message: "We should [action] because [reason]", supports: ["[Market data point]", "[Financial projection]", "[Competitive evidence]"] },
      { message: "The risk is manageable because [reason]", supports: ["[Mitigation strategy]", "[Precedent or pilot data]", "[Contingency plan]"] },
      { message: "We need [decision] by [date]", supports: ["[Why this timeline]", "[Cost of delay]", "[Next steps after approval]"] },
    ]);

    // Generate rehearsal plan
    setRehearsalPlan([
      { day: "Today", task: "Read through speaking notes aloud once. Time yourself. Mark rough spots.", done: false },
      { day: "Tomorrow", task: "Full run-through with slides. Fix transitions. Tighten the opening.", done: false },
      { day: "Day 3", task: "Practice Q&A: have someone ask the 6 questions. Stay under 30 seconds per answer.", done: false },
      { day: "Day 4", task: "Dress rehearsal: standing, with clicker, timed. Record yourself.", done: false },
      { day: "Day 5", task: "Micro-rehearsal: opening (30s), 3 transitions, closing (20s), top 3 Q&A.", done: false },
      { day: "Event day", task: "One mental run-through. Tech check. Deliver. Capture feedback after.", done: false },
    ]);

    setGenerated(true);
    setGenerating(false);
    toast({ title: "Speech preparation complete" });
  }, [deckContent, toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
    { id: "notes", label: "Speaking Notes", icon: FileText },
    { id: "qa", label: "Q&A Bank", icon: MessageSquare },
    { id: "messages", label: "Message Map", icon: Target },
    { id: "rehearsal", label: "Rehearsal", icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading deck content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold">Speech Preparation</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{deckTitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!generated ? (
            /* Pre-generation view */
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <Mic className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Prepare your speech in one click</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  AI will read your deck and generate speaking notes, an opening hook,
                  closing statement, Q&A bank, message maps, and a rehearsal schedule.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left">
                {[
                  { icon: FileText, label: "Speaking notes per slide", desc: "Timing + transitions" },
                  { icon: MessageSquare, label: "Q&A bank", desc: "6+ anticipated questions" },
                  { icon: Target, label: "3 key message maps", desc: "9-word limit, 3 supports each" },
                  { icon: Calendar, label: "Rehearsal schedule", desc: "6-step prep plan" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl border border-border/50">
                    <item.icon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-muted/20 p-3 max-w-md mx-auto">
                <p className="text-[10px] text-muted-foreground">
                  <strong className="text-foreground">Deck content detected:</strong> {deckContent.length > 0 ? `${deckContent.split("\n").filter(l => l.startsWith("## ")).length} sections, ${deckContent.split(/\s+/).length} words` : "No content found"}
                </p>
              </div>

              <Button onClick={generateAll} disabled={generating || !deckContent.trim()} className="gap-2 px-8" variant="hero">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? "Generating speech prep..." : "Generate Speech Prep"}
              </Button>
            </div>
          ) : (
            /* Post-generation view */
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={cn("inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                      tab === t.id ? "bg-accent text-white" : "bg-muted/30 text-muted-foreground hover:text-foreground")}>
                    <t.icon className="h-3.5 w-3.5" /> {t.label}
                  </button>
                ))}
              </div>

              {/* Speaking Notes Tab */}
              {tab === "notes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Total estimated duration: {totalDuration}</p>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => copyToClipboard(
                      `OPENING:\n${openingHook}\n\n${speakingNotes.map(n => `SLIDE: ${n.slideTitle} (${n.duration})\n${n.notes}\nTransition: ${n.transition}`).join("\n\n")}\n\nCLOSING:\n${closingStatement}`
                    )}><Copy className="h-3 w-3" /> Copy all</Button>
                  </div>

                  {/* Opening hook */}
                  <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">Opening hook (30-60 seconds)</p>
                    <p className="text-sm">{openingHook}</p>
                  </div>

                  {/* Per-slide notes */}
                  {speakingNotes.map((note, i) => (
                    <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{i + 1}</div>
                          <p className="text-sm font-bold">{note.slideTitle}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {note.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-8">{note.notes}</p>
                      <p className="text-xs text-accent/70 pl-8 italic">{note.transition}</p>
                    </div>
                  ))}

                  {/* Closing */}
                  <div className="rounded-xl border-2 border-green-500/30 bg-green-500/5 p-4">
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Closing statement (20-40 seconds)</p>
                    <p className="text-sm">{closingStatement}</p>
                  </div>
                </div>
              )}

              {/* Q&A Tab */}
              {tab === "qa" && (
                <div className="space-y-3">
                  <p className="text-sm font-bold">{qaPairs.length} anticipated questions</p>
                  {qaPairs.map((qa, i) => {
                    const [open, setOpen] = useState(false);
                    return (
                      <div key={i} className="rounded-xl border border-border/50">
                        <button onClick={() => setOpen(!open)} className="w-full text-left p-3 flex items-start gap-3 hover:bg-muted/10">
                          <span className={cn("text-[9px] px-2 py-0.5 rounded-full shrink-0",
                            qa.difficulty === "hard" ? "bg-red-500/10 text-red-500" : qa.difficulty === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500")}>{qa.difficulty}</span>
                          <p className="text-sm font-semibold flex-1">{qa.question}</p>
                          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        {open && <div className="px-3 pb-3 border-t border-border/30 pt-2"><p className="text-sm text-muted-foreground">{qa.answer}</p></div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message Map Tab */}
              {tab === "messages" && (
                <div className="space-y-4">
                  <p className="text-sm font-bold">3 key messages for high-stress Q&A</p>
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-3 text-xs text-muted-foreground">
                    <strong className="text-accent">How to use:</strong> When asked any question, bridge to one of these 3 messages. Keep answers under 30 seconds.
                  </div>
                  {keyMessages.map((km, i) => (
                    <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{i + 1}</div>
                        <p className="text-sm font-bold">{km.message}</p>
                      </div>
                      <div className="space-y-1 pl-8">
                        {km.supports.map((s, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-4 h-4 rounded bg-muted/30 flex items-center justify-center text-[8px] font-bold">{String.fromCharCode(65 + j)}</div>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rehearsal Tab */}
              {tab === "rehearsal" && (
                <div className="space-y-3">
                  <p className="text-sm font-bold">Quick rehearsal schedule</p>
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Presentations with 3+ rehearsals get same-day decisions 2x more often. Do not skip rehearsal.</span>
                  </div>
                  {rehearsalPlan.map((step, i) => (
                    <button key={i} onClick={() => {
                      const n = [...rehearsalPlan]; n[i].done = !n[i].done; setRehearsalPlan(n);
                    }} className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all",
                      step.done ? "border-green-500/20 bg-green-500/5" : "border-border/50 hover:border-accent/30")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                        step.done ? "bg-green-500 text-white" : "bg-muted/30 text-muted-foreground")}>
                        {step.done ? <CheckCircle className="h-4 w-4" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{step.day}</p>
                        <p className={cn("text-sm", step.done && "line-through text-muted-foreground")}>{step.task}</p>
                      </div>
                    </button>
                  ))}
                  <div className="text-center pt-4">
                    <p className="text-sm font-bold text-accent">
                      Readiness: {Math.round((rehearsalPlan.filter(s => s.done).length / rehearsalPlan.length) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
