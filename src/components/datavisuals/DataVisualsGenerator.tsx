import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Loader2, Download, Share2, BarChart3, PieChart,
  TrendingUp, GitBranch, Layers, Grid3x3, Table2, Target,
  ArrowRight, RefreshCw, Copy, Check, Upload, FileSpreadsheet,
  X, Plus, FolderOpen, Image, Crown, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { VisualBlockRenderer } from "@/components/blocks/VisualBlockRenderer";
import { invokeFunction } from "@/lib/supabase-function-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { BlockType } from "@/lib/blocks";

/* ── Visual Types ───────────────────────────────────────────────── */

const VISUAL_TYPES = [
  { id: "bar-chart", label: "Bar Chart", icon: <BarChart3 className="h-5 w-5" />, desc: "Compare values", blockType: "chart_block" as BlockType },
  { id: "donut-chart", label: "Donut Chart", icon: <PieChart className="h-5 w-5" />, desc: "Proportions", blockType: "chart_block" as BlockType },
  { id: "kpi-dashboard", label: "KPI Dashboard", icon: <Grid3x3 className="h-5 w-5" />, desc: "Metrics + trends", blockType: "kpi_dashboard" as BlockType },
  { id: "comparison-table", label: "Comparison", icon: <Table2 className="h-5 w-5" />, desc: "Side-by-side", blockType: "comparison_table" as BlockType },
  { id: "framework-matrix", label: "2x2 Matrix", icon: <Target className="h-5 w-5" />, desc: "Quadrants", blockType: "two_by_two_matrix" as BlockType },
  { id: "stat-block", label: "Stat Cards", icon: <TrendingUp className="h-5 w-5" />, desc: "Big numbers", blockType: "stat_block" as BlockType },
  { id: "three-pillars", label: "Three Pillars", icon: <Layers className="h-5 w-5" />, desc: "Framework", blockType: "three_pillars" as BlockType },
  { id: "flow-diagram", label: "Flow Diagram", icon: <GitBranch className="h-5 w-5" />, desc: "Process", blockType: "flow_diagram" as BlockType },
];

const CHART_SUBTYPE: Record<string, string> = { "bar-chart": "bar", "donut-chart": "donut" };

/* ── Quick prompts ──────────────────────────────────────────────── */

const QUICK_PROMPTS = [
  { label: "AI Adoption Survey", type: "bar-chart", prompt: "Bar chart: AI adoption by industry in 2025. Healthcare 45%, Finance 62%, Retail 38%, Manufacturing 55%, Technology 78%, Education 32%." },
  { label: "AI Governance Matrix", type: "framework-matrix", prompt: "2x2 matrix: AI Governance. X-axis: Risk Level (Low to High). Y-axis: Org Maturity (Low to High). Top-left 'Accelerate': scale existing programs, invest in advanced use cases. Top-right 'Transform': implement governance controls, board oversight. Bottom-left 'Monitor': basic oversight, low urgency. Bottom-right 'Remediate': urgent governance gaps, compliance risks." },
  { label: "Gen AI ROI Metrics", type: "kpi-dashboard", prompt: "KPI dashboard: Gen AI Impact 2025. Card 1: 40% title 'Productivity Gain' trend up change '+12% QoQ'. Card 2: $2.3M title 'Annual Savings' trend up change '+$800K'. Card 3: 3.2x title 'ROI on AI Spend' trend up change '+0.8x'. Card 4: 68% title 'Employee Adoption' trend up change '+15%'." },
  { label: "Country AI Comparison", type: "comparison-table", prompt: "Comparison table: Sovereign AI Capability by Country. Headers: US, China, UK, India, EU. Row 'VC Investment': High, High, Medium, Growing, Medium. Row 'Talent Pool': High, High, Medium, Growing, Medium. Row 'Compute Infrastructure': High, High, Medium, Low, Medium. Row 'Regulation': Medium, High, Medium, Low, High. Row 'Research Output': High, High, Medium, Growing, Medium." },
  { label: "AI Startup Growth", type: "stat-block", prompt: "Stat block: Fastest AI startups to $100M ARR. ElevenLabs: 23 months. Cursor (Anysphere): 21 months. Lovable: 7 months. Gamma: 30 months." },
  { label: "AI Risk Framework", type: "three-pillars", prompt: "Three pillars: Enterprise AI Risk Management. Pillar 1 'Technical Risks': Model bias and fairness issues, Hallucination and accuracy failures, Data poisoning and adversarial attacks, Security vulnerabilities in AI systems. Pillar 2 'Operational Risks': Vendor lock-in with AI providers, Unexpected cost overruns from compute, System reliability and uptime concerns, Integration failures with legacy systems. Pillar 3 'Regulatory Risks': EU AI Act compliance obligations, GDPR and data privacy requirements, Sector-specific AI regulations, Cross-border data transfer restrictions." },
];

