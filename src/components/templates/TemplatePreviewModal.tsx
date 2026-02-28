import { useState, useEffect, useCallback, useMemo } from 'react';
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

function chunkBlocks(blocks: TemplateBlock[], size = 3): TemplateBlock[][] {
  // Prefer sectionIndex grouping if available
  const hasSectionIndex = blocks.some(
    (b) => (b.block_meta as any)?.sectionIndex != null
  );

  if (hasSectionIndex) {
    const groups = new Map<number, TemplateBlock[]>();
    let ungrouped: TemplateBlock[] = [];
    for (const b of blocks) {
      const si = (b.block_meta as any)?.sectionIndex;
      if (si != null) {
        if (!groups.has(si)) groups.set(si, []);
        groups.get(si)!.push(b);
      } else {
        ungrouped.push(b);
      }
    }
    const sorted = Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v);
    if (ungrouped.length > 0) sorted.push(ungrouped);
    return sorted;
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[TemplatePreviewModal] Template has no sectionIndex values — using fixed chunks.');
    }
    const chunks: TemplateBlock[][] = [];
    for (let i = 0; i < blocks.length; i += size) {
      chunks.push(blocks.slice(i, i + size));
    }
    return chunks;
  }
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

  // Check if brand kit exists
  const hasBrandKit = useMemo(() => {
    try {
      const stored = localStorage.getItem('axora_brand_kit');
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

  const goNext = useCallback(() => setCurrentSlide((p) => Math.min(p + 1, totalSlides - 1)), [totalSlides]);
  const goPrev = useCallback(() => setCurrentSlide((p) => Math.max(p - 1, 0)), []);

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

  if (!template) return null;

  const visualCat = inferVisualCategory(template.category, template.tags);
  const style = getCategoryStyle(visualCat);

  // Brand kit CSS overrides
  const brandStyles: React.CSSProperties = {};
  if (showBrand) {
    try {
      const kit = JSON.parse(localStorage.getItem('axora_brand_kit') || '{}');
      if (kit.primaryColor) {
        (brandStyles as any)['--deck-accent'] = kit.primaryColor;
        (brandStyles as any)['--deck-heading'] = kit.primaryColor;
      }
    } catch { /* ignore */ }
  }

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
        <div className="flex-1 flex items-center justify-center px-4 py-6 relative min-h-0">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          ) : slides.length > 0 ? (
            <>
              {/* Prev arrow */}
              {!isMobile && currentSlide > 0 && (
                <button
                  onClick={goPrev}
                  className="absolute left-2 z-10 p-2 rounded-full bg-card border border-border shadow-md hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
              )}

              {/* Slide */}
              <div className="w-full max-w-4xl mx-auto">
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
            </>
          ) : (
            <p className="text-muted-foreground">No slides available</p>
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

          {/* Mobile slide dots */}
          {isMobile && totalSlides > 1 && (
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === currentSlide ? 'bg-accent' : 'bg-muted-foreground/30'
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
