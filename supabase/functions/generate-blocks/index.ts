import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Section {
  heading: string;
  points: string[];
}

interface Outline {
  title: string;
  sections: Section[];
  bullets: string[];
  summary: string;
}

interface BlockContent {
  [key: string]: unknown;
}

// All supported block types including visual blocks
type BlockType = 
  | "text" | "heading" | "list" | "callout" | "two_col" | "table" | "image"
  | "stat_block" | "quote_block" | "timeline_block" | "comparison_table"
  | "card_grid" | "hero_header" | "exec_summary" | "cta_section"
  | "section_divider" | "icon_text_block" | "framed_insight"
  | "chart_block" | "three_pillars" | "two_by_two_matrix" | "decision_next_steps"
  | "decision_summary" | "evidence_map" | "scenario_set" | "recommendation_panel"
  | "kpi_dashboard" | "relationship_matrix" | "flow_diagram"
  | "tabs_block" | "toggle_block"
  | "embed_block" | "cta_button_block" | "smart_layout";

interface Block {
  type: BlockType;
  content: BlockContent;
  order_index: number;
  block_payload?: BlockContent;
  block_meta?: { schema_version: number };
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  outline?: Outline;
  density?: string;
  enableVisualBlocks?: boolean;
  decisionMode?: boolean;
  targetSlideCount?: number;
  visualDensity?: "minimal" | "balanced" | "visual";
}

// ── PER-SLIDE INTENT CLASSIFICATION ──────────────────────────────────────────
// Slide intent is derived from the slide heading keywords.
type SlideIntent = "data" | "strategy" | "decision" | "other";

function classifySlideIntent(heading: string): SlideIntent {
  const h = heading.toLowerCase();
  // Check strategy BEFORE data to avoid "stat" in "strategic" matching data
  if (/pillar|framework|vision|approach|model|roadmap|strateg|priorit|principle|theme|focus|initiative|goal/i.test(h)) return "strategy";
  // Check decision before data
  if (/recommend|decision|next.?step|action|conclude|conclusion|proposal|option|select|choose/i.test(h)) return "decision";
  // Data: revenue, metrics, numbers, performance, growth, results, stats, KPI, figures
  if (/revenue|metric|performance|growth|result|stat|kpi|figure|number|cost|profit|loss|forecast|trend|data|rate|percent|roi|arr|mrr|q[1-4]\b|fy\d{2}/i.test(h)) return "data";
  return "other";
}

const DATA_VISUAL_TYPES = ["chart_block", "stat_block", "comparison_table", "smart_layout"] as const;
const STRATEGY_VISUAL_TYPES = ["three_pillars", "two_by_two_matrix", "smart_layout"] as const;
const EXECUTIVE_BLOCK_TYPES = ["embed_block", "cta_button_block", "smart_layout"] as const;
const DECISION_VISUAL_TYPES_EXTRA = ["decision_next_steps"] as const;

interface SlideIntentViolation {
  sectionIndex: number;
  sectionHeading: string;
  intent: SlideIntent;
  requiredTypes: string[];
  message: string;
}

/**
 * Check per-slide intent enforcement.
 * Maps each outline section to intent, finds its corresponding blocks,
 * and checks that a required visual block type is present.
 */
function checkPerSlideIntentViolations(
  blocks: Block[],
  outline: Outline,
  enableVisualBlocks: boolean
): SlideIntentViolation[] {
  if (!enableVisualBlocks) return [];

  const violations: SlideIntentViolation[] = [];
  const sections = outline.sections || [];

  // Group blocks by sectionIndex
  const blocksBySection = new Map<number, Block[]>();
  for (const block of blocks) {
    const idx = (block.content as Record<string, unknown>).sectionIndex as number | undefined;
    if (typeof idx !== "number") continue;
    if (!blocksBySection.has(idx)) blocksBySection.set(idx, []);
    blocksBySection.get(idx)!.push(block);
  }

  sections.forEach((section, sectionIdx) => {
    const intent = classifySlideIntent(section.heading);
    if (intent === "other") return;

    const sectionBlocks = blocksBySection.get(sectionIdx) || [];
    const sectionTypes = sectionBlocks.map(b => b.type);

    if (intent === "data") {
      const hasDataVisual = DATA_VISUAL_TYPES.some(t => sectionTypes.includes(t as BlockType));
      if (!hasDataVisual) {
        violations.push({
          sectionIndex: sectionIdx,
          sectionHeading: section.heading,
          intent,
          requiredTypes: [...DATA_VISUAL_TYPES],
          message: `Data slide "${section.heading}" must include chart_block, stat_block, or comparison_table`,
        });
      }
    } else if (intent === "strategy") {
      const hasStrategyVisual = STRATEGY_VISUAL_TYPES.some(t => sectionTypes.includes(t as BlockType));
      if (!hasStrategyVisual) {
        violations.push({
          sectionIndex: sectionIdx,
          sectionHeading: section.heading,
          intent,
          requiredTypes: [...STRATEGY_VISUAL_TYPES],
          message: `Strategy slide "${section.heading}" must include three_pillars or two_by_two_matrix`,
        });
      }
    } else if (intent === "decision") {
      const hasDecisionVisual = DECISION_VISUAL_TYPES_EXTRA.some(t => sectionTypes.includes(t as BlockType));
      if (!hasDecisionVisual) {
        violations.push({
          sectionIndex: sectionIdx,
          sectionHeading: section.heading,
          intent,
          requiredTypes: [...DECISION_VISUAL_TYPES_EXTRA],
          message: `Decision slide "${section.heading}" must include decision_next_steps`,
        });
      }
    }
  });

  return violations;
}

function buildSlideIntentCorrectionPrompt(violations: SlideIntentViolation[]): string {
  if (violations.length === 0) return "";
  const lines = violations.map(v =>
    `- Slide "${v.sectionHeading}" (${v.intent}): add one of [${v.requiredTypes.join(", ")}] and set sectionIndex=${v.sectionIndex} for that block.`
  );
  return `\n\nPER-SLIDE VISUAL REQUIREMENT FAILURES:\n${lines.join("\n")}\n\nFix these by replacing the text/list block for each failing slide with the required visual block type. Set sectionIndex correctly.`;
}

// Enforce exact slide count
function enforceSlideCount(
  blocks: Block[],
  targetSlideCount?: number
): { ok: boolean; error?: string } {
  if (!targetSlideCount) return { ok: true };
  const contentBlocks = blocks.filter(
    b => b.type !== "heading" && b.type !== "section_divider"
  );
  if (contentBlocks.length !== targetSlideCount) {
    return {
      ok: false,
      error: `Expected exactly ${targetSlideCount} content blocks, got ${contentBlocks.length}. Return exactly ${targetSlideCount} content blocks (excluding heading and section_divider).`,
    };
  }
  return { ok: true };
}

// Enforce decision mode block order
function enforceDecisionMode(blocks: Block[]): { ok: boolean; error?: string } {
  const types = blocks.map(b => b.type);
  const expected = ["decision_summary", "evidence_map", "scenario_set", "recommendation_panel"];
  // Allow 3 blocks (without scenario_set) or 4
  if (types.length < 3 || types.length > 4) {
    return { ok: false, error: `Decision mode requires 3-4 blocks, got ${types.length}` };
  }
  if (types[0] !== "decision_summary") {
    return { ok: false, error: `Decision mode: first block must be decision_summary, got ${types[0]}` };
  }
  if (types[1] !== "evidence_map") {
    return { ok: false, error: `Decision mode: second block must be evidence_map, got ${types[1]}` };
  }
  if (types[types.length - 1] !== "recommendation_panel") {
    return { ok: false, error: `Decision mode: last block must be recommendation_panel, got ${types[types.length - 1]}` };
  }
  return { ok: true };
}

interface BlockValidationResult {
  valid: boolean;
  invalidCount: number;
  errors: string[];
  blocks: Block[];
  intentViolations?: SlideIntentViolation[];
}

const BASIC_BLOCK_TYPES = ["heading", "text", "list", "callout", "two_col", "table", "image"];
const VISUAL_BLOCK_TYPES = [
  "stat_block", "quote_block", "timeline_block", "comparison_table",
  "card_grid", "hero_header", "exec_summary", "cta_section",
  "section_divider", "icon_text_block", "framed_insight",
  "chart_block", "three_pillars", "two_by_two_matrix", "decision_next_steps"
];
const DECISION_BLOCK_TYPES = [
  "decision_summary", "evidence_map", "scenario_set", "recommendation_panel"
];
const ALL_BLOCK_TYPES = [...BASIC_BLOCK_TYPES, ...VISUAL_BLOCK_TYPES, ...DECISION_BLOCK_TYPES];

