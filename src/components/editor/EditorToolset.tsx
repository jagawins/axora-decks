/**
 * EditorToolset – Gamma-style right-side vertical icon toolbar
 * with expandable panels for blocks, images, themes, and charts.
 */
import { invokeSignedIn } from "@/lib/supabase-function-client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers, Image, Palette, BarChart3, X, Search, Loader2,
  Type, List, Table2, Columns2, AlertCircle, ImageIcon,
  TrendingUp, Quote, Clock, Grid3X3, LayoutDashboard,
  Target, Divide, Star, Triangle, Gauge, ToggleLeft, PanelTop,
  Shield, MessageSquare, Calendar, Play, Mic, MicOff, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { THEMES, ThemeId } from "@/lib/themes";
import type { BlockType } from "@/lib/blocks";
import { BLOCK_LABELS } from "@/lib/blocks";
import { useToast } from "@/hooks/use-toast";

type ToolPanel = "blocks" | "images" | "themes" | "charts" | "executive" | "voice" | null;

interface EditorToolsetProps {
  onAddBlock: (type: BlockType) => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onInsertImage: (src: string, alt: string) => void;
  onVoiceAddSlide?: (text: string) => void;
  deckTitle?: string;
  deckContent?: string;
}

const TOOLS = [
  { id: "blocks" as const, icon: Layers, label: "Blocks" },
  { id: "voice" as const, icon: Mic, label: "Voice", accent: true },
  { id: "images" as const, icon: Image, label: "Images" },
  { id: "themes" as const, icon: Palette, label: "Theme" },
  { id: "charts" as const, icon: BarChart3, label: "Charts" },
  { id: "executive" as const, icon: Shield, label: "Exec Prep" },
];

const BLOCK_GROUPS = [
  {
    label: "Basic",
    items: [
      { type: "heading" as BlockType, icon: Type, label: "Heading" },
      { type: "text" as BlockType, icon: Type, label: "Text" },
      { type: "list" as BlockType, icon: List, label: "List" },
      { type: "callout" as BlockType, icon: AlertCircle, label: "Callout" },
      { type: "two_col" as BlockType, icon: Columns2, label: "Two Columns" },
      { type: "table" as BlockType, icon: Table2, label: "Table" },
      { type: "image" as BlockType, icon: ImageIcon, label: "Image" },
    ],
  },
  {
    label: "Visual",
    items: [
      { type: "stat_block" as BlockType, icon: TrendingUp, label: "Stats" },
      { type: "quote_block" as BlockType, icon: Quote, label: "Quote" },
      { type: "timeline_block" as BlockType, icon: Clock, label: "Timeline" },
      { type: "card_grid" as BlockType, icon: Grid3X3, label: "Card Grid" },
      { type: "hero_header" as BlockType, icon: LayoutDashboard, label: "Hero Header" },
      { type: "comparison_table" as BlockType, icon: Table2, label: "Comparison" },
      { type: "three_pillars" as BlockType, icon: Triangle, label: "Three Pillars" },
      { type: "exec_summary" as BlockType, icon: Star, label: "Exec Summary" },
      { type: "cta_section" as BlockType, icon: Target, label: "CTA" },
      { type: "section_divider" as BlockType, icon: Divide, label: "Divider" },
      { type: "framed_insight" as BlockType, icon: Star, label: "Framed Insight" },
      { type: "chart_block" as BlockType, icon: BarChart3, label: "Chart" },
      { type: "tabs_block" as BlockType, icon: PanelTop, label: "Tabs" },
      { type: "toggle_block" as BlockType, icon: ToggleLeft, label: "Toggle" },
    ],
  },
  {
    label: "Decision",
    items: [
      { type: "decision_summary" as BlockType, icon: Target, label: "Decision Summary" },
      { type: "evidence_map" as BlockType, icon: Grid3X3, label: "Evidence Map" },
      { type: "scenario_set" as BlockType, icon: Columns2, label: "Scenarios" },
      { type: "recommendation_panel" as BlockType, icon: Star, label: "Recommendation" },
    ],
  },
];

interface ImageResult {
  src: string;
  alt: string;
  credit?: string;
}

