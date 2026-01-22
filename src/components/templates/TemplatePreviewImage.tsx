import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { TemplateBlock } from '@/lib/templates';
import { getCachedPreview, generatePreviewFromElement } from '@/lib/template-preview';
import { TemplatePreview } from './TemplatePreview';
import { cn } from '@/lib/utils';

interface TemplatePreviewImageProps {
  templateId: string;
  previewUrl?: string | null;
  blocks: TemplateBlock[];
  className?: string;
}

export function TemplatePreviewImage({
  templateId,
  previewUrl,
  blocks,
  className = '',
}: TemplatePreviewImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const hasAttemptedGeneration = useRef(false);

  useEffect(() => {
    // Reset state when templateId changes
    hasAttemptedGeneration.current = false;
    setHasError(false);
    
    // Priority 1: Use provided previewUrl
    if (previewUrl) {
      setImageUrl(previewUrl);
      return;
    }

    // Priority 2: Check localStorage cache
    const cached = getCachedPreview(templateId);
    if (cached) {
      setImageUrl(cached);
      return;
    }

    // Priority 3: Will generate on first view (handled by IntersectionObserver below)
    setImageUrl(null);
  }, [templateId, previewUrl]);

  // Generate preview on first view using IntersectionObserver
  useEffect(() => {
    if (imageUrl || hasAttemptedGeneration.current || !previewRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAttemptedGeneration.current) {
          hasAttemptedGeneration.current = true;
          observer.disconnect();
          
          // Wait for render to complete
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (previewRef.current) {
            setIsGenerating(true);
            try {
              const dataUrl = await generatePreviewFromElement(previewRef.current, templateId);
              setImageUrl(dataUrl);
            } catch {
              setHasError(true);
            } finally {
              setIsGenerating(false);
            }
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [templateId, imageUrl, blocks]);

  // If we have a cached/provided image, show it
  if (imageUrl && !hasError) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-lg overflow-hidden", className)}>
        <img
          src={imageUrl}
          alt="Template preview"
          className="w-full h-full object-cover"
          onError={() => {
            setHasError(true);
            setImageUrl(null);
          }}
        />
      </div>
    );
  }

  // Show the live preview (which will be captured for caching)
  return (
    <div ref={previewRef} className={cn("relative", className)}>
      <TemplatePreview blocks={blocks} className="border-0" />
      
      {isGenerating && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      )}
    </div>
  );
}
