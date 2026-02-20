import { describe, it, expect } from "vitest";

// ─── Intent Classification (mirrors generate-blocks logic) ───

type SlideIntent = "data" | "strategy" | "decision" | "other";

function classifySlideIntent(heading: string): SlideIntent {
  const h = heading.toLowerCase();
  // Check strategy BEFORE data to avoid "stat" in "strategic" matching data
  if (/pillar|framework|vision|approach|model|roadmap|strateg|priorit|principle|theme|focus|initiative|goal/i.test(h)) return "strategy";
  // Check decision before data to avoid "action plan" matching strategy's "plan"
  if (/recommend|decision|next.?step|action|conclude|conclusion|proposal|option|select|choose/i.test(h)) return "decision";
  if (/revenue|metric|performance|growth|result|stat|kpi|figure|number|cost|profit|loss|forecast|trend|data|rate|percent|roi|arr|mrr|q[1-4]\b|fy\d{2}/i.test(h)) return "data";
  return "other";
}

describe("classifySlideIntent", () => {
  it.each([
    ["Q3 Revenue Trends", "data"],
    ["Key Performance Metrics", "data"],
    ["Growth Forecast 2025", "data"],
    ["Cost Analysis", "data"],
    ["ROI Summary", "data"],
    ["Strategic Pillars", "strategy"],
    ["Our Framework for Innovation", "strategy"],
    ["Vision & Roadmap", "strategy"],
    ["Key Priorities", "strategy"],
    ["Recommended Next Steps", "decision"],
    ["Decision Matrix", "decision"],
    ["Action Plan", "decision"],
    ["Proposal Options", "decision"],
    ["Team Introduction", "other"],
    ["About Our Company", "other"],
    ["Thank You", "other"],
  ])('classifies "%s" as %s', (heading, expected) => {
    expect(classifySlideIntent(heading)).toBe(expected);
  });
});

// ─── Slide Count Enforcement ───

