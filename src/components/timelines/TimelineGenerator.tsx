import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Download, BarChart3, Clock, ArrowRight,
  RefreshCw, Upload, FileSpreadsheet, X, Plus, FolderOpen,
  ChevronDown, Crown, Check, Copy, CalendarDays, GitBranch,
  Milestone, Layers, ArrowLeftRight, GanttChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { invokeFunction } from "@/lib/supabase-function-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/* ── Timeline Styles ────────────────────────────────────────────── */

interface TimelineStyle {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  pro: boolean;
}

const TIMELINE_STYLES: TimelineStyle[] = [
  { id: "horizontal", label: "Horizontal", icon: <ArrowRight className="h-5 w-5" />, description: "Left-to-right progression", pro: false },
  { id: "vertical", label: "Vertical", icon: <GitBranch className="h-5 w-5" />, description: "Classic dot-and-line", pro: false },
  { id: "milestone-cards", label: "Milestone Cards", icon: <Milestone className="h-5 w-5" />, description: "Cards with highlights", pro: true },
  { id: "gantt", label: "Gantt Chart", icon: <GanttChart className="h-5 w-5" />, description: "Duration bars + phases", pro: true },
  { id: "roadmap", label: "Roadmap Lanes", icon: <Layers className="h-5 w-5" />, description: "Multi-track swim lanes", pro: true },
  { id: "alternating", label: "Alternating", icon: <ArrowLeftRight className="h-5 w-5" />, description: "Zigzag left-right layout", pro: true },
];

/* ── Quick Prompts ──────────────────────────────────────────────── */

const QUICK_PROMPTS = [
  { label: "Product Roadmap", prompt: "Product roadmap 2026: Q1 — MVP launch and beta users. Q2 — AI features, 1000 users. Q3 — Enterprise tier, SOC2 compliance. Q4 — International expansion, 10K users, Series A." },
  { label: "Company History", prompt: "Company history timeline: 2018 — Founded in garage, 3 people. 2019 — First product launch, $500K revenue. 2020 — Series A $5M, pivoted to SaaS. 2021 — 100 customers, $2M ARR. 2022 — Series B $20M, 50 employees. 2023 — $10M ARR, international. 2024 — Acquired for $200M." },
  { label: "Project Plan", prompt: "Website redesign project: Week 1-2 Discovery and research. Week 3-4 Wireframes and UX design. Week 5-6 Visual design and prototyping. Week 7-10 Frontend development. Week 11-12 Backend integration. Week 13 QA testing. Week 14 Soft launch. Week 15-16 Full launch and optimization." },
  { label: "AI Strategy Phases", prompt: "Enterprise AI implementation roadmap: Phase 1 (Months 1-3) — Assessment and data audit, identify quick wins, form AI team. Phase 2 (Months 4-6) — Pilot projects, 3 use cases in production. Phase 3 (Months 7-12) — Scale across departments, governance framework. Phase 4 (Year 2) — AI Center of Excellence, full enterprise integration." },
  { label: "Funding Journey", prompt: "Startup funding timeline: Jan 2024 Pre-seed $250K from angels. Jun 2024 Seed round $2M led by Sequoia Scout. Jan 2025 $1M ARR milestone. Mar 2025 Series A $12M led by a16z. Sep 2025 $5M ARR. Mar 2026 Series B $40M, 200 employees." },
];

/* ── File parsing ───────────────────────────────────────────────── */

async function parseFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "tsv") {
    const text = await file.text();
    const delim = ext === "tsv" ? "\t" : ",";
    const lines = text.trim().split("\n");
    const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1, 30).map(l => l.split(delim).map(c => c.trim().replace(/^"|"$/g, "")));
    let out = `Timeline data from ${file.name}:\nColumns: ${headers.join(", ")}\n`;
    rows.forEach(row => { out += headers.map((h, i) => `${h}: ${row[i] || ""}`).join(", ") + "\n"; });
    return out;
  }
  if (ext === "json") { const t = await file.text(); return `JSON:\n${JSON.stringify(JSON.parse(t), null, 2).slice(0, 3000)}`; }
  if (ext === "txt" || ext === "md") { return (await file.text()).slice(0, 3000); }
  return `File: ${file.name}. Describe the timeline events.`;
}

