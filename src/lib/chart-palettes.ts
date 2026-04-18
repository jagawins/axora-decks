/**
 * Chart Palette Library
 * Vibrant, Gamma/Napkin-inspired color systems for visual blocks.
 * Each palette is curated to be accessible (WCAG AA on dark and light backgrounds)
 * and to feel editorial — not the default Recharts teal.
 */

export interface ChartPalette {
  id: string;
  name: string;
  /** Short tag shown in pickers, e.g. "Warm", "Cool", "Mono" */
  mood: string;
  /** Ordered list of HEX colors used for series */
  colors: string[];
}

export const CHART_PALETTES: ChartPalette[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    mood: 'Warm',
    colors: ['#f97316', '#f43f5e', '#ec4899', '#a855f7', '#6366f1'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    mood: 'Cool',
    colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#3b82f6'],
  },
  {
    id: 'forest',
    name: 'Forest',
    mood: 'Natural',
    colors: ['#10b981', '#84cc16', '#eab308', '#f59e0b', '#22c55e'],
  },
  {
    id: 'berry',
    name: 'Berry',
    mood: 'Vibrant',
    colors: ['#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#8b5cf6'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    mood: 'Considered',
    colors: ['#1e293b', '#475569', '#0ea5e9', '#f59e0b', '#dc2626'],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    mood: 'Soft',
    colors: ['#a5b4fc', '#fda4af', '#fcd34d', '#86efac', '#7dd3fc'],
  },
  {
    id: 'mono-blue',
    name: 'Mono Blue',
    mood: 'Focused',
    colors: ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
  },
  {
    id: 'corporate',
    name: 'Corporate',
    mood: 'Professional',
    colors: ['#1e3a8a', '#0891b2', '#0d9488', '#475569', '#64748b'],
  },
];

export const DEFAULT_PALETTE_ID = 'ocean';

export function getPalette(id?: string): ChartPalette {
  if (!id) return CHART_PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!;
  return CHART_PALETTES.find((p) => p.id === id) ?? CHART_PALETTES[0];
}

/**
 * Pick a palette deterministically from a seed (e.g. slide index or block id).
 * Skips muted "editorial" / "mono" palettes for variety on auto-pick.
 */
export function autoPalette(seed: number | string): ChartPalette {
  const vibrant = CHART_PALETTES.filter(
    (p) => !['editorial', 'mono-blue', 'corporate'].includes(p.id),
  );
  const n =
    typeof seed === 'number'
      ? seed
      : Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return vibrant[Math.abs(n) % vibrant.length];
}
