import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, ArrowRight, X, Palette } from 'lucide-react';
import { fetchTemplateBlocks, type Template, type TemplateBlock } from '@/lib/templates';
import { TemplatePreview } from './TemplatePreview';
import { inferVisualCategory, getCategoryStyle } from './TemplateThumbnail';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TemplatePreviewModalProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onUseTemplate: (id: string) => void;
}

function chunkBlocks(blocks: TemplateBlock[], size = 1): TemplateBlock[][] {
  // Each block is its own slide — YouExec style, one visual per slide
  return blocks.map((b) => [b]);
}

export function TemplatePreviewModal({
  template,
  open,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  const isMobile = useIsMobile();
  const [allBlocks, setAllBlocks] = useState<TemplateBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBrand, setShowBrand] = useState(false);

  // Slide transition direction tracking
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Check if brand kit exists
  const hasBrandKit = useMemo(() => {
    try {
      const stored = localStorage.getItem('axiva_brand_kit');
      return !!stored;
    } catch { return false; }
  }, []);

  // Fetch all blocks when template changes
  useEffect(() => {
    if (!template || !open) return;
    setLoading(true);
    setCurrentSlide(0);
    fetchTemplateBlocks(template.id)
      .then(setAllBlocks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [template?.id, open]);

  const slides = useMemo(() => chunkBlocks(allBlocks), [allBlocks]);
  const totalSlides = slides.length;

  const goNext = useCallback(() => {
    if (isTransitioning) return;
    setSlideDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((p) => Math.min(p + 1, totalSlides - 1));
      setIsTransitioning(false);
    }, 150);
  }, [totalSlides, isTransitioning]);

  const goPrev = useCallback(() => {
    if (isTransitioning) return;
    setSlideDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((p) => Math.max(p - 1, 0));
      setIsTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, goNext, goPrev, onClose]);

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && currentSlide < totalSlides - 1) {
        goNext();
      } else if (deltaX > 0 && currentSlide > 0) {
        goPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [currentSlide, totalSlides, goNext, goPrev]);

  if (!template) return null;

  const visualCat = inferVisualCategory(template.category, template.tags);
  const style = getCategoryStyle(visualCat);

  // Brand kit CSS overrides
  const brandStyles: React.CSSProperties = {};
  if (showBrand) {
    try {
      const kit = JSON.parse(localStorage.getItem('axiva_brand_kit') || '{}');
      if (kit.primaryColor) {
        (brandStyles as any)['--deck-accent'] = kit.primaryColor;
        (brandStyles as any)['--deck-heading'] = kit.primaryColor;
      }
    } catch { /* ignore */ }
  }

  // Transition classes for slide content
  const slideTransformClass = isTransitioning
    ? slideDirection === 'right'
      ? 'opacity-0 translate-x-4'
      : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 bg-background overflow-hidden"
        style={brandStyles}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Badge
              className="text-[10px] px-2 py-0.5 font-bold text-white border-0 shrink-0"
              style={{ backgroundColor: style.accent }}
            >
              {style.label}
            </Badge>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">{template.title}</h2>
              {template.description && (
                <p className="text-xs text-muted-foreground truncate">{template.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasBrandKit && (
              <Button
                variant={showBrand ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setShowBrand((p) => !p)}
              >
                <Palette className="h-3.5 w-3.5" />
                {showBrand ? 'Brand On' : 'My Brand'}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide Area */}
        <div
          className="flex-1 flex min-h-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : slides.length > 0 ? (
            <>
              {/* Slide thumbnail strip — left sidebar (desktop only) */}
              {!isMobile && totalSlides > 1 && (
                <div className="w-[140px] shrink-0 border-r border-border overflow-y-auto py-3 px-2 flex flex-col gap-2 bg-muted/30">
                  {slides.map((slideBlocks, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={cn(
                        'relative w-full aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0',
                        i === currentSlide
                          ? 'border-accent shadow-md ring-1 ring-accent/30'
                          : 'border-transparent hover:border-border opacity-60 hover:opacity-100'
                      )}
                    >
                      <div className="w-full h-full bg-card">
                        <TemplatePreview
                          blocks={slideBlocks}
                          className="shadow-none border-0 rounded-none"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-0.5">
                        <span className="text-[9px] text-white font-medium">{i + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Main slide area */}
              <div className="flex-1 flex items-center justify-center px-4 py-6 relative min-h-0">
                {/* Prev arrow */}
                {!isMobile && currentSlide > 0 && (
                  <button
                    onClick={goPrev}
                    className="absolute left-2 z-10 p-2 rounded-full bg-card border border-border shadow-md hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-foreground" />
                  </button>
                )}

                {/* Slide with transition */}
                <div
                  className={cn(
                    'w-full max-w-4xl mx-auto transition-all duration-200 ease-out',
                    slideTransformClass
                  )}
                >
                  <TemplatePreview
                    blocks={slides[currentSlide]}
                    className="shadow-lg"
                  />
                </div>

                {/* Next arrow */}
                {!isMobile && currentSlide < totalSlides - 1 && (
                  <button
                    onClick={goNext}
                    className="absolute right-2 z-10 p-2 rounded-full bg-card border border-border shadow-md hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-foreground" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">No slides available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Templates
            </button>
            {totalSlides > 0 && (
              <span className="text-sm text-muted-foreground">
                Slide {currentSlide + 1} of {totalSlides}
              </span>
            )}
          </div>

          {/* Slide dots (mobile + desktop) */}
          {totalSlides > 1 && (
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    i === currentSlide
                      ? 'bg-accent scale-125'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>
          )}

          <Button
            variant="hero"
            size="sm"
            className="gap-2"
            onClick={() => onUseTemplate(template.id)}
          >
            Use This Template
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