// Utility to strip any Markdown formatting
function stripMarkdown(s: unknown): unknown {
  if (typeof s !== "string") return s;
  return s
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[*-]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function sanitizeContent(content: BlockContent): BlockContent {
  const out: BlockContent = {};
  for (const k of Object.keys(content)) {
    const v = content[k];
    if (typeof v === "string") out[k] = stripMarkdown(v);
    else if (Array.isArray(v)) out[k] = v.map(item =>
      typeof item === "string" ? stripMarkdown(item) :
      (item && typeof item === "object") ? sanitizeContent(item as BlockContent) : item
    );
    else if (v && typeof v === "object") out[k] = sanitizeContent(v as BlockContent);
    else out[k] = v;
  }
  return out;
}

function validateRequest(body: unknown): ValidationResult & { preserveWording?: boolean } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { outline, density, enableVisualBlocks, preserveWording, decision_mode, targetSlideCount, visualDensity } = body as { 
    outline?: unknown; 
    density?: string;
    enableVisualBlocks?: boolean;
    preserveWording?: boolean;
    decision_mode?: boolean;
    targetSlideCount?: number;
    visualDensity?: string;
  };

  console.log(`[validateRequest] decision_mode: ${decision_mode === true}, targetSlideCount: ${targetSlideCount}, visualDensity: ${visualDensity}`);

  if (!outline || typeof outline !== "object") {
    return { valid: false, error: "outline is required and must be an object" };
  }

  const o = outline as Partial<Outline>;

  if (!o.title || typeof o.title !== "string") {
    return { valid: false, error: "outline.title is required" };
  }

  if (!Array.isArray(o.sections) || o.sections.length === 0) {
    return { valid: false, error: "outline.sections must be a non-empty array" };
  }

  for (let i = 0; i < o.sections.length; i++) {
    const section = o.sections[i];
    if (!section.heading || typeof section.heading !== "string") {
      return { valid: false, error: `outline.sections[${i}].heading is required` };
    }
    if (!Array.isArray(section.points)) {
      return { valid: false, error: `outline.sections[${i}].points must be an array` };
    }
  }

  const validDensities = ["vibes", "minimal", "context", "plenty"];
  const sanitizedDensity = typeof density === "string" && validDensities.includes(density) ? density : undefined;

  const sanitizedSlideCount = typeof targetSlideCount === "number" && targetSlideCount >= 3 && targetSlideCount <= 20 
    ? targetSlideCount 
    : undefined;

  const validVisualDensities = ["minimal", "balanced", "visual"];
  const sanitizedVisualDensity = typeof visualDensity === "string" && validVisualDensities.includes(visualDensity)
    ? visualDensity as "minimal" | "balanced" | "visual"
    : "balanced";

  return {
    valid: true,
    outline: {
      title: o.title,
      sections: o.sections,
      bullets: Array.isArray(o.bullets) ? o.bullets : [],
      summary: typeof o.summary === "string" ? o.summary : "",
    },
    density: sanitizedDensity,
    enableVisualBlocks: enableVisualBlocks !== false,
    preserveWording: preserveWording !== false,
    decisionMode: decision_mode === true,
    targetSlideCount: sanitizedSlideCount,
    visualDensity: sanitizedVisualDensity,
  };
}

// Normalize: reshape keys only, NEVER fabricate content
function normalizeBlockContent(type: string, content: BlockContent): BlockContent {
  const normalized: BlockContent = { ...content };

  switch (type) {
    case "heading":
      if (normalized.level === undefined && content.heading_level !== undefined) {
        normalized.level = content.heading_level;
      } else if (normalized.level === undefined && content.size !== undefined) {
        normalized.level = content.size;
      }
      if (normalized.text === undefined && content.heading !== undefined) {
        normalized.text = content.heading;
      } else if (normalized.text === undefined && content.title !== undefined) {
        normalized.text = content.title;
      } else if (normalized.text === undefined && content.value !== undefined) {
        normalized.text = content.value;
      }
      break;

    case "text":
      if (normalized.text === undefined && content.paragraph !== undefined) {
        normalized.text = content.paragraph;
      } else if (normalized.text === undefined && content.body !== undefined) {
        normalized.text = content.body;
      } else if (normalized.text === undefined && content.content !== undefined) {
        normalized.text = content.content;
      } else if (normalized.text === undefined && content.value !== undefined) {
        normalized.text = content.value;
      }
      break;

    case "list":
      if (!Array.isArray(normalized.items) && Array.isArray(content.list)) {
        normalized.items = content.list;
      } else if (!Array.isArray(normalized.items) && Array.isArray(content.points)) {
        normalized.items = content.points;
      } else if (!Array.isArray(normalized.items) && Array.isArray(content.bullets)) {
        normalized.items = content.bullets;
      }
      if (normalized.ordered === undefined && content.is_ordered !== undefined) {
        normalized.ordered = content.is_ordered;
      } else if (normalized.ordered === undefined && content.numbered !== undefined) {
        normalized.ordered = content.numbered;
      }
      break;

    case "callout":
      if (normalized.text === undefined && content.message !== undefined) {
        normalized.text = content.message;
      } else if (normalized.text === undefined && content.content !== undefined) {
        normalized.text = content.content;
      } else if (normalized.text === undefined && content.body !== undefined) {
        normalized.text = content.body;
      }
      if (normalized.icon === undefined && content.type !== undefined) {
        normalized.icon = content.type;
      } else if (normalized.icon === undefined && content.variant !== undefined) {
        normalized.icon = content.variant;
      }
      break;

    case "two_col":
      if (normalized.left === undefined && content.left_column !== undefined) {
        normalized.left = content.left_column;
      } else if (normalized.left === undefined && content.column1 !== undefined) {
        normalized.left = content.column1;
      } else if (normalized.left === undefined && content.col1 !== undefined) {
        normalized.left = content.col1;
      }
      if (normalized.right === undefined && content.right_column !== undefined) {
        normalized.right = content.right_column;
      } else if (normalized.right === undefined && content.column2 !== undefined) {
        normalized.right = content.column2;
      } else if (normalized.right === undefined && content.col2 !== undefined) {
        normalized.right = content.col2;
      }
      break;

    case "table":
      if (!Array.isArray(normalized.headers) && Array.isArray(content.header)) {
        normalized.headers = content.header;
      } else if (!Array.isArray(normalized.headers) && Array.isArray(content.columns)) {
        normalized.headers = content.columns;
      }
      if (!Array.isArray(normalized.rows) && Array.isArray(content.data)) {
        normalized.rows = content.data;
      } else if (!Array.isArray(normalized.rows) && Array.isArray(content.cells)) {
        normalized.rows = content.cells;
      }
      break;

    case "image":
      if (normalized.src === undefined && content.url !== undefined) {
        normalized.src = content.url;
      } else if (normalized.src === undefined && content.source !== undefined) {
        normalized.src = content.source;
      } else if (normalized.src === undefined && content.image_url !== undefined) {
        normalized.src = content.image_url;
      }
      if (normalized.alt === undefined && content.alt_text !== undefined) {
        normalized.alt = content.alt_text;
      } else if (normalized.alt === undefined && content.description !== undefined) {
        normalized.alt = content.description;
      }
      break;
      
    // Visual block types - minimal normalization as they have well-defined schemas
    case "stat_block":
    case "quote_block":
    case "timeline_block":
    case "comparison_table":
    case "card_grid":
    case "hero_header":
    case "exec_summary":
    case "cta_section":
    case "section_divider":
    case "icon_text_block":
    case "framed_insight":
    case "chart_block":
    case "three_pillars":
    case "two_by_two_matrix":
    case "decision_next_steps":
    case "embed_block":
    case "cta_button_block":
    case "smart_layout":
      // Pass through - these have strict schemas
      break;
  }

  return normalized;
}

