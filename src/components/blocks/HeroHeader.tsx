/**
 * Hero Header Block Component
 * Eye-catching header section for presentations
 */

import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HeroHeaderPayload, VisualBlockProps } from './types';

export function HeroHeader({ 
  payload, 
  readOnly = true, 
  className 
}: VisualBlockProps<HeroHeaderPayload>) {
  const { 
    heading, 
    subheading, 
    cta, 
    image, 
    backgroundStyle = 'gradient' 
  } = payload;

  return (
    <div 
      className={cn(
        'relative w-full min-h-[300px] md:min-h-[400px] rounded-radius-2xl overflow-hidden',
        'flex flex-col justify-center items-center text-center p-space-8 md:p-space-16',
        className
      )}
    >
      {/* Background */}
      {backgroundStyle === 'image' && image?.src ? (
        <>
          <img 
            src={image.src} 
            alt={image.alt || 'Hero background'} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </>
      ) : backgroundStyle === 'image' && image?.prompt ? (
        <>
          <div className="absolute inset-0 bg-[var(--deck-muted,hsl(var(--muted)))]/30 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-[var(--deck-muted,hsl(var(--muted-foreground)))]" />
              <p className="text-fluid-sm text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-2">{image.prompt}</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--deck-accent,hsl(var(--accent)))]/20 via-[var(--deck-bg,hsl(var(--background)))] to-[var(--deck-bg,hsl(var(--background)))]" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-fluid-4xl md:text-fluid-5xl font-bold text-[var(--deck-fg,hsl(var(--foreground)))] leading-tight">
          {heading}
        </h1>
        {subheading && (
          <p className="text-fluid-lg md:text-fluid-xl text-[var(--deck-muted,hsl(var(--muted-foreground)))] mt-space-4 max-w-2xl mx-auto">
            {subheading}
          </p>
        )}
        {cta && (
          <div className="mt-space-8">
            <button
              className={cn(
                'inline-flex items-center gap-2 px-space-8 py-space-4 rounded-radius-lg',
                'bg-[var(--deck-accent,hsl(var(--accent)))] text-white',
                'font-semibold text-fluid-base',
                'transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5'
              )}
            >
              {cta.text}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-[var(--deck-accent,hsl(var(--accent)))]/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-[var(--deck-accent,hsl(var(--accent)))]/10 to-transparent blur-3xl" />
    </div>
  );
}
