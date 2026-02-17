/**
 * Visual Layout Pass
 * Transforms verbose/text-heavy blocks into visual layouts.
 * Runs after generation or on-demand via "Make it Visual" button.
 */

import type { Block, BlockType } from './blocks';
import { extractRawText } from './blocks';
import { invokeFunction } from './supabase-function-client';

// ============================================
// DETECTION HELPERS
// ============================================

function countWords(block: Block): number {
  const lines = extractRawText(block);
  return lines.join(' ').split(/\s+/).filter(Boolean).length;
}

function countBullets(block: Block): number {
  if (block.type === 'list') {
    return Array.isArray(block.content.items) ? (block.content.items as string[]).length : 0;
  }
  return 0;
}

function indicatesPlan(block: Block): boolean {
  const text = extractRawText(block).join(' ').toLowerCase();
  return /\b(plan|roadmap|timeline|phase|milestone|quarter|q[1-4]|schedule|rollout|launch)\b/.test(text);
}

function indicatesStrategy(block: Block): boolean {
  const text = extractRawText(block).join(' ').toLowerCase();
  return /\b(strategy|approach|framework|pillars?|principles?|foundation|methodology)\b/.test(text);
}

function indicatesComparison(block: Block): boolean {
  const text = extractRawText(block).join(' ').toLowerCase();
  return /\b(vs\.?|versus|compare|comparison|advantages?|disadvantages?|pros?\b|cons?\b|options?|alternatives?)\b/.test(text);
}

function indicatesDecision(block: Block): boolean {
  const text = extractRawText(block).join(' ').toLowerCase();
  return /\b(decide|decision|recommend|next\s*steps?|action\s*items?|go[\s/-]no[\s/-]go)\b/.test(text);
}

function indicatesProblem(block: Block): boolean {
  const text = extractRawText(block).join(' ').toLowerCase();
  return /\b(risk|challenge|issue|gap|threat|obstacle|blocker|problem|weakness)\b/.test(text);
}

function hasNumbers(block: Block): boolean {
  const text = extractRawText(block).join(' ');
  return /(\d+%|\$[\d,]+|\d+x|\d+\s*(million|billion|k|m)\b)/i.test(text);
}

function isVisualType(type: BlockType): boolean {
  return ![
    'text', 'heading', 'list', 'callout',
  ].includes(type);
}

// ============================================
// NUMERIC DATA EXTRACTION
// ============================================

interface DataPoint {
  label: string;
  value: number;
}

const TIME_LABEL_RE = /\b(Q[1-4]|20\d{2}|19\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\b/i;

function extractNumericData(block: Block): DataPoint[] {
  const lines = extractRawText(block);
  const points: DataPoint[] = [];

  for (const line of lines) {
    // Match patterns like "Q1 2024: $1.2M" or "Revenue: 45%" or "Sales 500k"
    const numMatch = line.match(/(\$?[\d,]+\.?\d*)\s*([%kmbKMB]?)/);
    if (numMatch) {
      let value = parseFloat(numMatch[1].replace(/,/g, ''));
      const suffix = numMatch[2].toLowerCase();
      if (suffix === 'k') value *= 1000;
      else if (suffix === 'm') value *= 1000000;
      else if (suffix === 'b') value *= 1000000000;

      const label = line
        .replace(numMatch[0], '')
        .replace(/^[-:•*,\s]+/, '')
        .replace(/[-:•*,\s]+$/, '')
        .trim() || `Point ${points.length + 1}`;

      if (label.length > 0 && points.length < 8) {
        points.push({ label: label.slice(0, 30), value });
      }
    }
  }
  return points;
}

function hasTimeLabels(dataPoints: DataPoint[]): boolean {
  return dataPoints.some((d) => TIME_LABEL_RE.test(d.label));
}

// ============================================
// CONVERSION FUNCTIONS
// ============================================

function convertToChart(block: Block): Block[] {
  const dataPoints = extractNumericData(block);
  if (dataPoints.length < 3) return convertToStats(block);

  const chartType = hasTimeLabels(dataPoints) ? 'line' : 'bar';
  const lines = extractRawText(block);
  const title = lines[0] && lines[0].length < 60 ? lines[0] : undefined;

  return [{
    ...block,
    type: 'chart_block' as BlockType,
    content: {
      chartType,
      data: dataPoints,
      title,
    },
  }];
}

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

  if (stats.length < 2) return [block];

  return [{
    ...block,
    type: 'stat_block' as BlockType,
    content: { stats },
  }];
}

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

function convertToThreePillars(block: Block): Block[] {
  const lines = extractRawText(block);
  const pillars = lines.slice(0, 3).map((line) => ({
    title: line.length > 40 ? line.slice(0, 37) + '…' : line,
    description: line.length > 40 ? line : undefined,
    icon: 'Target',
  }));

  if (pillars.length < 3) {
    while (pillars.length < 3) {
      pillars.push({ title: `Pillar ${pillars.length + 1}`, description: undefined, icon: 'Zap' });
    }
  }

  return [{
    ...block,
    type: 'three_pillars' as BlockType,
    content: {
      title: lines[0] && lines[0].length < 50 ? lines[0] : 'Strategic Pillars',
      pillars,
    },
  }];
}

