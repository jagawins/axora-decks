import { describe, it, expect } from "vitest";
import {
  classifySlideIntent,
  enforceSlideCount,
  enforceVisualDensity,
  checkPerSlideIntentViolations,
  enforceDecisionMode,
} from "@/lib/deck-engine-helpers";

// ─── Intent Classification ───

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
    expect(enforceSlideCount(blocks, 6).ok).toBe(true);
  });

  it("fails when count mismatches", () => {
    const blocks = [{ type: "text" }, { type: "text" }, { type: "text" }];
    const result = enforceSlideCount(blocks, 5);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Expected exactly 5");
  });
});

// ─── Visual Density Enforcement ───

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
    expect(enforceVisualDensity(blocks, "balanced").ok).toBe(true);
  });
});

// ─── Per-Slide Intent Violations ───

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
    ];
    expect(checkPerSlideIntentViolations(blocks, outline)).toHaveLength(0);
  });
});

// ─── Decision Mode Enforcement ───

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
