import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Download, ArrowRight, RefreshCw, Upload,
  FileSpreadsheet, X, Plus, FolderOpen, ChevronDown, Crown,
  CalendarDays, GitBranch, Milestone, Layers, ArrowLeftRight,
  GanttChart, Target, Zap, BarChart3, Calendar, Workflow,
  TrendingUp, Split, LayoutGrid, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { invokeFunction } from "@/lib/supabase-function-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RENDERERS, type TimelineData, type TimelineEvent } from "./TimelineRenderers";

/* ── Style Definitions ──────────────────────────────────────────── */

interface StyleDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  desc: string;
  pro: boolean;
  group: "core" | "strategy" | "visualization" | "advanced" | "viral";
}

const STYLES: StyleDef[] = [
  // Core (1-6)
  { id: "horizontal", label: "Horizontal", icon: <ArrowRight className="h-4 w-4" />, desc: "Left-to-right", pro: false, group: "core" },
  { id: "vertical", label: "Vertical", icon: <GitBranch className="h-4 w-4" />, desc: "Dot-and-line", pro: false, group: "core" },
  { id: "gantt", label: "Gantt Chart", icon: <GanttChart className="h-4 w-4" />, desc: "Duration bars", pro: true, group: "core" },
  { id: "milestone-cards", label: "Milestone Cards", icon: <Milestone className="h-4 w-4" />, desc: "Colorful cards", pro: true, group: "core" },
  { id: "roadmap", label: "Swim Lanes", icon: <Layers className="h-4 w-4" />, desc: "Multi-track", pro: true, group: "core" },
  { id: "alternating", label: "Alternating", icon: <ArrowLeftRight className="h-4 w-4" />, desc: "Zigzag layout", pro: true, group: "core" },
  // Strategy (7-10)
  { id: "strategic-phase", label: "Strategic Phase", icon: <Target className="h-4 w-4" />, desc: "Phase blocks", pro: true, group: "strategy" },
  { id: "three-horizon", label: "Three Horizon", icon: <Layers className="h-4 w-4" />, desc: "McKinsey model", pro: true, group: "strategy" },
  { id: "product-evolution", label: "Product Evolution", icon: <TrendingUp className="h-4 w-4" />, desc: "Version progression", pro: true, group: "strategy" },
  { id: "decision-gate", label: "Decision Gate", icon: <Workflow className="h-4 w-4" />, desc: "Stage-gate funnel", pro: true, group: "strategy" },
  // Visualization (11-15)
  { id: "s-curve", label: "S-Curve", icon: <TrendingUp className="h-4 w-4" />, desc: "Growth curve", pro: true, group: "visualization" },
  { id: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" />, desc: "Date grid cards", pro: true, group: "visualization" },
  { id: "step-process", label: "Step Process", icon: <LayoutGrid className="h-4 w-4" />, desc: "Numbered steps", pro: false, group: "visualization" },
  { id: "layered", label: "Layered Theme", icon: <Split className="h-4 w-4" />, desc: "Stacked tracks", pro: true, group: "visualization" },
  { id: "before-after", label: "Before / After", icon: <ArrowLeftRight className="h-4 w-4" />, desc: "Past vs future", pro: true, group: "visualization" },
  // Advanced Reasoning (16-18)
  { id: "scenario-branching", label: "Scenario Branching", icon: <GitBranch className="h-4 w-4" />, desc: "Multiple futures", pro: true, group: "advanced" },
  { id: "impact-magnitude", label: "Impact Magnitude", icon: <Target className="h-4 w-4" />, desc: "Sized by importance", pro: true, group: "advanced" },
  { id: "cause-effect", label: "Cause & Effect", icon: <ArrowRight className="h-4 w-4" />, desc: "Causal chains", pro: true, group: "advanced" },
  // Viral / Shareable (19-23)
  { id: "life-journey", label: "Life Journey", icon: <CalendarDays className="h-4 w-4" />, desc: "Personal story", pro: true, group: "viral" },
  { id: "company-story", label: "Company Story", icon: <TrendingUp className="h-4 w-4" />, desc: "Brand narrative", pro: true, group: "viral" },
  { id: "tech-evolution", label: "Tech Evolution", icon: <Layers className="h-4 w-4" />, desc: "Era progression", pro: true, group: "viral" },
  { id: "then-vs-now", label: "Then vs Now", icon: <ArrowLeftRight className="h-4 w-4" />, desc: "Compare eras", pro: true, group: "viral" },
  { id: "future-prediction", label: "Future Prediction", icon: <Sparkles className="h-4 w-4" />, desc: "What comes next", pro: true, group: "viral" },
];

/* ── Narrative Views (one dataset → multiple views) ─────────────── */

interface NarrativeView {
  id: string;
  label: string;
  style: string;
  description: string;
}

function suggestNarrativeViews(events: TimelineEvent[]): NarrativeView[] {
  const views: NarrativeView[] = [
    { id: "milestone", label: "Milestone View", style: "milestone-cards", description: "Key achievements as cards" },
    { id: "chronological", label: "Chronological", style: "vertical", description: "Classic timeline" },
  ];

  if (events.length >= 4) {
    views.push({ id: "strategic", label: "Strategy Phases", style: "strategic-phase", description: "Phased strategic blocks" });
  }
  if (events.length >= 6) {
    views.push({ id: "horizon", label: "Three Horizons", style: "three-horizon", description: "McKinsey horizons" });
  }
  if (events.some(e => e.category || e.phase)) {
    views.push({ id: "swimlane", label: "Multi-Track", style: "roadmap", description: "Parallel swim lanes" });
  }
  if (events.length >= 3) {
    views.push({ id: "evolution", label: "Evolution", style: "product-evolution", description: "Version progression" });
    views.push({ id: "before-after", label: "Before / After", style: "before-after", description: "Past vs future" });
    // Advanced reasoning views
    views.push({ id: "scenario", label: "Scenario Branching", style: "scenario-branching", description: "Multiple futures from decision point" });
    views.push({ id: "cause-effect", label: "Cause & Effect", style: "cause-effect", description: "What caused what" });
    views.push({ id: "impact", label: "Impact Magnitude", style: "impact-magnitude", description: "Sized by importance" });
  }
  if (events.length >= 5) {
    views.push({ id: "growth", label: "Growth Curve", style: "s-curve", description: "S-curve visualization" });
  }
  // Viral/shareable views
  views.push({ id: "company-story", label: "Company Story", style: "company-story", description: "Brand narrative" });
  views.push({ id: "then-vs-now", label: "Then vs Now", style: "then-vs-now", description: "Compare two eras" });
  if (events.length >= 5) {
    views.push({ id: "future", label: "Future Prediction", style: "future-prediction", description: "What comes next" });
    views.push({ id: "life-journey", label: "Life Journey", style: "life-journey", description: "Personal narrative" });
  }
  return views;
}

/* ── Auto Style Selector ────────────────────────────────────────── */

function autoSelectStyle(events: TimelineEvent[]): string {
  if (events.length <= 3) return "horizontal";
  if (events.length >= 8) return "step-process";
  if (events.some(e => e.category || e.phase)) return "roadmap";
  if (events.some(e => e.duration)) return "gantt";
  if (events.length >= 6) return "strategic-phase";
  return "milestone-cards";
}

/* ── Quick Prompts ──────────────────────────────────────────────── */

const QUICK_PROMPTS = [
  { label: "Product Roadmap", prompt: "Product roadmap 2026: Q1 — MVP launch and beta users. Q2 — AI features, 1000 users. Q3 — Enterprise tier, SOC2. Q4 — International expansion, 10K users, Series A." },
  { label: "Company History", prompt: "2018 Founded in garage. 2019 First product, $500K revenue. 2020 Series A $5M. 2021 100 customers, $2M ARR. 2022 Series B $20M. 2023 $10M ARR, international. 2024 Acquired for $200M." },
  { label: "AI Strategy", prompt: "AI implementation roadmap: Phase 1 (M1-3) Assessment, data audit, quick wins. Phase 2 (M4-6) Pilot projects, 3 use cases. Phase 3 (M7-12) Scale across departments, governance. Phase 4 (Year 2) AI Center of Excellence." },
  { label: "Project Plan", prompt: "Website redesign: Week 1-2 Discovery. Week 3-4 Wireframes. Week 5-6 Visual design. Week 7-10 Development. Week 11-12 Backend. Week 13 QA. Week 14-16 Launch." },
  { label: "Funding Journey", prompt: "Jan 2024 Pre-seed $250K. Jun 2024 Seed $2M. Jan 2025 $1M ARR. Mar 2025 Series A $12M. Sep 2025 $5M ARR. Mar 2026 Series B $40M." },
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
    let out = `Timeline data:\nColumns: ${headers.join(", ")}\n`;
    rows.forEach(row => { out += headers.map((h, i) => `${h}: ${row[i] || ""}`).join(", ") + "\n"; });
    return out;
  }
  if (ext === "json") return `JSON:\n${(await file.text()).slice(0, 3000)}`;
  if (ext === "txt" || ext === "md") return (await file.text()).slice(0, 3000);
  return `File: ${file.name}. Describe events.`;
}

