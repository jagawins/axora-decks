/**
 * Slide Outline Sidebar for DeckPlayer
 */

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComputedSlide } from "@/lib/slide-engine";

interface DeckPlayerOutlineProps {
  slides: ComputedSlide[];
  currentSlide: number;
  onSlideSelect: (index: number) => void;
  open: boolean;
  onToggle: () => void;
}

export function DeckPlayerOutline({
  slides,
  currentSlide,
  onSlideSelect,
  open,
  onToggle,
}: DeckPlayerOutlineProps) {
  if (!open) return null;

  return (
    <div className="w-56 flex-shrink-0 border-r border-[var(--deck-border)] bg-[var(--deck-bg)] overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b border-[var(--deck-border)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--deck-muted)]">
          Outline
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
      </div>
      <div className="p-2 space-y-1">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => onSlideSelect(i)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              i === currentSlide
                ? "bg-[var(--deck-accent)]/15 text-[var(--deck-accent)] font-medium"
                : "text-[var(--deck-muted)] hover:text-[var(--deck-fg)] hover:bg-[var(--deck-fg)]/5"
            }`}
          >
            <span className="text-xs opacity-50 mr-2">{i + 1}</span>
            <span className="truncate">{slide.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
