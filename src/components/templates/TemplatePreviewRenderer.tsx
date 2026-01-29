/**
 * Template Preview Renderer
 * Generates preview images using html-to-image.
 * Waits for fonts and images to load before capture.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Loader2 } from 'lucide-react';
import { type TemplateBlock } from '@/lib/templates';
import { VisualBlockRenderer } from '@/components/blocks';
import { cn } from '@/lib/utils';

// Design size for the slide (16:9 aspect ratio)
const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;

interface TemplatePreviewRendererProps {
  blocks: TemplateBlock[];
  themeId?: string;
  onPreviewGenerated?: (dataUrl: string) => void;
  className?: string;
}

/**
 * Renders a scaled-down 16:9 preview of template blocks.
 * Optionally generates a PNG image for caching.
 */
export function TemplatePreviewRenderer({
  blocks,
  themeId = 'classic',
  onPreviewGenerated,
  className = '',
}: TemplatePreviewRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasGenerated = useRef(false);
  
  // Show first 3 blocks in preview
  const previewBlocks = blocks.slice(0, 3);

  // Update scale on resize
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / DESIGN_WIDTH);
      }
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Generate preview image on first render
  const generatePreview = useCallback(async () => {
    if (!contentRef.current || hasGenerated.current || !onPreviewGenerated) {
      return;
    }

    hasGenerated.current = true;
    setIsGenerating(true);

    try {
      // Wait for fonts to load
      await document.fonts.ready;

      // Wait for any images to load
      const images = contentRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(null);
              } else {
                img.onload = () => resolve(null);
                img.onerror = () => resolve(null);
              }
            })
        )
      );

      // Small delay to ensure styles are applied
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Generate PNG
      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
      });

      onPreviewGenerated(dataUrl);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [onPreviewGenerated]);

  // Trigger generation when visible
  useEffect(() => {
    if (!onPreviewGenerated || hasGenerated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          generatePreview();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [generatePreview, onPreviewGenerated]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'aspect-[16/9] w-full rounded-xl border border-border bg-[var(--deck-bg,hsl(var(--card)))] overflow-hidden relative',
        className
      )}
    >
      {/* Scaled content container */}
      <div
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: `${DESIGN_WIDTH}px`,
          height: `${DESIGN_HEIGHT}px`,
          transform: `scale(${scale})`,
        }}
        data-theme={themeId}
      >
        <div className="w-full h-full p-16 flex flex-col justify-center gap-8">
          {previewBlocks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[var(--deck-muted,hsl(var(--muted-foreground)))] text-4xl">
              Empty template
            </div>
          ) : (
            previewBlocks.map((block, index) => (
              <VisualBlockRenderer
                key={block.id || index}
                block={block}
                readOnly
              />
            ))
          )}
        </div>
      </div>

      {/* Generation overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      )}
    </div>
  );
}
