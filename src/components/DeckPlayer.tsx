/**
 * DeckPlayer – Full presentation player with deck/document modes
 * Supports slide-to-slide links, inline editing, and quick AI actions
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  List,
  Monitor,
  FileText,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeId, DEFAULT_THEME } from "@/lib/themes";
import { computeSlides, type SlideBlock, type ComputedSlide } from "@/lib/slide-engine";
import { resolveBrandStyles, type BrandKit } from "@/lib/brand";
import { VisualBlockRenderer } from "@/components/blocks/VisualBlockRenderer";
import { DeckPlayerOutline } from "@/components/DeckPlayerOutline";
import { SlideQuickActions } from "@/components/SlideQuickActions";

interface DeckPlayerProps {
  blocks: SlideBlock[];
  title?: string;
  theme?: ThemeId;
  brandKit?: BrandKit | null;
  animations?: "off" | "subtle" | "full";
  initialSlide?: number;
  /** Called when user clicks "Edit this slide" – receives block IDs for focused editing */
  onEditSlide?: (blockIds: string[]) => void;
  /** Called when a quick AI action fires – receives blockId + instruction */
  onQuickAction?: (blockId: string, instruction: string) => Promise<void>;
  /** Enable view-tracking beacons (for public preview) */
  trackViews?: boolean;
  /** Project ID for view tracking */
  projectId?: string;
}

type ViewMode = "deck" | "document";

