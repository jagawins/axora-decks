import { toPng } from 'html-to-image';
import type { TemplateBlock } from '@/lib/templates';

const CACHE_PREFIX = 'axora:tpl:preview:';

/**
 * Get cached preview URL from localStorage
 */
export function getCachedPreview(templateId: string): string | null {
  try {
    return localStorage.getItem(`${CACHE_PREFIX}${templateId}`);
  } catch {
    return null;
  }
}

/**
 * Cache preview URL to localStorage
 */
export function cachePreview(templateId: string, dataUrl: string): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${templateId}`, dataUrl);
  } catch (e) {
    // localStorage quota exceeded or unavailable
    console.warn('Failed to cache preview:', e);
  }
}

/**
 * Generate preview image from a DOM element
 */
export async function generatePreviewFromElement(
  element: HTMLElement,
  templateId: string
): Promise<string> {
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#0a0a0a', // Match dark theme background
    });
    
    // Cache the generated preview
    cachePreview(templateId, dataUrl);
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate preview:', error);
    throw error;
  }
}

/**
 * Clear all cached previews
 */
export function clearPreviewCache(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // Ignore errors
  }
}

/**
 * Get preview label for a block (used in import preview)
 */
export function getBlockPreviewLabel(block: TemplateBlock): string {
  const content = block.content as Record<string, unknown>;
  
  switch (block.type) {
    case 'heading':
      return (content.text as string) || 'Heading';
    case 'text':
      const text = (content.text as string) || '';
      return text.length > 50 ? `${text.slice(0, 50)}...` : text || 'Text block';
    case 'list':
      const items = (content.items as string[]) || [];
      return items.length > 0 ? `List: ${items[0]}...` : 'List';
    case 'callout':
      return (content.text as string) || 'Callout';
    case 'table':
      const headers = (content.headers as string[]) || [];
      return headers.length > 0 ? `Table: ${headers.join(', ')}` : 'Table';
    case 'two_col':
      return 'Two Column Layout';
    case 'image':
      return (content.alt as string) || 'Image';
    default:
      return block.type;
  }
}
