/**
 * Three Pillars Block
 * Displays 3 key pillars/themes as prominent cards with icons
 */

import { Card } from '@/components/ui/card';
import { Target, Zap, Shield, TrendingUp, Users, Lightbulb, Award, BarChart3 } from 'lucide-react';
import type { VisualBlockProps } from './types';

export interface ThreePillarsPayload {
  title?: string;
  pillars: Array<{
    title: string;
    description?: string;
    icon?: string;
  }>;
}

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Target, Zap, Shield, TrendingUp, Users, Lightbulb, Award, BarChart3,
};

const PILLAR_COLORS = [
  'from-primary/20 to-primary/5 border-primary/30',
  'from-accent/20 to-accent/5 border-accent/30',
  'from-secondary/20 to-secondary/5 border-secondary/30',
];

export function ThreePillars({ payload, className = '' }: VisualBlockProps<ThreePillarsPayload>) {
  const { title, pillars = [] } = payload;
  const displayPillars = pillars.slice(0, 3);

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">{title}</h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayPillars.map((pillar, i) => {
          const IconComp = PILLAR_ICONS[pillar.icon || ''] || Target;
          return (
            <Card
              key={i}
              className={`p-6 bg-gradient-to-b ${PILLAR_COLORS[i % 3]} border text-center space-y-3`}
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-background/80 flex items-center justify-center">
                <IconComp className="h-5 w-5 text-[var(--deck-accent,hsl(var(--accent)))]" />
              </div>
              <h4 className="font-semibold text-sm text-[var(--deck-fg,hsl(var(--foreground)))]">
                {pillar.title}
              </h4>
              {pillar.description && (
                <p className="text-xs text-[var(--deck-muted,hsl(var(--muted-foreground)))] line-clamp-3">
                  {pillar.description}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
