/**
 * Timeline Block Component
 * Displays chronological events with visual connections
 */

import { Check, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineBlockPayload, VisualBlockProps } from './types';

export function TimelineBlock({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<TimelineBlockPayload>) {
  const { title, events = [] } = payload;

  const statusConfig = {
    completed: {
      icon: Check,
      dotClass: 'bg-success border-success',
      lineClass: 'bg-success',
      textClass: 'text-[var(--deck-fg,hsl(var(--foreground)))]',
    },
    current: {
      icon: Clock,
      dotClass: 'bg-[var(--deck-accent,hsl(var(--accent)))] border-[var(--deck-accent,hsl(var(--accent)))] animate-pulse',
      lineClass: 'bg-gradient-to-b from-[var(--deck-accent,hsl(var(--accent)))] to-[var(--deck-border,hsl(var(--border)))]',
      textClass: 'text-[var(--deck-accent,hsl(var(--accent)))]',
    },
    upcoming: {
      icon: Circle,
      dotClass: 'bg-transparent border-[var(--deck-border,hsl(var(--border)))]',
      lineClass: 'bg-[var(--deck-border,hsl(var(--border)))]',
      textClass: 'text-[var(--deck-muted,hsl(var(--muted-foreground)))]',
    },
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] mb-space-6">
          {title}
        </h3>
      )}
      <div className="relative space-y-0">
        {events.map((event, index) => {
          const status = event.status || 'upcoming';
          const config = statusConfig[status];
          const Icon = config.icon;
          const isLast = index === events.length - 1;

          return (
            <div key={index} className="relative flex gap-space-4">
              {/* Timeline line and dot */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center z-10',
                    config.dotClass
                  )}
                >
                  <Icon className={cn('w-5 h-5', status === 'completed' ? 'text-success-foreground' : status === 'current' ? 'text-accent-foreground' : 'text-muted-foreground')} />
                </div>
                {!isLast && (
                  <div className={cn('w-0.5 flex-1 min-h-[3rem]', config.lineClass)} />
                )}
              </div>

              {/* Content */}
              <div className={cn('pb-space-8', isLast && 'pb-0')}>
                <span className={cn('text-fluid-sm font-medium', config.textClass)}>
                  {event.date}
                </span>
                <h4 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] mt-space-1">
                  {event.title}
                </h4>
                {event.description && (
                  <p className="text-fluid-base text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