/* ── File parsing ───────────────────────────────────────────────── */

async function parseFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "tsv") {
    const text = await file.text();
    const delim = ext === "tsv" ? "\t" : ",";
    const lines = text.trim().split("\n");
    const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1, 21).map(l => l.split(delim).map(c => c.trim().replace(/^"|"$/g, "")));
    let out = `Data from ${file.name} (${rows.length} rows):\nColumns: ${headers.join(", ")}\n\n`;
    rows.slice(0, 10).forEach(row => { out += headers.map((h, i) => `${h}: ${row[i] || ""}`).join(", ") + "\n"; });
    return out;
  }
  if (ext === "json") { const t = await file.text(); return `JSON data:\n${JSON.stringify(JSON.parse(t), null, 2).slice(0, 3000)}`; }
  if (ext === "txt" || ext === "md") { return await file.text().then(t => t.slice(0, 3000)); }
  if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
    return `[Image: ${file.name}] Extract all data, numbers, labels, and categories from this image and create a data visualization.`;
  }
  if (ext === "pptx" || ext === "ppt") {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);
      const texts: string[] = [];
      const slides = Object.keys(zip.files).filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/)).sort();
      for (const s of slides) {
        const xml = await zip.files[s].async("text");
        const t = xml.match(/<a:t>([^<]*)<\/a:t>/g)?.map(x => x.replace(/<\/?a:t>/g, "")) || [];
        if (t.length) texts.push(`Slide ${s.match(/slide(\d+)/)?.[1]}: ${t.join(" | ")}`);
      }
      return texts.length ? `Data from ${file.name}:\n${texts.join("\n")}` : `PPTX: ${file.name}. Describe the data.`;
    } catch { return `PPTX: ${file.name}. Describe the data.`; }
  }
  if (ext === "pdf") {
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      const readable = text.match(/[\x20-\x7E]{10,}/g)?.join(" ").slice(0, 3000) || "";
      return readable.length > 50 ? `Data from PDF ${file.name}:\n${readable}` : `PDF: ${file.name}. Describe the data.`;
    } catch { return `PDF: ${file.name}. Describe the data.`; }
  }
  return `File: ${file.name}. Describe which data to visualize.`;
}

/* ── AI call — generates visual block JSON directly ─────────────── */

async function callAI(prompt: string, typeId: string | null): Promise<{ type: BlockType; content: Record<string, unknown> }[]> {
  const vt = VISUAL_TYPES.find(v => v.id === typeId);
  const chartSub = typeId ? CHART_SUBTYPE[typeId] || "" : "";

  const { data, error } = await invokeFunction<{ blocks: { type: string; content: Record<string, unknown> }[] }>(
    "generate-data-visual",
    {
      prompt,
      blockType: vt?.blockType || null,
      chartSubtype: chartSub || null,
    }
  );

  if (error) throw new Error(error);
  if (!data?.blocks?.length) throw new Error("No visual blocks generated. Try being more specific.");

  const ok = new Set(["chart_block","stat_block","kpi_dashboard","comparison_table","two_by_two_matrix","three_pillars","timeline_block","flow_diagram"]);
  return data.blocks.filter(b => ok.has(b.type)).map(b => ({ type: b.type as BlockType, content: b.content }));
}

/* ── Component ──────────────────────────────────────────────────── */