export default function DeckPlayer({
  blocks,
  title,
  theme = DEFAULT_THEME,
  brandKit,
  animations = "subtle",
  initialSlide = 0,
  onEditSlide,
  onQuickAction,
  trackViews,
  projectId,
}: DeckPlayerProps) {
  const slides = useMemo(() => computeSlides(blocks), [blocks]);
  const [currentSlide, setCurrentSlide] = useState(
    Math.min(initialSlide, Math.max(0, slides.length - 1))
  );
  const [viewMode, setViewMode] = useState<ViewMode>("deck");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const totalSlides = slides.length;
  const brandStyles = useMemo(() => resolveBrandStyles(brandKit), [brandKit]);

  // View tracking: record time spent per slide
  const slideEnteredAt = useRef(Date.now());
  const viewerHash = useRef<string>("");

  useEffect(() => {
    // Generate a simple viewer hash from random ID stored in sessionStorage
    let hash = sessionStorage.getItem("axiva_vh");
    if (!hash) {
      hash = crypto.randomUUID().slice(0, 8);
      sessionStorage.setItem("axiva_vh", hash);
    }
    viewerHash.current = hash;
  }, []);

  const sendViewBeacon = useCallback(
    (slideIndex: number, durationMs: number) => {
      if (!trackViews || !projectId) return;
      const durationSeconds = Math.round(durationMs / 1000);
      if (durationSeconds < 1) return;

      // Fire and forget via edge function
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/record-view`;
      const body = JSON.stringify({
        project_id: projectId,
        slide_index: slideIndex,
        duration_seconds: durationSeconds,
        viewer_hash: viewerHash.current,
      });
      navigator.sendBeacon?.(url, body) ||
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body,
          keepalive: true,
        }).catch(() => {});
    },
    [trackViews, projectId]
  );

  // Navigation
  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, totalSlides - 1));
      // Send beacon for the slide being left
      const elapsed = Date.now() - slideEnteredAt.current;
      sendViewBeacon(currentSlide, elapsed);
      slideEnteredAt.current = Date.now();

      setCurrentSlide(clamped);
      setSlideKey((k) => k + 1);
    },
    [totalSlides, currentSlide, sendViewBeacon]
  );

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

  // Send final beacon on unmount
  useEffect(() => {
    return () => {
      const elapsed = Date.now() - slideEnteredAt.current;
      sendViewBeacon(currentSlide, elapsed);
    };
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (viewMode !== "deck") return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, isFullscreen, viewMode]);

  // Deep link: read ?slide= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("slide");
    if (s) {
      const idx = parseInt(s, 10) - 1;
      if (!isNaN(idx)) goTo(idx);
    }
  }, [goTo]);

  // Slide link handler – intercepts #slide-N links
  const handleSlideLink = useCallback(
    (targetIndex: number) => {
      goTo(targetIndex);
    },
    [goTo]
  );

  if (!slides.length) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--deck-muted)]">
        <p>No slides to display</p>
      </div>
    );
  }

  const animClass =
    animations === "off"
      ? ""
      : animations === "full"
      ? "deck-slide-enter-full"
      : "deck-slide-enter";

  return (
    <div
      className={`flex flex-col h-full theme-${theme}`}
      style={brandStyles}
    >
      {/* Top bar */}
      <div className="deck-player-controls flex items-center justify-between px-4 py-2 border-b border-[var(--deck-border)] bg-[var(--deck-bg)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOutlineOpen(!outlineOpen)}
            title="Toggle outline"
          >
            <List className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[var(--deck-muted)]">
            {viewMode === "deck"
              ? `${currentSlide + 1} / ${totalSlides}`
              : `${totalSlides} slides`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "deck" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setViewMode("deck")}
          >
            <Monitor className="h-3.5 w-3.5" />
            Deck
          </Button>
          <Button
            variant={viewMode === "document" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setViewMode("document")}
          >
            <FileText className="h-3.5 w-3.5" />
            Document
          </Button>

          <div className="w-px h-5 bg-[var(--deck-border)] mx-1" />

          {viewMode === "deck" && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev} disabled={currentSlide === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next} disabled={currentSlide === totalSlides - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden bg-[var(--deck-bg)]">
        <DeckPlayerOutline
          slides={slides}
          currentSlide={currentSlide}
          onSlideSelect={goTo}
          open={outlineOpen}
          onToggle={() => setOutlineOpen(false)}
        />

        {viewMode === "deck" ? (
          <DeckView
            slide={slides[currentSlide]}
            slideKey={slideKey}
            animClass={animClass}
            brandKit={brandKit}
            onNavigateSlide={handleSlideLink}
            onEditSlide={onEditSlide}
            onQuickAction={onQuickAction}
          />
        ) : (
          <DocumentView
            slides={slides}
            brandKit={brandKit}
            onNavigateSlide={handleSlideLink}
          />
        )}
      </div>

      {/* Progress bar (deck mode only) */}
      {viewMode === "deck" && totalSlides > 1 && (
        <div className="h-1 bg-[var(--deck-border)]">
          <div
            className="h-full bg-[var(--deck-accent)] transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Deck View – single slide at a time, 16:9 scaled
   ============================================================ */

function DeckView({
  slide,
  slideKey,
  animClass,
  brandKit,
  onNavigateSlide,
  onEditSlide,
  onQuickAction,
}: {
  slide: ComputedSlide;
  slideKey: number;
  animClass: string;
  brandKit?: BrandKit | null;
  onNavigateSlide?: (index: number) => void;
  onEditSlide?: (blockIds: string[]) => void;
  onQuickAction?: (blockId: string, instruction: string) => Promise<void>;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
      <div
        key={slideKey}
        className={`w-full max-w-5xl aspect-[16/9] bg-[var(--deck-bg)] text-[var(--deck-fg)] border border-[var(--deck-border)] rounded-xl shadow-2xl p-10 flex items-center justify-center overflow-auto ${animClass}`}
        style={brandKit?.typography?.bodyFont ? { fontFamily: `'${brandKit.typography.bodyFont}', sans-serif` } : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="w-full">
          {slide.blocks.map((block) => (
            <SlideBlockRenderer
              key={block.id}
              block={block}
              onNavigateSlide={onNavigateSlide}
            />
          ))}
        </div>

        {/* Edit button */}
        {onEditSlide && hovered && (
          <button
            className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--deck-bg)]/80 border border-[var(--deck-border)] backdrop-blur-sm opacity-70 hover:opacity-100 transition-opacity"
            onClick={() => onEditSlide(slide.blocks.map((b) => b.id))}
            title="Edit this slide"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        {/* Quick AI actions */}
        {onQuickAction && hovered && slide.blocks.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <SlideQuickActions
              blockId={slide.blocks[0].id}
              onAction={onQuickAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Document View – all slides stacked vertically
   ============================================================ */

function DocumentView({
  slides,
  brandKit,
  onNavigateSlide,
}: {
  slides: ComputedSlide[];
  brandKit?: BrandKit | null;
  onNavigateSlide?: (index: number) => void;
}) {
  return (
    <div
      className="flex-1 overflow-y-auto"
      style={brandKit?.typography?.bodyFont ? { fontFamily: `'${brandKit.typography.bodyFont}', sans-serif` } : undefined}
    >
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {slides.map((slide, i) => (
          <section key={i} id={`slide-${i + 1}`}>
            <div className="bg-[var(--deck-bg)] text-[var(--deck-fg)] border border-[var(--deck-border)] rounded-xl p-8 shadow-lg">
              {slide.blocks.map((block) => (
                <SlideBlockRenderer
                  key={block.id}
                  block={block}
                  onNavigateSlide={onNavigateSlide}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Shared block renderer with slide link interception
   ============================================================ */

function SlideBlockRenderer({
  block,
  onNavigateSlide,
}: {
  block: SlideBlock;
  onNavigateSlide?: (index: number) => void;
}) {
  const isBasic = ["heading", "text", "list", "callout", "two_col", "table", "image"].includes(block.type);

  // Intercept clicks on slide links (#slide-N)
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      const match = href.match(/^#slide-(\d+)$/);
      if (match && onNavigateSlide) {
        e.preventDefault();
        onNavigateSlide(parseInt(match[1], 10) - 1);
      }
    },
    [onNavigateSlide]
  );

  // Check for slideLink in CTA/hero content and render inline link
  const content = block.content || {};
  const slideLink = content.slideLink as number | undefined;

  if (!isBasic) {
    return (
      <div className="w-full" onClick={handleClick}>
        <VisualBlockRenderer
          block={{ type: block.type as any, content: block.content as any } as any}
          readOnly
        />
        {slideLink != null && onNavigateSlide && (
          <button
            className="mt-2 text-sm text-[var(--deck-accent)] hover:underline"
            onClick={() => onNavigateSlide(slideLink - 1)}
          >
            → Go to slide {slideLink}
          </button>
        )}
      </div>
    );
  }

  // Legacy basic blocks
  const c = content;

  switch (block.type) {
    case "heading": {
      const level = Number(c.level || 2);
      const sizeClass =
        level === 1 ? "text-5xl md:text-6xl" : level === 2 ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl";
      return <div className={`font-bold text-center ${sizeClass}`}>{String(c.text || "")}</div>;
    }
    case "text":
      return <p className="text-xl md:text-2xl text-center leading-relaxed">{String(c.text || "")}</p>;
    case "list": {
      const items = Array.isArray(c.items) ? (c.items as string[]) : [];
      const ordered = !!c.ordered;
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag className={`text-xl space-y-3 ${ordered ? "list-decimal" : "list-disc"} list-inside`}>
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </Tag>
      );
    }
    case "callout":
      return (
        <div className="p-8 rounded-xl border-2 text-center border-[var(--deck-accent)]/50 bg-[var(--deck-accent)]/10">
          <p className="text-xl md:text-2xl">{String(c.text || "")}</p>
        </div>
      );
    case "two_col":
      return (
        <div className="grid grid-cols-2 gap-12 w-full">
          <div className="text-lg">{String(c.left || "")}</div>
          <div className="text-lg">{String(c.right || "")}</div>
        </div>
      );
    case "table": {
      const headers = Array.isArray(c.headers) ? (c.headers as string[]) : [];
      const rows = Array.isArray(c.rows) ? (c.rows as string[][]) : [];
      return (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="border border-[var(--deck-border)] p-3 bg-[var(--deck-muted)]/20 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {(Array.isArray(row) ? row : []).map((cell, ci) => (
                    <td key={ci} className="border border-[var(--deck-border)] p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "image": {
      const src = String(c.src || "");
      const alt = String(c.alt || "");
      return (
        <div className="text-center">
          {src ? (
            <img src={src} alt={alt} className="max-h-[60vh] mx-auto rounded-lg" />
          ) : (
            <div className="w-full h-48 bg-[var(--deck-muted)]/20 rounded-lg flex items-center justify-center text-[var(--deck-muted)]">
              No image
            </div>
          )}
        </div>
      );
    }
    default:
      return <p className="text-[var(--deck-muted)]">Unknown block</p>;
  }
}
