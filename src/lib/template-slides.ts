import type { TemplateBlock } from '@/lib/templates';

const SLIDE_START_TYPES = new Set(['heading', 'hero_header', 'section_divider', 'exec_summary']);
const FULL_SLIDE_TYPES = new Set([
  'hero_header',
  'exec_summary',
  'cta_section',
  'chart_block',
  'kpi_dashboard',
  'timeline_block',
  'comparison_table',
  'card_grid',
  'three_pillars',
  'two_by_two_matrix',
  'framed_insight',
  'flow_diagram',
  'relationship_matrix',
  'decision_summary',
  'scenario_set',
  'recommendation_panel',
  'evidence_map',
  'decision_next_steps',
]);

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return null;
}

function getSectionIndex(block: TemplateBlock): number | null {
  const blockMeta = (block.block_meta || {}) as Record<string, unknown>;
  const blockPayload = (block.block_payload || {}) as Record<string, unknown>;
  const content = ((block.content || {}) as Record<string, unknown>);

  return (
    toNumber(blockMeta.sectionIndex) ??
    toNumber(blockMeta.section_index) ??
    toNumber(blockPayload.sectionIndex) ??
    toNumber(blockPayload.section_index) ??
    toNumber(content.sectionIndex) ??
    toNumber(content.section_index)
  );
}

/**
 * Groups template blocks into logical slides.
 * Priority: explicit sectionIndex metadata -> heuristic fallback.
 */
export function chunkTemplateBlocks(blocks: TemplateBlock[]): TemplateBlock[][] {
  if (!blocks.length) return [];

  const sorted = [...blocks].sort((a, b) => a.order_index - b.order_index);

  console.debug('[chunkTemplateBlocks]', sorted.length, 'blocks. First block_meta:', JSON.stringify(sorted[0]?.block_meta), 'sectionIndex check:', sorted.map(b => {
    const bm = (b.block_meta || {}) as Record<string, unknown>;
    return bm.sectionIndex;
  }));

  // 1) Best signal: section index from block metadata/content
  const hasSectionMeta = sorted.some((b) => getSectionIndex(b) !== null);
  console.debug('[chunkTemplateBlocks] hasSectionMeta:', hasSectionMeta);
  if (hasSectionMeta) {
    const grouped = new Map<number, TemplateBlock[]>();
    let lastIndex = 0;

    for (const block of sorted) {
      const resolvedIndex = getSectionIndex(block) ?? lastIndex;
      lastIndex = resolvedIndex;

      if (!grouped.has(resolvedIndex)) grouped.set(resolvedIndex, []);
      grouped.get(resolvedIndex)!.push(block);
    }

    const result = Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([, slideBlocks]) => slideBlocks);
    console.debug('[chunkTemplateBlocks] sectionIndex result:', result.length, 'slides');
    return result;
  }

  // 2) Fallback heuristic for legacy templates
  const slides: TemplateBlock[][] = [];

  for (const block of sorted) {
    const current = slides[slides.length - 1];
    const startsSlide = SLIDE_START_TYPES.has(block.type);
    const isFullSlide = FULL_SLIDE_TYPES.has(block.type);

    if (!current) {
      slides.push([block]);
      continue;
    }

    if (startsSlide || isFullSlide || current.length >= 3) {
      slides.push([block]);
    } else {
      current.push(block);
    }
  }

  return slides;
}