// Validate: check required keys and non-empty values on SANITIZED content
function validateBlockContent(type: string, sanitizedContent: BlockContent): { valid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];

  switch (type) {
    case "heading": {
      const level = sanitizedContent.level;
      const text = sanitizedContent.text;
      if (level === undefined || (typeof level !== "number" && typeof level !== "string")) {
        missingKeys.push("level");
      }
      if (typeof text !== "string" || text.trim().length < 2) {
        missingKeys.push("text (minLength: 2)");
      }
      break;
    }
    case "text": {
      const text = sanitizedContent.text;
      if (typeof text !== "string" || text.trim().length < 10) {
        missingKeys.push("text (minLength: 10)");
      }
      break;
    }
    case "list": {
      const items = sanitizedContent.items;
      const ordered = sanitizedContent.ordered;
      if (!Array.isArray(items) || items.length < 2) {
        missingKeys.push("items (minItems: 2)");
      } else {
        const invalidItems = items.filter((i: unknown) => typeof i !== "string" || (i as string).trim().length < 2);
        if (invalidItems.length > 0) {
          missingKeys.push(`items[${items.indexOf(invalidItems[0])}] (minLength: 2)`);
        }
      }
      if (typeof ordered !== "boolean") {
        missingKeys.push("ordered");
      }
      break;
    }
    case "callout": {
      const text = sanitizedContent.text;
      const icon = sanitizedContent.icon;
      if (typeof text !== "string" || text.trim().length < 10) {
        missingKeys.push("text (minLength: 10)");
      }
      if (typeof icon !== "string" || !["info", "warning", "success"].includes(icon)) {
        missingKeys.push("icon (enum: info|warning|success)");
      }
      break;
    }
    case "two_col": {
      const left = sanitizedContent.left;
      const right = sanitizedContent.right;
      if (typeof left !== "string" || left.trim().length < 5) {
        missingKeys.push("left (minLength: 5)");
      }
      if (typeof right !== "string" || right.trim().length < 5) {
        missingKeys.push("right (minLength: 5)");
      }
      break;
    }
    case "table": {
      const headers = sanitizedContent.headers;
      const rows = sanitizedContent.rows;
      if (!Array.isArray(headers) || headers.length < 2) {
        missingKeys.push("headers (minItems: 2)");
      } else {
        const invalidHeaders = headers.filter((h: unknown) => typeof h !== "string" || (h as string).length < 1);
        if (invalidHeaders.length > 0) {
          missingKeys.push("headers contains empty string");
        }
      }
      if (!Array.isArray(rows) || rows.length < 1) {
        missingKeys.push("rows (minItems: 1)");
      } else {
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          if (!Array.isArray(row) || row.length < 2) {
            missingKeys.push(`rows[${r}] (minItems: 2)`);
            break;
          }
        }
      }
      break;
    }
    case "image": {
      const src = sanitizedContent.src;
      const prompt = sanitizedContent.prompt;
      const alt = sanitizedContent.alt;
      // Either src or prompt must be present
      if ((typeof src !== "string" || src.trim().length < 5) && 
          (typeof prompt !== "string" || prompt.trim().length < 5)) {
        missingKeys.push("src or prompt (minLength: 5)");
      }
      if (typeof alt !== "string" || alt.trim().length < 2) {
        missingKeys.push("alt (minLength: 2)");
      }
      break;
    }
    // Visual block validations
    case "stat_block": {
      const stats = sanitizedContent.stats;
      if (!Array.isArray(stats) || stats.length < 2) {
        missingKeys.push("stats (minItems: 2)");
      } else {
        for (let i = 0; i < stats.length; i++) {
          const stat = stats[i] as { value?: unknown; label?: unknown };
          if (typeof stat?.value !== "string" || stat.value.trim().length < 1) {
            missingKeys.push(`stats[${i}].value required`);
            break;
          }
          if (typeof stat?.label !== "string" || stat.label.trim().length < 1) {
            missingKeys.push(`stats[${i}].label required`);
            break;
          }
        }
      }
      break;
    }
    case "quote_block": {
      const quote = sanitizedContent.quote;
      if (typeof quote !== "string" || quote.trim().length < 10) {
        missingKeys.push("quote (minLength: 10)");
      }
      break;
    }
    case "timeline_block": {
      const events = sanitizedContent.events;
      if (!Array.isArray(events) || events.length < 2) {
        missingKeys.push("events (minItems: 2)");
      } else {
        for (let i = 0; i < events.length; i++) {
          const event = events[i] as { date?: unknown; title?: unknown };
          if (typeof event?.date !== "string") {
            missingKeys.push(`events[${i}].date required`);
            break;
          }
          if (typeof event?.title !== "string") {
            missingKeys.push(`events[${i}].title required`);
            break;
          }
        }
      }
      break;
    }
    case "comparison_table": {
      const headers = sanitizedContent.headers;
      const rows = sanitizedContent.rows;
      if (!Array.isArray(headers) || headers.length < 2) {
        missingKeys.push("headers (minItems: 2)");
      }
      if (!Array.isArray(rows) || rows.length < 1) {
        missingKeys.push("rows (minItems: 1)");
      }
      break;
    }
    case "card_grid": {
      const cards = sanitizedContent.cards;
      if (!Array.isArray(cards) || cards.length < 2) {
        missingKeys.push("cards (minItems: 2)");
      } else {
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as { title?: unknown };
          if (typeof card?.title !== "string") {
            missingKeys.push(`cards[${i}].title required`);
            break;
          }
        }
      }
      break;
    }
    case "hero_header": {
      const heading = sanitizedContent.heading;
      if (typeof heading !== "string" || heading.trim().length < 3) {
        missingKeys.push("heading (minLength: 3)");
      }
      break;
    }
    case "exec_summary": {
      const summary = sanitizedContent.summary;
      const keyPoints = sanitizedContent.keyPoints;
      if (typeof summary !== "string" || summary.trim().length < 20) {
        missingKeys.push("summary (minLength: 20)");
      }
      if (!Array.isArray(keyPoints) || keyPoints.length < 2) {
        missingKeys.push("keyPoints (minItems: 2)");
      }
      break;
    }
    case "cta_section": {
      const heading = sanitizedContent.heading;
      if (typeof heading !== "string" || heading.trim().length < 3) {
        missingKeys.push("heading (minLength: 3)");
      }
      break;
    }
    case "section_divider": {
      // Section dividers have no required content
      break;
    }
    case "icon_text_block": {
      const items = sanitizedContent.items;
      if (!Array.isArray(items) || items.length < 2) {
        missingKeys.push("items (minItems: 2)");
      }
      break;
    }
    case "framed_insight": {
      const insight = sanitizedContent.insight;
      if (typeof insight !== "string" || insight.trim().length < 10) {
        missingKeys.push("insight (minLength: 10)");
      }
      break;
    }
    case "chart_block": {
      const data = sanitizedContent.data;
      const chartType = sanitizedContent.chartType;
      if (!["bar", "line"].includes(String(chartType))) {
        missingKeys.push("chartType (enum: bar|line)");
      }
      if (!Array.isArray(data) || data.length < 2) {
        missingKeys.push("data (minItems: 2)");
      } else {
        for (let i = 0; i < data.length; i++) {
          const dp = data[i] as { label?: unknown; value?: unknown };
          if (typeof dp?.label !== "string") missingKeys.push(`data[${i}].label required`);
          if (typeof dp?.value !== "number") missingKeys.push(`data[${i}].value must be number`);
        }
      }
      break;
    }
    case "three_pillars": {
      const pillars = sanitizedContent.pillars;
      if (!Array.isArray(pillars) || pillars.length !== 3) {
        missingKeys.push("pillars (exactly 3 items required)");
      } else {
        for (let i = 0; i < pillars.length; i++) {
          const p = pillars[i] as { title?: unknown };
          if (typeof p?.title !== "string" || (p.title as string).trim().length < 1) {
            missingKeys.push(`pillars[${i}].title required`);
            break;
          }
        }
      }
      break;
    }
    case "two_by_two_matrix": {
      const xAxisLabel = sanitizedContent.xAxisLabel;
      const yAxisLabel = sanitizedContent.yAxisLabel;
      const quadrants = sanitizedContent.quadrants;
      if (typeof xAxisLabel !== "string" || (xAxisLabel as string).trim().length < 1) {
        missingKeys.push("xAxisLabel required");
      }
      if (typeof yAxisLabel !== "string" || (yAxisLabel as string).trim().length < 1) {
        missingKeys.push("yAxisLabel required");
      }
      if (!Array.isArray(quadrants) || quadrants.length !== 4) {
        missingKeys.push("quadrants (exactly 4 items required)");
      } else {
        for (let i = 0; i < quadrants.length; i++) {
          const q = quadrants[i] as { title?: unknown };
          if (typeof q?.title !== "string" || (q.title as string).trim().length < 1) {
            missingKeys.push(`quadrants[${i}].title required`);
            break;
          }
        }
      }
      break;
    }
    case "decision_next_steps": {
      const recommendation = sanitizedContent.recommendation;
      const rationale = sanitizedContent.rationale;
      const nextSteps = sanitizedContent.nextSteps;
      if (typeof recommendation !== "string" || (recommendation as string).trim().length < 5) {
        missingKeys.push("recommendation (minLength: 5)");
      }
      if (!Array.isArray(rationale) || rationale.length < 1) {
        missingKeys.push("rationale (minItems: 1)");
      }
      if (!Array.isArray(nextSteps) || nextSteps.length < 1) {
        missingKeys.push("nextSteps (minItems: 1)");
      }
      break;
    }
    // Decision block validations (Contract v2)
    case "decision_summary": {
      const summary = sanitizedContent.summary;
      const key_points = sanitizedContent.key_points;
      if (typeof summary !== "string" || summary.trim().length < 5) {
        missingKeys.push("summary (minLength: 5)");
      }
      if (!Array.isArray(key_points) || key_points.length < 1) {
        missingKeys.push("key_points (minItems: 1)");
      }
      break;
    }
    case "evidence_map": {
      const claims = sanitizedContent.claims;
      if (!Array.isArray(claims) || claims.length < 1) {
        missingKeys.push("claims (minItems: 1)");
      } else {
        for (let i = 0; i < claims.length; i++) {
          const item = claims[i] as { claim?: unknown; evidence?: unknown; confidence?: unknown };
          if (typeof item?.claim !== "string") missingKeys.push(`claims[${i}].claim required`);
          if (!Array.isArray(item?.evidence)) missingKeys.push(`claims[${i}].evidence must be array`);
          if (!["high", "medium", "low"].includes(String(item?.confidence))) missingKeys.push(`claims[${i}].confidence required`);
        }
      }
      break;
    }
    case "scenario_set": {
      const scenarios = sanitizedContent.scenarios;
      if (!Array.isArray(scenarios) || scenarios.length < 1) {
        missingKeys.push("scenarios (minItems: 1)");
      }
      break;
    }
    case "recommendation_panel": {
      const recommendation = sanitizedContent.recommendation;
      const rationale = sanitizedContent.rationale;
      const next_steps = sanitizedContent.next_steps;
      if (typeof recommendation !== "string" || recommendation.trim().length < 5) {
        missingKeys.push("recommendation (minLength: 5)");
      }
      if (!Array.isArray(rationale)) missingKeys.push("rationale must be array");
      if (!Array.isArray(next_steps)) missingKeys.push("next_steps must be array");
      break;
    }
    default:
      missingKeys.push(`unknown type: ${type}`);
  }

  return { valid: missingKeys.length === 0, missingKeys };
}

