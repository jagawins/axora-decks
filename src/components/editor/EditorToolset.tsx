/**
 * EditorToolset – Gamma-style right-side vertical icon toolbar
 * with expandable panels for blocks, images, themes, and charts.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Layers, Image, Palette, BarChart3, X, Search, Loader2,
  Type, List, Table2, Columns2, AlertCircle, ImageIcon,
  TrendingUp, Quote, Clock, Grid3X3, LayoutDashboard,
  Target, Divide, Star, Triangle, Gauge, ToggleLeft, PanelTop,
  Shield, MessageSquare, Calendar, Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { THEMES, ThemeId } from "@/lib/themes";
import type { BlockType } from "@/lib/blocks";
import { BLOCK_LABELS } from "@/lib/blocks";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ToolPanel = "blocks" | "images" | "themes" | "charts" | "executive" | null;

interface EditorToolsetProps {
  onAddBlock: (type: BlockType) => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onInsertImage: (src: string, alt: string) => void;
  deckTitle?: string;
  deckContent?: string;
}

const TOOLS = [
  { id: "blocks" as const, icon: Layers, label: "Blocks" },
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
  deckTitle,
  deckContent,
}: EditorToolsetProps) => {
  const [activePanel, setActivePanel] = useState<ToolPanel>(null);
  const [imageQuery, setImageQuery] = useState("");
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [imageSearching, setImageSearching] = useState(false);
  const { toast } = useToast();

  const togglePanel = (panel: ToolPanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleImageSearch = async () => {
    if (!imageQuery.trim()) return;
    setImageSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("image-search", {
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
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => togglePanel(id)}
            className={cn(
              "flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50",
              activePanel === id && "bg-accent/10 text-accent"
            )}
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span className="text-[9px] mt-0.5 font-medium">{label}</span>
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

                {/* Speaker Notes Generator */}
                <div className="border-t border-border/50 pt-3 mt-3">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Quick Actions</p>
                  {[
                    { type: "smart_layout" as BlockType, label: "Add Recommendation Slide", desc: "Rec + evidence + risk" },
                    { type: "smart_layout" as BlockType, label: "Add Agenda Slide", desc: "Items + owners + time" },
                    { type: "cta_button_block" as BlockType, label: "Add CTA Buttons", desc: "Approve, schedule, book" },
                    { type: "embed_block" as BlockType, label: "Add Live Embed", desc: "Sheets, PowerBI, Figma" },
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EditorToolset;
