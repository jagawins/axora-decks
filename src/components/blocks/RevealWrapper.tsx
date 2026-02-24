/**
 * RevealWrapper — progressive disclosure wrapper for list/card items.
 * Items appear one at a time on click/spacebar in deck mode.
 * In document mode (or when reveal is off), all items show immediately.
 */

import { useState, useCallback, useEffect, type ReactNode } from 'react';

interface RevealWrapperProps {
  items: ReactNode[];
  reveal?: boolean;
  deckMode?: boolean;
  className?: string;
}

export function RevealWrapper({ items, reveal = false, deckMode = false, className = '' }: RevealWrapperProps) {
  const shouldReveal = reveal && deckMode;
  const [visibleCount, setVisibleCount] = useState(shouldReveal ? 1 : items.length);

  // Reset when items change
  useEffect(() => {
    setVisibleCount(shouldReveal ? 1 : items.length);
  }, [shouldReveal, items.length]);

  const advance = useCallback(() => {
    if (visibleCount < items.length) {
      setVisibleCount((c) => Math.min(c + 1, items.length));
    }
  }, [visibleCount, items.length]);

  // Listen for click and spacebar when in reveal mode
  useEffect(() => {
    if (!shouldReveal) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        advance();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shouldReveal, advance]);

  return (
    <div
      className={`${className}`}
      onClick={shouldReveal ? advance : undefined}
      role={shouldReveal ? 'button' : undefined}
      tabIndex={shouldReveal ? 0 : undefined}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={`transition-all duration-300 ${
            i < visibleCount
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden'
          }`}
        >
          {item}
        </div>
      ))}
      {shouldReveal && visibleCount < items.length && (
        <p className="text-fluid-xs text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-2 text-center select-none">
          Click or press Space to reveal next ({visibleCount}/{items.length})
        </p>
      )}
    </div>
  );
}