/* ── Timeline event type ────────────────────────────────────────── */

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  status?: "completed" | "current" | "upcoming";
  category?: string;
  color?: string;
  duration?: string;
}

interface GeneratedTimeline {
  title: string;
  style: string;
  events: TimelineEvent[];
}

/* ── Timeline Renderers ─────────────────────────────────────────── */

function HorizontalTimeline({ data }: { data: GeneratedTimeline }) {
  return (
    <div className="w-full overflow-x-auto">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="relative min-w-[800px]">
        {/* Line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-accent/60 to-border" />
        <div className="flex justify-between relative">
          {data.events.map((ev, i) => (
            <div key={i} className="flex flex-col items-center text-center" style={{ width: `${100 / data.events.length}%` }}>
              {/* Dot */}
              <div className={cn(
                "w-4 h-4 rounded-full border-2 z-10 mt-6 mb-3",
                ev.status === "completed" ? "bg-green-500 border-green-500" :
                ev.status === "current" ? "bg-accent border-accent animate-pulse" :
                "bg-card border-border"
              )} />
              {/* Content */}
              <div className="px-2">
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

function VerticalTimeline({ data }: { data: GeneratedTimeline }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="relative ml-6">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent to-border" />
        {data.events.map((ev, i) => (
          <div key={i} className="relative flex gap-6 pb-8 last:pb-0">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 shrink-0 z-10 flex items-center justify-center",
              ev.status === "completed" ? "bg-green-500 border-green-500" :
              ev.status === "current" ? "bg-accent border-accent" :
              "bg-card border-border"
            )}>
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

function MilestoneCards({ data }: { data: GeneratedTimeline }) {
  const colors = ["bg-violet-500/10 border-violet-500/30 text-violet-400", "bg-teal-500/10 border-teal-500/30 text-teal-400", "bg-amber-500/10 border-amber-500/30 text-amber-400", "bg-blue-500/10 border-blue-500/30 text-blue-400", "bg-rose-500/10 border-rose-500/30 text-rose-400", "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"];
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.events.map((ev, i) => {
          const colorCls = colors[i % colors.length];
          return (
            <div key={i} className={cn("rounded-xl border p-4", colorCls.split(" ").slice(0, 2).join(" "))}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold", colorCls)}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{ev.date}</p>
              </div>
              <p className="text-sm font-bold">{ev.title}</p>
              {ev.description && <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{ev.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GanttTimeline({ data }: { data: GeneratedTimeline }) {
  const colors = ["bg-violet-500", "bg-teal-500", "bg-amber-500", "bg-blue-500", "bg-rose-500", "bg-emerald-500", "bg-orange-500", "bg-indigo-500"];
  const total = data.events.length;
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-2">
        {data.events.map((ev, i) => {
          const widthPct = Math.max(20, Math.min(95, 30 + (i * 65 / total)));
          const leftPct = Math.min(i * (70 / total), 60);
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-right">
                <p className="text-[10px] font-semibold text-muted-foreground">{ev.date}</p>
              </div>
              <div className="flex-1 relative h-8">
                <div
                  className={cn("absolute top-0 h-full rounded-md flex items-center px-3", colors[i % colors.length])}
                  style={{ left: `${leftPct}%`, width: `${widthPct - leftPct}%` }}
                >
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

function RoadmapLanes({ data }: { data: GeneratedTimeline }) {
  // Group events by category or split into 2-3 tracks
  const tracks: { name: string; events: TimelineEvent[] }[] = [];
  const categories = [...new Set(data.events.map(e => e.category || "General"))];
  if (categories.length > 1) {
    categories.forEach(cat => {
      tracks.push({ name: cat, events: data.events.filter(e => (e.category || "General") === cat) });
    });
  } else {
    const mid = Math.ceil(data.events.length / 2);
    tracks.push({ name: "Track 1", events: data.events.slice(0, mid) });
    tracks.push({ name: "Track 2", events: data.events.slice(mid) });
  }
  const trackColors = ["border-violet-500/30 bg-violet-500/5", "border-teal-500/30 bg-teal-500/5", "border-amber-500/30 bg-amber-500/5"];
  const dotColors = ["bg-violet-500", "bg-teal-500", "bg-amber-500"];

  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6">{data.title}</h3>}
      <div className="space-y-4">
        {tracks.map((track, ti) => (
          <div key={ti} className={cn("rounded-xl border p-4", trackColors[ti % trackColors.length])}>
            <p className="text-xs font-bold mb-3 uppercase tracking-wide opacity-60">{track.name}</p>
            <div className="flex gap-3 overflow-x-auto">
              {track.events.map((ev, ei) => (
                <div key={ei} className="flex items-start gap-2 min-w-[160px] shrink-0">
                  <div className={cn("w-3 h-3 rounded-full mt-1 shrink-0", dotColors[ti % dotColors.length])} />
                  <div>
                    <p className="text-[10px] font-semibold opacity-60">{ev.date}</p>
                    <p className="text-xs font-bold">{ev.title}</p>
                    {ev.description && <p className="text-[9px] text-muted-foreground mt-0.5">{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlternatingTimeline({ data }: { data: GeneratedTimeline }) {
  return (
    <div className="w-full">
      {data.title && <h3 className="text-lg font-bold mb-6 text-center">{data.title}</h3>}
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent/40 to-border" />
        <div className="space-y-6">
          {data.events.map((ev, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className="relative flex items-start">
                {/* Left side */}
                <div className={cn("w-[45%]", isLeft ? "pr-6 text-right" : "")}>
                  {isLeft && (
                    <div className="inline-block text-right">
                      <p className="text-[10px] font-semibold text-accent">{ev.date}</p>
                      <p className="text-sm font-bold">{ev.title}</p>
                      {ev.description && <p className="text-[10px] text-muted-foreground mt-1">{ev.description}</p>}
                    </div>
                  )}
                </div>
                {/* Center dot */}
                <div className="w-[10%] flex justify-center">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 z-10",
                    ev.status === "completed" ? "bg-green-500 border-green-500" :
                    ev.status === "current" ? "bg-accent border-accent" :
                    "bg-card border-border"
                  )} />
                </div>
                {/* Right side */}
                <div className={cn("w-[45%]", !isLeft ? "pl-6" : "")}>
                  {!isLeft && (
                    <div>
                      <p className="text-[10px] font-semibold text-accent">{ev.date}</p>
                      <p className="text-sm font-bold">{ev.title}</p>
                      {ev.description && <p className="text-[10px] text-muted-foreground mt-1">{ev.description}</p>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Timeline renderer map ──────────────────────────────────────── */

const RENDERERS: Record<string, React.FC<{ data: GeneratedTimeline }>> = {
  horizontal: HorizontalTimeline,
  vertical: VerticalTimeline,
  "milestone-cards": MilestoneCards,
  gantt: GanttTimeline,
  roadmap: RoadmapLanes,
  alternating: AlternatingTimeline,
};

/* ── Main Component ─────────────────────────────────────────────── */

export default function TimelineGenerator() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isPro = subscription.tier !== "free";

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("horizontal");
  const [generating, setGenerating] = useState(false);
  const [timeline, setTimeline] = useState<GeneratedTimeline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [addingToDeck, setAddingToDeck] = useState(false);
  const [existingDecks, setExistingDecks] = useState<{ id: string; title: string }[]>([]);
  const [showDeckPicker, setShowDeckPicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("projects").select("id, title").order("updated_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setExistingDecks(data as any); });
  }, [user]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploadedFile(f);
    try { const d = await parseFile(f); setPrompt(p => p ? `${p}\n\n${d}` : `Create a timeline from:\n\n${d}`); }
    catch { setError(`Failed to parse ${f.name}.`); }
  }, []);

  const generate = useCallback(async (op?: string) => {
    const p = op || prompt; if (!p.trim()) return;
    if (!user) { navigate("/auth"); return; }

    // Check Pro gate for premium styles
    const style = TIMELINE_STYLES.find(s => s.id === selectedStyle);
    if (style?.pro && !isPro) {
      toast({ title: "Pro feature", description: `${style.label} timelines require a Pro subscription.` });
      navigate("/pricing");
      return;
    }

    setGenerating(true); setError(null); setTimeline(null);

    try {
      const res = await invokeFunction<{ blocks: { type: string; content: any }[] }>(
        "generate-data-visual",
        {
          prompt: `Generate a timeline visualization.\n\nStyle: ${selectedStyle}\nData: ${p}\n\nReturn a timeline_block with events. Each event must have: date, title, description, and optionally status (completed/current/upcoming) and category (for roadmap lanes).`,
          blockType: "timeline_block",
        }
      );

      if (res.error) throw new Error(res.error);

      const block = res.data?.blocks?.[0];
      if (!block?.content?.events) throw new Error("No timeline generated. Try being more specific.");

      setTimeline({
        title: block.content.title || "Timeline",
        style: selectedStyle,
        events: block.content.events,
      });

      // Auto-save to library
      try {
        const { data: proj } = await supabase.from("projects")
          .insert({ title: `[Timeline] ${block.content.title || "Timeline"}`, user_id: user.id, theme: "executive" } as any)
          .select("id").single();
        if (proj) {
          await supabase.from("blocks").insert({ project_id: proj.id, type: "timeline_block", content: block.content, order_index: 0 } as any);
        }
      } catch {}

      toast({ title: "Timeline generated & saved" });
    } catch (e: any) { setError(e.message || "Failed"); }
    finally { setGenerating(false); }
  }, [prompt, selectedStyle, user, navigate, isPro, toast]);

  const downloadAsImage = useCallback(async () => {
    setDownloading(true);
    try {
      const el = document.getElementById("timeline-render");
      if (!el) throw new Error("Not found");
      const { default: html2canvas } = await import("html2canvas");
      const src = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false });
      let canvas = src;
      if (!isPro) {
        const barH = 80;
        canvas = document.createElement("canvas");
        canvas.width = src.width;
        canvas.height = src.height + barH;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(src, 0, 0);
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, src.height, canvas.width, barH);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Generated with AXIVA — axiva.ai", canvas.width / 2, src.height + barH / 2);
      }
      const link = document.createElement("a");
      link.download = `axiva-timeline-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      if (!isPro) toast({ title: "Downloaded with watermark", description: "Go Pro for watermark-free exports." });
    } catch (e: any) { toast({ title: "Download failed", variant: "destructive" }); }
    finally { setDownloading(false); }
  }, [isPro, toast]);

  const addToNewDeck = useCallback(async () => {
    if (!user || !timeline) return;
    setAddingToDeck(true);
    try {
      const { data: proj } = await supabase.from("projects")
        .insert({ title: timeline.title, user_id: user.id, theme: "executive" } as any)
        .select("id").single();
      if (!proj) throw new Error("Failed");
      await supabase.from("blocks").insert({ project_id: proj.id, type: "timeline_block", content: { title: timeline.title, events: timeline.events }, order_index: 0 } as any);
      navigate(`/editor/${proj.id}`);
    } catch { toast({ title: "Failed to create deck", variant: "destructive" }); }
    finally { setAddingToDeck(false); }
  }, [user, timeline, navigate, toast]);

  const Renderer = RENDERERS[timeline?.style || "horizontal"] || HorizontalTimeline;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
          <CalendarDays className="h-3.5 w-3.5" /> AI Timeline Generator
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Timeline Generator</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate stunning timelines, roadmaps, and Gantt charts from a description or CSV.
          6 premium styles for every use case.
        </p>
      </div>

      {/* Style selector */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Choose a style</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 max-w-4xl mx-auto">
          {TIMELINE_STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s.id)}
              className={cn("relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                selectedStyle === s.id ? "border-accent bg-accent/10 text-accent" : "border-border/50 bg-card/50 text-muted-foreground hover:border-accent/30")}
            >
              {s.pro && (
                <div className="absolute top-1 right-1">
                  <Crown className="h-3 w-3 text-amber-400" />
                </div>
              )}
              {s.icon}
              <span className="text-xs font-medium">{s.label}</span>
              <span className="text-[9px] text-muted-foreground">{s.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv,.tsv,.json,.txt,.md" onChange={handleFile} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Import Data
          </Button>
          <span className="text-xs text-muted-foreground">CSV, JSON, TXT</span>
          {uploadedFile && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs">
              <FileSpreadsheet className="h-3 w-3 text-accent" />
              <span className="text-accent font-medium">{uploadedFile.name}</span>
              <button onClick={() => { setUploadedFile(null); if (fileRef.current) fileRef.current.value = ""; }}><X className="h-3 w-3" /></button>
            </div>
          )}
        </div>

        <Textarea
          placeholder={"Describe your timeline events...\n\n• Product roadmap: Q1 launch, Q2 growth, Q3 enterprise, Q4 international\n• Company history: 2018 founded, 2020 Series A, 2023 IPO\n• Project plan with phases and milestones"}
          value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[120px] text-sm"
        />

        <div className="flex gap-2">
          <Button variant="hero" onClick={() => generate()} disabled={generating || !prompt.trim()} className="gap-2 flex-1">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate Timeline"}
          </Button>
          {timeline && <Button variant="outline" onClick={() => generate()} disabled={generating}><RefreshCw className="h-4 w-4" /></Button>}
        </div>
      </div>

      {/* Quick prompts */}
      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground text-center mb-3">Try an example:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_PROMPTS.map((qp, i) => (
            <button key={i} onClick={() => { setPrompt(qp.prompt); setTimeout(() => generate(qp.prompt), 50); }} disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-card/50 text-muted-foreground hover:border-accent/30 hover:text-accent transition-all disabled:opacity-50">
              <Sparkles className="h-3 w-3" /> {qp.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="max-w-2xl mx-auto p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

      {generating && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center"><CalendarDays className="h-7 w-7 text-accent animate-pulse" /></div>
          <p className="text-sm font-medium">Building your timeline...</p>
        </div>
      )}

      {/* Rendered timeline */}
      {timeline && !generating && (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
            {/* Title bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{selectedStyle}</Badge>
                <span className="text-sm font-medium">{timeline.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{timeline.events.length} events</span>
            </div>

            {/* Timeline visual */}
            <div id="timeline-render" className="p-8 bg-white dark:bg-gray-950 min-h-[300px]">
              <Renderer data={timeline} />
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-muted/20 border-t border-border/30 space-y-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1" disabled={downloading} onClick={downloadAsImage}>
                  {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  {isPro ? "Download PNG" : "Download with watermark"}
                </Button>
                {!isPro && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-accent" onClick={() => navigate("/pricing")}><Crown className="h-3 w-3" /> Remove watermark</Button>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="hero" size="sm" className="h-8 text-xs gap-1.5 flex-1" disabled={addingToDeck} onClick={addToNewDeck}>
                  {addingToDeck ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  New deck from this
                </Button>
                {existingDecks.length > 0 && (
                  <div className="relative">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowDeckPicker(!showDeckPicker)}>
                      <FolderOpen className="h-3 w-3" /> Add to existing <ChevronDown className={cn("h-3 w-3 transition-transform", showDeckPicker && "rotate-180")} />
                    </Button>
                    {showDeckPicker && (
                      <div className="absolute bottom-full mb-1 right-0 w-64 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-50">
                        <div className="px-3 py-2 border-b border-border/50">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Insert into deck</p>
                        </div>
                        {existingDecks.map(deck => (
                          <button key={deck.id} className="w-full text-left px-3 py-2.5 text-xs hover:bg-accent/5 border-b border-border/30 last:border-0 flex items-center justify-between"
                            onClick={async () => {
                              if (!timeline) return;
                              const { data: existing } = await supabase.from("blocks").select("order_index").eq("project_id", deck.id).order("order_index", { ascending: false }).limit(1);
                              const nextIdx = existing?.length ? (existing[0] as any).order_index + 1 : 0;
                              await supabase.from("blocks").insert({ project_id: deck.id, type: "timeline_block", content: { title: timeline.title, events: timeline.events }, order_index: nextIdx } as any);
                              await supabase.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", deck.id);
                              setShowDeckPicker(false);
                              navigate(`/editor/${deck.id}`);
                            }}>
                            <span className="truncate font-medium">{deck.title || "Untitled"}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground text-center pt-1">Generated with <a href="https://axiva.ai/?ref=timeline" className="text-accent hover:underline font-medium">AXIVA</a></p>
            </div>
          </div>

          {/* Style switcher — preview in other styles */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">Try other styles:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {TIMELINE_STYLES.filter(s => s.id !== selectedStyle).map(s => (
                <Button key={s.id} variant="ghost" size="sm" className="h-7 text-[10px] gap-1"
                  onClick={() => { setSelectedStyle(s.id); if (timeline) setTimeline({ ...timeline, style: s.id }); }}>
                  {s.icon} {s.label} {s.pro && <Crown className="h-2.5 w-2.5 text-amber-400" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
