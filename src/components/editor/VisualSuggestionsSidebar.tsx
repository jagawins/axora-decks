/**
 * Visual Suggestions Sidebar
 * Napkin-style on-demand panel for swapping palette and chart style
 * on the currently selected visual block.
 */

import { Sparkles, X, BarChart3, LineChart, PieChart, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CHART_PALETTES, getPalette } from "@/lib/chart-palettes";
import type { Block } from "@/lib/blocks";
import { cn } from "@/lib/utils";

interface VisualSuggestionsSidebarProps {
  open: boolean;
  onClose: () => void;
  selectedBlock: Block | null;
  onUpdateContent: (blockId: string, content: Record<string, unknown>) => void;
}

const CHART_STYLES: Array<{
  id: "bar" | "line" | "area" | "donut" | "stacked_bar";
  label: string;
  Icon: typeof BarChart3;
}> = [
  { id: "bar", label: "Bar", Icon: BarChart3 },
  { id: "line", label: "Line", Icon: LineChart },
  { id: "area", label: "Area", Icon: LineChart },
  { id: "donut", label: "Donut", Icon: PieChart },
  { id: "stacked_bar", label: "Stacked", Icon: Layers },
];

const SUPPORTED_TYPES = new Set(["chart_block", "kpi_dashboard"]);

export function VisualSuggestionsSidebar({
  open,
  onClose,
  selectedBlock,
  onUpdateContent,
}: VisualSuggestionsSidebarProps) {
  if (!open) return null;

  const isSupported = selectedBlock && SUPPORTED_TYPES.has(selectedBlock.type);
  const content = (selectedBlock?.content ?? {}) as Record<string, unknown>;
  const currentPaletteId = (content.paletteId as string) ?? "auto";
  const currentChartType = (content.chartType as string) ?? "bar";
  const isChart = selectedBlock?.type === "chart_block";

  const setPalette = (paletteId: string) => {
    if (!selectedBlock) return;
    const next = { ...content };
    if (paletteId === "auto") {
      delete next.paletteId;
    } else {
      next.paletteId = paletteId;
    }
    // Clear hard-coded colors so palette takes effect
    if ("colors" in next) delete next.colors;
    onUpdateContent(selectedBlock.id, next);
  };

  const setChartType = (chartType: string) => {
    if (!selectedBlock) return;
    onUpdateContent(selectedBlock.id, { ...content, chartType });
  };

  return (
    <aside
      className="fixed right-0 top-0 bottom-0 z-40 w-80 border-l border-border bg-background shadow-xl flex flex-col"
      aria-label="Visual suggestions"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold">Visual Suggestions</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close visual suggestions"
          className="h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {!isSupported ? (
            <div className="text-center py-8 px-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">
                {selectedBlock ? "No suggestions for this block" : "No block selected"}
              </p>
              <p className="text-xs text-muted-foreground">
                Select a chart or KPI block to swap palette and style.
              </p>
            </div>
          ) : (
            <>
              {/* Current block label */}
              <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Editing
                </p>
                <p className="text-sm font-medium">
                  {selectedBlock?.type === "chart_block" ? "Chart" : "KPI Dashboard"}
                  {(content.title as string) ? ` — ${content.title}` : ""}
                </p>
              </div>

              {/* Chart style picker (chart_block only) */}
              {isChart && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Chart Style
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {CHART_STYLES.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setChartType(id)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg border p-3 transition-all",
                          currentChartType === id
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/50 hover:bg-muted/40"
                        )}
                        aria-pressed={currentChartType === id}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-[11px] font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Palette picker */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Color Palette
                </h3>
                <div className="space-y-2">
                  {/* Auto option */}
                  <button
                    type="button"
                    onClick={() => setPalette("auto")}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border p-2.5 transition-all text-left",
                      currentPaletteId === "auto"
                        ? "border-accent bg-accent/10 ring-1 ring-accent"
                        : "border-border hover:border-accent/50 hover:bg-muted/40"
                    )}
                    aria-pressed={currentPaletteId === "auto"}
                  >
                    <div className="flex -space-x-1 shrink-0">
                      {["#f97316", "#0ea5e9", "#a855f7", "#10b981"].map((c) => (
                        <span
                          key={c}
                          className="h-5 w-5 rounded-full border-2 border-background"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Auto</p>
                      <p className="text-[11px] text-muted-foreground">
                        Pick a vibrant palette automatically
                      </p>
                    </div>
                  </button>

                  {CHART_PALETTES.map((p) => {
                    const palette = getPalette(p.id);
                    const active = currentPaletteId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPalette(p.id)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg border p-2.5 transition-all text-left",
                          active
                            ? "border-accent bg-accent/10 ring-1 ring-accent"
                            : "border-border hover:border-accent/50 hover:bg-muted/40"
                        )}
                        aria-pressed={active}
                      >
                        <div className="flex gap-0.5 shrink-0 rounded-md overflow-hidden">
                          {palette.colors.slice(0, 5).map((c, i) => (
                            <span
                              key={i}
                              className="h-5 w-3"
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.mood}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
