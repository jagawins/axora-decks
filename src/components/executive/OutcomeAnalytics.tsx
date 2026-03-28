import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Clock, CheckCircle, Users, TrendingUp, AlertTriangle, Target, ThumbsUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Metric { label: string; value: string; trend?: "up"|"down"|"flat"; target?: string }
interface Event { name: string; date: string; decisionTime?: string; clarity?: number; objectionsCovered?: number; rehearsals?: number; outcome?: string }

export default function OutcomeAnalytics() {
  const [events, setEvents] = useState<Event[]>([
    { name: "Q4 Board Update", date: "2026-03-15", decisionTime: "Same day", clarity: 4.2, objectionsCovered: 85, rehearsals: 3, outcome: "Approved" },
    { name: "EU Expansion Proposal", date: "2026-03-01", decisionTime: "3 days", clarity: 3.8, objectionsCovered: 70, rehearsals: 2, outcome: "Approved with conditions" },
    { name: "Product Roadmap Review", date: "2026-02-15", decisionTime: "1 week", clarity: 3.2, objectionsCovered: 55, rehearsals: 1, outcome: "Deferred" },
  ]);
  const [newEvent, setNewEvent] = useState<Event>({ name: "", date: "" });

  const avgClarity = events.filter(e => e.clarity).reduce((s, e) => s + (e.clarity || 0), 0) / events.filter(e => e.clarity).length;
  const avgObjCov = events.filter(e => e.objectionsCovered).reduce((s, e) => s + (e.objectionsCovered || 0), 0) / events.filter(e => e.objectionsCovered).length;
  const avgRehearsals = events.filter(e => e.rehearsals).reduce((s, e) => s + (e.rehearsals || 0), 0) / events.filter(e => e.rehearsals).length;

  const metrics: Metric[] = [
    { label: "Avg clarity score", value: avgClarity.toFixed(1) + "/5", trend: "up", target: "4.0" },
    { label: "Avg objection coverage", value: Math.round(avgObjCov) + "%", trend: "up", target: "80%" },
    { label: "Avg rehearsals", value: avgRehearsals.toFixed(1), trend: "up", target: "3" },
    { label: "Same-day decisions", value: events.filter(e => e.decisionTime === "Same day").length + "/" + events.length, trend: "flat" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent" /> Outcome Analytics</h3>
      <p className="text-sm text-muted-foreground">Track whether communication improved understanding, changed belief, and accelerated decisions.</p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-xl font-bold">{m.value}</p>
              {m.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
              {m.trend === "down" && <TrendingUp className="h-3.5 w-3.5 text-red-500 rotate-180" />}
            </div>
            {m.target && <p className="text-[9px] text-muted-foreground mt-1">Target: {m.target}</p>}
          </div>
        ))}
      </div>

      {/* Event history */}
      <div className="space-y-2">
        <p className="text-sm font-bold">Presentation history</p>
        {events.map((ev, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4 flex items-start gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              ev.outcome === "Approved" ? "bg-green-500/10 text-green-500" :
              ev.outcome === "Deferred" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")}>
              {ev.outcome === "Approved" ? <ThumbsUp className="h-5 w-5" /> :
               ev.outcome === "Deferred" ? <Clock className="h-5 w-5" /> : <Target className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">{ev.name}</p>
                <span className={cn("text-[9px] px-2 py-0.5 rounded-full",
                  ev.outcome === "Approved" ? "bg-green-500/10 text-green-500" :
                  ev.outcome === "Deferred" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")}>
                  {ev.outcome}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{ev.date}</p>
              <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Decision: {ev.decisionTime}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Clarity: {ev.clarity}/5</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Objections: {ev.objectionsCovered}%</span>
                <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Rehearsals: {ev.rehearsals}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add event */}
      <div className="rounded-xl border border-dashed border-border/50 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Log a new presentation</p>
        <div className="grid grid-cols-2 gap-3">
          <Textarea placeholder="Event name" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} className="min-h-[36px]" />
          <Textarea placeholder="Date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="min-h-[36px]" />
        </div>
        <Button variant="ghost" size="sm" onClick={() => {
          if (!newEvent.name) return;
          setEvents([{ ...newEvent, rehearsals: 0, clarity: 0, objectionsCovered: 0 }, ...events]);
          setNewEvent({ name: "", date: "" });
        }}>+ Add Event</Button>
      </div>

      {/* Insights */}
      <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 space-y-2">
        <p className="text-xs font-bold text-accent uppercase tracking-wider">Insights</p>
        <p className="text-sm">Presentations with 3+ rehearsals get same-day decisions {Math.round((events.filter(e => (e.rehearsals||0)>=3 && e.decisionTime==="Same day").length / Math.max(events.filter(e=>(e.rehearsals||0)>=3).length,1))*100)}% of the time.</p>
        <p className="text-sm">Average objection coverage is {Math.round(avgObjCov)}%. Target is 80%. {avgObjCov < 80 ? "Build more comprehensive Q&A banks." : "On track."}</p>
      </div>
    </div>
  );
}
