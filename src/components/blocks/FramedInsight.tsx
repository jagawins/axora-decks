/**
 * Framed Insight Block Component
 * Highlighted insight or callout with visual emphasis
 */

import { Lightbulb, AlertTriangle, Info, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FramedInsightPayload, VisualBlockProps } from './types';

export function FramedInsight({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<FramedInsightPayload>) {
  const { insight, context, source, type = 'insight' } = payload;

  const typeConfig = {
    insight: {
      icon: Lightbulb,
      label: 'Key Insight',
      bgClass: 'from-[var(--deck-accent,hsl(var(--accent)))]/10 to-transparent',
      borderClass: 'border-[var(--deck-accent,hsl(var(--accent)))]/30',
      iconClass: 'text-[var(--deck-accent,hsl(var(--accent)))]',
    },
    warning: {
      icon: AlertTriangle,
      label: 'Warning',
      bgClass: 'from-warning/10 to-transparent',
      borderClass: 'border-warning/30',
      iconClass: 'text-warning',
    },
    tip: {
      icon: Bookmark,
      label: 'Pro Tip',
      bgClass: 'from-success/10 to-transparent',
      borderClass: 'border-success/30',
      iconClass: 'text-success',
    },
    note: {
      icon: Info,
      label: 'Note',
      bgClass: 'from-muted/20 to-transparent',
      borderClass: 'border-[var(--deck-border,hsl(var(--border)))]',
      iconClass: 'text-[var(--deck-muted,hsl(var(--muted-foreground)))]',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'relative w-full rounded-radius-2xl overflow-hidden p-space-6 md:p-space-8',
        'bg-gradient-to-br', config.bgClass,
        'border', config.borderClass,
        className
      )}
    >
      {/* Icon and label */}
      <div className="flex items-center gap-space-3 mb-space-4">
        <div className={cn('w-10 h-10 rounded-radius-lg flex items-center justify-center', config.bgClass.replace('to-transparent', ''))}>
          <Icon className={cn('w-5 h-5', config.iconClass)} />
        </div>
        <span className={cn('text-fluid-sm font-semibold uppercase tracking-wide', config.iconClass)}>
          {config.label}
        </span>
      </div>

      {/* Insight text */}
      <p className="text-fluid-lg md:text-fluid-xl font-medium text-[var(--deck-fg,hsl(var(--foreground)))] leading-relaxed">
        {insight}
      </p>

      {/* Context */}
      {context && (
        <p className="text-fluid-base text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-4">
          {context}
        </p>
      )}

      {/* Source */}
      {source && (
        <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-4 opacity-70">
          — {source}
        </p>
      )}

      {/* Decorative corner accent */}
      <div className={cn(
        'absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-30',
        type === 'insight' && 'bg-[var(--deck-accent,hsl(var(--accent)))]',
        type === 'warning' && 'bg-warning',
        type === 'tip' && 'bg-success',
        type === 'note' && 'bg-muted'
      )} />
    </div>
  );
}
