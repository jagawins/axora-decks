import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SampleSlideRenderer from "@/components/sample/SampleSlideRenderer";
import { SAMPLE_DECKS, type SampleDeck } from "@/data/sample-decks";
import { trackProductEvent } from "@/lib/product-events";


interface Props {
  /** Controlled deck id. When omitted the explorer manages its own selection. */
  deckId?: string;
  onDeckChange?: (deckId: string) => void;
  decks?: SampleDeck[];
  /** Show the deck switcher tabs */
  showDeckTabs?: boolean;
  /** Show speaker notes and anticipated questions */
  showNotes?: boolean;
  /** Tighter type + smaller frame, used in the hero */
  compact?: boolean;
  className?: string;
}

export default function SampleDeckExplorer({
  deckId,
  onDeckChange,
  decks = SAMPLE_DECKS,
  showDeckTabs = true,
  showNotes = false,
  compact = false,
  className,
}: Props) {
  const [internalDeckId, setInternalDeckId] = useState(deckId ?? decks[0].id);
  const activeDeckId = deckId ?? internalDeckId;
  const deck = useMemo(
    () => decks.find((d) => d.id === activeDeckId) ?? decks[0],
    [decks, activeDeckId]
  );

  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = deck.slides.length;
  const slide = deck.slides[Math.min(index, total - 1)];

  // Reset to the first slide whenever the deck changes
  useEffect(() => {
    setIndex(0);
  }, [deck.id]);

  const selectDeck = useCallback(
    (id: string) => {
      if (id === activeDeckId) return;
      setInternalDeckId(id);
      onDeckChange?.(id);
      trackProductEvent("sample_opened", { deck_id: id, source: compact ? "hero" : "demo" });
    },
    [activeDeckId, onDeckChange, compact]
  );

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex((current) => {
        if (clamped !== current) {
          trackProductEvent("sample_slide_viewed", { deck_id: deck.id, slide_index: clamped });
        }
        return clamped;
      });
    },
    [total, deck.id]
  );

  // Arrow-key navigation, but never while the visitor is typing.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      // Only respond when this explorer is on screen and focused within, or when it
      // is the only explorer (compact panels are skipped to avoid double handling).
      const root = rootRef.current;
      if (!root) return;
      if (compact && !root.contains(document.activeElement)) return;
      e.preventDefault();
      go(e.key === "ArrowRight" ? index + 1 : index - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go, index, compact]);

  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <div ref={rootRef} className={cn("w-full", className)}>
      {showDeckTabs && (
        <div
          role="tablist"
          aria-label="Sample decks"
          className="mb-4 flex flex-wrap gap-2"
        >
          {decks.map((d) => {
            const selected = d.id === deck.id;
            return (
              <button
                key={d.id}
                role="tab"
                type="button"
                id={`sample-tab-${d.id}`}
                aria-selected={selected}
                aria-controls="sample-deck-panel"
                onClick={() => selectDeck(d.id)}
                className={cn(
                  "min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected
                    ? "border-accent/60 bg-accent/10 text-accent"
                    : "border-border/60 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                )}
              >
                {d.title}
              </button>
            );
          })}
        </div>
      )}

      <div
        id="sample-deck-panel"
        role="tabpanel"
        aria-labelledby={showDeckTabs ? `sample-tab-${deck.id}` : undefined}
        className="rounded-2xl border border-border/60 bg-card/40 p-3 sm:p-4"
      >
        {/* Deck meta */}
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{deck.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {deck.organisation} · {deck.audience}
            </p>
          </div>
          <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Illustrative sample
          </span>
        </div>

        {/* Slide surface — taller on phones so nothing is clipped, 16:9 from sm up */}
        <div
          className="relative w-full overflow-hidden rounded-xl border border-white/10 aspect-[4/5] sm:aspect-video"
          style={{ background: deck.surface }}
        >
          <div className="absolute inset-0 overflow-y-auto motion-safe:transition-opacity motion-safe:duration-200">
            <SampleSlideRenderer body={slide.body} accent={deck.accent} compact={compact} />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${deck.accent}80, transparent)` }}
          />
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[40px] gap-1.5"
            onClick={() => go(index - 1)}
            disabled={atStart}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <p aria-live="polite" className="text-center text-xs text-muted-foreground">
            Slide {index + 1} of {total} · {slide.label}
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-[40px] gap-1.5"
            onClick={() => go(index + 1)}
            disabled={atEnd}
            aria-label="Next slide"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Slide selectors */}
        <div className="mt-3 flex flex-wrap gap-2">
          {deck.slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "min-h-[36px] rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                i === index
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>
      </div>

      {showNotes && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card/40 p-4">
            <h3 className="text-sm font-semibold text-foreground">Speaker note (sample)</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{slide.speakerNote}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 p-4">
            <h3 className="text-sm font-semibold text-foreground">Anticipated questions (sample)</h3>
            <dl className="mt-2 space-y-3">
              {slide.questions.map((q) => (
                <div key={q.question}>
                  <dt className="text-[15px] font-medium text-foreground">{q.question}</dt>
                  <dd className="mt-0.5 text-[15px] leading-relaxed text-muted-foreground">{q.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
