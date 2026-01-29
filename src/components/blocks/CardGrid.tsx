/**
 * Card Grid Block Component
 * Displays items in a responsive card grid layout
 */

import { Image as ImageIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardGridPayload, VisualBlockProps } from './types';

export function CardGrid({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<CardGridPayload>) {
  const { title, subtitle, cards = [], columns = 3 } = payload;

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (Icons as Record<string, any>)[iconName];
    return IconComponent || null;
  };

  const colsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {(title || subtitle) && (
        <div className="mb-space-6">
          {title && (
            <h3 className="text-fluid-xl font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-fluid-base text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-2">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={cn('grid gap-space-4', colsClass[columns])}>
        {cards.map((card, index) => {
          const Icon = getIcon(card.icon);
          
          return (
            <div
              key={index}
              className={cn(
                'group relative overflow-hidden rounded-radius-xl p-space-6',
                'bg-[var(--deck-bg,hsl(var(--card)))]/50',
                'border border-[var(--deck-border,hsl(var(--border)))]',
                'transition-all duration-300 hover:border-[var(--deck-accent,hsl(var(--accent)))]/50',
                'hover:shadow-glow-subtle hover:-translate-y-1'
              )}
            >
              {/* Image or Icon */}
              {card.image?.src ? (
                <div className="aspect-video w-full mb-space-4 rounded-radius-lg overflow-hidden">
                  <img 
                    src={card.image.src} 
                    alt={card.image.alt || card.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : card.image?.prompt ? (
                <div className="aspect-video w-full mb-space-4 rounded-radius-lg overflow-hidden bg-[var(--deck-muted,hsl(var(--muted)))]/20 flex items-center justify-center border border-dashed border-[var(--deck-border,hsl(var(--border)))]">
                  <div className="text-center p-space-4">
                    <ImageIcon className="w-8 h-8 mx-auto text-[var(--deck-muted,hsl(var(--muted-foreground)))]" />
                    <p className="text-fluid-xs text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-2 line-clamp-2">
                      {card.image.prompt}
                    </p>
                  </div>
                </div>
              ) : Icon ? (
                <div className="w-12 h-12 rounded-radius-lg bg-[var(--deck-accent,hsl(var(--accent)))]/10 flex items-center justify-center mb-space-4">
                  <Icon className="w-6 h-6 text-[var(--deck-accent,hsl(var(--accent)))]" />
                </div>
              ) : null}

              {/* Content */}
              <h4 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
                {card.title}
              </h4>
              {card.description && (
                <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-2 line-clamp-3">
                  {card.description}
                </p>
              )}

              {/* Decorative hover effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--deck-accent,hsl(var(--accent)))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
