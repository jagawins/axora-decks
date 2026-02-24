/**
 * Toggle Block — two named states the viewer can flip between.
 * E.g. "Current vs. Target", "Before vs. After"
 */

import { useState } from 'react';
import type { VisualBlockProps, ToggleBlockPayload } from './types';

export function ToggleBlock({ payload, readOnly, className = '' }: VisualBlockProps<ToggleBlockPayload>) {
  const stateA = payload?.stateA ?? { label: 'State A', content: '' };
  const stateB = payload?.stateB ?? { label: 'State B', content: '' };
  const [active, setActive] = useState<'a' | 'b'>(payload?.defaultState ?? 'a');

  const current = active === 'a' ? stateA : stateB;

  return (
    <div className={`w-full ${className}`}>
      {payload?.title && (
        <h3 className="text-fluid-2xl font-semibold mb-space-4 text-[var(--deck-fg,hsl(var(--foreground)))]">
          {payload.title}
        </h3>
      )}
      <div className="flex gap-space-2 mb-space-4">
        <button
          onClick={() => setActive('a')}
          className={`px-space-6 py-space-2 rounded-radius-lg text-fluid-sm font-medium transition-all duration-200 ${
            active === 'a'
              ? 'bg-[var(--deck-accent,hsl(var(--primary)))] text-[var(--deck-bg,hsl(var(--primary-foreground)))] shadow-sm'
              : 'bg-[var(--deck-muted,hsl(var(--muted)))]/20 text-[var(--deck-muted,hsl(var(--muted-foreground)))] hover:bg-[var(--deck-muted,hsl(var(--muted)))]/30'
          }`}
        >
          {stateA.label}
        </button>
        <button
          onClick={() => setActive('b')}
          className={`px-space-6 py-space-2 rounded-radius-lg text-fluid-sm font-medium transition-all duration-200 ${
            active === 'b'
              ? 'bg-[var(--deck-accent,hsl(var(--primary)))] text-[var(--deck-bg,hsl(var(--primary-foreground)))] shadow-sm'
              : 'bg-[var(--deck-muted,hsl(var(--muted)))]/20 text-[var(--deck-muted,hsl(var(--muted-foreground)))] hover:bg-[var(--deck-muted,hsl(var(--muted)))]/30'
          }`}
        >
          {stateB.label}
        </button>
      </div>
      <div className="p-space-6 rounded-radius-lg bg-[var(--deck-muted,hsl(var(--muted)))]/10 border border-[var(--deck-border,hsl(var(--border)))] transition-all duration-300">
        <p className="text-fluid-base leading-relaxed text-[var(--deck-fg,hsl(var(--foreground)))] whitespace-pre-line">
          {current.content}
        </p>
      </div>
    </div>
  );
}
