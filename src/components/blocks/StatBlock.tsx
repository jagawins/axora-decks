/**
 * Stat Block Component
 * Displays key metrics with optional trend indicators
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatBlockPayload, VisualBlockProps } from './types';

export function StatBlock({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<StatBlockPayload>) {
  const { title, stats = [], layout = 'row' } = payload;
  
  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  const trendColor = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] mb-space-4">
          {title}
        </h3>
      )}
      <div 
        className={cn(
          'grid gap-space-4',
          layout === 'grid' 
            ? 'grid-cols-2 md:grid-cols-4' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        )}
      >
        {stats.map((stat, index) => {
          const Icon = stat.trend ? TrendIcon[stat.trend] : null;
          
          return (
            <div
              key={index}
              className={cn(
                'relative overflow-hidden rounded-radius-xl p-space-6',
                'bg-gradient-to-br from-[var(--deck-accent,hsl(var(--accent)))]/10 to-transparent',
                'border border-[var(--deck-border,hsl(var(--border)))]',
                'transition-all duration-300 hover:shadow-glow-subtle'
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-fluid-3xl font-bold text-[var(--deck-fg,hsl(var(--foreground)))] animate-count-up">
                    {stat.value}
                  </p>
                  <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-1">
                    {stat.label}
                  </p>
                </div>
                {stat.change && Icon && (
                  <div className={cn('flex items-center gap-1', stat.trend && trendColor[stat.trend])}>
                    <Icon className="w-4 h-4" />
                    <span className="text-fluid-sm font-medium">{stat.change}</span>
                  </div>
                )}
              </div>
              {/* Decorative gradient corner */}
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-[var(--deck-accent,hsl(var(--accent)))]/5 blur-xl" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
