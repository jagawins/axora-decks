import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, Clock, Users, Mic, Video, FileText, Download, Sparkles } from "lucide-react";

interface RehearsalDay { day: string; task: string; done: boolean; category: "draft"|"rehearse"|"coach"|"qa"|"dress"|"deliver" }

const DEFAULT_PLAN: RehearsalDay[] = [
  { day: "Day 14", task: "Draft outline and decision ask. Define audience and objections.", done: false, category: "draft" },
  { day: "Day 12", task: "First full run out loud. Capture timing and rough spots.", done: false, category: "rehearse" },
  { day: "Day 10", task: "Slide draft. One point per slide. Remove excess text.", done: false, category: "draft" },
  { day: "Day 9", task: "Second run with slides. Fix transitions, tighten openings.", done: false, category: "rehearse" },
  { day: "Day 7", task: "Coach session. Target 3 issues only (pacing, clarity, credibility).", done: false, category: "coach" },
  { day: "Day 6", task: "Revise talk track. Build Q&A bank (top 15 questions).", done: false, category: "qa" },
  { day: "Day 5", task: "Mock Q&A with hostile and friendly panel.", done: false, category: "qa" },
  { day: "Day 3", task: "Full dress rehearsal with countdown clock and clicker.", done: false, category: "dress" },
  { day: "Day 2", task: "Micro rehearsal: opening, transitions, ending, top 5 Q&A.", done: false, category: "rehearse" },
  { day: "Day 1", task: "Rest, mental run, final tech check.", done: false, category: "rehearse" },
  { day: "Day 0", task: "Deliver. Capture recording and feedback.", done: false, category: "deliver" },
  { day: "Day +1", task: "Debrief. Document what worked, what to change next time.", done: false, category: "coach" },
];

const CAT_COLORS: Record<string, string> = {
  draft: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  rehearse: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  coach: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  qa: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  dress: "bg-red-500/10 text-red-500 border-red-500/20",
  deliver: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function RehearsalPlanner() {
  const { toast } = useToast();
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [runThroughs, setRunThroughs] = useState(0);

  const toggleDone = (i: number) => {
    const n = [...plan]; n[i].done = !n[i].done; setPlan(n);
  };
  const done = plan.filter(p => p.done).length;
  const readinessScore = Math.round((done / plan.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Event header */}
      <div className="rounded-xl border border-border/50 p-5 space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2"><Calendar className="h-5 w-5 text-accent" /> Rehearsal Plan</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Event name</label>
            <Textarea placeholder="Q4 Board Update" value={eventName} onChange={e => setEventName(e.target.value)} className="min-h-[36px]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Event date</label>
            <Textarea placeholder="March 28, 2026" value={eventDate} onChange={e => setEventDate(e.target.value)} className="min-h-[36px]" />
          </div>
        </div>
      </div>

      {/* Readiness score */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn("rounded-xl p-4 text-center border", readinessScore >= 80 ? "border-green-500/20 bg-green-500/5" : readinessScore >= 50 ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5")}>
          <p className={cn("text-2xl font-bold", readinessScore >= 80 ? "text-green-500" : readinessScore >= 50 ? "text-amber-500" : "text-red-500")}>{readinessScore}%</p>
          <p className="text-[10px] text-muted-foreground">Readiness score</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-accent">{done}/{plan.length}</p>
          <p className="text-[10px] text-muted-foreground">Steps complete</p>
        </div>
        <div className="rounded-xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold">{runThroughs}</p>
          <p className="text-[10px] text-muted-foreground">Full run-throughs</p>
          <Button variant="ghost" size="sm" className="text-[10px] mt-1" onClick={() => setRunThroughs(r => r + 1)}>+ Log run</Button>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold">Two-week rehearsal checklist</p>
          <div className="flex gap-1">
            {Object.entries(CAT_COLORS).map(([k,v]) => (
              <span key={k} className={cn("text-[8px] px-1.5 py-0.5 rounded-full border", v)}>{k}</span>
            ))}
          </div>
        </div>
        {plan.map((p, i) => (
          <button key={i} onClick={() => toggleDone(i)}
            className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all",
              p.done ? "border-green-500/20 bg-green-500/5" : "border-border/50 hover:border-accent/30")}>
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
              p.done ? "bg-green-500 text-white" : "bg-muted/30 text-muted-foreground")}>
              {p.done ? <CheckCircle className="h-4 w-4" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{p.day}</span>
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border", CAT_COLORS[p.category])}>{p.category}</span>
              </div>
              <p className={cn("text-sm mt-0.5", p.done ? "line-through text-muted-foreground" : "")}>{p.task}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground">Coaching notes and feedback</label>
        <Textarea placeholder="Record feedback from each rehearsal..." value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px] mt-1" />
      </div>
    </div>
  );
}
