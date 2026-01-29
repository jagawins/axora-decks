/**
 * Two Column Block Component (Upgraded)
 * Flexible two-column layout with customizable ratio
 */

import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TwoColumnPayload, VisualBlockProps } from './types';

export function TwoColumnBlock({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<TwoColumnPayload>) {
  const { title, left, right, ratio = '50-50' } = payload;

  const ratioClass = {
    '50-50': 'grid-cols-1 md:grid-cols-2',
    '60-40': 'grid-cols-1 md:grid-cols-[3fr_2fr]',
    '40-60': 'grid-cols-1 md:grid-cols-[2fr_3fr]',
    '70-30': 'grid-cols-1 md:grid-cols-[7fr_3fr]',
    '30-70': 'grid-cols-1 md:grid-cols-[3fr_7fr]',
  };

  const renderColumn = (col: typeof left) => {
    if (!col) return null;
    
    if (col.type === 'image') {
      return (
        <div className="aspect-video rounded-radius-xl overflow-hidden bg-[var(--deck-muted,hsl(var(--muted)))]/20">
          {col.content.startsWith('http') ? (
            <img 
              src={col.content} 
              alt="Column image" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 border border-dashed border-[var(--deck-border,hsl(var(--border)))]">
              <ImageIcon className="w-8 h-8 text-[var(--deck-muted,hsl(var(--muted-foreground)))]" />
              <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] text-center px-4">
                {col.content}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (col.type === 'list') {
      const items = col.content.split('\n').filter(Boolean);
      return (
        <ul className="space-y-space-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-space-3">
              <span className="text-[var(--deck-accent,hsl(var(--accent)))] flex-shrink-0">•</span>
              <span className="text-fluid-base text-[var(--deck-fg,hsl(var(--foreground)))]">{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Default: text
    return (
      <p className="text-fluid-base leading-relaxed text-[var(--deck-fg,hsl(var(--foreground)))]">
        {col.content}
      </p>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] mb-space-6">
          {title}
        </h3>
      )}
      <div className={cn('grid gap-space-8', ratioClass[ratio])}>
        <div>{renderColumn(left)}</div>
        <div>{renderColumn(right)}</div>
      </div>
    </div>
  );
}
