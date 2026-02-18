import { useState, useCallback } from "react";
import { Search, Lock, Unlock, Image, Loader2, ChevronDown, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { ImageAsset, ImageSlot, ImageSearchResult, ImageSource } from "@/types/visual-builder";

const IMAGE_SOURCE_OPTIONS: { value: ImageSource; label: string; icon?: string }[] = [
  { value: "stock", label: "Stock Photos" },
  { value: "web", label: "Web Images" },
  { value: "ai", label: "AI Images" },
  { value: "illustration", label: "Illustrations" },
  { value: "gif", label: "Animated GIFs" },
];

interface ImagePickerSlotProps {
  slot: ImageSlot;
  onUpdate: (slotId: string, asset: ImageAsset | undefined) => void;
}

function ImagePickerSlot({ slot, onUpdate }: ImagePickerSlotProps) {
  const [expanded, setExpanded] = useState(false);
  const [source, setSource] = useState<ImageSource>("stock");
  const [query, setQuery] = useState(slot.suggestedQuery || slot.slideTitle);
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

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
      const { data, error } = await supabase.functions.invoke("image-generate", {
        body: { prompt: query.trim() || slot.slideTitle },
      });
      if (!error && data?.url) {
        setResults([{ thumbUrl: data.thumbUrl || data.url, url: data.url, credit: data.credit }]);
      }
    } catch (e) {
      console.error("image-generate error", e);
    } finally {
      setGenerating(false);
    }
  }, [query, slot.slideTitle]);

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

  return (
    <div className="border border-border/60 rounded-lg overflow-hidden bg-background">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
      >
        {/* Thumbnail or placeholder */}
        <div className="w-14 h-10 rounded-md overflow-hidden bg-muted/50 flex-shrink-0 flex items-center justify-center">
          {slot.imageAsset?.thumbUrl ? (
            <img
              src={slot.imageAsset.thumbUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : slot.imageAsset?.url ? (
            <img
              src={slot.imageAsset.url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Image className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Slide title */}
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

        {/* Lock / remove buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {slot.imageAsset && (
            <>
              <button
                type="button"
                onClick={toggleLock}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  slot.imageAsset.locked
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                )}
                title={slot.imageAsset.locked ? "Unlock image" : "Lock image (won't change on regenerate)"}
              >
                {slot.imageAsset.locked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
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
          <ChevronDown
            className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")}
          />
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
                  onKeyDown={(e) => e.key === "Enter" && (source === "ai" ? doGenerate() : doSearch())}
                  placeholder="Search images..."
                  className="pl-8 h-9 text-sm bg-background"
                />
              </div>
              {source === "ai" ? (
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

          {/* Results grid */}
          {(searching || generating) && (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {source === "ai" ? "Generating image..." : "Searching..."}
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
                  <img
                    src={r.thumbUrl || r.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {!searching && !generating && results.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">
              {source === "ai"
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