// Check visual density ratio compliance
function enforceVisualDensity(
  blocks: Block[],
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
    return { ok: false, error: `Visual density "minimal" requires ≥20% visual blocks, got ${Math.round(ratio * 100)}%. Add more visual blocks (chart_block, stat_block, card_grid, etc.)` };
  }
  if (visualDensity === "balanced" && ratio < 0.35) {
    return { ok: false, error: `Visual density "balanced" requires ≥40% visual blocks, got ${Math.round(ratio * 100)}%. Replace text/list blocks with visual block types.` };
  }
  if (visualDensity === "visual" && ratio < 0.6) {
    return { ok: false, error: `Visual density "visual" requires ≥60% visual blocks, got ${Math.round(ratio * 100)}%. Every slide should have a visual block.` };
  }

  return { ok: true };
}

// Pipeline: normalize → sanitize → validate → per-slide intent check → slide count check → density check
function validateBlocks(
  rawBlocks: Array<{ type: string; content: BlockContent }>,
  enableVisualBlocks: boolean,
  outline?: Outline,
  targetSlideCount?: number,
  decisionMode?: boolean,
  visualDensity?: "minimal" | "balanced" | "visual"
): BlockValidationResult {
  const validBlocks: Block[] = [];
  const errors: string[] = [];
  let invalidCount = 0;
  
  const allowedTypes = enableVisualBlocks ? ALL_BLOCK_TYPES : BASIC_BLOCK_TYPES;

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];

    // Check type
    if (!block.type || !allowedTypes.includes(block.type)) {
      errors.push(`block[${i}]: invalid type "${block.type || 'undefined'}"`);
      invalidCount++;
      continue;
    }

    // Check content exists
    if (!block.content || typeof block.content !== "object") {
      errors.push(`block[${i}] (${block.type}): content missing or not an object`);
      invalidCount++;
      continue;
    }

    // Step 1: Normalize (reshape keys, no fabrication)
    const normalizedContent = normalizeBlockContent(block.type, block.content);

    // Step 2: Sanitize (strip markdown)
    const sanitizedContent = sanitizeContent(normalizedContent);

    // Validate sectionIndex if present (pass through, don't strip)
    const sectionIndex = (block.content as Record<string, unknown>).sectionIndex;
    if (typeof sectionIndex === "number" && outline) {
      if (sectionIndex < 0 || sectionIndex >= outline.sections.length) {
        // Clamp to valid range instead of rejecting
        sanitizedContent.sectionIndex = Math.max(0, Math.min(outline.sections.length - 1, sectionIndex));
      } else {
        sanitizedContent.sectionIndex = sectionIndex;
      }
    }

    // Step 3: Validate on sanitized content
    const contentValidation = validateBlockContent(block.type, sanitizedContent);
    if (!contentValidation.valid) {
      errors.push(`block[${i}] (${block.type}): missing [${contentValidation.missingKeys.join(", ")}]`);
      invalidCount++;
      continue;
    }

    // Block is valid - for visual/decision blocks, also set block_payload
    const isVisualOrDecision = VISUAL_BLOCK_TYPES.includes(block.type) || DECISION_BLOCK_TYPES.includes(block.type);
    validBlocks.push({
      type: block.type as BlockType,
      content: sanitizedContent,
      order_index: i,
      ...(isVisualOrDecision && { 
        block_payload: sanitizedContent,
        block_meta: { schema_version: 1 }
      }),
    });
  }

  // Decision mode: enforce block order
  if (decisionMode) {
    const decisionResult = enforceDecisionMode(validBlocks);
    if (!decisionResult.ok) {
      errors.push(decisionResult.error!);
    }
    return {
      valid: invalidCount === 0 && validBlocks.length > 0 && decisionResult.ok,
      invalidCount,
      errors,
      blocks: validBlocks,
    };
  }

  // Per-slide intent enforcement (soft — logged as warnings, not retry triggers)
  const intentViolations = outline
    ? checkPerSlideIntentViolations(validBlocks, outline, enableVisualBlocks)
    : [];

  // Slide count enforcement (soft — logged, not retry trigger)
  const slideCountResult = enforceSlideCount(validBlocks, targetSlideCount);
  if (!slideCountResult.ok) {
    errors.push(slideCountResult.error!);
  }

  // Visual density enforcement (soft — logged, not retry trigger)
  const densityResult = enforceVisualDensity(validBlocks, visualDensity);
  if (!densityResult.ok) {
    errors.push(densityResult.error!);
  }

  // SPEED OPTIMIZATION: Only invalidCount > 0 triggers retry.
  // Intent violations, density failures, and slide count mismatches are quality nudges — log them but accept the response.
  return {
    valid: invalidCount === 0 && validBlocks.length > 0,
    invalidCount,
    errors: [
      ...errors,
      ...intentViolations.map(v => v.message),
    ],
    blocks: validBlocks,
    intentViolations,
  };
}

// Parse Anthropic AI response and extract blocks
function parseAIResponse(data: Record<string, unknown>, requestId: string): { blocks: Array<{ type: string; content: BlockContent }> | null; parseError?: string } {
  // Anthropic format: content is an array of blocks
  const contentBlocks = data.content as Array<{ type: string; name?: string; input?: unknown; text?: string }> | undefined;
  
  if (Array.isArray(contentBlocks)) {
    // Look for tool_use block
    const toolUse = contentBlocks.find(b => b.type === "tool_use" && b.name === "create_blocks");
    if (toolUse?.input) {
      const result = toolUse.input as { blocks?: Array<{ type: string; content: BlockContent }> };
      console.log(`[${requestId}] First block shape:`, JSON.stringify(result.blocks?.[0] ?? {}).slice(0, 300));
      if (Array.isArray(result.blocks)) {
        return { blocks: result.blocks };
      }
      return { blocks: null, parseError: "tool_use result missing blocks array" };
    }

    // Fallback: try text block
    const textBlock = contentBlocks.find(b => b.type === "text" && b.text);
    if (textBlock?.text) {
      try {
        const cleanContent = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const result = JSON.parse(cleanContent);
        console.log(`[${requestId}] First block shape (text):`, JSON.stringify(result.blocks?.[0] ?? {}).slice(0, 300));
        if (Array.isArray(result.blocks)) {
          return { blocks: result.blocks };
        }
        return { blocks: null, parseError: "text result missing blocks array" };
      } catch (e) {
        return { blocks: null, parseError: `text parse error: ${e}` };
      }
    }
  }

  return { blocks: null, parseError: "no tool_use or text content in Anthropic response" };
}

function getDensityBlockConstraints(density: string): string {
  switch (density) {
    case "vibes":
      return `
DENSITY CONSTRAINTS (STRICT - JUST VIBES):
- Prefer hero_header and section_divider blocks
- Use stat_block for impressive numbers
- Lists: maximum 2-3 very short items
- Text blocks: maximum 1 short sentence
- NO tables
- Focus on visual impact`;
    
    case "minimal":
      return `
DENSITY CONSTRAINTS (STRICT - MINIMAL TEXT):
- Lists: maximum 3 bullet points
- Text blocks: maximum 2 sentences
- Use card_grid for 3-4 key points
- Use stat_block for metrics
- Tables: avoid unless essential`;
    
    case "context":
      return `
DENSITY CONSTRAINTS (A LITTLE CONTEXT):
- Lists: 3-5 bullet points allowed
- Text blocks: 2-3 sentences
- Use visual blocks where appropriate
- One comparison_table allowed if relevant`;
    
    case "plenty":
      return `
DENSITY CONSTRAINTS (PLENTY OF TEXT):
- Lists: 5+ items allowed
- Text blocks: paragraphs permitted
- Multiple tables allowed
- Use exec_summary for detailed overviews
- Detailed explanations welcome`;
    
    default:
      return "";
  }
}

