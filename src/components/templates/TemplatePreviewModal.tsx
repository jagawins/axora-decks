import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, ChevronLeft, ChevronRight, ArrowRight, X, Palette,
  Layers, Download, Sparkles, BarChart3, Clock, GitCompare,
  FileText, LayoutGrid, Target, Quote, Lightbulb, Keyboard,
} from 'lucide-react';
import { fetchTemplateBlocks, type Template, type TemplateBlock } from '@/lib/templates';
import { chunkTemplateBlocks } from '@/lib/template-slides';
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

// Block type display info
const BLOCK_DISPLAY: Record<string, { icon: typeof BarChart3; label: string }> = {
  chart_block: { icon: BarChart3, label: 'Chart' },
  kpi_dashboard: { icon: BarChart3, label: 'KPI Dashboard' },
  timeline_block: { icon: Clock, label: 'Timeline' },
  comparison_table: { icon: GitCompare, label: 'Comparison Table' },
  flow_diagram: { icon: GitCompare, label: 'Flow Diagram' },
  stat_block: { icon: Target, label: 'Statistics' },
  quote_block: { icon: Quote, label: 'Quote' },
  card_grid: { icon: LayoutGrid, label: 'Card Grid' },
  exec_summary: { icon: FileText, label: 'Executive Summary' },
  hero_header: { icon: Sparkles, label: 'Hero Header' },
  three_pillars: { icon: LayoutGrid, label: 'Three Pillars' },
  framed_insight: { icon: Lightbulb, label: 'Insight' },
  two_by_two_matrix: { icon: LayoutGrid, label: '2×2 Matrix' },
  decision_summary: { icon: Target, label: 'Decision Summary' },
  recommendation_panel: { icon: Target, label: 'Recommendations' },
  scenario_set: { icon: LayoutGrid, label: 'Scenarios' },
  evidence_map: { icon: Target, label: 'Evidence Map' },
  tabs_block: { icon: LayoutGrid, label: 'Tabs' },
  toggle_block: { icon: LayoutGrid, label: 'Toggle' },
};

function getBlockBreakdown(blocks: TemplateBlock[]): { icon: typeof BarChart3; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const b of blocks) {
    if (BLOCK_DISPLAY[b.type]) {
      counts.set(b.type, (counts.get(b.type) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ ...BLOCK_DISPLAY[type], count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
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
  const [showKeyHint, setShowKeyHint] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const hasBrandKit = useMemo(() => {
    try { return !!localStorage.getItem('axiva_brand_kit'); }
    catch { return false; }
  }, []);

  useEffect(() => {
    if (!template || !open) return;
    setLoading(true);
    setCurrentSlide(0);
    setShowKeyHint(true);
    fetchTemplateBlocks(template.id)
      .then(setAllBlocks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [template?.id, open]);

  // Hide keyboard hint after first nav
  useEffect(() => {
    if (currentSlide > 0) setShowKeyHint(false);
  }, [currentSlide]);

  const slides = useMemo(() => chunkTemplateBlocks(allBlocks), [allBlocks]);
  const totalSlides = slides.length;
  const blockBreakdown = useMemo(() => getBlockBreakdown(allBlocks), [allBlocks]);
  const progressPercent = totalSlides > 0 ? ((currentSlide + 1) / totalSlides) * 100 : 0;

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0 && currentSlide < totalSlides - 1) goNext();
      else if (deltaX > 0 && currentSlide > 0) goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [currentSlide, totalSlides, goNext, goPrev]);

  if (!template) return null;

  const visualCat = inferVisualCategory(template.category, template.tags);
  const style = getCategoryStyle(visualCat);

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

  const slideTransformClass = isTransitioning
    ? slideDirection === 'right' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-7xl w-[96vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden border-border/50"
        style={{ ...brandStyles, backgroundColor: 'hsl(220 20% 3%)' }}
      >
        {/* Header — cinematic dark */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/30 shrink-0 bg-card/50">
          <div className="flex items-center gap-3 min-w-0">
            <Badge
              className="text-[10px] px-2.5 py-0.5 font-bold text-white border-0 shrink-0"
              style={{ backgroundColor: style.accent }}
            >
              {style.label}
            </Badge>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">{template.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Slide count badge */}
            {totalSlides > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{totalSlides}</span> Slides
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
              <Download className="h-3.5 w-3.5" />
              PPTX
            </div>
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

        {/* Progress bar */}
        {totalSlides > 1 && (
          <Progress value={progressPercent} className="h-0.5 rounded-none bg-border/20" />
        )}

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
              {/* Thumbnail strip — sidebar */}
              {!isMobile && totalSlides > 1 && (
                <div className="w-[140px] shrink-0 border-r border-border/20 overflow-y-auto py-3 px-2 flex flex-col gap-2 bg-card/30">
                  {slides.map((slideBlocks, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={cn(
                        'relative w-full aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0',
                        i === currentSlide
                          ? 'border-accent shadow-md ring-1 ring-accent/30'
                          : 'border-transparent hover:border-border opacity-50 hover:opacity-100'
                      )}
                    >
                      <div className="w-full h-full bg-card">
                        <TemplatePreview blocks={slideBlocks} className="shadow-none border-0 rounded-none" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-0.5">
                        <span className="text-[9px] text-white font-medium">{i + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Main slide area */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex items-center justify-center px-4 py-6 relative min-h-0">
                  {/* Keyboard hint */}
                  {showKeyHint && !isMobile && totalSlides > 1 && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border/30 text-[11px] text-muted-foreground animate-fade-in">
                      <Keyboard className="h-3 w-3" />
                      Use ← → to navigate
                    </div>
                  )}

                  {/* Prev arrow */}
                  {!isMobile && currentSlide > 0 && (
                    <button
                      onClick={goPrev}
                      className="absolute left-3 z-10 p-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 shadow-lg hover:bg-card transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                  )}

                  {/* Slide */}
                  <div className={cn(
                    'w-full max-w-4xl mx-auto transition-all duration-200 ease-out',
                    slideTransformClass
                  )}>
                    <TemplatePreview
                      blocks={slides[currentSlide]}
                      className="shadow-2xl shadow-black/30 ring-1 ring-white/5"
                    />
                  </div>

                  {/* Next arrow */}
                  {!isMobile && currentSlide < totalSlides - 1 && (
                    <button
                      onClick={goNext}
                      className="absolute right-3 z-10 p-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/30 shadow-lg hover:bg-card transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-foreground" />
                    </button>
                  )}
                </div>

                {/* What's Inside — below slide */}
                {blockBreakdown.length > 0 && (
                  <div className="px-6 pb-3 shrink-0">
                    <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">What's inside:</span>
                      {blockBreakdown.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/30 border border-border/20">
                            <Icon className="h-3 w-3 opacity-60" />
                            {item.count > 1 ? `${item.count}× ` : ''}{item.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
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
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/30 shrink-0 bg-card/50">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Templates
            </button>
            {totalSlides > 0 && (
              <span className="text-sm text-muted-foreground">
                Slide <span className="text-foreground font-medium">{currentSlide + 1}</span> of {totalSlides}
              </span>
            )}
          </div>

          {/* Slide dots */}
          {totalSlides > 1 && totalSlides <= 20 && (
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    'rounded-full transition-all duration-200',
                    i === currentSlide
                      ? 'w-6 h-2 bg-accent'
                      : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
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
