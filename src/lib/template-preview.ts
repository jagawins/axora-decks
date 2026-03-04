/**
 * Legacy template preview utilities
 * @deprecated Use template-preview-cache.ts for IndexedDB-based caching
 */

import { toPng } from 'html-to-image';
import type { TemplateBlock, BlockPayload } from '@/lib/templates';

const CACHE_PREFIX = 'axiva:tpl:preview:';

/**
 * Get cached preview URL from localStorage
 * @deprecated Use getCachedPreview from template-preview-cache.ts
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
 * @deprecated Use cachePreview from template-preview-cache.ts
 */
export function cachePreview(templateId: string, dataUrl: string): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${templateId}`, dataUrl);
  } catch (e) {
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
      backgroundColor: '#0a0a0a',
    });
    
    cachePreview(templateId, dataUrl);
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate preview:', error);
    throw error;
  }
}

/**
 * Clear all cached previews from localStorage
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
 * Get payload from block, handling both new and legacy formats
 */
function getPayload(block: TemplateBlock): BlockPayload {
  return block.block_payload || (block.content as BlockPayload) || {};
}

/**
 * Get preview label for a block (used in import preview)
 */
export function getBlockPreviewLabel(block: TemplateBlock): string {
  const payload = getPayload(block);
  
  switch (block.type) {
    case 'heading':
      return payload.text || 'Heading';
    case 'text':
      const text = payload.text || '';
      return text.length > 50 ? `${text.slice(0, 50)}...` : text || 'Text block';
    case 'list':
      const items = payload.items || [];
      return items.length > 0 ? `List: ${items[0]}...` : 'List';
    case 'callout':
      return payload.text || 'Callout';
    case 'table':
      const headers = payload.headers || [];
      return headers.length > 0 ? `Table: ${headers.join(', ')}` : 'Table';
    case 'two_col':
      return 'Two Column Layout';
    case 'image':
      return payload.alt || payload.prompt || 'Image';
    default:
      return block.type;
  }
}
