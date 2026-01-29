/**
 * Icon Text Block Component
 * Items with icons and descriptions in vertical or horizontal layout
 */

import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IconTextBlockPayload, VisualBlockProps } from './types';

export function IconTextBlock({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<IconTextBlockPayload>) {
  const { title, items = [], layout = 'vertical' } = payload;

  const getIcon = (iconName?: string) => {
    if (!iconName) return Icons.Circle;
    const IconComponent = (Icons as Record<string, any>)[iconName];
    return IconComponent || Icons.Circle;
  };

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-fluid-lg font-semibold text-[var(--deck-fg,hsl(var(--foreground)))] mb-space-6">
          {title}
        </h3>
      )}
      <div 
        className={cn(
          'grid gap-space-6',
          layout === 'horizontal' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        )}
      >
        {items.map((item, index) => {
          const Icon = getIcon(item.icon);
          
          return (
            <div 
              key={index}
              className={cn(
                'flex gap-space-4',
                layout === 'vertical' ? 'items-start' : 'flex-col items-center text-center'
              )}
            >
              <div 
                className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-radius-lg',
                  'bg-[var(--deck-accent,hsl(var(--accent)))]/10',
                  'flex items-center justify-center'
                )}
              >
                <Icon className="w-6 h-6 text-[var(--deck-accent,hsl(var(--accent)))]" />
              </div>
              <div className={layout === 'horizontal' ? 'mt-space-3' : ''}>
                <h4 className="text-fluid-base font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-1">
                    {item.description}
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