const EditorToolset = ({
  onAddBlock,
  currentTheme,
  onThemeChange,
  onInsertImage,
  onVoiceAddSlide,
  deckTitle,
  deckContent,
}: EditorToolsetProps) => {
  const [activePanel, setActivePanel] = useState<ToolPanel>(null);
  const [imageQuery, setImageQuery] = useState("");
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [imageSearching, setImageSearching] = useState(false);
  const { toast } = useToast();

  // Voice recording state
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceTranscribing, setVoiceTranscribing] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus" : "audio/webm",
      });
      voiceChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) voiceChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(voiceChunksRef.current, { type: "audio/webm" });
        if (blob.size < 500) return;

        setVoiceTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", blob, "editor-voice.webm");
          formData.append("language", "en");
          formData.append("context", "Executive presentation editing. The user is describing changes to their slides or dictating content.");

          const { data, error } = await supabase.functions.invoke("transcribe-audio", {
            body: formData,
          });

          if (error) throw error;
          if (data?.text) {
            setVoiceTranscript(prev => (prev ? prev + " " : "") + data.text);
          }
        } catch (err) {
          console.error("Voice transcription failed:", err);
          toast({ title: "Voice transcription failed", variant: "destructive" });
        } finally {
          setVoiceTranscribing(false);
        }
      };

      recorder.start();
      voiceRecorderRef.current = recorder;
      setVoiceRecording(true);
    } catch {
      toast({ title: "Microphone access denied", description: "Allow microphone access in your browser settings.", variant: "destructive" });
    }
  };

  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current && voiceRecorderRef.current.state !== "inactive") {
      voiceRecorderRef.current.stop();
    }
    voiceRecorderRef.current = null;
    setVoiceRecording(false);
  };

  const handleVoiceAction = (action: "add-slide" | "add-block") => {
    if (!voiceTranscript.trim()) return;
    if (action === "add-slide" && onVoiceAddSlide) {
      onVoiceAddSlide(voiceTranscript.trim());
    } else {
      onAddBlock("text" as BlockType);
    }
    toast({ title: action === "add-slide" ? "Generating slide from voice" : "Text block added" });
    setVoiceTranscript("");
  };

  const togglePanel = (panel: ToolPanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleImageSearch = async () => {
    if (!imageQuery.trim()) return;
    setImageSearching(true);
    try {
      const { data, error } = await invokeSignedIn("image-search", {
        body: { query: imageQuery.trim(), count: 8 },
      });
      if (error) throw error;
      setImageResults(
        (data?.images || []).map((img: any) => ({
          src: img.src || img.url,
          alt: img.alt || imageQuery,
          credit: img.credit || img.photographer,
        }))
      );
    } catch (err) {
      console.error("Image search error:", err);
      toast({ title: "Image search failed", variant: "destructive" });
    } finally {
      setImageSearching(false);
    }
  };

  return (
    <>
      {/* Vertical icon strip */}
      <div className="hidden md:flex flex-col items-center gap-1 py-3 px-1.5 border-l border-border bg-card/30">
        {TOOLS.map(({ id, icon: Icon, label, accent }) => (
          <button
            key={id}
            onClick={() => togglePanel(id)}
            className={cn(
              "relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-colors",
              activePanel === id
                ? accent ? "bg-red-500/10 text-red-500" : "bg-accent/10 text-accent"
                : accent ? "text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              voiceRecording && id === "voice" && "animate-pulse"
            )}
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[9px] mt-0.5 font-medium">{label}</span>
            {accent && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Expandable panel */}
      {activePanel && (
        <div className="hidden md:flex w-72 border-l border-border bg-card/50 backdrop-blur-sm flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <h4 className="font-semibold text-sm capitalize">{activePanel}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActivePanel(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* Blocks panel */}
            {activePanel === "blocks" && (
              <div className="space-y-4">
                {BLOCK_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {group.items.map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          onClick={() => {
                            onAddBlock(type);
                            setActivePanel(null);
                          }}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left"
                        >
                          <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs truncate">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Images panel */}
            {activePanel === "images" && (
              <div className="space-y-3">
                <div className="flex gap-1.5">
                  <Input
                    value={imageQuery}
                    onChange={(e) => setImageQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleImageSearch()}
                    placeholder="Search images…"
                    className="h-8 text-sm bg-muted/30"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={handleImageSearch}
                    disabled={imageSearching}
                  >
                    {imageSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                {imageResults.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {imageResults.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onInsertImage(img.src, img.alt);
                          toast({ title: "Image inserted" });
                        }}
                        className="relative group rounded-md overflow-hidden border border-border hover:border-accent/50 transition-colors"
                      >
                        <img src={img.src} alt={img.alt} className="w-full h-20 object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <span className="text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-medium">Insert</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">Search for images to insert into your slides</p>
                )}
              </div>
            )}

            {/* Themes panel */}
            {activePanel === "themes" && (
              <div className="space-y-2">
                {(Object.keys(THEMES) as ThemeId[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => onThemeChange(t)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left",
                      currentTheme === t
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-muted/50 hover:border-accent/30"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-md border border-border flex-shrink-0 bg-gradient-to-br",
                        THEMES[t].preview
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium">{THEMES[t].label}</p>
                      {currentTheme === t && (
                        <p className="text-[10px] text-accent">Active</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Charts panel */}
            {activePanel === "charts" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Insert chart blocks into your presentation.</p>
                {[
                  { type: "chart_block" as BlockType, label: "Bar / Line Chart", desc: "Visualize data trends" },
                  { type: "stat_block" as BlockType, label: "Statistics Block", desc: "Highlight key metrics" },
                  { type: "comparison_table" as BlockType, label: "Comparison Table", desc: "Compare options side by side" },
                  { type: "two_by_two_matrix" as BlockType, label: "2×2 Matrix", desc: "Strategic positioning grid" },
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => {
                      onAddBlock(type);
                      setActivePanel(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left"
                  >
                    <BarChart3 className="h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Voice Panel */}
            {activePanel === "voice" && (
              <div className="space-y-4">
                {/* Recording section */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                    <Mic className="h-3 w-3" /> Voice Input
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Speak to add content to your deck. OpenAI transcribes with 96% accuracy.
                  </p>

                  {/* Large mic button */}
                  <button
                    onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording}
                    disabled={voiceTranscribing}
                    className={cn(
                      "mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all",
                      voiceRecording
                        ? "bg-red-500 text-white shadow-xl shadow-red-500/30 animate-pulse scale-110"
                        : voiceTranscribing
                        ? "bg-muted text-muted-foreground cursor-wait"
                        : "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:shadow-lg hover:scale-105"
                    )}
                  >
                    {voiceTranscribing ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : voiceRecording ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </button>

                  <p className="text-[10px] text-muted-foreground">
                    {voiceRecording ? "Tap to stop recording" : voiceTranscribing ? "Transcribing your voice..." : "Tap to start speaking"}
                  </p>

                  {voiceRecording && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-red-500">Recording</span>
                    </div>
                  )}
                </div>

                {/* Transcript */}
                {voiceTranscript && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Transcript</p>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 max-h-32 overflow-y-auto">
                      <p className="text-xs leading-relaxed">{voiceTranscript}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        className="flex-1 gap-1 bg-red-500 hover:bg-red-600 text-white text-xs h-8"
                        onClick={() => handleVoiceAction("add-slide")}
                      >
                        <Sparkles className="h-3 w-3" /> Generate Slide
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => setVoiceTranscript("")}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-border/50 pt-3">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Add voice blocks to slides</p>
                  <p className="text-[9px] text-muted-foreground mb-2">Insert blocks that listen during your live presentation.</p>
                  {[
                    { type: "voice_input" as BlockType, label: "Voice Input Block", desc: "Captures audience speech with OpenAI (96% accuracy)" },
                    { type: "adaptive_block" as BlockType, label: "Voice-Adaptive Block", desc: "Slide regenerates based on what was spoken" },
                  ].map(({ type, label, desc }) => (
                    <button
                      key={label}
                      onClick={() => {
                        onAddBlock(type);
                        setActivePanel(null);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-[9px] text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* How it works */}
                <div className="border-t border-border/50 pt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">How Voice Slides work</p>
                  <div className="space-y-2">
                    {[
                      { step: "1", text: "Add a Voice Input block to a slide" },
                      { step: "2", text: "During your presentation, click 'Start Listening'" },
                      { step: "3", text: "The audience speaks; AI captures with 96% accuracy" },
                      { step: "4", text: "Click 'Extract values' to fill variables" },
                      { step: "5", text: "Downstream adaptive slides regenerate automatically" },
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-start gap-2">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500/10 text-red-500 text-[9px] font-bold shrink-0 mt-0.5">{step}</span>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Executive Prep Panel */}
            {activePanel === "executive" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Prepare for your presentation — Q&A, message maps, rehearsal, and speaking notes.</p>
                {[
                  { icon: MessageSquare, label: "Generate Q&A Bank", desc: "AI predicts likely questions from this deck", href: `/executive?tab=qa-bank&context=${encodeURIComponent(deckTitle || '')}` },
                  { icon: Target, label: "Build Message Map", desc: "3 key messages × 3 supporting facts", href: "/executive?tab=message-map" },
                  { icon: Shield, label: "Crisis Templates", desc: "Pre-built for layoffs, incidents, outages", href: "/executive?tab=crisis" },
                  { icon: Calendar, label: "Rehearsal Plan", desc: "14-day prep checklist with readiness score", href: "/executive?tab=rehearsal" },
                  { icon: Play, label: "Timed Q&A Drill", desc: "30-second practice rounds", href: "/executive?tab=drill" },
                ].map(({ icon: Icon, label, desc, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-border hover:bg-muted/50 hover:border-accent/30 transition-all text-left"
                  >
                    <Icon className="h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </a>
                ))}

                {/* Quick Add Blocks */}
                <div className="border-t border-border/50 pt-3 mt-3">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Quick add blocks</p>
                  {[
                    { type: "smart_layout" as BlockType, label: "Recommendation Slide", desc: "Rec + evidence + risk" },
                    { type: "smart_layout" as BlockType, label: "Agenda Slide", desc: "Items + owners + time" },
                    { type: "cta_button_block" as BlockType, label: "CTA Buttons", desc: "Approve, schedule, book" },
                    { type: "embed_block" as BlockType, label: "Live Embed", desc: "Sheets, PowerBI, Figma" },
                  ].map(({ type, label, desc }) => (
                    <button
                      key={label}
                      onClick={() => {
                        onAddBlock(type);
                        setActivePanel(null);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-[9px] text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Audience Interaction */}
                <div className="border-t border-border/50 pt-3 mt-3">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Audience interaction</p>
                  <p className="text-[9px] text-muted-foreground mb-2">Add live polls, Q&A, and feedback — viewers interact when deck is shared.</p>
                  {[
                    { type: "audience_poll" as BlockType, label: "Live Poll", desc: "Multiple choice, rating, or yes/no" },
                    { type: "audience_qa" as BlockType, label: "Audience Q&A", desc: "Submit and upvote questions" },
                    { type: "audience_wordcloud" as BlockType, label: "Word Cloud", desc: "One-word submissions, live cloud" },
                    { type: "audience_survey" as BlockType, label: "Feedback Survey", desc: "Post-presentation survey" },
                  ].map(({ type, label, desc }) => (
                    <button
                      key={label}
                      onClick={() => {
                        onAddBlock(type);
                        setActivePanel(null);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-[9px] text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-border/30 pt-2 mt-2">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Voice Slides <span className="text-[8px] ml-1 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">NEW</span></p>
                    <p className="text-[9px] text-muted-foreground mb-2">OpenAI-powered. Your deck listens and adapts.</p>
                    {[
                      { type: "voice_input" as BlockType, label: "Voice Input", desc: "OpenAI transcription captures audience speech (96% accuracy)", color: "bg-red-500" },
                      { type: "adaptive_block" as BlockType, label: "Voice-Adaptive Block", desc: "Slide regenerates based on what was spoken", color: "bg-red-500" },
                    ].map(({ type, label, desc, color }) => (
                      <button
                        key={label}
                        onClick={() => {
                          onAddBlock(type);
                          setActivePanel(null);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
                        <div>
                          <p className="text-xs font-medium">{label}</p>
                          <p className="text-[9px] text-muted-foreground">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border/30 pt-2 mt-2">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Smart Slides</p>
                    <p className="text-[9px] text-muted-foreground mb-2">Type-based input that adapts downstream slides.</p>
                    {[
                      { type: "live_input" as BlockType, label: "Live Input", desc: "Capture requirements by typing (text, number, select)" },
                      { type: "adaptive_block" as BlockType, label: "Adaptive Block", desc: "Downstream slide that regenerates from inputs" },
                    ].map(({ type, label, desc }) => (
                      <button
                        key={`smart-${label}`}
                        onClick={() => {
                          onAddBlock(type);
                          setActivePanel(null);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <p className="text-xs font-medium">{label}</p>
                          <p className="text-[9px] text-muted-foreground">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Adaptive */}
                <div className="border-t border-border/50 pt-3 mt-3">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Live adaptive slides</p>
                  <p className="text-[9px] text-muted-foreground mb-2">Slides that adapt in real-time based on audience input during the meeting.</p>
                  {[
                    { type: "live_input" as BlockType, label: "Live Input", desc: "Capture audience data mid-presentation" },
                    { type: "adaptive_block" as BlockType, label: "Adaptive Slide", desc: "Content regenerates when inputs change" },
                  ].map(({ type, label, desc }) => (
                    <button
                      key={label}
                      onClick={() => {
                        onAddBlock(type);
                        setActivePanel(null);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-all text-left"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-[9px] text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EditorToolset;
