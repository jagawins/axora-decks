/**
 * CTA Section Block Component
 * Call-to-action section with primary and secondary buttons
 */

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CTASectionPayload, VisualBlockProps } from './types';

export function CTASection({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<CTASectionPayload>) {
  const { heading, subheading, primaryCta, secondaryCta, image } = payload;

  return (
    <div 
      className={cn(
        'relative w-full rounded-radius-2xl overflow-hidden p-space-8 md:p-space-12',
        'bg-gradient-to-br from-[var(--deck-accent,hsl(var(--accent)))]/20 via-[var(--deck-bg,hsl(var(--card)))] to-[var(--deck-bg,hsl(var(--card)))]',
        'border border-[var(--deck-accent,hsl(var(--accent)))]/20',
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h2 className="text-fluid-2xl md:text-fluid-3xl font-bold text-[var(--deck-fg,hsl(var(--foreground)))]">
          {heading}
        </h2>
        {subheading && (
          <p className="text-fluid-lg text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-4">
            {subheading}
          </p>
        )}

        {/* Buttons */}
        {(primaryCta || secondaryCta) && (
          <div className="flex flex-col sm:flex-row gap-space-4 justify-center mt-space-8">
            {primaryCta && (
              primaryCta.href ? (
                <a
                  href={primaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-space-8 py-space-4 rounded-radius-lg',
                    'bg-[var(--deck-accent,hsl(var(--accent)))] text-white',
                    'font-semibold text-fluid-base',
                    'transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5'
                  )}
                >
                  {primaryCta.text}
                  <ArrowRight className="w-5 h-5" />
                </a>
              ) : (
                <button
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-space-8 py-space-4 rounded-radius-lg',
                    'bg-[var(--deck-accent,hsl(var(--accent)))] text-white',
                    'font-semibold text-fluid-base',
                    'transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5'
                  )}
                >
                  {primaryCta.text}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )
            )}
            {secondaryCta && (
              secondaryCta.href ? (
                <a
                  href={secondaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-space-8 py-space-4 rounded-radius-lg',
                    'bg-transparent border border-[var(--deck-border,hsl(var(--border)))]',
                    'text-[var(--deck-fg,hsl(var(--foreground)))]',
                    'font-semibold text-fluid-base',
                    'transition-all duration-300 hover:bg-[var(--deck-muted,hsl(var(--muted)))]/20'
                  )}
                >
                  {secondaryCta.text}
                </a>
              ) : (
                <button
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-space-8 py-space-4 rounded-radius-lg',
                    'bg-transparent border border-[var(--deck-border,hsl(var(--border)))]',
                    'text-[var(--deck-fg,hsl(var(--foreground)))]',
                    'font-semibold text-fluid-base',
                    'transition-all duration-300 hover:bg-[var(--deck-muted,hsl(var(--muted)))]/20'
                  )}
                >
                  {secondaryCta.text}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[var(--deck-accent,hsl(var(--accent)))]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[var(--deck-accent,hsl(var(--accent)))]/10 blur-3xl" />
    </div>
  );
}
