/**
 * Executive Summary Block Component
 * Concise summary with key points for executive audiences
 */

import { Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExecSummaryPayload, VisualBlockProps } from './types';

export function ExecSummary({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<ExecSummaryPayload>) {
  const { title, summary, keyPoints = [], bottomLine } = payload;

  return (
    <div 
      className={cn(
        'w-full rounded-radius-2xl overflow-hidden',
        'bg-gradient-to-br from-[var(--deck-accent,hsl(var(--accent)))]/10 to-transparent',
        'border border-[var(--deck-accent,hsl(var(--accent)))]/20',
        className
      )}
    >
      {/* Header */}
      <div className="px-space-8 py-space-6 border-b border-[var(--deck-border,hsl(var(--border)))]/50">
        <div className="flex items-center gap-space-3">
          <div className="w-10 h-10 rounded-radius-lg bg-[var(--deck-accent,hsl(var(--accent)))]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[var(--deck-accent,hsl(var(--accent)))]" />
          </div>
          <h3 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
            {title || 'Executive Summary'}
          </h3>
        </div>
      </div>

      {/* Summary text */}
      <div className="px-space-8 py-space-6">
        <p className="text-fluid-base leading-relaxed text-[var(--deck-fg,hsl(var(--foreground)))]">
          {summary}
        </p>
      </div>

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="px-space-8 pb-space-6">
          <h4 className="text-fluid-sm font-semibold text-[var(--deck-muted,hsl(var(--muted-foreground)))] uppercase tracking-wide mb-space-3">
            Key Points
          </h4>
          <ul className="space-y-space-2">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-space-3">
                <ChevronRight className="w-5 h-5 text-[var(--deck-accent,hsl(var(--accent)))] flex-shrink-0 mt-0.5" />
                <span className="text-fluid-base text-[var(--deck-fg,hsl(var(--foreground)))]">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Line */}
      {bottomLine && (
        <div className="px-space-8 py-space-6 bg-[var(--deck-accent,hsl(var(--accent)))]/10 border-t border-[var(--deck-accent,hsl(var(--accent)))]/20">
          <p className="text-fluid-sm font-semibold text-[var(--deck-muted,hsl(var(--muted-foreground)))] uppercase tracking-wide mb-space-2">
            Bottom Line
          </p>
          <p className="text-fluid-lg font-medium text-[var(--deck-fg,hsl(var(--foreground)))]">
            {bottomLine}
          </p>
        </div>
      )}
    </div>
  );
}
