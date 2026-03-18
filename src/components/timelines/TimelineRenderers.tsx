/**
 * 15 Timeline Visualization Renderers
 *
 * CORE TIMELINES (1-6):
 * 1. Horizontal — left-to-right progression
 * 2. Vertical — classic dot-and-line
 * 3. Gantt Chart — duration bars with phases
 * 4. Milestone Cards — colorful numbered cards
 * 5. Roadmap Swim Lanes — multi-track parallel
 * 6. Alternating — zigzag left-right
 *
 * STRATEGY TIMELINES (7-10):
 * 7. Strategic Phase — phased blocks with gates
 * 8. Three Horizon — McKinsey horizons model
 * 9. Product Evolution — version progression
 * 10. Decision Gate — stage-gate funnel
 *
 * VISUALIZATION TIMELINES (11-15):
 * 11. S-Curve — growth curve with annotations
 * 12. Calendar — month/week grid with events
 * 13. Step Process — numbered step blocks
 * 14. Layered Theme — stacked thematic tracks
 * 15. Before/After — split comparison
 */

import { cn } from "@/lib/utils";
import { Check, ArrowRight, ChevronRight } from "lucide-react";

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  status?: "completed" | "current" | "upcoming";
  category?: string;
  color?: string;
  duration?: string;
  phase?: string;
  horizon?: string;
}

export interface TimelineData {
  title: string;
  style: string;
  events: TimelineEvent[];
}

const PALETTE = ["bg-violet-500", "bg-teal-500", "bg-amber-500", "bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-orange-500", "bg-indigo-500"];
const PALETTE_LIGHT = ["bg-violet-500/10 border-violet-500/30", "bg-teal-500/10 border-teal-500/30", "bg-amber-500/10 border-amber-500/30", "bg-blue-500/10 border-blue-500/30", "bg-rose-500/10 border-rose-500/30", "bg-emerald-500/10 border-emerald-500/30"];
const TEXT_COLORS = ["text-violet-400", "text-teal-400", "text-amber-400", "text-blue-400", "text-rose-400", "text-emerald-400"];

