/**
 * EditorMoreMenu – Gamma-style consolidated dropdown for deck actions
 */
import {
  Undo2, Star, Clock, Eye, Globe, Palette, Settings2, FileDown,
  MessageSquare, BarChart3, Copy, Trash2, BookTemplate, Share2,
  Printer, FileSpreadsheet, Loader2, Presentation, Layers, Zap,
  LayoutTemplate, Check, Sparkles, Upload, History, Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { ThemeId } from "@/lib/themes";
import type { LayoutPresetId } from "@/lib/themes";
import { THEMES, LAYOUT_PRESETS } from "@/lib/themes";

interface EditorMoreMenuProps {
  projectTitle?: string;
  createdAt?: string;
  // Actions
  onUndo?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onBrandKit: () => void;
  onThemeChange: (theme: ThemeId) => void;
  currentTheme: ThemeId;
  onLayoutChange: (layout: LayoutPresetId) => void;
  currentLayout: LayoutPresetId;
  onExportPDF: () => void;
  onExportPPTX?: () => void;
  pptxLoading?: boolean;
  onShare: () => void;
  onPresenterView: () => void;
  onAnalytics?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onImportContent?: () => void;
  onGenerateDeck: () => void;
  onQuickPolish: () => void;
  polishing?: boolean;
  onMakeItVisual: () => void;
  blocksCount: number;
  onVersionHistory?: () => void;
  onSlideLocks?: () => void;
  lockedSlidesCount?: number;
}

export function EditorMoreMenu({
  projectTitle,
  onUndo,
  onToggleFavorite,
  isFavorite,
  onBrandKit,
  onThemeChange,
  currentTheme,
  onLayoutChange,
  currentLayout,
  onExportPDF,
  onExportPPTX,
  pptxLoading,
  onShare,
  onPresenterView,
  onAnalytics,
  onDuplicate,
  onDelete,
  onImportContent,
  onGenerateDeck,
  onQuickPolish,
  polishing,
  onMakeItVisual,
  blocksCount,
  onVersionHistory,
  onSlideLocks,
  lockedSlidesCount,
}: EditorMoreMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <span className="sr-only">Menu</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-foreground">
            <circle cx="8" cy="3" r="1.5" fill="currentColor" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="8" cy="13" r="1.5" fill="currentColor" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        {/* Project info */}
        {projectTitle && (
          <>
            <div className="px-3 py-2">
              <p className="text-sm font-medium truncate">{projectTitle}</p>
              <p className="text-[11px] text-muted-foreground">by you</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Undo */}
        {onUndo && (
          <DropdownMenuItem onClick={onUndo}>
            <Undo2 className="h-4 w-4 mr-2.5" />
            Undo
            <span className="ml-auto text-[11px] text-muted-foreground">⌘Z</span>
          </DropdownMenuItem>
        )}

        {/* Favorites */}
        {onToggleFavorite && (
          <DropdownMenuItem onClick={onToggleFavorite}>
            <Star className={`h-4 w-4 mr-2.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
            {isFavorite ? "Remove from favorites" : "Add to favorites"}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* AI Actions */}
        <DropdownMenuItem onClick={onGenerateDeck}>
          <Sparkles className="h-4 w-4 mr-2.5 text-accent" />
          Generate with AI…
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onQuickPolish} disabled={polishing || blocksCount === 0}>
          <Zap className="h-4 w-4 mr-2.5" />
          {polishing ? "Polishing…" : "Quick Polish"}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onMakeItVisual} disabled={blocksCount === 0}>
          <Layers className="h-4 w-4 mr-2.5" />
          Make it Visual
        </DropdownMenuItem>

        {onSlideLocks && (
          <DropdownMenuItem onClick={onSlideLocks} disabled={blocksCount === 0}>
            <Shield className="h-4 w-4 mr-2.5" />
            Locked slides
            {lockedSlidesCount ? (
              <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                {lockedSlidesCount}
              </span>
            ) : null}
          </DropdownMenuItem>
        )}

        {onVersionHistory && (
          <DropdownMenuItem onClick={onVersionHistory}>
            <History className="h-4 w-4 mr-2.5" />
            Version history
          </DropdownMenuItem>
        )}

        {onImportContent && (
          <DropdownMenuItem onClick={onImportContent}>
            <Upload className="h-4 w-4 mr-2.5" />
            Import content…
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Appearance */}
        <DropdownMenuItem onClick={onBrandKit}>
          <Globe className="h-4 w-4 mr-2.5" />
          Logo, colors, fonts…
        </DropdownMenuItem>

        {/* Theme sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="h-4 w-4 mr-2.5" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.keys(THEMES) as ThemeId[]).map((t) => (
              <DropdownMenuItem
                key={t}
                onClick={() => onThemeChange(t)}
                className={currentTheme === t ? "bg-accent/20" : ""}
              >
                {THEMES[t].label}
                {currentTheme === t && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Layout sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <LayoutTemplate className="h-4 w-4 mr-2.5" />
            Page setup
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(Object.keys(LAYOUT_PRESETS) as LayoutPresetId[]).map((id) => (
              <DropdownMenuItem
                key={id}
                onClick={() => onLayoutChange(id)}
                className={currentLayout === id ? "bg-accent/20" : ""}
              >
                {LAYOUT_PRESETS[id].label}
                {currentLayout === id && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Export sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileDown className="h-4 w-4 mr-2.5" />
            Export
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={onExportPDF}>
              <Printer className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            {onExportPPTX && (
              <DropdownMenuItem onClick={onExportPPTX} disabled={pptxLoading}>
                {pptxLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                )}
                Export as PowerPoint
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onPresenterView}>
              <Presentation className="h-4 w-4 mr-2" />
              Presenter view
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Analytics */}
        {onAnalytics && (
          <DropdownMenuItem onClick={onAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2.5" />
            Analytics
          </DropdownMenuItem>
        )}

        {/* Share */}
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="h-4 w-4 mr-2.5" />
          Share…
        </DropdownMenuItem>

        {/* Duplicate */}
        {onDuplicate && (
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-2.5" />
            Duplicate this deck
          </DropdownMenuItem>
        )}

        {/* Delete */}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2.5" />
              Delete this deck
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