// Build system prompt with visual block layout rules
function buildSystemPrompt(
  isRetry: boolean,
  validationErrors?: string[],
  density?: string,
  enableVisualBlocks?: boolean,
  preserveWording?: boolean,
  decisionMode?: boolean,
  visualDensity?: "minimal" | "balanced" | "visual",
  targetSlideCount?: number
): string {
  const densityConstraints = getDensityBlockConstraints(density || "context");
  
  const preserveWordingRule = preserveWording ? `
PRESERVE ORIGINAL WORDING (CRITICAL):
- Keep user's exact phrasing verbatim for text/list/callout/two_col blocks.
- For visual blocks: restructure but quote user text directly.
` : '';

  const decisionModePrompt = decisionMode ? `
DECISION MODE (ACTIVE):
Generate 3-4 blocks in FIXED ORDER:
1. decision_summary: {summary, key_points:[], risks?:[]}
2. evidence_map: {claims:[{claim, evidence:[], confidence:"high"|"medium"|"low"}]}
3. scenario_set (optional): {scenarios:[{name:"best_case"|"base_case"|"worst_case", assumptions:[], outcomes:[], risks:[]}]}
4. recommendation_panel: {recommendation, rationale:[], alternatives:[], next_steps:[]}
NEVER invent numbers. Use "Not provided" if data is missing.
` : '';

  const visualBlockRules = enableVisualBlocks && !decisionMode ? `
VISUAL BLOCK TYPE SELECTION (match content → type):
| Content Pattern | Block Type |
|---|---|
| 2-6 numeric values | stat_block |
| Quoted text/testimonial | quote_block |
| Dates/phases/steps | timeline_block |
| Comparisons/vs/pros-cons | comparison_table |
| 3-4 distinct features | card_grid |
| Presentation title | hero_header |
| Summary + key points | exec_summary |
| Call to action | cta_section |
| Topic transition | section_divider |
| Items with icons | icon_text_block |
| Key insight/tip | framed_insight |
| 3+ numeric data points (time-series→line, categorical→bar) | chart_block |
| Exactly 3 strategic themes | three_pillars |
| 2-axis positioning | two_by_two_matrix |
| Recommendation + next steps | decision_next_steps |
| Live dashboard/spreadsheet/video/embed URL | embed_block |
| Action buttons: schedule/approve/book/download | cta_button_block |
| Executive summary with metrics | smart_layout (layout:"exec-summary") |
| KPIs + analysis commentary | smart_layout (layout:"metrics-commentary") |
| Recommendation + evidence + risks | smart_layout (layout:"recommendation") |
| Compare 2-3 options side by side | smart_layout (layout:"comparison-columns") |
| Single key metric + supporting data | smart_layout (layout:"spotlight") |
| Meeting agenda with owners | smart_layout (layout:"agenda") |

BLOCK SCHEMAS (required fields):
- stat_block: {stats:[{value,label,trend?}]}
- quote_block: {quote,author?,role?}
- timeline_block: {events:[{date,title,status?}]}
- comparison_table: {headers:[],rows:[{label,values:[]}]}
- card_grid: {cards:[{title,description?,icon?}],columns?}
- hero_header: {heading,subheading?,cta?:{text,href}}
- exec_summary: {summary,keyPoints:[],bottomLine?}
- cta_section: {heading,primaryCta?:{text,href}}
- section_divider: {style?,label?}
- icon_text_block: {items:[{icon,title,description?}]}
- framed_insight: {insight,type?,source?}
- chart_block: {chartType:"bar"|"line",data:[{label,value(number)}],title?}
- three_pillars: {pillars:[{title,description?,icon?}](exactly 3)}
- two_by_two_matrix: {xAxisLabel,yAxisLabel,quadrants:[{title,description?}](exactly 4)}
- decision_next_steps: {recommendation,rationale:[],nextSteps:[{action,owner?,due?}],risks?:[]}
- embed_block: {url:"https://...",title?,height?,caption?} — Use for live dashboards, Google Sheets, PowerBI, Figma, YouTube, Calendly
- cta_button_block: {buttons:[{label,url,icon?,variant?,description?}],title?,subtitle?,layout?:"horizontal"|"vertical"|"card",alignment?} — icons: calendar,mail,link,document,approve,arrow,download,message,phone,video
- smart_layout: {layout:"exec-summary"|"metrics-commentary"|"recommendation"|"comparison-columns"|"spotlight"|"agenda",items:[{title,content?,metric?,metricLabel?,status?,owner?,time?}],summary?,recommendation?,riskNote?}

WORD LIMITS: text body max 60 words, list items max 12 words/6 items, card descriptions max 25 words, exec_summary max 80 words, pillars max 30 words each.

HARD RULES:
- ≥40% visual blocks (not text/list/heading/callout)
- Data slides → chart_block or stat_block
- Strategy slides → three_pillars or two_by_two_matrix
- Decision slides → decision_next_steps
- Every block MUST include "sectionIndex" (0-based integer)
` : '';

  const visualDensityRules = enableVisualBlocks && !decisionMode && visualDensity ? `
VISUAL DENSITY: ${visualDensity.toUpperCase()}
${visualDensity === "minimal" ? "- ≥20% visual blocks" : ""}
${visualDensity === "balanced" ? "- ≥50% visual blocks, every data slide must have chart/stat" : ""}
${visualDensity === "visual" ? "- Every content slide must have a visual block" : ""}
` : '';

  const slideCountRule = targetSlideCount ? `
SLIDE COUNT: Generate EXACTLY ${targetSlideCount} content blocks (excludes section_divider and heading).
` : '';

  let prompt = decisionMode 
    ? `You are an expert executive decision support analyst. Generate a structured DECISION DECK.

CRITICAL: You MUST populate the content object with actual data. Empty content {} will fail.
${preserveWordingRule}
${decisionModePrompt}

NEVER return {"type": "decision_summary", "content": {}} - this will fail validation.`
    : `You are an expert presentation designer trained in McKinsey, BCG, and Bain consulting slide methodology. You combine strategic structure with compelling visual storytelling to create presentations that get approvals.

═══ SLIDE GROUPING (CRITICAL — prevents 65-slide decks) ═══
- Each outline section = ONE slide (heading + ONE rich content block)
- NEVER make a separate block for each bullet point
- Group all bullets from a section into a SINGLE list, table, or visual block
- A 10-section outline should produce ~12-15 total blocks, NOT 40-65
- If you create more than 3 blocks per section, you are doing it wrong

═══ BCG/McKINSEY SLIDE METHODOLOGY ═══
- ACTION TITLES: Every heading block must state a complete takeaway, not a topic. "Revenue grew 23% YoY driven by APAC expansion" not "Revenue Overview"
- THREE LAYERS per slide: (1) Action title stating the takeaway, (2) Sub-context supporting the title, (3) Visual evidence (chart, table, framework)
- ANSWER-FIRST: Lead with the conclusion on every slide, then show the evidence below
- VISUAL DENSITY: Consulting slides are 70%+ visual (charts, frameworks, tables). Minimize prose.
- FRAMEWORKS: Use comparison_table, two_by_two_matrix, three_pillars for strategic content
- DATA PROMINENCE: Numbers and charts should dominate. Use stat_block and chart_block aggressively.
- BENCHMARKING: When showing metrics, include context (vs last period, vs industry, vs target)
- FOOTNOTES: Include source attributions in text blocks where data is cited

═══ NARRATIVE FLOW (Story-Based Structure) ═══
Build a narrative arc across the slides:
1. HOOK SLIDE: Open with a surprising fact, bold claim, or provocative question
2. CONTEXT SLIDE: Establish the situation (what is happening)
3. TENSION SLIDE: Present the problem or challenge (why it matters now)
4. INSIGHT SLIDES: Reveal the key findings with data evidence
5. SOLUTION SLIDES: Present the recommendation with frameworks
6. CLOSE SLIDE: Clear call to action with specific next steps

═══ VISUAL DIRECTION (per slide) ═══
- Title/hook slides: Use hero_header with bold assertion and clean design
- Data slides: chart_block (bar for comparison, line for trends, donut for composition)
- Strategy slides: three_pillars, two_by_two_matrix, comparison_table
- Summary slides: exec_summary with bullet key points
- Decision slides: decision_next_steps with owner and timeline
- Transition slides: section_divider with topic label
- Proof point slides: stat_block with 2-4 key metrics
- Quote/testimonial slides: quote_block with attribution
- Action slides: cta_section or cta_button_block

═══ SLIDE CONTENT QUALITY ═══
- Each slide communicates ONE clear idea (the action title)
- Bullet points: max 12 words each, max 6 items per slide
- Text body: max 60 words (less is more)
- Every data point includes context (vs what? change from what?)
- Use "so what?" test: every slide must answer why the audience should care
- Eliminate filler words: "it is important to note that" becomes direct statement

═══ PERSUASION LAYER ═══
- Strengthen arguments with specific numbers and benchmarks
- Use contrast (before/after, old/new) to make impact tangible
- Address objections before they are raised
- Build credibility with sources and proof points
- End with a clear, compelling ask (not just "questions?")

CRITICAL: You MUST populate the content object with actual data. Empty content {} will fail.
${preserveWordingRule}
${densityConstraints}
${slideCountRule}
${enableVisualBlocks ? visualBlockRules : ''}
${enableVisualBlocks ? visualDensityRules : ''}

BASIC BLOCK FORMATS:
- heading: {level:1|2|3, text}
- text: {text (min 10 chars)}
- list: {items:[], ordered:boolean}
- callout: {text, icon:"info"|"warning"|"success"}
- two_col: {left, right}
- table: {headers:[], rows:[[]]}

CONSULTING SLIDE FLOW:
1. hero_header (title + core assertion as a hook)
2. exec_summary (answer-first: 3-5 key recommendations)
3. section_divider before each topic
4. For each section: action-title heading → visual evidence block (chart/stat/table/framework)
5. decision_next_steps or cta_section to close with specific actions
${targetSlideCount ? `Exactly ${targetSlideCount} content blocks.` : "8-15 blocks total."}

NEVER return {"type": "heading", "content": {}} - this will fail validation.`;

  if (isRetry && validationErrors?.length) {
    prompt += `

CORRECTION REQUIRED - Your previous response had invalid blocks.
Errors: ${validationErrors.slice(0, 5).join("; ")}

You MUST fill in actual content for every block. Check the required fields for each block type.`;
  }

  return prompt;
}