export default function DataVisualsGenerator() {
  const { user } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isPro = subLoading ? true : subscription.tier !== "free";

  const [prompt, setPrompt] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [visuals, setVisuals] = useState<{ type: BlockType; content: Record<string, unknown> }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [addingToDeck, setAddingToDeck] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  // Existing decks for "insert into existing deck"
  const [existingDecks, setExistingDecks] = useState<{ id: string; title: string }[]>([]);
  const [showDeckPicker, setShowDeckPicker] = useState<number | null>(null);
  const [insertingIntoDeck, setInsertingIntoDeck] = useState<string | null>(null);

  // Load existing decks when user logs in
  useEffect(() => {
    if (!user) return;
    supabase
      .from("projects")
      .select("id, title")
      .order("updated_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setExistingDecks(data as { id: string; title: string }[]);
      });
  }, [user]);

  // ── Download as image with watermark ──────────────────────────
  const downloadAsImage = useCallback(async (index: number) => {
    setDownloading(index);
    try {
      const cardEl = document.getElementById(`visual-card-${index}`);
      if (!cardEl) throw new Error("Visual card not found");

      const { default: html2canvas } = await import("html2canvas");
      const sourceCanvas = await html2canvas(cardEl, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      let finalCanvas: HTMLCanvasElement;

      if (!isPro) {
        // Create a taller canvas with watermark bar appended below
        const barH = 80; // at 2x scale
        finalCanvas = document.createElement("canvas");
        finalCanvas.width = sourceCanvas.width;
        finalCanvas.height = sourceCanvas.height + barH;

        const ctx = finalCanvas.getContext("2d")!;
        // Draw the visual
        ctx.drawImage(sourceCanvas, 0, 0);
        // Draw watermark bar
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, sourceCanvas.height, finalCanvas.width, barH);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Generated with AXIVA — axiva.ai", finalCanvas.width / 2, sourceCanvas.height + barH / 2);
      } else {
        finalCanvas = sourceCanvas;
      }

      const link = document.createElement("a");
      link.download = `axiva-visual-${Date.now()}.png`;
      link.href = finalCanvas.toDataURL("image/png");
      link.click();

      if (!isPro) {
        toast({
          title: "Visual downloaded with watermark",
          description: "Upgrade to Pro for watermark-free exports.",
          action: (
            <Button size="sm" variant="hero" className="gap-1" onClick={() => navigate("/pricing")}>
              <Crown className="h-3 w-3" /> Go Pro
            </Button>
          ),
        });
      } else {
        toast({ title: "Visual downloaded" });
      }
    } catch (e) {
      console.error("Download error:", e);
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  }, [isPro, navigate, toast]);

  // ── Add to NEW deck ───────────────────────────────────────────
  const addToNewDeck = useCallback(async (visual: { type: BlockType; content: Record<string, unknown> }, index: number) => {
    if (!user) { navigate("/auth"); return; }
    setAddingToDeck(index);
    try {
      const title = String((visual.content as any).title || "Data Visual");
      const { data: newProject, error: projErr } = await supabase
        .from("projects")
        .insert({ title, user_id: user.id, theme: "executive" })
        .select("id")
        .single();
      if (projErr || !newProject) throw projErr || new Error("Failed to create project");

      const { error: blockErr } = await supabase.from("blocks").insert({
        project_id: newProject.id,
        type: visual.type,
        content: visual.content as any,
        order_index: 0,
      } as any);
      if (blockErr) throw blockErr;

      toast({ title: "Deck created", description: "Opening editor…" });
      navigate(`/editor/${newProject.id}`);
    } catch (e: any) {
      console.error("Add to deck error:", e);
      toast({ title: "Failed to create deck", variant: "destructive" });
    } finally {
      setAddingToDeck(null);
    }
  }, [user, navigate, toast]);

  // ── Insert into EXISTING deck ─────────────────────────────────
  const insertIntoDeck = useCallback(async (visual: { type: BlockType; content: Record<string, unknown> }, deckId: string) => {
    if (!user) { navigate("/auth"); return; }
    setInsertingIntoDeck(deckId);
    try {
      // Get the current max order_index
      const { data: existing } = await supabase
        .from("blocks")
        .select("order_index")
        .eq("project_id", deckId)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextIndex = existing && existing.length > 0 ? (existing[0] as any).order_index + 1 : 0;

      const { error: blockErr } = await supabase.from("blocks").insert({
        project_id: deckId,
        type: visual.type,
        content: visual.content as any,
        order_index: nextIndex,
      } as any);
      if (blockErr) throw blockErr;

      // Update project updated_at
      await supabase.from("projects").update({ updated_at: new Date().toISOString() }).eq("id", deckId);

      toast({ title: "Visual added to deck", description: "Opening editor…" });
      setShowDeckPicker(null);
      navigate(`/editor/${deckId}`);
    } catch (e: any) {
      console.error("Insert into deck error:", e);
      toast({ title: "Failed to add to deck", variant: "destructive" });
    } finally {
      setInsertingIntoDeck(null);
    }
  }, [user, navigate, toast]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploadedFile(f);
    try { const d = await parseFile(f); setPrompt(p => p ? `${p}\n\n${d}` : `Visualize this data:\n\n${d}`); }
    catch { setError(`Failed to parse ${f.name}.`); }
  }, []);

  const generate = useCallback(async (op?: string) => {
    const p = op || prompt; if (!p.trim()) return;
    if (!user) { navigate("/auth"); return; }
    setGenerating(true); setError(null); setVisuals([]);
    try {
      const r = await callAI(p, selectedType);
      if (!r.length) throw new Error("No visuals generated. Be more specific about the data.");
      setVisuals(r);

      // Auto-save each visual to library as a project
      for (const visual of r) {
        try {
          const title = String((visual.content as any).title || "Data Visual");
          const { data: proj } = await supabase
            .from("projects")
            .insert({
              title: `[Visual] ${title}`,
              user_id: user.id,
              theme: "executive",
              description: "Generated from Data & Visuals",
            } as any)
            .select("id")
            .single();

          if (proj) {
            await supabase.from("blocks").insert({
              project_id: proj.id,
              type: visual.type,
              content: visual.content as any,
              order_index: 0,
            } as any);
          }
        } catch (saveErr) {
          console.warn("Auto-save to library failed:", saveErr);
        }
      }

      // Refresh existing decks list
      const { data: refreshed } = await supabase
        .from("projects")
        .select("id, title")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (refreshed) setExistingDecks(refreshed as { id: string; title: string }[]);

      toast({ title: "Visual generated & saved", description: "Find it in your library dashboard." });
    } catch (e: any) { setError(e.message || "Failed"); }
    finally { setGenerating(false); }
  }, [prompt, selectedType, user, navigate, toast]);

  const quickGen = (qp: typeof QUICK_PROMPTS[0]) => {
    setPrompt(qp.prompt); setSelectedType(qp.type);
    setTimeout(() => generate(qp.prompt), 50);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4">
          <BarChart3 className="h-3.5 w-3.5" /> AI Data Visualizations
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Data & Visuals Generator</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate HBR-quality charts, frameworks, and dashboards. Import a CSV or describe your data.
        </p>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl mx-auto">
        {VISUAL_TYPES.map(vt => (
          <button key={vt.id} onClick={() => setSelectedType(selectedType === vt.id ? null : vt.id)}
            className={cn("flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
              selectedType === vt.id ? "border-accent bg-accent/10 text-accent" : "border-border/50 bg-card/50 text-muted-foreground hover:border-accent/30")}>
            {vt.icon}
            <span className="text-xs font-medium">{vt.label}</span>
            <span className="text-[9px] text-muted-foreground">{vt.desc}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv,.tsv,.json,.txt,.md,.xlsx,.jpg,.jpeg,.png,.pptx,.pdf" onChange={handleFile} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Import Data
          </Button>
          <span className="text-xs text-muted-foreground">CSV, JSON, TXT, Excel</span>
          {uploadedFile && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs">
              <FileSpreadsheet className="h-3 w-3 text-accent" />
              <span className="text-accent font-medium">{uploadedFile.name}</span>
              <button onClick={() => { setUploadedFile(null); if (fileRef.current) fileRef.current.value = ""; }}><X className="h-3 w-3" /></button>
            </div>
          )}
        </div>

        <Textarea placeholder={"Describe the data to visualize...\n\n• Bar chart: AI adoption — Healthcare 45%, Finance 62%\n• KPI dashboard: Revenue $14M, Growth +28%, NRR 118%\n• 2x2 matrix: Risk vs Maturity framework"} value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[130px] text-sm" />

        <div className="flex gap-2">
          <Button variant="hero" onClick={() => generate()} disabled={generating || !prompt.trim()} className="gap-2 flex-1">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate Visual"}
          </Button>
          {visuals.length > 0 && <Button variant="outline" onClick={() => generate()} disabled={generating}><RefreshCw className="h-4 w-4" /></Button>}
        </div>
      </div>

      {/* Quick prompts */}
      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground text-center mb-3">Try an example:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_PROMPTS.map((qp, i) => (
            <button key={i} onClick={() => quickGen(qp)} disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 bg-card/50 text-muted-foreground hover:border-accent/30 hover:text-accent transition-all disabled:opacity-50">
              <Sparkles className="h-3 w-3" /> {qp.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="max-w-2xl mx-auto p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

      {generating && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center"><Sparkles className="h-7 w-7 text-accent animate-pulse" /></div>
          <p className="text-sm font-medium">Building your visualization...</p>
          <p className="text-xs text-muted-foreground">AI is structuring data into executive-grade visuals</p>
        </div>
      )}

      {/* ── Generated Visuals ────────────────────────────────────── */}
      {visuals.length > 0 && !generating && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-center">{visuals.length === 1 ? "Generated Visual" : `${visuals.length} Visuals Generated`}</h3>
          <div className={cn("grid gap-6 max-w-5xl mx-auto", visuals.length === 1 ? "grid-cols-1 max-w-3xl" : "grid-cols-1 md:grid-cols-2")}>
            {visuals.map((v, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg">
                {/* Title bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{v.type.replace(/_/g, " ")}</Badge>
                    <span className="text-sm font-medium truncate">{String((v.content as any).title || "Visual")}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { navigator.clipboard.writeText(JSON.stringify(v.content, null, 2)); setCopied(i); setTimeout(() => setCopied(null), 2000); }}
                      title="Copy data">
                      {copied === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Visual content — this gets captured for image download */}
                <div id={`visual-card-${i}`} className="p-6 bg-white dark:bg-gray-950 min-h-[240px]">
                  <VisualBlockRenderer block={{ type: v.type, content: v.content } as any} readOnly />
                </div>

                {/* Actions bar */}
                <div className="px-4 py-3 bg-muted/20 border-t border-border/30 space-y-2">
                  {/* Row 1: Download + Copy */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 flex-1"
                      disabled={downloading === i}
                      onClick={() => downloadAsImage(i)}
                    >
                      {downloading === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      {downloading === i ? "Exporting…" : isPro ? "Download PNG" : "Download with watermark"}
                    </Button>
                    {!isPro && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1 text-accent"
                        onClick={() => navigate("/pricing")}
                      >
                        <Crown className="h-3 w-3" /> Remove watermark
                      </Button>
                    )}
                  </div>

                  {/* Row 2: Add to deck actions */}
                  <div className="flex items-center gap-2 relative">
                    <Button
                      variant="hero"
                      size="sm"
                      className="h-8 text-xs gap-1.5 flex-1"
                      disabled={addingToDeck === i}
                      onClick={() => addToNewDeck(v, i)}
                    >
                      {addingToDeck === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      {addingToDeck === i ? "Creating…" : "New deck from this"}
                    </Button>

                    {existingDecks.length > 0 && (
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => setShowDeckPicker(showDeckPicker === i ? null : i)}
                        >
                          <FolderOpen className="h-3 w-3" />
                          Add to existing
                          <ChevronDown className={cn("h-3 w-3 transition-transform", showDeckPicker === i && "rotate-180")} />
                        </Button>

                        {/* Deck picker dropdown */}
                        {showDeckPicker === i && (
                          <div className="absolute bottom-full mb-1 right-0 w-64 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-50">
                            <div className="px-3 py-2 border-b border-border/50">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Insert into deck</p>
                            </div>
                            {existingDecks.map((deck) => (
                              <button
                                key={deck.id}
                                className="w-full text-left px-3 py-2.5 text-xs hover:bg-accent/5 border-b border-border/30 last:border-0 flex items-center justify-between gap-2 transition-colors"
                                disabled={insertingIntoDeck === deck.id}
                                onClick={() => insertIntoDeck(v, deck.id)}
                              >
                                <span className="truncate font-medium">{deck.title || "Untitled deck"}</span>
                                {insertingIntoDeck === deck.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin shrink-0 text-accent" />
                                ) : (
                                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Watermark */}
                  <p className="text-[9px] text-muted-foreground text-center pt-1">
                    Generated with <a href="https://axiva.ai/?ref=datavisual" className="text-accent hover:underline font-medium">AXIVA</a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
