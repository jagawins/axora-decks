// Shared helpers used by both the generate-blocks edge function and frontend tests.
// Keep these in sync with supabase/functions/generate-blocks/index.ts.

export type SlideIntent = "data" | "strategy" | "decision" | "other";

export function classifySlideIntent(heading: string): SlideIntent {
  const h = heading.toLowerCase();
  // Check strategy BEFORE data to avoid "stat" in "strategic" matching data
  if (/pillar|framework|vision|approach|model|roadmap|strateg|priorit|principle|theme|focus|initiative|goal/i.test(h)) return "strategy";
  if (/recommend|decision|next.?step|action|conclude|conclusion|proposal|option|select|choose/i.test(h)) return "decision";
  if (/revenue|metric|performance|growth|result|stat|kpi|figure|number|cost|profit|loss|forecast|trend|data|rate|percent|roi|arr|mrr|q[1-4]\b|fy\d{2}/i.test(h)) return "data";
  return "other";
}

export const DATA_VISUAL_TYPES = ["chart_block", "stat_block", "comparison_table"] as const;
export const STRATEGY_VISUAL_TYPES = ["three_pillars", "two_by_two_matrix"] as const;
export const DECISION_VISUAL_TYPES = ["decision_next_steps"] as const;

export function enforceSlideCount(
  blocks: Array<{ type: string }>,
  targetSlideCount?: number
): { ok: boolean; error?: string } {
  if (!targetSlideCount) return { ok: true };
  const contentBlocks = blocks.filter(
    b => b.type !== "heading" && b.type !== "section_divider"
  );
  if (contentBlocks.length !== targetSlideCount) {
    return {
      ok: false,
      error: `Expected exactly ${targetSlideCount} content blocks, got ${contentBlocks.length}.`,
    };
  }
  return { ok: true };
}

export function enforceVisualDensity(
  blocks: Array<{ type: string }>,
  visualDensity?: "minimal" | "balanced" | "visual"
): { ok: boolean; error?: string } {
  if (!visualDensity) return { ok: true };

  const contentBlocks = blocks.filter(
    b => b.type !== "heading" && b.type !== "section_divider"
  );
  if (contentBlocks.length === 0) return { ok: true };

  const VISUAL_TYPES = new Set([
    "stat_block", "quote_block", "timeline_block", "comparison_table",
    "card_grid", "hero_header", "exec_summary", "cta_section",
    "icon_text_block", "framed_insight", "chart_block", "three_pillars",
    "two_by_two_matrix", "decision_next_steps",
  ]);

  const visualCount = contentBlocks.filter(b => VISUAL_TYPES.has(b.type)).length;
  const ratio = visualCount / contentBlocks.length;

  if (visualDensity === "minimal" && ratio < 0.15) {
    return { ok: false, error: `Too few visual blocks for minimal density` };
  }
  if (visualDensity === "balanced" && ratio < 0.35) {
    return { ok: false, error: `Too few visual blocks for balanced density` };
  }
  if (visualDensity === "visual" && ratio < 0.6) {
    return { ok: false, error: `Too few visual blocks for visual density` };
  }

  return { ok: true };
}

export function checkPerSlideIntentViolations(
  blocks: Array<{ type: string; content: Record<string, unknown> }>,
  outline: { sections: Array<{ heading: string; points: string[] }> }
): { sectionIndex: number; intent: string }[] {
  const violations: { sectionIndex: number; intent: string }[] = [];
  const blocksBySection = new Map<number, string[]>();

  for (const block of blocks) {
    const idx = block.content.sectionIndex as number | undefined;
    if (typeof idx !== "number") continue;
    if (!blocksBySection.has(idx)) blocksBySection.set(idx, []);
    blocksBySection.get(idx)!.push(block.type);
  }

  outline.sections.forEach((section, idx) => {
    const intent = classifySlideIntent(section.heading);
    if (intent === "other") return;
    const types = blocksBySection.get(idx) || [];

    if (intent === "data" && !DATA_VISUAL_TYPES.some(t => types.includes(t))) {
      violations.push({ sectionIndex: idx, intent });
    }
    if (intent === "strategy" && !STRATEGY_VISUAL_TYPES.some(t => types.includes(t))) {
      violations.push({ sectionIndex: idx, intent });
    }
    if (intent === "decision" && !DECISION_VISUAL_TYPES.some(t => types.includes(t))) {
      violations.push({ sectionIndex: idx, intent });
    }
  });

  return violations;
}

export function enforceDecisionMode(blocks: Array<{ type: string }>): { ok: boolean; error?: string } {
  const types = blocks.map(b => b.type);
  if (types.length < 3 || types.length > 4) {
    return { ok: false, error: `Decision mode requires 3-4 blocks, got ${types.length}` };
  }
  if (types[0] !== "decision_summary") {
    return { ok: false, error: `First block must be decision_summary` };
  }
  if (types[1] !== "evidence_map") {
    return { ok: false, error: `Second block must be evidence_map` };
  }
  if (types[types.length - 1] !== "recommendation_panel") {
    return { ok: false, error: `Last block must be recommendation_panel` };
  }
  return { ok: true };
}