// Tool schema with per-type oneOf validated schemas
function getToolSchema(enableVisualBlocks: boolean, decisionMode: boolean = false): Record<string, unknown> {
  // Define strict content schemas per block type
  const headingSchema = { 
    type: "object", 
    required: ["type", "content"],
    properties: { 
      type: { type: "string", const: "heading" },
      content: { 
        type: "object", 
        required: ["level", "text"],
        properties: { 
          level: { type: "number", enum: [1, 2, 3] }, 
          text: { type: "string", minLength: 2 } 
        }
      }
    }
  };

  const textSchema = { 
    type: "object", 
    required: ["type", "content"],
    properties: { 
      type: { type: "string", const: "text" },
      content: { 
        type: "object", 
        required: ["text"],
        properties: { text: { type: "string", minLength: 10 } }
      }
    }
  };

  const listSchema = { 
    type: "object", 
    required: ["type", "content"],
    properties: { 
      type: { type: "string", const: "list" },
      content: { 
        type: "object", 
        required: ["items", "ordered"],
        properties: { 
          items: { type: "array", minItems: 2, items: { type: "string", minLength: 2 } }, 
          ordered: { type: "boolean" } 
        }
      }
    }
  };

  const calloutSchema = { 
    type: "object", 
    required: ["type", "content"],
    properties: { 
      type: { type: "string", const: "callout" },
      content: { 
        type: "object", 
        required: ["text", "icon"],
        properties: { 
          text: { type: "string", minLength: 10 }, 
          icon: { type: "string", enum: ["info", "warning", "success"] } 
        }
      }
    }
  };

  const twoColSchema = { 
    type: "object", 
    required: ["type", "content"],
    properties: { 
      type: { type: "string", const: "two_col" },
      content: { 
        type: "object", 
        required: ["left", "right"],
        properties: { 
          left: { type: "string", minLength: 5 }, 
          right: { type: "string", minLength: 5 } 
        }
      }
    }
  };

  const tableSchema = { 
    type: "object", 
    required: ["type", "content"],
    properties: { 
      type: { type: "string", const: "table" },
      content: { 
        type: "object", 
        required: ["headers", "rows"],
        properties: { 
          headers: { type: "array", minItems: 2, items: { type: "string" } }, 
          rows: { type: "array", minItems: 1, items: { type: "array", items: { type: "string" } } } 
        }
      }
    }
  };

  const imageSchema = { 
    type: "object", 
    required: ["type", "content"],
    properties: { 
      type: { type: "string", const: "image" },
      content: { 
        type: "object", 
        required: ["alt"],
        properties: { 
          src: { type: "string" }, 
          prompt: { type: "string" },
          alt: { type: "string", minLength: 2 } 
        }
      }
    }
  };

  // Visual block schemas - unified min/max constraints
  const statBlockSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "stat_block" },
      content: {
        type: "object",
        required: ["stats"],
        properties: {
          title: { type: "string" },
          stats: { 
            type: "array", 
            minItems: 2,
            maxItems: 6,
            items: { 
              type: "object", 
              required: ["value", "label"],
              properties: {
                value: { type: "string", minLength: 1 },
                label: { type: "string", minLength: 1 },
                change: { type: "string" },
                trend: { type: "string", enum: ["up", "down", "neutral"] }
              }
            }
          },
          layout: { type: "string", enum: ["row", "grid"] }
        }
      }
    }
  };

  const quoteBlockSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "quote_block" },
      content: {
        type: "object",
        required: ["quote"],
        properties: {
          quote: { type: "string", minLength: 10 },
          author: { type: "string" },
          role: { type: "string" },
          company: { type: "string" }
        }
      }
    }
  };

  const timelineBlockSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "timeline_block" },
      content: {
        type: "object",
        required: ["events"],
        properties: {
          title: { type: "string" },
          events: {
            type: "array",
            minItems: 2,
            items: {
              type: "object",
              required: ["date", "title"],
              properties: {
                date: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                status: { type: "string", enum: ["completed", "current", "upcoming"] }
              }
            }
          }
        }
      }
    }
  };

  const comparisonTableSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "comparison_table" },
      content: {
        type: "object",
        required: ["headers", "rows"],
        properties: {
          title: { type: "string" },
          headers: { type: "array", minItems: 2, items: { type: "string" } },
          rows: { 
            type: "array", 
            minItems: 1,
            items: {
              type: "object",
              required: ["label", "values"],
              properties: {
                label: { type: "string" },
                values: { type: "array", items: { oneOf: [{ type: "string" }, { type: "boolean" }] } }
              }
            }
          },
          highlightColumn: { type: "number" }
        }
      }
    }
  };

  const cardGridSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "card_grid" },
      content: {
        type: "object",
        required: ["cards"],
        properties: {
          title: { type: "string" },
          cards: {
            type: "array",
            minItems: 2,
            maxItems: 6,
            items: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                icon: { type: "string" }
              }
            }
          },
          columns: { type: "number", enum: [2, 3, 4] }
        }
      }
    }
  };

  const heroHeaderSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "hero_header" },
      content: {
        type: "object",
        required: ["heading"],
        properties: {
          heading: { type: "string", minLength: 3 },
          subheading: { type: "string" },
          cta: { 
            type: "object",
            properties: {
              text: { type: "string" },
              href: { type: "string" }
            }
          },
          backgroundStyle: { type: "string", enum: ["gradient", "image", "solid"] }
        }
      }
    }
  };

  const execSummarySchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "exec_summary" },
      content: {
        type: "object",
        required: ["summary", "keyPoints"],
        properties: {
          title: { type: "string" },
          summary: { type: "string", minLength: 20 },
          keyPoints: { type: "array", minItems: 2, items: { type: "string" } },
          bottomLine: { type: "string" }
        }
      }
    }
  };

  const ctaSectionSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "cta_section" },
      content: {
        type: "object",
        required: ["heading"],
        properties: {
          heading: { type: "string", minLength: 3 },
          subheading: { type: "string" },
          primaryCta: { 
            type: "object",
            properties: {
              text: { type: "string" },
              href: { type: "string" }
            }
          },
          secondaryCta: { 
            type: "object",
            properties: {
              text: { type: "string" },
              href: { type: "string" }
            }
          }
        }
      }
    }
  };

  const sectionDividerSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "section_divider" },
      content: {
        type: "object",
        properties: {
          style: { type: "string", enum: ["line", "gradient", "dots", "space"] },
          label: { type: "string" }
        }
      }
    }
  };

  const iconTextBlockSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "icon_text_block" },
      content: {
        type: "object",
        required: ["items"],
        properties: {
          title: { type: "string" },
          items: {
            type: "array",
            minItems: 2,
            items: {
              type: "object",
              required: ["icon", "title"],
              properties: {
                icon: { type: "string" },
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          layout: { type: "string", enum: ["vertical", "horizontal"] }
        }
      }
    }
  };

  const framedInsightSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "framed_insight" },
      content: {
        type: "object",
        required: ["insight"],
        properties: {
          insight: { type: "string", minLength: 10 },
          context: { type: "string" },
          source: { type: "string" },
          type: { type: "string", enum: ["tip", "warning", "insight", "note"] }
        }
      }
    }
  };

  // Decision block schemas (Contract v2)
  const decisionSummarySchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "decision_summary" },
      content: {
        type: "object",
        required: ["summary", "key_points"],
        properties: {
          title: { type: "string" },
          summary: { type: "string", minLength: 5 },
          key_points: { type: "array", minItems: 1, items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } }
        }
      }
    }
  };

  const evidenceMapSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "evidence_map" },
      content: {
        type: "object",
        required: ["claims"],
        properties: {
          title: { type: "string" },
          claims: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["claim", "evidence", "confidence"],
              properties: {
                claim: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
                confidence: { type: "string", enum: ["high", "medium", "low"] }
              }
            }
          }
        }
      }
    }
  };

  const scenarioSetSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "scenario_set" },
      content: {
        type: "object",
        required: ["scenarios"],
        properties: {
          title: { type: "string" },
          scenarios: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["name", "assumptions", "outcomes", "risks"],
              properties: {
                name: { type: "string", enum: ["best_case", "base_case", "worst_case"] },
                assumptions: { type: "array", items: { type: "string" } },
                outcomes: { type: "array", items: { type: "string" } },
                risks: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    }
  };

  const recommendationPanelSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "recommendation_panel" },
      content: {
        type: "object",
        required: ["recommendation", "rationale", "alternatives", "next_steps"],
        properties: {
          title: { type: "string" },
          recommendation: { type: "string", minLength: 5 },
          rationale: { type: "array", items: { type: "string" } },
          alternatives: { type: "array", items: { type: "string" } },
          next_steps: { type: "array", items: { type: "string" } }
        }
      }
    }
  };

  // NEW: chart_block schema
  const chartBlockSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "chart_block" },
      content: {
        type: "object",
        required: ["chartType", "data"],
        properties: {
          chartType: { type: "string", enum: ["bar", "line"] },
          title: { type: "string" },
          data: {
            type: "array",
            minItems: 2,
            items: {
              type: "object",
              required: ["label", "value"],
              properties: {
                label: { type: "string" },
                value: { type: "number" }
              }
            }
          }
        }
      }
    }
  };

  // NEW: three_pillars schema
  const threePillarsSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "three_pillars" },
      content: {
        type: "object",
        required: ["pillars"],
        properties: {
          title: { type: "string" },
          pillars: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                icon: { type: "string" }
              }
            }
          }
        }
      }
    }
  };

  // NEW: two_by_two_matrix schema
  const twoByTwoMatrixSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "two_by_two_matrix" },
      content: {
        type: "object",
        required: ["xAxisLabel", "yAxisLabel", "quadrants"],
        properties: {
          title: { type: "string" },
          xAxisLabel: { type: "string" },
          yAxisLabel: { type: "string" },
          quadrants: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      }
    }
  };

  // NEW: decision_next_steps schema
  const decisionNextStepsSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "decision_next_steps" },
      content: {
        type: "object",
        required: ["recommendation", "rationale", "nextSteps"],
        properties: {
          title: { type: "string" },
          recommendation: { type: "string", minLength: 5 },
          rationale: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
          nextSteps: {
            type: "array",
            minItems: 1,
            maxItems: 6,
            items: {
              type: "object",
              required: ["action"],
              properties: {
                action: { type: "string" },
                owner: { type: "string" },
                due: { type: "string" }
              }
            }
          },
          risks: { type: "array", maxItems: 4, items: { type: "string" } }
        }
      }
    }
  };

  // Strip properties not supported by Anthropic's tool schema
  function stripUnsupportedSchemaProps(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(stripUnsupportedSchemaProps);
    if (!obj || typeof obj !== "object") return obj;
    const out: Record<string, unknown> = {};
    const UNSUPPORTED = new Set(["minLength", "maxLength", "minItems", "maxItems", "minimum", "maximum", "additionalProperties"]);
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (UNSUPPORTED.has(k)) continue;
      out[k] = stripUnsupportedSchemaProps(v);
    }
    return out;
  }

  // Inject sectionIndex into every schema's content properties
  function addSectionIndex(schema: Record<string, unknown>): Record<string, unknown> {
    const props = schema.properties as Record<string, unknown>;
    const contentSchema = props.content as Record<string, unknown>;
    const contentProps = contentSchema.properties as Record<string, unknown>;
    return {
      ...schema,
      properties: {
        ...props,
        content: {
          ...contentSchema,
          properties: {
            ...contentProps,
            sectionIndex: { type: "integer", description: "Index of the outline section (0-based) this block belongs to" },
          },
        },
      },
    };
  }

  // ── Executive block schemas ─────────────────────────────────────────────

  const embedBlockSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "embed_block" },
      content: {
        type: "object",
        required: ["url"],
        properties: {
          title: { type: "string", description: "Title shown above the embed" },
          url: { type: "string", description: "URL to embed (Google Sheets, PowerBI, Tableau, Figma, Miro, Loom, YouTube, Calendly, Airtable, or any webpage)" },
          height: { type: "number", description: "Height in pixels (default 400)" },
          caption: { type: "string", description: "Caption below the embed" },
        }
      }
    }
  };

  const ctaButtonBlockSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "cta_button_block" },
      content: {
        type: "object",
        required: ["buttons"],
        properties: {
          title: { type: "string", description: "Heading above buttons" },
          subtitle: { type: "string", description: "Subtext below heading" },
          layout: { type: "string", enum: ["horizontal", "vertical", "card"], description: "Button layout style" },
          alignment: { type: "string", enum: ["left", "center", "right"] },
          buttons: {
            type: "array", minItems: 1, maxItems: 4,
            items: {
              type: "object",
              required: ["label", "url"],
              properties: {
                label: { type: "string", description: "Button text e.g. 'Schedule Follow-up'" },
                url: { type: "string", description: "Link URL (https:// or mailto:)" },
                icon: { type: "string", enum: ["calendar", "mail", "link", "document", "approve", "arrow", "download", "message", "phone", "video"] },
                variant: { type: "string", enum: ["primary", "secondary", "outline", "ghost"] },
                description: { type: "string", description: "For card layout, description below button label" },
              }
            }
          }
        }
      }
    }
  };

  const smartLayoutSchema = {
    type: "object",
    required: ["type", "content"],
    properties: {
      type: { type: "string", const: "smart_layout" },
      content: {
        type: "object",
        required: ["layout", "items"],
        properties: {
          title: { type: "string" },
          layout: { type: "string", enum: ["exec-summary", "metrics-commentary", "recommendation", "comparison-columns", "spotlight", "agenda"], description: "exec-summary: key message + 4 metrics. metrics-commentary: KPIs grid + analysis. recommendation: recommendation box + evidence + risk. comparison-columns: 3 options side by side. spotlight: featured metric + supporting. agenda: numbered items with owners." },
          summary: { type: "string", description: "Key message for exec-summary or analysis text for metrics-commentary" },
          recommendation: { type: "string", description: "For recommendation layout: the main recommendation text" },
          riskNote: { type: "string", description: "For recommendation layout: risk/caveat note" },
          items: {
            type: "array", minItems: 1,
            items: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                metric: { type: "string", description: "e.g. '$4.2M' or '+23%'" },
                metricLabel: { type: "string", description: "e.g. 'Revenue' or 'Growth rate'" },
                status: { type: "string", enum: ["positive", "negative", "neutral", "warning"] },
                owner: { type: "string", description: "For agenda: person responsible" },
                time: { type: "string", description: "For agenda: time allocation e.g. '15 min'" },
              }
            }
          }
        }
      }
    }
  };

  // Build oneOf array based on enableVisualBlocks and decisionMode flags
  const basicBlockSchemas = [headingSchema, textSchema, listSchema, calloutSchema, twoColSchema, tableSchema, imageSchema].map(addSectionIndex);
  const visualBlockSchemas = [
    statBlockSchema, quoteBlockSchema, timelineBlockSchema, comparisonTableSchema, 
    cardGridSchema, heroHeaderSchema, execSummarySchema, ctaSectionSchema, 
    sectionDividerSchema, iconTextBlockSchema, framedInsightSchema,
    chartBlockSchema, threePillarsSchema, twoByTwoMatrixSchema, decisionNextStepsSchema,
    embedBlockSchema, ctaButtonBlockSchema, smartLayoutSchema
  ].map(addSectionIndex);
  const decisionBlockSchemas = [
    decisionSummarySchema, evidenceMapSchema, scenarioSetSchema, recommendationPanelSchema
  ];

  // If decision mode is enabled, only use decision block schemas (3-4 blocks, scenario_set optional)
  if (decisionMode) {
    return stripUnsupportedSchemaProps({
      name: "create_blocks",
      description: "Create a decision deck with 3-4 blocks: decision_summary (required first), evidence_map (required second), scenario_set (optional, only if meaningful), recommendation_panel (required last).",
      input_schema: {
        type: "object",
        required: ["blocks"],
        properties: {
          blocks: {
            type: "array",
            items: {
              oneOf: decisionBlockSchemas
            }
          }
        }
      }
    }) as ReturnType<typeof getToolSchema>;
  }

  const blockSchemas = enableVisualBlocks 
    ? [...basicBlockSchemas, ...visualBlockSchemas]
    : basicBlockSchemas;

  return stripUnsupportedSchemaProps({
    name: "create_blocks",
    description: "Create presentation blocks. Each block MUST include sectionIndex (0-based integer) mapping to the outline section it belongs to. Use visual block types for richer presentations.",
    input_schema: {
      type: "object",
      required: ["blocks"],
      properties: {
        blocks: {
          type: "array",
          items: {
            oneOf: blockSchemas
          }
        }
      }
    }
  }) as ReturnType<typeof getToolSchema>;
}