/* ═══ 1. HORIZONTAL ═════════════════════════════════════════════ */
export function HorizontalTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full overflow-x-auto">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="relative min-w-[700px]">
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-accent/60 to-border" />
        <div className="flex justify-between relative">
          {data.events.map((ev, i) => (
            <div key={i} className="flex flex-col items-center text-center" style={{ width: `${100 / data.events.length}%` }}>
              <div className={cn("w-4 h-4 rounded-full border-2 z-10 mt-6 mb-3",
                ev.status === "completed" ? "bg-green-500 border-green-500" :
                ev.status === "current" ? "bg-accent border-accent animate-pulse" : "bg-card border-border")} />
              <div className="px-1">
                <p className="text-[10px] font-semibold text-accent uppercase tracking-wide">{ev.date}</p>
                <p className="text-xs font-bold mt-1">{ev.title}</p>
                {ev.description && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ 2. VERTICAL ═══════════════════════════════════════════════ */
export function VerticalTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="relative ml-6">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent to-border" />
        {data.events.map((ev, i) => (
          <div key={i} className="relative flex gap-6 pb-8 last:pb-0">
            <div className={cn("w-6 h-6 rounded-full border-2 shrink-0 z-10 flex items-center justify-center",
              ev.status === "completed" ? "bg-green-500 border-green-500" :
              ev.status === "current" ? "bg-accent border-accent" : "bg-card border-border")}>
              {ev.status === "completed" && <Check className="h-3 w-3 text-white" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-accent">{ev.date}</p>
              <p className="text-sm font-bold mt-0.5">{ev.title}</p>
              {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 3. GANTT CHART ════════════════════════════════════════════ */
export function GanttTimeline({ data }: { data: TimelineData }) {
  const n = data.events.length;
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-2">
        {data.events.map((ev, i) => {
          const w = Math.max(25, Math.min(90, 30 + (i * 60 / n)));
          const l = Math.min(i * (60 / n), 55);
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 shrink-0 text-right"><p className="text-[10px] font-semibold text-muted-foreground truncate">{ev.date}</p></div>
              <div className="flex-1 relative h-8">
                <div className={cn("absolute top-0 h-full rounded-md flex items-center px-3", PALETTE[i % PALETTE.length])}
                  style={{ left: `${l}%`, width: `${w - l}%` }}>
                  <span className="text-[10px] font-semibold text-white truncate">{ev.title}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ 4. MILESTONE CARDS ════════════════════════════════════════ */
export function MilestoneCards({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.events.map((ev, i) => (
          <div key={i} className={cn("rounded-xl border p-4", PALETTE_LIGHT[i % PALETTE_LIGHT.length])}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold", TEXT_COLORS[i % TEXT_COLORS.length], PALETTE_LIGHT[i % PALETTE_LIGHT.length])}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{ev.date}</p>
            </div>
            <p className="text-sm font-bold">{ev.title}</p>
            {ev.description && <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{ev.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 5. ROADMAP SWIM LANES ═════════════════════════════════════ */
export function RoadmapLanes({ data }: { data: TimelineData }) {
  const cats = [...new Set(data.events.map(e => e.category || e.phase || "General"))];
  const tracks = cats.length > 1
    ? cats.map(c => ({ name: c, events: data.events.filter(e => (e.category || e.phase || "General") === c) }))
    : [{ name: "Track 1", events: data.events.slice(0, Math.ceil(data.events.length / 2)) }, { name: "Track 2", events: data.events.slice(Math.ceil(data.events.length / 2)) }];
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-3">
        {tracks.map((t, ti) => (
          <div key={ti} className={cn("rounded-xl border p-4", PALETTE_LIGHT[ti % PALETTE_LIGHT.length])}>
            <p className="text-xs font-bold mb-3 uppercase tracking-wide opacity-60">{t.name}</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {t.events.map((ev, ei) => (
                <div key={ei} className="flex items-start gap-2 min-w-[150px] shrink-0">
                  <div className={cn("w-3 h-3 rounded-full mt-1 shrink-0", PALETTE[ti % PALETTE.length])} />
                  <div><p className="text-[10px] font-semibold opacity-60">{ev.date}</p><p className="text-xs font-bold">{ev.title}</p></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 6. ALTERNATING ════════════════════════════════════════════ */
export function AlternatingTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6 text-center">{data.title}</h3>}
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent/40 to-border" />
        <div className="space-y-6">
          {data.events.map((ev, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className="relative flex items-start">
                <div className={cn("w-[44%]", isLeft ? "pr-4 text-right" : "")}>
                  {isLeft && <div className="inline-block text-right"><p className="text-[10px] font-semibold text-accent">{ev.date}</p><p className="text-sm font-bold">{ev.title}</p>{ev.description && <p className="text-[10px] text-muted-foreground mt-1">{ev.description}</p>}</div>}
                </div>
                <div className="w-[12%] flex justify-center"><div className={cn("w-4 h-4 rounded-full border-2 z-10", ev.status === "completed" ? "bg-green-500 border-green-500" : ev.status === "current" ? "bg-accent border-accent" : "bg-card border-border")} /></div>
                <div className={cn("w-[44%]", !isLeft ? "pl-4" : "")}>
                  {!isLeft && <div><p className="text-[10px] font-semibold text-accent">{ev.date}</p><p className="text-sm font-bold">{ev.title}</p>{ev.description && <p className="text-[10px] text-muted-foreground mt-1">{ev.description}</p>}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ 7. STRATEGIC PHASE ════════════════════════════════════════ */
export function StrategicPhaseTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="flex gap-1 overflow-x-auto">
        {data.events.map((ev, i) => (
          <div key={i} className="flex items-stretch shrink-0" style={{ minWidth: `${Math.max(120, 100 / data.events.length)}%` ? undefined : undefined, flex: 1 }}>
            <div className={cn("flex-1 rounded-xl p-4 border relative", PALETTE_LIGHT[i % PALETTE_LIGHT.length])}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-xs font-bold", TEXT_COLORS[i % TEXT_COLORS.length])}>Phase {i + 1}</span>
                <span className="text-[9px] text-muted-foreground">{ev.date}</span>
              </div>
              <p className="text-sm font-bold">{ev.title}</p>
              {ev.description && <p className="text-[10px] text-muted-foreground mt-1.5">{ev.description}</p>}
            </div>
            {i < data.events.length - 1 && <div className="flex items-center px-1"><ChevronRight className="h-4 w-4 text-muted-foreground/40" /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 8. THREE HORIZON ══════════════════════════════════════════ */
export function ThreeHorizonTimeline({ data }: { data: TimelineData }) {
  const horizons = [
    { label: "Horizon 1 — Maintain & Defend", color: "border-blue-500/30 bg-blue-500/5", text: "text-blue-400" },
    { label: "Horizon 2 — Build & Grow", color: "border-teal-500/30 bg-teal-500/5", text: "text-teal-400" },
    { label: "Horizon 3 — Explore & Create", color: "border-violet-500/30 bg-violet-500/5", text: "text-violet-400" },
  ];
  const third = Math.ceil(data.events.length / 3);
  const groups = [data.events.slice(0, third), data.events.slice(third, third * 2), data.events.slice(third * 2)];
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-3">
        {horizons.map((h, hi) => (
          <div key={hi} className={cn("rounded-xl border p-4", h.color)}>
            <p className={cn("text-xs font-bold mb-3", h.text)}>{h.label}</p>
            <div className="flex flex-wrap gap-3">
              {(groups[hi] || []).map((ev, ei) => (
                <div key={ei} className="flex items-start gap-2 min-w-[140px]">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", hi === 0 ? "bg-blue-500" : hi === 1 ? "bg-teal-500" : "bg-violet-500")} />
                  <div><p className="text-[10px] opacity-60">{ev.date}</p><p className="text-xs font-bold">{ev.title}</p></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 9. PRODUCT EVOLUTION ══════════════════════════════════════ */
export function ProductEvolutionTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-0">
        {data.events.map((ev, i) => (
          <div key={i} className="flex items-stretch">
            <div className="flex flex-col items-center mr-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0", PALETTE[i % PALETTE.length])}>
                v{i + 1}
              </div>
              {i < data.events.length - 1 && <div className="w-0.5 flex-1 min-h-[2rem] bg-border" />}
            </div>
            <div className="pb-6">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-bold">{ev.title}</p>
                <p className="text-[10px] text-muted-foreground">{ev.date}</p>
              </div>
              {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 10. DECISION GATE ═════════════════════════════════════════ */
export function DecisionGateTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="flex items-center gap-0 overflow-x-auto">
        {data.events.map((ev, i) => (
          <div key={i} className="flex items-center shrink-0">
            {/* Stage */}
            <div className={cn("rounded-xl p-3 border min-w-[130px]", PALETTE_LIGHT[i % PALETTE_LIGHT.length])}>
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-50">Stage {i + 1}</p>
              <p className="text-xs font-bold mt-1">{ev.title}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{ev.date}</p>
            </div>
            {/* Gate diamond */}
            {i < data.events.length - 1 && (
              <div className="flex flex-col items-center mx-2">
                <div className={cn("w-6 h-6 rotate-45 border-2 flex items-center justify-center", ev.status === "completed" ? "bg-green-500 border-green-500" : "bg-card border-accent")}>
                  {ev.status === "completed" && <Check className="h-3 w-3 text-white -rotate-45" />}
                </div>
                <p className="text-[8px] text-muted-foreground mt-1">Gate</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 11. S-CURVE ═══════════════════════════════════════════════ */
export function SCurveTimeline({ data }: { data: TimelineData }) {
  const n = data.events.length;
  // Generate S-curve path points
  const points = data.events.map((_, i) => {
    const x = (i / (n - 1)) * 100;
    const t = i / (n - 1);
    const y = 100 - (1 / (1 + Math.exp(-8 * (t - 0.5)))) * 100; // sigmoid
    return { x, y };
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * 6} ${p.y * 2 + 20}`).join(" ");

  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="relative">
        <svg viewBox="0 0 600 260" className="w-full h-[200px]" fill="none">
          <path d={pathD} stroke="url(#grad)" strokeWidth="3" fill="none" />
          <defs><linearGradient id="grad" x1="0" x2="600" gradientUnits="userSpaceOnUse"><stop stopColor="#6C3AFF" /><stop offset="1" stopColor="#14B8A6" /></linearGradient></defs>
          {points.map((p, i) => (
            <circle key={i} cx={p.x * 6} cy={p.y * 2 + 20} r="5" fill={i < n / 2 ? "#6C3AFF" : "#14B8A6"} />
          ))}
        </svg>
        <div className="flex justify-between mt-2">
          {data.events.map((ev, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / n}%` }}>
              <p className="text-[9px] font-bold">{ev.title}</p>
              <p className="text-[8px] text-muted-foreground">{ev.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ 12. CALENDAR ══════════════════════════════════════════════ */
export function CalendarTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {data.events.map((ev, i) => (
          <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
            <div className={cn("px-3 py-1.5 text-center text-white text-[10px] font-bold", PALETTE[i % PALETTE.length])}>
              {ev.date}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-bold leading-tight">{ev.title}</p>
              {ev.description && <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">{ev.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 13. STEP PROCESS ══════════════════════════════════════════ */
export function StepProcessTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-3">
        {data.events.map((ev, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shrink-0", PALETTE[i % PALETTE.length])}>
              {i + 1}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-baseline gap-2">
                <p className="text-sm font-bold">{ev.title}</p>
                <p className="text-[10px] text-muted-foreground">{ev.date}</p>
              </div>
              {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
            </div>
            {i < data.events.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/30 mt-4 shrink-0 hidden sm:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 14. LAYERED THEME ═════════════════════════════════════════ */
export function LayeredTimeline({ data }: { data: TimelineData }) {
  const themes = [...new Set(data.events.map(e => e.category || e.phase || `Theme ${Math.floor(data.events.indexOf(e) / 3) + 1}`))];
  const themeMap = new Map<string, TimelineEvent[]>();
  data.events.forEach(e => {
    const key = e.category || e.phase || `Theme ${Math.floor(data.events.indexOf(e) / 3) + 1}`;
    if (!themeMap.has(key)) themeMap.set(key, []);
    themeMap.get(key)!.push(e);
  });

  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-1">
        {[...themeMap.entries()].map(([theme, events], ti) => (
          <div key={ti} className="flex items-center gap-2">
            <div className="w-20 shrink-0 text-right">
              <p className={cn("text-[10px] font-bold", TEXT_COLORS[ti % TEXT_COLORS.length])}>{theme}</p>
            </div>
            <div className="flex-1 flex gap-1">
              {events.map((ev, ei) => (
                <div key={ei} className={cn("flex-1 rounded-md px-2 py-2 text-white text-[9px] font-semibold truncate", PALETTE[ti % PALETTE.length])} title={`${ev.date}: ${ev.title}`}>
                  {ev.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Date axis */}
      <div className="flex justify-between mt-2 ml-[88px]">
        {data.events.length > 0 && <span className="text-[9px] text-muted-foreground">{data.events[0].date}</span>}
        {data.events.length > 1 && <span className="text-[9px] text-muted-foreground">{data.events[data.events.length - 1].date}</span>}
      </div>
    </div>
  );
}

/* ═══ 15. BEFORE/AFTER ══════════════════════════════════════════ */
export function BeforeAfterTimeline({ data }: { data: TimelineData }) {
  const mid = Math.ceil(data.events.length / 2);
  const before = data.events.slice(0, mid);
  const after = data.events.slice(mid);
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6 text-center">{data.title}</h3>}
      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Before / Past</p>
          <div className="space-y-3">
            {before.map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                <div><p className="text-[10px] text-muted-foreground">{ev.date}</p><p className="text-xs font-medium">{ev.title}</p></div>
              </div>
            ))}
          </div>
        </div>
        {/* After */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
          <p className="text-xs font-bold text-accent uppercase tracking-wider mb-4">After / Future</p>
          <div className="space-y-3">
            {after.map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                <div><p className="text-[10px] text-accent">{ev.date}</p><p className="text-xs font-bold">{ev.title}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ 16. SCENARIO BRANCHING ════════════════════════════════════ */
export function ScenarioBranchingTimeline({ data }: { data: TimelineData }) {
  // First event is the decision point, rest are branching paths
  const decision = data.events[0];
  const branches = data.events.slice(1);
  const branchColors = [["bg-green-500/10 border-green-500/30", "text-green-400", "bg-green-500"], ["bg-amber-500/10 border-amber-500/30", "text-amber-400", "bg-amber-500"], ["bg-red-500/10 border-red-500/30", "text-red-400", "bg-red-500"], ["bg-blue-500/10 border-blue-500/30", "text-blue-400", "bg-blue-500"]];

  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      {/* Decision node */}
      <div className="flex justify-center mb-6">
        <div className="rounded-2xl border-2 border-accent bg-accent/10 px-6 py-4 text-center max-w-xs">
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Decision Point</p>
          <p className="text-sm font-bold mt-1">{decision?.title || "Today"}</p>
          <p className="text-[10px] text-muted-foreground">{decision?.date}</p>
        </div>
      </div>
      {/* Branching lines */}
      <div className="flex justify-center mb-2">
        <div className="w-0.5 h-6 bg-accent" />
      </div>
      {/* Branches */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {branches.slice(0, 3).map((b, i) => {
          const [bgBorder, textCl, dotCl] = branchColors[i % branchColors.length];
          return (
            <div key={i} className={cn("rounded-xl border p-4 relative", bgBorder)}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-3 h-3 rounded-full", dotCl)} />
                <p className={cn("text-xs font-bold", textCl)}>Path {String.fromCharCode(65 + i)}</p>
                {b.description?.includes("likely") && <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Most likely</span>}
              </div>
              <p className="text-sm font-bold">{b.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{b.date}</p>
              {b.description && <p className="text-[10px] text-muted-foreground mt-1">{b.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ 17. IMPACT MAGNITUDE ══════════════════════════════════════ */
export function ImpactMagnitudeTimeline({ data }: { data: TimelineData }) {
  // Size dots by index position (later events have more impact, or use description length as proxy)
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="relative">
        {/* Base line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-0.5" />
        <div className="flex justify-between items-center relative min-h-[200px]">
          {data.events.map((ev, i) => {
            // Impact score: rough heuristic from description length or position
            const impact = ev.description ? Math.min(ev.description.length / 30, 3) + 1 : (i + 1) / data.events.length * 3 + 1;
            const size = Math.max(32, Math.min(80, impact * 20));
            const isAbove = i % 2 === 0;
            return (
              <div key={i} className="flex flex-col items-center relative" style={{ width: `${100 / data.events.length}%` }}>
                {isAbove && (
                  <div className="mb-2 text-center">
                    <p className="text-[9px] font-bold">{ev.title}</p>
                    <p className="text-[8px] text-muted-foreground">{ev.date}</p>
                  </div>
                )}
                <div className={cn("rounded-full flex items-center justify-center z-10 border-2 transition-all", PALETTE[i % PALETTE.length], "border-transparent")}
                  style={{ width: `${size}px`, height: `${size}px` }}>
                  <span className="text-[9px] font-bold text-white">{ev.date?.slice(-4) || ""}</span>
                </div>
                {!isAbove && (
                  <div className="mt-2 text-center">
                    <p className="text-[9px] font-bold">{ev.title}</p>
                    <p className="text-[8px] text-muted-foreground">{ev.date}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ 18. CAUSE & EFFECT ════════════════════════════════════════ */
export function CauseEffectTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-0">
        {data.events.map((ev, i) => (
          <div key={i}>
            <div className="flex items-start gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold", i === 0 ? "bg-red-500" : i === data.events.length - 1 ? "bg-accent" : PALETTE[i % PALETTE.length])}>
                {i === 0 ? "RC" : i === data.events.length - 1 ? "→" : String(i)}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-baseline gap-2">
                  {i === 0 && <span className="text-[8px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full uppercase">Root Cause</span>}
                  {i === data.events.length - 1 && <span className="text-[8px] font-bold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full uppercase">Final Effect</span>}
                </div>
                <p className="text-sm font-bold mt-1">{ev.title}</p>
                <p className="text-[10px] text-muted-foreground">{ev.date}</p>
                {ev.description && <p className="text-[10px] text-muted-foreground mt-0.5">{ev.description}</p>}
              </div>
            </div>
            {i < data.events.length - 1 && (
              <div className="flex items-center gap-4 py-1">
                <div className="w-10 flex justify-center"><div className="w-0.5 h-5 bg-border" /></div>
                <p className="text-[9px] text-accent font-semibold italic">↓ leads to</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 19. LIFE JOURNEY ══════════════════════════════════════════ */
export function LifeJourneyTimeline({ data }: { data: TimelineData }) {
  const emojiMap: Record<string, string> = { born: "👶", school: "🎓", job: "💼", married: "💍", travel: "✈️", launch: "🚀", growth: "📈", goal: "⭐" };
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6 text-center">{data.title}</h3>}
      <div className="relative max-w-md mx-auto">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-teal-500 to-amber-500" />
        {data.events.map((ev, i) => {
          const emoji = Object.entries(emojiMap).find(([k]) => ev.title.toLowerCase().includes(k))?.[1] || "📌";
          const isFuture = ev.status === "upcoming";
          return (
            <div key={i} className={cn("relative flex gap-5 pb-8 last:pb-0", isFuture && "opacity-60")}>
              <div className="w-12 h-12 rounded-full bg-card border-2 border-accent flex items-center justify-center text-xl z-10 shrink-0">
                {emoji}
              </div>
              <div className={cn("rounded-xl border p-3 flex-1", isFuture ? "border-dashed border-accent/30 bg-accent/5" : "border-border/50 bg-card/50")}>
                <p className="text-[10px] font-semibold text-accent">{ev.date}</p>
                <p className="text-sm font-bold">{ev.title}</p>
                {ev.description && <p className="text-[10px] text-muted-foreground mt-1">{ev.description}</p>}
                {isFuture && <p className="text-[8px] text-accent mt-1 italic">Future goal</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ 20. COMPANY STORY ═════════════════════════════════════════ */
export function CompanyStoryTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="relative overflow-x-auto">
        <div className="flex gap-0 min-w-[600px]">
          {data.events.map((ev, i) => (
            <div key={i} className="flex-1 relative">
              {/* Top: alternating above/below */}
              <div className={cn("px-3 text-center", i % 2 === 0 ? "pb-10" : "pt-10")}>
                <div className={cn("rounded-xl p-3 border inline-block", PALETTE_LIGHT[i % PALETTE_LIGHT.length])}>
                  <p className={cn("text-xs font-bold", TEXT_COLORS[i % TEXT_COLORS.length])}>{ev.date}</p>
                  <p className="text-[10px] font-bold mt-1">{ev.title}</p>
                  {ev.description && <p className="text-[8px] text-muted-foreground mt-0.5">{ev.description}</p>}
                </div>
              </div>
              {/* Center dot on line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center">
                <div className={cn("w-4 h-4 rounded-full z-10", PALETTE[i % PALETTE.length])} />
              </div>
            </div>
          ))}
          {/* Horizontal line through center */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-0.5" />
        </div>
      </div>
    </div>
  );
}

/* ═══ 21. TECH EVOLUTION ════════════════════════════════════════ */
export function TechEvolutionTimeline({ data }: { data: TimelineData }) {
  const eraColors = ["bg-slate-700", "bg-blue-600", "bg-teal-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="flex gap-0 overflow-x-auto">
        {data.events.map((ev, i) => (
          <div key={i} className="flex-1 min-w-[120px]">
            <div className={cn("h-2 w-full", eraColors[i % eraColors.length])} />
            <div className="p-3 border-r border-border/30 last:border-0">
              <p className="text-[10px] font-bold text-muted-foreground">{ev.date}</p>
              <p className="text-xs font-bold mt-1">{ev.title}</p>
              {ev.description && <p className="text-[9px] text-muted-foreground mt-1">{ev.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 22. THEN VS NOW ═══════════════════════════════════════════ */
export function ThenVsNowTimeline({ data }: { data: TimelineData }) {
  const mid = Math.ceil(data.events.length / 2);
  const then = data.events.slice(0, mid);
  const now = data.events.slice(mid);
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6 text-center">{data.title}</h3>}
      <div className="space-y-3">
        {Array.from({ length: Math.max(then.length, now.length) }).map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            {/* Then */}
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-right">
              {then[i] ? (<>
                <p className="text-[9px] text-muted-foreground">{then[i].date}</p>
                <p className="text-xs font-bold">{then[i].title}</p>
              </>) : <div className="h-8" />}
            </div>
            {/* Now */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
              {now[i] ? (<>
                <p className="text-[9px] text-accent">{now[i].date}</p>
                <p className="text-xs font-bold">{now[i].title}</p>
              </>) : <div className="h-8" />}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        <p className="text-[9px] text-muted-foreground text-right font-bold uppercase">Then</p>
        <p className="text-[9px] text-accent font-bold uppercase">Now</p>
      </div>
    </div>
  );
}

/* ═══ 23. FUTURE PREDICTION ═════════════════════════════════════ */
export function FuturePredictionTimeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-3">
        {data.events.map((ev, i) => {
          const confidence = ev.description?.toLowerCase().includes("likely") ? "high" : ev.description?.toLowerCase().includes("possible") ? "medium" : i < data.events.length / 2 ? "high" : "medium";
          const confStyles = { high: "border-green-500/30 bg-green-500/5", medium: "border-amber-500/30 bg-amber-500/5", low: "border-red-500/30 bg-red-500/5" };
          const confText = { high: "text-green-400", medium: "text-amber-400", low: "text-red-400" };
          return (
            <div key={i} className={cn("rounded-xl border p-4 flex items-start gap-4", confStyles[confidence])}>
              <div className="text-2xl shrink-0">{i === 0 ? "📍" : "🔮"}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{ev.title}</p>
                  <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full", confText[confidence], confStyles[confidence])}>
                    {confidence} confidence
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ev.date}</p>
                {ev.description && <p className="text-[10px] text-muted-foreground mt-1">{ev.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ RENDERER MAP ══════════════════════════════════════════════ */
export const RENDERERS: Record<string, React.FC<{ data: TimelineData }>> = {
  "horizontal": HorizontalTimeline,
  "vertical": VerticalTimeline,
  "gantt": GanttTimeline,
  "milestone-cards": MilestoneCards,
  "roadmap": RoadmapLanes,
  "alternating": AlternatingTimeline,
  "strategic-phase": StrategicPhaseTimeline,
  "three-horizon": ThreeHorizonTimeline,
  "product-evolution": ProductEvolutionTimeline,
  "decision-gate": DecisionGateTimeline,
  "s-curve": SCurveTimeline,
  "calendar": CalendarTimeline,
  "step-process": StepProcessTimeline,
  "layered": LayeredTimeline,
  "before-after": BeforeAfterTimeline,
  // Advanced reasoning
  "scenario-branching": ScenarioBranchingTimeline,
  "impact-magnitude": ImpactMagnitudeTimeline,
  "cause-effect": CauseEffectTimeline,
  // Viral / shareable
  "life-journey": LifeJourneyTimeline,
  "company-story": CompanyStoryTimeline,
  "tech-evolution": TechEvolutionTimeline,
  "then-vs-now": ThenVsNowTimeline,
  "future-prediction": FuturePredictionTimeline,
};
