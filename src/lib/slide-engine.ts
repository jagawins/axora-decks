/**
 * Slide Engine
 * Groups blocks into logical slides for deck presentation
 */

import type { BlockType } from "@/lib/blocks";

export interface SlideBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

export interface ComputedSlide {
  index: number;
  title: string;
  blocks: SlideBlock[];
  sectionIndex?: number;
}

// Decision blocks should always appear in fixed order
const DECISION_BLOCK_ORDER = [
  "decision_summary",
  "evidence_map",
  "scenario_set",
  "recommendation_panel",
];

/**
 * Compute slides from blocks.
 * Strategy: each block is one slide (1:1 mapping).
 * Decision blocks are reordered to their canonical sequence.
 */
export function computeSlides(blocks: SlideBlock[]): ComputedSlide[] {
  if (!blocks.length) return [];

  // Separate decision blocks for reordering
  const decisionBlocks: SlideBlock[] = [];
  const otherBlocks: SlideBlock[] = [];

  for (const block of blocks) {
    if (DECISION_BLOCK_ORDER.includes(block.type)) {
      decisionBlocks.push(block);
    } else {
      otherBlocks.push(block);
    }
  }

  // Sort decision blocks by fixed order
  decisionBlocks.sort(
    (a, b) =>
      DECISION_BLOCK_ORDER.indexOf(a.type) -
      DECISION_BLOCK_ORDER.indexOf(b.type)
  );

  const ordered =
    decisionBlocks.length > 0
      ? [...decisionBlocks, ...otherBlocks]
      : blocks;

  return ordered.map((block, i) => ({
    index: i,
    title: extractSlideTitle(block),
    blocks: [block],
    sectionIndex: (block.content?.sectionIndex as number) ?? undefined,
  }));
}

function extractSlideTitle(block: SlideBlock): string {
  const c = block.content || {};

  // Try common title fields
  if (typeof c.title === "string" && c.title) return c.title;
  if (typeof c.headline === "string" && c.headline) return c.headline;
  if (block.type === "heading" && typeof c.text === "string") return c.text;

  // Fallback to type label
  return formatBlockType(block.type);
}

function formatBlockType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