/* ═══ MAIN COMPONENT ════════════════════════════════════════════ */

export default function TimelineGenerator() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isPro = subscription.tier !== "free";

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("horizontal");
  const [autoMode, setAutoMode] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [addingToDeck, setAddingToDeck] = useState(false);
  const [existingDecks, setExistingDecks] = useState<{ id: string; title: string }[]>([]);
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [showNarrativeViews, setShowNarrativeViews] = useState(false);
  const [styleGroup, setStyleGroup] = useState<"core" | "strategy" | "visualization">("core");

  useEffect(() => {
    if (!user) return;
    supabase.from("projects").select("id, title").order("updated_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setExistingDecks(data as any); });
  }, [user]);

  const generate = useCallback(async (op?: string) => {
    const p = op || prompt; if (!p.trim()) return;
    if (!user) { navigate("/auth"); return; }

    const style = STYLES.find(s => s.id === selectedStyle);
    if (style?.pro && !isPro && !autoMode) {
      toast({ title: "Pro feature", description: `${style.label} requires Pro.` }); navigate("/pricing"); return;
    }

    setGenerating(true); setError(null); setTimeline(null);
    try {
      const res = await invokeFunction<{ blocks: { type: string; content: any }[] }>(
        "generate-data-visual",
        {
          prompt: `Generate a timeline. Each event: date, title, description, status (completed/current/upcoming), category (optional).\n\nData: ${p}`,
          blockType: "timeline_block",
        }
      );
      if (res.error) throw new Error(res.error);
      const block = res.data?.blocks?.[0];
      if (!block?.content?.events) throw new Error("No timeline generated.");

      const events = block.content.events as TimelineEvent[];
      const finalStyle = autoMode ? autoSelectStyle(events) : selectedStyle;

      // Check pro gate for auto-selected style
      const finalStyleDef = STYLES.find(s => s.id === finalStyle);
      if (finalStyleDef?.pro && !isPro) {
        // Fallback to free style
        setTimeline({ title: block.content.title || "Timeline", style: "horizontal", events });
      } else {
        setTimeline({ title: block.content.title || "Timeline", style: finalStyle, events });
      }

      // Auto-save
      try {
        const { data: proj } = await supabase.from("projects")
          .insert({ title: `[Timeline] ${block.content.title || "Timeline"}`, user_id: user.id, theme: "executive" } as any)
          .select("id").single();
        if (proj) await supabase.from("blocks").insert({ project_id: proj.id, type: "timeline_block", content: block.content, order_index: 0 } as any);
      } catch {}

      toast({ title: "Timeline generated & saved" });
    } catch (e: any) { setError(e.message || "Failed"); }
    finally { setGenerating(false); }
  }, [prompt, selectedStyle, autoMode, user, navigate, isPro, toast]);

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
        canvas = document.createElement("canvas"); canvas.width = src.width; canvas.height = src.height + barH;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(src, 0, 0);
        ctx.fillStyle = "#111827"; ctx.fillRect(0, src.height, canvas.width, barH);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 28px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("Generated with AXIVA — axiva.ai", canvas.width / 2, src.height + barH / 2);
      }
      const link = document.createElement("a"); link.download = `axiva-timeline-${Date.now()}.png`; link.href = canvas.toDataURL("image/png"); link.click();
    } catch { toast({ title: "Download failed", variant: "destructive" }); }
    finally { setDownloading(false); }
  }, [isPro, toast]);

  const addToNewDeck = useCallback(async () => {
    if (!user || !timeline) return;
    setAddingToDeck(true);
    try {
      const { data: proj } = await supabase.from("projects").insert({ title: timeline.title, user_id: user.id, theme: "executive" } as any).select("id").single();
      if (!proj) throw new Error("Failed");
      await supabase.from("blocks").insert({ project_id: proj.id, type: "timeline_block", content: { title: timeline.title, events: timeline.events }, order_index: 0 } as any);
      navigate(`/editor/${proj.id}`);
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setAddingToDeck(false); }
  }, [user, timeline, navigate, toast]);

  const narrativeViews = timeline ? suggestNarrativeViews(timeline.events) : [];
  const Renderer = RENDERERS[timeline?.style || "horizontal"] || RENDERERS.horizontal;
  const filteredStyles = STYLES.filter(s => s.group === styleGroup);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
          <CalendarDays className="h-3.5 w-3.5" /> AI Timeline Generator
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Timeline Generator</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          23 professional styles. One dataset, multiple narrative views.
          Describe your events or import a CSV — AI builds the visualization.
        </p>
      </div>

      {/* Auto / Manual toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-border/50 overflow-hidden">
          <button onClick={() => setAutoMode(true)} className={cn("px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors", autoMode ? "bg-accent text-white" : "bg-card/50 text-muted-foreground hover:text-foreground")}>
            <Zap className="h-3 w-3" /> Auto Style
          </button>
          <button onClick={() => setAutoMode(false)} className={cn("px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors", !autoMode ? "bg-accent text-white" : "bg-card/50 text-muted-foreground hover:text-foreground")}>
            <Eye className="h-3 w-3" /> Choose Style
          </button>
        </div>
      </div>

      {/* Style selector (manual mode) */}
      {!autoMode && (
        <div className="space-y-3">
          {/* Group tabs */}
          <div className="flex justify-center gap-2">
            {([["core", "Core"], ["strategy", "Strategy"], ["visualization", "Visual"], ["advanced", "Advanced"], ["viral", "Viral"]] as const).map(([g, label]) => (
              <button key={g} onClick={() => setStyleGroup(g)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all", styleGroup === g ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:text-foreground")}>
                {label}
              </button>
            ))}
          </div>
          {/* Style cards */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-w-4xl mx-auto">
            {filteredStyles.map(s => (
              <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                className={cn("relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                  selectedStyle === s.id ? "border-accent bg-accent/10 text-accent" : "border-border/50 bg-card/50 text-muted-foreground hover:border-accent/30")}>
                {s.pro && <div className="absolute top-1 right-1"><Crown className="h-3 w-3 text-amber-400" /></div>}
                {s.icon}
                <span className="text-[10px] font-medium">{s.label}</span>
                <span className="text-[8px] text-muted-foreground">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input + file */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv,.tsv,.json,.txt,.md" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return; setUploadedFile(f);
            try { const d = await parseFile(f); setPrompt(p => p ? `${p}\n\n${d}` : `Timeline:\n\n${d}`); } catch { setError(`Parse failed.`); }
          }} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" /> Import</Button>
          <span className="text-xs text-muted-foreground">CSV, JSON, TXT</span>
          {uploadedFile && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs">
              <FileSpreadsheet className="h-3 w-3 text-accent" /><span className="text-accent font-medium">{uploadedFile.name}</span>
              <button onClick={() => { setUploadedFile(null); if (fileRef.current) fileRef.current.value = ""; }}><X className="h-3 w-3" /></button>
            </div>
          )}
        </div>
        <Textarea placeholder="Describe timeline events...\n\n• 2018 Founded. 2019 Seed round. 2020 Product launch. 2022 AI feature. 2024 Expansion.\n• Q1 MVP, Q2 Growth, Q3 Enterprise, Q4 International" value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[110px] text-sm" />
        <div className="flex gap-2">
          <Button variant="hero" onClick={() => generate()} disabled={generating || !prompt.trim()} className="gap-2 flex-1">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : autoMode ? "Generate (Auto Style)" : "Generate Timeline"}
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

      {/* ── RENDERED TIMELINE ──────────────────────────────────── */}
      {timeline && !generating && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{timeline.style.replace(/-/g, " ")}</Badge>
                <span className="text-sm font-medium">{timeline.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{timeline.events.length} events</span>
            </div>

            <div id="timeline-render" className="p-8 bg-white dark:bg-gray-950 min-h-[280px]">
              <Renderer data={timeline} />
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-muted/20 border-t border-border/30 space-y-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1" disabled={downloading} onClick={downloadAsImage}>
                  {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  {isPro ? "Download PNG" : "Download with watermark"}
                </Button>
                {!isPro && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-accent" onClick={() => navigate("/pricing")}><Crown className="h-3 w-3" /> Go Pro</Button>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="hero" size="sm" className="h-8 text-xs gap-1.5 flex-1" disabled={addingToDeck} onClick={addToNewDeck}>
                  {addingToDeck ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} New deck
                </Button>
                {existingDecks.length > 0 && (
                  <div className="relative">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowDeckPicker(!showDeckPicker)}>
                      <FolderOpen className="h-3 w-3" /> Existing <ChevronDown className={cn("h-3 w-3", showDeckPicker && "rotate-180")} />
                    </Button>
                    {showDeckPicker && (
                      <div className="absolute bottom-full mb-1 right-0 w-64 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-50">
                        <div className="px-3 py-2 border-b border-border/50"><p className="text-[10px] font-semibold text-muted-foreground uppercase">Insert into deck</p></div>
                        {existingDecks.map(d => (
                          <button key={d.id} className="w-full text-left px-3 py-2.5 text-xs hover:bg-accent/5 border-b border-border/30 last:border-0 flex items-center justify-between"
                            onClick={async () => {
                              if (!timeline) return;
                              const { data: ex } = await supabase.from("blocks").select("order_index").eq("project_id", d.id).order("order_index", { ascending: false }).limit(1);
                              await supabase.from("blocks").insert({ project_id: d.id, type: "timeline_block", content: { title: timeline.title, events: timeline.events }, order_index: ex?.length ? (ex[0] as any).order_index + 1 : 0 } as any);
                              setShowDeckPicker(false); navigate(`/editor/${d.id}`);
                            }}>
                            <span className="truncate font-medium">{d.title || "Untitled"}</span><ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
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

          {/* ── NARRATIVE VIEWS — one dataset, multiple stories ──── */}
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  One Dataset → Multiple Narrative Views
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Same data, different executive stories. Click to switch.</p>
              </div>
              {!isPro && <Badge variant="outline" className="text-[9px] border-amber-400/30 text-amber-400 gap-1"><Crown className="h-2.5 w-2.5" /> Pro</Badge>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {narrativeViews.map(v => {
                const isActive = timeline.style === v.style;
                const styleDef = STYLES.find(s => s.id === v.style);
                const needsPro = styleDef?.pro && !isPro;
                return (
                  <button key={v.id}
                    onClick={() => {
                      if (needsPro) { toast({ title: "Pro feature" }); navigate("/pricing"); return; }
                      setTimeline({ ...timeline, style: v.style });
                    }}
                    className={cn("text-left p-3 rounded-xl border transition-all",
                      isActive ? "border-accent bg-accent/10" : "border-border/40 hover:border-accent/30")}>
                    <p className="text-[10px] font-bold flex items-center gap-1">
                      {v.label}
                      {needsPro && <Crown className="h-2.5 w-2.5 text-amber-400" />}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{v.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick style switcher */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">All 23 styles:</p>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {STYLES.map(s => (
                <Button key={s.id} variant="ghost" size="sm"
                  className={cn("h-7 text-[9px] gap-1 px-2", timeline.style === s.id && "bg-accent/10 text-accent")}
                  onClick={() => {
                    if (s.pro && !isPro) { toast({ title: "Pro feature" }); navigate("/pricing"); return; }
                    setTimeline({ ...timeline, style: s.id });
                  }}>
                  {s.label} {s.pro && <Crown className="h-2 w-2 text-amber-400" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
