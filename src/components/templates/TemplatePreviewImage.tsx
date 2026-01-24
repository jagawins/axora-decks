import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { type TemplateBlock } from '@/lib/templates';
import { getCachedPreview, cachePreview } from '@/lib/template-preview-cache';
import { TemplatePreviewRenderer } from './TemplatePreviewRenderer';
import { cn } from '@/lib/utils';

interface TemplatePreviewImageProps {
  templateId: string;
  templateVersion?: number;
  themeId?: string;
  previewUrl?: string | null;
  blocks: TemplateBlock[];
  className?: string;
}

/**
 * Displays a template preview image.
 * Priority: 1) previewUrl prop, 2) IndexedDB cache, 3) Generate on-demand
 */
export function TemplatePreviewImage({
  templateId,
  templateVersion = 1,
  themeId = 'classic',
  previewUrl,
  blocks,
  className = '',
}: TemplatePreviewImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check cache on mount
  useEffect(() => {
    let cancelled = false;

    async function checkCache() {
      setIsLoading(true);
      setHasError(false);
      
      // Priority 1: Use provided previewUrl
      if (previewUrl) {
        setImageUrl(previewUrl);
        setIsLoading(false);
        return;
      }

      // Priority 2: Check IndexedDB cache
      try {
        const cached = await getCachedPreview(templateId, templateVersion, themeId);
        if (cancelled) return;
        
        if (cached) {
          setImageUrl(cached);
          setIsLoading(false);
          return;
        }
      } catch {
        // Cache error, fall through to generation
      }

      // Priority 3: Need to generate
      if (!cancelled) {
        setShouldGenerate(true);
        setIsLoading(false);
      }
    }

    checkCache();
    return () => {
      cancelled = true;
    };
  }, [templateId, templateVersion, themeId, previewUrl]);

  // Handle preview generation callback
  const handlePreviewGenerated = async (dataUrl: string) => {
    if (!mountedRef.current) return;
    
    setImageUrl(dataUrl);
    setShouldGenerate(false);
    
    // Cache the generated preview
    try {
      await cachePreview(templateId, templateVersion, themeId, dataUrl);
    } catch {
      // Cache error, preview still works
    }
  };

  // If we have an image URL, show it
  if (imageUrl && !hasError) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-xl overflow-hidden", className)}>
        <img
          src={imageUrl}
          alt="Template preview"
          className="w-full h-full object-cover"
          onError={() => {
            setHasError(true);
            setImageUrl(null);
            setShouldGenerate(true);
          }}
        />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("relative aspect-video bg-muted rounded-xl overflow-hidden flex items-center justify-center", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Need to generate preview
  if (shouldGenerate) {
    return (
      <TemplatePreviewRenderer
        blocks={blocks}
        themeId={themeId}
        onPreviewGenerated={handlePreviewGenerated}
        className={className}
      />
    );
  }

  // Fallback: render live preview without generation
  return (
    <TemplatePreviewRenderer
      blocks={blocks}
      themeId={themeId}
      className={className}
    />
  );
}