// Call Anthropic Claude API
async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  enableVisualBlocks: boolean,
  decisionMode: boolean = false
): Promise<{ response?: Response; error?: string }> {
  try {
    const toolSchema = getToolSchema(enableVisualBlocks, decisionMode);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt },
        ],
        tools: [toolSchema],
        tool_choice: { type: "tool", name: "create_blocks" },
      }),
    });

    return { response };
  } catch (e) {
    return { error: `fetch error: ${e}` };
  }
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const _authClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: { user: _authUser }, error: _authError } = await _authClient.auth.getUser(authHeader.replace("Bearer ", ""));
  if (_authError || !_authUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      console.error(`[${requestId}] Validation failed:`, validation.error);
      return new Response(
        JSON.stringify({ error: validation.error, requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const outline = validation.outline!;
    const density = validation.density;
    const enableVisualBlocks = validation.enableVisualBlocks ?? true;
    const preserveWording = validation.preserveWording ?? true;
    const decisionMode = validation.decisionMode ?? false;
    const targetSlideCount = validation.targetSlideCount;
    const visualDensity = validation.visualDensity ?? "balanced";
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (!ANTHROPIC_API_KEY) {
      console.error(`[${requestId}] ANTHROPIC_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generationStart = Date.now();
    console.log(`[${requestId}] Generating blocks for: "${outline.title}" density: ${density || "default"}, visualDensity: ${visualDensity}, visualBlocks: ${enableVisualBlocks}, decisionMode: ${decisionMode}, targetSlideCount: ${targetSlideCount}`);

    const userPrompt = decisionMode 
      ? `Analyze this content and create a DECISION DECK with exactly 4 blocks.

Title: ${outline.title}
Summary: ${outline.summary}

Content:
${outline.sections.map((s, i) => `${i + 1}. ${s.heading}\n${s.points.map(p => `   - ${p}`).join("\n")}`).join("\n\n")}

Key Points:
${outline.bullets.map(b => `- ${b}`).join("\n")}

CRITICAL: Generate exactly 4 blocks in order: decision_summary, evidence_map, scenario_set, recommendation_panel. Never invent numbers - use "Not provided" if missing.`
      : `Convert this outline into a professional presentation. Each outline section becomes ONE rich slide (not multiple thin slides).

Title: ${outline.title}
Summary: ${outline.summary}

Sections (each section = exactly ONE slide with rich content):
${outline.sections.map((s, i) => `Section ${i} (sectionIndex=${i}). "${s.heading}"\n${s.points.map(p => `   - ${p}`).join("\n")}`).join("\n\n")}

Key Takeaways:
${outline.bullets.map(b => `- ${b}`).join("\n")}

CRITICAL SLIDE GROUPING RULES:
1. Each outline section becomes exactly 2-3 blocks: one heading (action title) + one rich content block (list, table, stat_block, chart_block, comparison_table, etc.)
2. NEVER create a separate block for each bullet point. Group all bullets from one section into a SINGLE list, table, or visual block.
3. Total output should be ${outline.sections.length * 2 + 2} to ${outline.sections.length * 3 + 2} blocks (not 40-65 blocks).
4. The presentation should have roughly ${outline.sections.length + 2} slides (title + sections + closing), NOT one slide per bullet.
5. Every block's content MUST include "sectionIndex" (integer, 0-based).

SLIDE PATTERN (repeat for each section):
  { type: "heading", content: { level: 2, text: "[ACTION TITLE from section]", sectionIndex: N } }
  { type: "[visual_block_type]", content: { [rich content combining ALL points from this section], sectionIndex: N } }

For visual block selection per section:
- Sections with metrics/numbers → stat_block or chart_block
- Sections with comparisons → comparison_table or two_col
- Sections with 3+ features/pillars → three_pillars or card_grid
- Sections with steps/timeline → timeline_block
- Sections with bullet points → list (combine ALL bullets into ONE list block)
- Summary/recommendation sections → exec_summary or decision_next_steps

WRONG (creates 65 slides):
  heading: "Problem"
  text: "The answer is buried"
  text: "Slides are overloaded"
  text: "Meetings become explanations"

RIGHT (creates 1 slide):
  heading: "Most presentations fail at the moment that matters"
  list: { items: ["The answer is buried on slide 15", "Slides are overloaded with noise", "Meetings become explanations instead of decisions"], ordered: false, sectionIndex: 1 }
${targetSlideCount ? `\nSLIDE COUNT: Generate content for exactly ${targetSlideCount} slides. Each slide = heading + content block.` : ''}`;

    // First attempt
    const systemPrompt1 = buildSystemPrompt(false, undefined, density, enableVisualBlocks, preserveWording, decisionMode, visualDensity, targetSlideCount);
    const result1 = await callAI(ANTHROPIC_API_KEY, systemPrompt1, userPrompt, enableVisualBlocks, decisionMode);

    if (result1.error) {
      console.error(`[${requestId}] AI call failed:`, result1.error);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response1 = result1.response!;
    if (!response1.ok) {
      const status = response1.status;
      console.error(`[${requestId}] AI gateway error: ${status}`);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment.", requestId }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue.", requestId }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data1 = await response1.json();
    const parsed1 = parseAIResponse(data1, requestId);

    if (parsed1.blocks) {
      const blockValidation1 = validateBlocks(parsed1.blocks, enableVisualBlocks, outline, targetSlideCount, decisionMode, visualDensity);

      if (blockValidation1.valid) {
        const latencyMs = Date.now() - generationStart;
        const intentWarnings = blockValidation1.intentViolations?.length ?? 0;
        const densityWarnings = blockValidation1.errors.filter(e => e.includes("Visual density")).length;
        console.log(`[${requestId}] TELEMETRY: retried=false, blocks=${blockValidation1.blocks.length}, latencyMs=${latencyMs}, intentWarnings=${intentWarnings}, densityWarnings=${densityWarnings}`);
        return new Response(
          JSON.stringify({ blocks: blockValidation1.blocks, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Only retry on schema failures (invalidCount > 0)
      const intentViolationMessages = blockValidation1.intentViolations?.map(v => v.message) ?? [];
      const allErrors = blockValidation1.errors;
      console.warn(`[${requestId}] TELEMETRY: retried=true, reason=schema_invalid, invalidBlocksCount=${blockValidation1.invalidCount}, intentViolations=${intentViolationMessages.length}, errors=${allErrors.slice(0, 3).join("; ")}`);
      console.log(`[${requestId}] Retrying with correction prompt...`);

      // Build correction with intent violations prominently listed
      const intentCorrection = buildSlideIntentCorrectionPrompt(blockValidation1.intentViolations ?? []);
      const correctionErrors = [...allErrors.slice(0, 3), intentCorrection].filter(Boolean);
      const systemPrompt2 = buildSystemPrompt(true, correctionErrors, density, enableVisualBlocks, preserveWording, decisionMode, visualDensity, targetSlideCount);
      const result2 = await callAI(ANTHROPIC_API_KEY, systemPrompt2, userPrompt, enableVisualBlocks, decisionMode);

      if (result2.error || !result2.response?.ok) {
        console.error(`[${requestId}] Retry failed: ${result2.error || result2.response?.status}`);
        // Return the best we have (valid blocks even if intent violations exist) rather than failing completely
        if (blockValidation1.blocks.length > 0 && blockValidation1.invalidCount === 0) {
          console.warn(`[${requestId}] Returning blocks despite intent violations (retry unavailable)`);
          return new Response(
            JSON.stringify({ blocks: blockValidation1.blocks, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ 
            error: "Failed to generate valid blocks after retry", 
            requestId,
            validationErrors: allErrors.slice(0, 5)
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data2 = await result2.response.json();
      const parsed2 = parseAIResponse(data2, requestId);

      if (parsed2.blocks) {
        const blockValidation2 = validateBlocks(parsed2.blocks, enableVisualBlocks, outline, targetSlideCount, decisionMode, visualDensity);

        if (blockValidation2.valid) {
          console.log(`[${requestId}] Generated ${blockValidation2.blocks.length} valid blocks after retry`);
          return new Response(
            JSON.stringify({ blocks: blockValidation2.blocks, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Even after retry, return valid blocks if schema is OK (best-effort for intent violations)
        if (blockValidation2.blocks.length > 0 && blockValidation2.invalidCount === 0) {
          console.warn(`[${requestId}] Returning blocks after retry despite remaining intent violations`);
          return new Response(
            JSON.stringify({ blocks: blockValidation2.blocks, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.error(`[${requestId}] Validation still failed: invalidBlocksCount=${blockValidation2.invalidCount}, errors=${blockValidation2.errors.slice(0, 3).join("; ")}`);
        return new Response(
          JSON.stringify({ 
            error: "Failed to generate valid blocks after retry", 
            requestId,
            validationErrors: blockValidation2.errors.slice(0, 5)
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.error(`[${requestId}] Parse failed on retry: ${parsed2.parseError}`);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response after retry", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      console.error(`[${requestId}] Parse failed (attempt 1): ${parsed1.parseError}`);

      // Single retry for parse failures
      console.log(`[${requestId}] Retrying after parse failure...`);

      const systemPrompt2 = buildSystemPrompt(true, ["Previous response was not valid JSON"], density, enableVisualBlocks, preserveWording, decisionMode, visualDensity, targetSlideCount);
      const result2 = await callAI(ANTHROPIC_API_KEY, systemPrompt2, userPrompt, enableVisualBlocks, decisionMode);

      if (result2.response?.ok) {
        const data2 = await result2.response.json();
        const parsed2 = parseAIResponse(data2, requestId);

        if (parsed2.blocks) {
          const blockValidation2 = validateBlocks(parsed2.blocks, enableVisualBlocks, outline, targetSlideCount, decisionMode, visualDensity);

          if (blockValidation2.valid) {
            console.log(`[${requestId}] Generated ${blockValidation2.blocks.length} valid blocks after retry`);
            return new Response(
              JSON.stringify({ blocks: blockValidation2.blocks, requestId }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.error(`[${requestId}] Validation failed after parse retry: ${blockValidation2.errors.slice(0, 3).join("; ")}`);
          return new Response(
            JSON.stringify({ 
              error: "Failed to generate valid blocks", 
              requestId,
              validationErrors: blockValidation2.errors.slice(0, 5)
            }),
            { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", requestId }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({
        error: error instanceof SyntaxError ? "Invalid JSON in request body" : "Internal server error",
        requestId
      }),
      { status: error instanceof SyntaxError ? 400 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
