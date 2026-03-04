/**
 * Template Preview Cache System
 * Uses IndexedDB for binary storage and localStorage for metadata pointers.
 */

import { getPreviewCacheKey, RENDERER_VERSION } from './templates';

const DB_NAME = 'axiva-previews';
const DB_VERSION = 1;
const STORE_NAME = 'previews';

// Metadata stored in localStorage
interface PreviewMetadata {
  templateId: string;
  templateVersion: number;
  themeId: string;
  rendererVersion: number;
  cachedAt: number;
}

const METADATA_PREFIX = 'axiva:preview:meta:';

// =============================================================================
// IndexedDB Operations
// =============================================================================

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });

  return dbPromise;
}

async function getFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function saveToIndexedDB(key: string, data: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put({ key, data });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Failed to save to IndexedDB:', e);
  }
}

async function deleteFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore errors
  }
}

// =============================================================================
// Metadata Operations (localStorage)
// =============================================================================

function getMetadataKey(templateId: string): string {
  return `${METADATA_PREFIX}${templateId}`;
}

function getMetadata(templateId: string): PreviewMetadata | null {
  try {
    const json = localStorage.getItem(getMetadataKey(templateId));
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

function setMetadata(templateId: string, meta: PreviewMetadata): void {
  try {
    localStorage.setItem(getMetadataKey(templateId), JSON.stringify(meta));
  } catch {
    // Quota exceeded
  }
}

function deleteMetadata(templateId: string): void {
  try {
    localStorage.removeItem(getMetadataKey(templateId));
  } catch {
    // Ignore
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get cached preview image from local cache
 */
export async function getCachedPreview(
  templateId: string,
  templateVersion: number,
  themeId: string
): Promise<string | null> {
  // Check metadata first
  const meta = getMetadata(templateId);
  
  if (!meta) return null;
  
  // Validate cache is still valid
  if (
    meta.templateVersion !== templateVersion ||
    meta.themeId !== themeId ||
    meta.rendererVersion !== RENDERER_VERSION
  ) {
    // Cache is stale, clean up
    const oldKey = getPreviewCacheKey(meta.templateId, meta.templateVersion, meta.themeId);
    await deleteFromIndexedDB(oldKey);
    deleteMetadata(templateId);
    return null;
  }

  // Get from IndexedDB
  const key = getPreviewCacheKey(templateId, templateVersion, themeId);
  return getFromIndexedDB(key);
}

/**
 * Save preview image to local cache
 */
export async function cachePreview(
  templateId: string,
  templateVersion: number,
  themeId: string,
  imageBase64: string
): Promise<void> {
  const key = getPreviewCacheKey(templateId, templateVersion, themeId);
  
  // Save to IndexedDB
  await saveToIndexedDB(key, imageBase64);
  
  // Save metadata
  setMetadata(templateId, {
    templateId,
    templateVersion,
    themeId,
    rendererVersion: RENDERER_VERSION,
    cachedAt: Date.now(),
  });
}

/**
 * Invalidate cache for a specific template
 */
export async function invalidatePreviewCache(templateId: string): Promise<void> {
  const meta = getMetadata(templateId);
  if (meta) {
    const key = getPreviewCacheKey(meta.templateId, meta.templateVersion, meta.themeId);
    await deleteFromIndexedDB(key);
    deleteMetadata(templateId);
  }
}

/**
 * Clear all cached previews
 */
export async function clearAllPreviewCache(): Promise<void> {
  try {
    // Clear IndexedDB
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    // Clear metadata from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(METADATA_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // Ignore errors
  }
}

/**
 * Check if a valid cache exists for a template
 */
export function hasCachedPreview(
  templateId: string,
  templateVersion: number,
  themeId: string
): boolean {
  const meta = getMetadata(templateId);
  
  return !!(
    meta &&
    meta.templateVersion === templateVersion &&
    meta.themeId === themeId &&
    meta.rendererVersion === RENDERER_VERSION
  );
}