function convertToDecisionBlock(block: Block): Block[] {
  const lines = extractRawText(block);
  const decision = lines[0] || 'Decision Required';
  const steps = lines.slice(1, 5).map((line) => ({
    action: line.length > 60 ? line.slice(0, 57) + '…' : line,
    priority: 'medium' as const,
  }));

  return [{
    ...block,
    type: 'decision_next_steps' as BlockType,
    content: {
      decision,
      next_steps: steps.length > 0 ? steps : [{ action: 'Define next steps', priority: 'high' as const }],
    },
  }];
}

function convertToComparisonTable(block: Block): Block[] {
  const lines = extractRawText(block);
  const title = lines[0] || 'Comparison';
  const items = lines.slice(1, 6);

  return [{
    ...block,
    type: 'comparison_table' as BlockType,
    content: {
      headers: ['Aspect', 'Option A', 'Option B'],
      rows: items.map((item) => ({
        label: item.length > 40 ? item.slice(0, 37) + '…' : item,
        values: ['—', '—'],
      })),
      title,
    },
  }];
}

function convertToProblemInsight(block: Block): Block[] {
  const lines = extractRawText(block);
  const insight = lines.join(' ').slice(0, 200);

  return [{
    ...block,
    type: 'framed_insight' as BlockType,
    content: {
      insight: insight || 'Risk identified',
      type: 'warning',
    },
  }];
}

// ============================================
// INTENT CLASSIFICATION
// ============================================

type Intent = 'strategy' | 'metrics' | 'timeline' | 'comparison' | 'decision' | 'problem' | 'generic';

function classifyIntent(block: Block): Intent {
  if (indicatesStrategy(block)) return 'strategy';
  if (hasNumbers(block)) return 'metrics';
  if (indicatesPlan(block)) return 'timeline';
  if (indicatesComparison(block)) return 'comparison';
  if (indicatesDecision(block)) return 'decision';
  if (indicatesProblem(block)) return 'problem';
  return 'generic';
}

// ============================================
// MAIN LAYOUT PASS
// ============================================

export function runVisualLayoutPass(blocks: Block[]): Block[] {
  const result: Block[] = [];

  for (const block of blocks) {
    // Skip already-visual blocks
    if (isVisualType(block.type)) {
      result.push(block);
      continue;
    }

    // Skip headings
    if (block.type === 'heading') {
      result.push(block);
      continue;
    }

    const wordCount = countWords(block);
    const bulletCount = countBullets(block);

    // Classify intent
    const intent = classifyIntent(block);

    switch (intent) {
      case 'metrics': {
        result.push(...convertToChart(block));
        continue;
      }
      case 'strategy': {
        result.push(...convertToThreePillars(block));
        continue;
      }
      case 'timeline': {
        result.push(...convertToTimeline(block));
        continue;
      }
      case 'comparison': {
        result.push(...convertToComparisonTable(block));
        continue;
      }
      case 'decision': {
        result.push(...convertToDecisionBlock(block));
        continue;
      }
      case 'problem': {
        result.push(...convertToProblemInsight(block));
        continue;
      }
    }

    // Generic fallback rules
    if (wordCount > 70 && block.type === 'text') {
      result.push(...convertToCardGrid(block));
      continue;
    }

    if (bulletCount > 6) {
      result.push(...compressList(block));
      continue;
    }

    result.push(block);
  }

  // Enforce at least 40% visual blocks
  const totalBlocks = result.length;
  const visualCount = result.filter((b) => isVisualType(b.type)).length;
  const visualRatio = totalBlocks > 0 ? visualCount / totalBlocks : 0;

  if (visualRatio < 0.4 && totalBlocks >= 3) {
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

// ============================================
// DECK VARIETY CHECK
// ============================================

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

// ============================================
// AI HERO IMAGE ENRICHMENT (async, max 1 per deck)
// ============================================

export async function enrichHeroImage(blocks: Block[]): Promise<Block[]> {
  const heroIndex = blocks.findIndex((b) => b.type === 'hero_header');
  if (heroIndex === -1) return blocks;

  const hero = blocks[heroIndex];
  const heading = (hero.content.heading as string) || '';
  if (!heading || heading.length < 5) return blocks;

  // Skip if already has an image
  const existingImage = hero.content.image as { src?: string } | undefined;
  if (existingImage?.src) return blocks;

  const prompt = `Minimalist corporate illustration representing "${heading}". Clean, abstract, no text, white background, professional.`;

  try {
    const response = await invokeFunction<{ images?: Array<{ src?: string }> }>('resolve-images', {
      images: [{ blockIndex: 0, query: prompt, alt: heading }],
      mode: 'ai',
    });

    if (response.data?.images?.[0]?.src) {
      const updated = [...blocks];
      updated[heroIndex] = {
        ...hero,
        content: {
          ...hero.content,
          image: { src: response.data.images[0].src, prompt, alt: heading },
        },
      };
      return updated;
    }
  } catch (err) {
    console.warn('[enrichHeroImage] Failed to generate hero image:', err);
  }

  return blocks;
}