function enforceSlideCount(
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

describe("enforceSlideCount", () => {
  it("passes when no target specified", () => {
    expect(enforceSlideCount([], undefined).ok).toBe(true);
  });

  it("passes when count matches", () => {
    const blocks = [
      { type: "hero_header" },
      { type: "section_divider" },
      { type: "stat_block" },
      { type: "heading" },
      { type: "chart_block" },
      { type: "text" },
      { type: "cta_section" },
      { type: "list" },
    ];
    // content blocks = hero_header, stat_block, chart_block, text, cta_section, list = 6
    // heading and section_divider excluded
    expect(enforceSlideCount(blocks, 6).ok).toBe(true);
  });

  it("fails when count mismatches", () => {
    const blocks = [
      { type: "text" },
      { type: "text" },
      { type: "text" },
    ];
    const result = enforceSlideCount(blocks, 5);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Expected exactly 5");
  });
});

// ─── Visual Density Enforcement ───

function enforceVisualDensity(
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

describe("enforceVisualDensity", () => {
  it("passes with no density set", () => {
    expect(enforceVisualDensity([{ type: "text" }], undefined).ok).toBe(true);
  });

  it("passes minimal with 1/5 visual", () => {
    const blocks = [
      { type: "chart_block" },
      { type: "text" },
      { type: "text" },
      { type: "text" },
      { type: "text" },
    ];
    expect(enforceVisualDensity(blocks, "minimal").ok).toBe(true);
  });

  it("fails minimal with 0 visuals", () => {
    const blocks = Array(5).fill({ type: "text" });
    expect(enforceVisualDensity(blocks, "minimal").ok).toBe(false);
  });

  it("passes balanced with 50% visual", () => {
    const blocks = [
      { type: "chart_block" },
      { type: "stat_block" },
      { type: "three_pillars" },
      { type: "text" },
      { type: "list" },
      { type: "text" },
    ];
    expect(enforceVisualDensity(blocks, "balanced").ok).toBe(true);
  });

  it("fails balanced with only 20% visual", () => {
    const blocks = [
      { type: "chart_block" },
      { type: "text" },
      { type: "text" },
      { type: "text" },
      { type: "text" },
    ];
    expect(enforceVisualDensity(blocks, "balanced").ok).toBe(false);
  });

  it("passes visual with 80% visual", () => {
    const blocks = [
      { type: "chart_block" },
      { type: "stat_block" },
      { type: "three_pillars" },
      { type: "hero_header" },
      { type: "text" },
    ];
    expect(enforceVisualDensity(blocks, "visual").ok).toBe(true);
  });

  it("fails visual with 40% visual", () => {
    const blocks = [
      { type: "chart_block" },
      { type: "stat_block" },
      { type: "text" },
      { type: "text" },
      { type: "text" },
    ];
    expect(enforceVisualDensity(blocks, "visual").ok).toBe(false);
  });

  it("excludes heading and section_divider from ratio", () => {
    const blocks = [
      { type: "heading" },
      { type: "section_divider" },
      { type: "chart_block" },
      { type: "text" },
    ];
    // content blocks: chart_block + text = 2, visual = 1, ratio = 50%
    expect(enforceVisualDensity(blocks, "balanced").ok).toBe(true);
  });
});

// ─── Per-Slide Intent Violations ───

const DATA_VISUAL_TYPES = ["chart_block", "stat_block", "comparison_table"];
const STRATEGY_VISUAL_TYPES = ["three_pillars", "two_by_two_matrix"];
const DECISION_VISUAL_TYPES = ["decision_next_steps"];

function checkPerSlideIntentViolations(
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

describe("checkPerSlideIntentViolations", () => {
  const outline = {
    sections: [
      { heading: "Revenue Performance", points: ["p1"] },
      { heading: "Strategic Pillars", points: ["p2"] },
      { heading: "Recommended Next Steps", points: ["p3"] },
      { heading: "Team Overview", points: ["p4"] },
    ],
  };

  it("passes when all intents satisfied", () => {
    const blocks = [
      { type: "chart_block", content: { sectionIndex: 0 } },
      { type: "three_pillars", content: { sectionIndex: 1 } },
      { type: "decision_next_steps", content: { sectionIndex: 2 } },
      { type: "text", content: { sectionIndex: 3 } },
    ];
    expect(checkPerSlideIntentViolations(blocks, outline)).toHaveLength(0);
  });

  it("reports violations for missing visual blocks", () => {
    const blocks = [
      { type: "text", content: { sectionIndex: 0 } },
      { type: "list", content: { sectionIndex: 1 } },
      { type: "text", content: { sectionIndex: 2 } },
      { type: "text", content: { sectionIndex: 3 } },
    ];
    const violations = checkPerSlideIntentViolations(blocks, outline);
    expect(violations).toHaveLength(3);
    expect(violations[0]).toEqual({ sectionIndex: 0, intent: "data" });
    expect(violations[1]).toEqual({ sectionIndex: 1, intent: "strategy" });
    expect(violations[2]).toEqual({ sectionIndex: 2, intent: "decision" });
  });

  it("accepts alternative visual types for data slides", () => {
    const blocks = [
      { type: "stat_block", content: { sectionIndex: 0 } },
      { type: "two_by_two_matrix", content: { sectionIndex: 1 } },
      { type: "decision_next_steps", content: { sectionIndex: 2 } },
    ];
    expect(checkPerSlideIntentViolations(blocks, outline)).toHaveLength(0);
  });

  it("ignores 'other' intent slides", () => {
    const blocks = [
      { type: "chart_block", content: { sectionIndex: 0 } },
      { type: "three_pillars", content: { sectionIndex: 1 } },
      { type: "decision_next_steps", content: { sectionIndex: 2 } },
      // No visual block for section 3, but it's "other" intent
    ];
    expect(checkPerSlideIntentViolations(blocks, outline)).toHaveLength(0);
  });
});

// ─── Decision Mode Enforcement ───

function enforceDecisionMode(blocks: Array<{ type: string }>): { ok: boolean; error?: string } {
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

describe("enforceDecisionMode", () => {
  it("passes with 4 correct blocks", () => {
    const blocks = [
      { type: "decision_summary" },
      { type: "evidence_map" },
      { type: "scenario_set" },
      { type: "recommendation_panel" },
    ];
    expect(enforceDecisionMode(blocks).ok).toBe(true);
  });

  it("passes with 3 blocks (no scenario_set)", () => {
    const blocks = [
      { type: "decision_summary" },
      { type: "evidence_map" },
      { type: "recommendation_panel" },
    ];
    expect(enforceDecisionMode(blocks).ok).toBe(true);
  });

  it("fails with wrong order", () => {
    const blocks = [
      { type: "evidence_map" },
      { type: "decision_summary" },
      { type: "recommendation_panel" },
    ];
    expect(enforceDecisionMode(blocks).ok).toBe(false);
  });

  it("fails with too many blocks", () => {
    const blocks = Array(5).fill({ type: "decision_summary" });
    expect(enforceDecisionMode(blocks).ok).toBe(false);
  });
});
