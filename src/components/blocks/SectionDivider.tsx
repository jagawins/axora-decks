/**
 * Section Divider Block Component
 * Visual separator between content sections
 */

import { cn } from '@/lib/utils';
import type { SectionDividerPayload, VisualBlockProps } from './types';

export function SectionDivider({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<SectionDividerPayload>) {
  const { style = 'line', label } = payload;

  if (style === 'space') {
    return <div className={cn('h-space-12', className)} />;
  }

  if (style === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-space-3 py-space-8', className)}>
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--deck-accent,hsl(var(--accent)))]/50"
          />
        ))}
      </div>
    );
  }

  if (style === 'gradient') {
    return (
      <div className={cn('py-space-8', className)}>
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--deck-accent,hsl(var(--accent)))]/50 to-transparent" />
      </div>
    );
  }

  // Default: line with optional label
  return (
    <div className={cn('flex items-center gap-space-4 py-space-8', className)}>
      <div className="flex-1 h-px bg-[var(--deck-border,hsl(var(--border)))]" />
      {label && (
        <span className="text-fluid-sm font-medium text-[var(--deck-muted,hsl(var(--muted-foreground)))] px-space-4">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-[var(--deck-border,hsl(var(--border)))]" />
    </div>
  );
}
