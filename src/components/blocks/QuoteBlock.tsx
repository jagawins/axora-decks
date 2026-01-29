/**
 * Quote Block Component
 * Displays testimonials or notable quotes with attribution
 */

import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuoteBlockPayload, VisualBlockProps } from './types';

export function QuoteBlock({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<QuoteBlockPayload>) {
  const { quote, author, role, company, image } = payload;

  return (
    <div 
      className={cn(
        'relative w-full p-space-8 rounded-radius-2xl',
        'bg-[var(--deck-bg,hsl(var(--card)))]/50',
        'border-l-4 border-[var(--deck-accent,hsl(var(--accent)))]',
        className
      )}
    >
      {/* Quote icon */}
      <Quote 
        className="absolute top-space-6 right-space-6 w-12 h-12 text-[var(--deck-accent,hsl(var(--accent)))]/20" 
        strokeWidth={1}
      />
      
      {/* Quote text */}
      <blockquote className="relative z-10">
        <p className="text-fluid-xl md:text-fluid-2xl font-medium leading-relaxed text-[var(--deck-fg,hsl(var(--foreground)))] italic">
          "{quote}"
        </p>
      </blockquote>
      
      {/* Attribution */}
      {(author || role || company) && (
        <div className="mt-space-6 flex items-center gap-space-4">
          {image?.src && (
            <img 
              src={image.src} 
              alt={image.alt || author || 'Author'} 
              className="w-12 h-12 rounded-full object-cover border-2 border-[var(--deck-accent,hsl(var(--accent)))]/30"
            />
          )}
          <div>
            {author && (
              <p className="font-semibold text-[var(--deck-fg,hsl(var(--foreground)))]">
                {author}
              </p>
            )}
            {(role || company) && (
              <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))]">
                {[role, company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
