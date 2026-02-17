/**
 * Visual Layout Pass
 * Transforms verbose/text-heavy blocks into visual layouts.
 * Runs after generation or on-demand via "Make it Visual" button.
 */

import type { Block, BlockType } from './blocks';
import { extractRawText } from './blocks';

/**
 * Count words in a block's content
 */
function countWords(block: Block): number {
  const lines = extractRawText(block);
  return lines.join(' ').split(/\s+/).filter(Boolean).length;
}

/**
 * Count bullet items in a block
 */
function countBullets(block: Block): number {
  if (block.type === 'list') {
    return Array.isArray(block.content.items) ? (block.content.items as string[]).length : 0;
  }
  return 0;
}

/**
 * Detect if content mentions planning/roadmap
 */
function indicatesPlan(block: Block): boolean {
  const text = extractRawText(block).join(' ').toLowerCase();
  return /\b(plan|roadmap|timeline|phase|milestone|quarter|q[1-4]|schedule|rollout|launch)\b/.test(text);
}

/**
 * Detect if content contains numbers/metrics
 */
function hasNumbers(block: Block): boolean {
  const text = extractRawText(block).join(' ');
  return /(\d+%|\$[\d,]+|\d+x|\d+\s*(million|billion|k|m)\b)/i.test(text);
}

/**
 * Check if a block type is non-paragraph (visual)
 */
function isVisualType(type: BlockType): boolean {
  return ![
    'text', 'heading', 'list', 'callout',
  ].includes(type);
}

/**
 * Transform a verbose text block into bullets + card_grid
 */
function convertToCardGrid(block: Block): Block[] {
  const lines = extractRawText(block);
  const title = lines[0] || 'Key Points';
  const points = lines.slice(1, 5);

  return [{
    ...block,
    type: 'card_grid' as BlockType,
    content: {
      title,
      cards: points.map((p) => ({
        title: p.length > 50 ? p.slice(0, 47) + '…' : p,
        description: p.length > 50 ? p : undefined,
        icon: 'Zap',
      })),
      columns: points.length <= 2 ? 2 : 3,
    },
  }];
}

/**
 * Compress long list into 3 bullets + callout
 */
function compressList(block: Block): Block[] {
  const items = (block.content.items as string[] || []);
  const topThree = items.slice(0, 3);
  const remaining = items.length - 3;

  const listBlock: Block = {
    ...block,
    content: { items: topThree, ordered: block.content.ordered },
  };

  const calloutBlock: Block = {
    id: crypto.randomUUID(),
    type: 'framed_insight' as BlockType,
    content: {
      insight: `${remaining} additional points consolidated — focus on the top 3 priorities above.`,
      type: 'note',
    },
    order_index: block.order_index + 0.5,
  };

  return [listBlock, calloutBlock];
}

/**
 * Convert plan-like content to timeline
 */
function convertToTimeline(block: Block): Block[] {
  const lines = extractRawText(block);
  const events = lines.slice(0, 5).map((line, i) => ({
    date: `Step ${i + 1}`,
    title: line.length > 60 ? line.slice(0, 57) + '…' : line,
    status: i === 0 ? 'completed' as const : i === lines.length - 1 ? 'upcoming' as const : 'current' as const,
  }));

  return [{
    ...block,
    type: 'timeline_block' as BlockType,
    content: { events },
  }];
}

/**
 * Convert number-heavy content to stat_block
 */
function convertToStats(block: Block): Block[] {
  const lines = extractRawText(block);
  const stats: Array<{ value: string; label: string; trend?: string }> = [];

  for (const line of lines) {
    const numMatch = line.match(/(\$?[\d,]+\.?\d*[%kmbKMB]?)/);
    if (numMatch && stats.length < 4) {
      const value = numMatch[1];
      const label = line.replace(value, '').replace(/^[-:•*]\s*/, '').trim() || 'Metric';
      let trend: string | undefined;
      if (/\b(increase|up|grow|rise|gain)\b/i.test(line)) trend = 'up';
      else if (/\b(decrease|down|drop|fall|loss)\b/i.test(line)) trend = 'down';
      stats.push({ value, label, trend });
    }
  }

  if (stats.length < 2) return [block]; // Not enough numbers

  return [{
    ...block,
    type: 'stat_block' as BlockType,
    content: { stats },
  }];
}

/**
 * Run the visual layout pass on an array of blocks.
 * Returns a new array with transformed blocks.
 */
export function runVisualLayoutPass(blocks: Block[]): Block[] {
  const result: Block[] = [];

  for (const block of blocks) {
    // Skip already-visual blocks
    if (isVisualType(block.type)) {
      result.push(block);
      continue;
    }

    const wordCount = countWords(block);
    const bulletCount = countBullets(block);

    // Rule: numbers → stat_block
    if (hasNumbers(block) && block.type !== 'heading') {
      result.push(...convertToStats(block));
      continue;
    }

    // Rule: plan content → timeline
    if (indicatesPlan(block) && block.type !== 'heading') {
      result.push(...convertToTimeline(block));
      continue;
    }

    // Rule: >70 words → card grid
    if (wordCount > 70 && block.type === 'text') {
      result.push(...convertToCardGrid(block));
      continue;
    }

    // Rule: >6 bullets → compress
    if (bulletCount > 6) {
      result.push(...compressList(block));
      continue;
    }

    result.push(block);
  }

  // Ensure at least 40% visual blocks
  const totalBlocks = result.length;
  const visualCount = result.filter((b) => isVisualType(b.type)).length;
  const visualRatio = totalBlocks > 0 ? visualCount / totalBlocks : 0;

  if (visualRatio < 0.4 && totalBlocks >= 3) {
    // Convert remaining text blocks to card_grid until we hit 40%
    const needed = Math.ceil(totalBlocks * 0.4) - visualCount;
    let converted = 0;
    for (let i = 0; i < result.length && converted < needed; i++) {
      if (result[i].type === 'text' && countWords(result[i]) > 20) {
        const cards = convertToCardGrid(result[i]);
        result.splice(i, 1, ...cards);
        converted++;
      }
    }
  }

  // Re-index
  return result.map((b, i) => ({ ...b, order_index: i }));
}

/**
 * Check if a generated deck has required variety types.
 * Returns missing types that should be injected.
 */
export function checkDeckVariety(blocks: Block[]): BlockType[] {
  const types = new Set(blocks.map((b) => b.type));
  const required: BlockType[] = [
    'hero_header',
    'three_pillars' as BlockType,
    'stat_block',
    'timeline_block',
  ];
  return required.filter((t) => !types.has(t));
}
