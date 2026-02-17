/**
 * 2×2 Matrix Block
 * Strategic quadrant layout for decision frameworks
 */

import { Card } from '@/components/ui/card';
import type { VisualBlockProps } from './types';

export interface TwoByTwoMatrixPayload {
  title?: string;
  xAxis?: string;
  yAxis?: string;
  quadrants: Array<{
    label: string;
    items: string[];
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }>;
}

const QUADRANT_STYLES: Record<string, string> = {
  'top-left': 'bg-warning/10 border-warning/20',
  'top-right': 'bg-primary/10 border-primary/20',
  'bottom-left': 'bg-muted/30 border-muted-foreground/10',
  'bottom-right': 'bg-accent/10 border-accent/20',
};

const QUADRANT_ORDER = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

export function TwoByTwoMatrix({ payload, className = '' }: VisualBlockProps<TwoByTwoMatrixPayload>) {
  const { title, xAxis, yAxis, quadrants = [] } = payload;

  // Map quadrants by position
  const qMap: Record<string, typeof quadrants[0]> = {};
  quadrants.forEach((q) => { qMap[q.position] = q; });

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{title}</h3>
      )}
      <div className="relative">
        {/* Axis labels */}
        {yAxis && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground font-medium tracking-wide uppercase whitespace-nowrap">
            {yAxis}
          </div>
        )}
        {xAxis && (
          <div className="text-center text-[10px] text-muted-foreground font-medium tracking-wide uppercase mt-1">
            {xAxis}
          </div>
        )}

        <div className="grid grid-cols-2 grid-rows-2 gap-2 ml-4">
          {QUADRANT_ORDER.map((pos) => {
            const q = qMap[pos];
            return (
              <Card key={pos} className={`p-4 border ${QUADRANT_STYLES[pos]} min-h-[100px]`}>
                <h5 className="text-xs font-semibold uppercase tracking-wide text-[var(--deck-fg,hsl(var(--foreground)))] mb-2">
                  {q?.label || pos.replace('-', ' ')}
                </h5>
                <ul className="space-y-1">
                  {(q?.items || []).slice(0, 3).map((item, i) => (
                    <li key={i} className="text-xs text-[var(--deck-muted,hsl(var(--muted-foreground)))] flex items-start gap-1.5">
                      <span className="text-accent mt-0.5">•</span>
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
