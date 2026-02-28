import { useState, useCallback } from "react";
import { Search, Lock, Unlock, Image, Loader2, ChevronDown, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { ImageAsset, ImageSlot, ImageSearchResult, ImageSource, ImageQuality } from "@/types/visual-builder";

const IMAGE_SOURCE_OPTIONS: { value: ImageSource; label: string }[] = [
  { value: "stock", label: "Stock Photos" },
  { value: "web", label: "Web Images" },
  { value: "ai", label: "AI Images" },
  { value: "ai-infographic", label: "AI Infographic" },
  { value: "illustration", label: "Illustrations" },
  { value: "gif", label: "Animated GIFs" },
];

const INFOGRAPHIC_PREFIX = "Create a clean data infographic: ";

interface ImagePickerSlotProps {
  slot: ImageSlot;
  onUpdate: (slotId: string, asset: ImageAsset | undefined) => void;
}

function ImagePickerSlot({ slot, onUpdate }: ImagePickerSlotProps) {
  const [expanded, setExpanded] = useState(false);
  const [source, setSource] = useState<ImageSource>("stock");
  const [quality, setQuality] = useState<ImageQuality>("standard");
  const [query, setQuery] = useState(slot.suggestedQuery || slot.slideTitle);
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  const isAISource = source === "ai" || source === "ai-infographic";
  const effectiveQuality: ImageQuality = source === "ai-infographic" ? "pro" : quality;

  const doSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("image-search", {
        body: { q: query.trim(), source },
      });
      if (!error && data?.results) {
        setResults(data.results);
      }
    } catch (e) {
      console.error("image-search error", e);
    } finally {
      setSearching(false);
    }
  }, [query, source]);

  const doGenerate = useCallback(async () => {
    setGenerating(true);
    setResults([]);
    try {
      const prompt = source === "ai-infographic"
        ? `${INFOGRAPHIC_PREFIX}${query.trim() || slot.slideTitle}`
        : query.trim() || slot.slideTitle;

      const style = source === "ai-infographic" ? "infographic" : undefined;

      const { data, error } = await supabase.functions.invoke("image-generate", {
        body: { prompt, style, quality: effectiveQuality },
      });
      if (!error && data?.url) {
        setResults([{ thumbUrl: data.thumbUrl || data.url, url: data.url, credit: data.credit }]);
      }
    } catch (e) {
      console.error("image-generate error", e);
    } finally {
      setGenerating(false);
    }
  }, [query, slot.slideTitle, source, effectiveQuality]);

  const selectImage = (result: ImageSearchResult) => {
    onUpdate(slot.id, {
      source,
      query: query.trim(),
      url: result.url,
      thumbUrl: result.thumbUrl,
      credit: result.credit,
      license: result.license,
      locked: false,
    });
    setExpanded(false);
  };

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slot.imageAsset) {
      onUpdate(slot.id, { ...slot.imageAsset, locked: !slot.imageAsset.locked });
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(slot.id, undefined);
  };

  const selectedSourceLabel = IMAGE_SOURCE_OPTIONS.find(o => o.value === source)?.label || "Stock Photos";

  const loadingText = generating
    ? effectiveQuality === "pro"
      ? "Generating HD image…"
      : "Generating image…"
    : "Searching…";

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden bg-background">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="w-14 h-10 rounded-md overflow-hidden bg-muted/50 flex-shrink-0 flex items-center justify-center">
          {slot.imageAsset?.thumbUrl ? (
            <img src={slot.imageAsset.thumbUrl} alt="" className="w-full h-full object-cover" />
          ) : slot.imageAsset?.url ? (
            <img src={slot.imageAsset.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Image className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{slot.slideTitle}</p>
          {slot.imageAsset ? (
            <p className="text-xs text-muted-foreground truncate">
              {slot.imageAsset.source} · {slot.imageAsset.credit || "Image selected"}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No image selected</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {slot.imageAsset && (
            <>
              <button
                type="button"
                onClick={toggleLock}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  slot.imageAsset.locked ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                )}
                title={slot.imageAsset.locked ? "Unlock image" : "Lock image (won't change on regenerate)"}
              >
                {slot.imageAsset.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-xs"
              >
                ✕
              </button>
            </>
          )}
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </div>
      </button>

      {/* Expanded search panel */}
      {expanded && (
        <div className="border-t border-border/40 p-3 space-y-3 bg-muted/20">
          {/* Source + Search row */}
          <div className="flex gap-2">
            {/* Source dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="h-9 px-3 rounded-md border border-border/60 bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50 transition-colors whitespace-nowrap"
              >
                {selectedSourceLabel}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {showSourceMenu && (
                <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[150px]">
                  {IMAGE_SOURCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSource(opt.value);
                        setShowSourceMenu(false);
                        setResults([]);
                        if (opt.value === "ai-infographic") setQuality("pro");
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md",
                        source === opt.value && "bg-muted font-medium"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search input */}
            <div className="flex-1 flex gap-1">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (isAISource ? doGenerate() : doSearch())}
                  placeholder={source === "ai-infographic" ? "Describe infographic…" : "Search images…"}
                  className="pl-8 h-9 text-sm bg-background"
                />
              </div>
              {isAISource ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={doGenerate}
                  disabled={generating}
                  className="h-9 px-3 gap-1.5"
                >
                  {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Generate
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={doSearch}
                  disabled={searching}
                  className="h-9 px-3"
                >
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
                </Button>
              )}
            </div>
          </div>

          {/* Quality toggle — only for AI source (not ai-infographic, which forces pro) */}
          {source === "ai" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Quality:</span>
              <div className="flex rounded-md border border-border/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuality("standard")}
                  className={cn(
                    "px-3 py-1 text-xs transition-colors",
                    quality === "standard" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setQuality("pro")}
                  className={cn(
                    "px-3 py-1 text-xs transition-colors flex items-center gap-1",
                    quality === "pro" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground"
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  Pro
                </button>
              </div>
              {quality === "pro" && (
                <span className="text-xs text-muted-foreground">Higher quality, slower (~15s)</span>
              )}
            </div>
          )}

          {source === "ai-infographic" && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-primary" />
              Pro quality · Optimised for data infographics
            </div>
          )}

          {/* Results grid */}
          {(searching || generating) && (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingText}
            </div>
          )}

          {!searching && !generating && results.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectImage(r)}
                  className="aspect-video rounded overflow-hidden border-2 border-transparent hover:border-primary transition-all focus:border-primary outline-none"
                  title={r.credit}
                >
                  <img src={r.thumbUrl || r.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {!searching && !generating && results.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">
              {isAISource
                ? "Click Generate to create an AI image for this slide."
                : "Enter a search term and click Search."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface VisualBuilderProps {
  slots: ImageSlot[];
  onUpdateSlot: (slotId: string, asset: ImageAsset | undefined) => void;
}

export function VisualBuilder({ slots, onUpdateSlot }: VisualBuilderProps) {
  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <ImagePickerSlot key={slot.id} slot={slot} onUpdate={onUpdateSlot} />
      ))}
      {slots.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-8">
          No image slots available for this outline.
        </div>
      )}
    </div>
  );
}
