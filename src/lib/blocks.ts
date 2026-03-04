/**
 * Shared block utilities for the presentation editor.
 * Provides types, normalization, sanitization, and validation for blocks.
 */

// ============================================
// TYPES
// ============================================

// Basic block types
export type BasicBlockType = "text" | "heading" | "image" | "two_col" | "table" | "list" | "callout";

// Visual block types from the layout engine
export type VisualBlockType = 
  | "stat_block" 
  | "quote_block" 
  | "timeline_block" 
  | "comparison_table"
  | "card_grid" 
  | "hero_header" 
  | "exec_summary" 
  | "cta_section"
  | "section_divider" 
  | "icon_text_block" 
  | "framed_insight"
  | "three_pillars"
  | "two_by_two_matrix"
  | "decision_next_steps"
  | "chart_block"
  | "tabs_block"
  | "toggle_block"
  | "kpi_dashboard"
  | "relationship_matrix"
  | "flow_diagram";

// Decision block types (Decision Layer)
export type DecisionBlockType =
  | "decision_summary"
  | "evidence_map"
  | "scenario_set"
  | "recommendation_panel";

// All block types
export type BlockType = BasicBlockType | VisualBlockType | DecisionBlockType;

// Visual block type array for runtime checks
export const VISUAL_BLOCK_TYPES: VisualBlockType[] = [
  "stat_block", 
  "quote_block", 
  "timeline_block", 
  "comparison_table",
  "card_grid", 
  "hero_header", 
  "exec_summary", 
  "cta_section",
  "section_divider", 
  "icon_text_block", 
  "framed_insight",
  "three_pillars",
  "two_by_two_matrix",
  "decision_next_steps",
  "chart_block",
  "tabs_block",
  "toggle_block",
  "kpi_dashboard",
  "relationship_matrix",
  "flow_diagram",
];

// Decision block type array for runtime checks
export const DECISION_BLOCK_TYPES: DecisionBlockType[] = [
  "decision_summary",
  "evidence_map",
  "scenario_set",
  "recommendation_panel"
];

export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
}

export interface AIBlock {
  type: BlockType;
  content: Record<string, unknown>;
  order_index?: number;
}

// ============================================
// STRIP MARKDOWN
// ============================================

/**
 * Strip Markdown formatting from a string
 */
export function stripMarkdown(s: unknown): string {
  if (typeof s !== "string") return String(s ?? "");

  return s
    // bold/italic markers
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    // heading markers
    .replace(/^#{1,6}\s+/gm, "")
    // leading bullet markers
    .replace(/^\s*[*-]\s+/gm, "")
    // leading numbered list markers
    .replace(/^\s*\d+\.\s+/gm, "")
    // backticks
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

// ============================================
// SANITIZE CONTENT (recursive markdown stripping)
// ============================================

/**
 * Recursively sanitize all string values in a content object
 */
export function sanitizeContent(content: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const k of Object.keys(content)) {
    const v = content[k];
    if (typeof v === "string") {
      out[k] = stripMarkdown(v);
    } else if (Array.isArray(v)) {
      out[k] = v.map((item) =>
        typeof item === "string"
          ? stripMarkdown(item)
          : item && typeof item === "object"
          ? sanitizeContent(item as Record<string, unknown>)
          : item
      );
    } else if (v && typeof v === "object") {
      out[k] = sanitizeContent(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }

  return out;
}

// ============================================
// NORMALIZE BLOCK CONTENT
// ============================================

// Check if block type is a basic block type
export function isBasicBlockType(type: BlockType): type is BasicBlockType {
  return ["text", "heading", "image", "two_col", "table", "list", "callout"].includes(type);
}

// Check if block type is a visual block type  
export function isVisualBlockType(type: BlockType): type is VisualBlockType {
  return [
    "stat_block", "quote_block", "timeline_block", "comparison_table",
    "card_grid", "hero_header", "exec_summary", "cta_section",
    "section_divider", "icon_text_block", "framed_insight",
    "three_pillars", "two_by_two_matrix", "decision_next_steps",
    "chart_block", "tabs_block", "toggle_block",
  ].includes(type);
}

// Check if block type is a decision block type
export function isDecisionBlockType(type: BlockType): type is DecisionBlockType {
  return DECISION_BLOCK_TYPES.includes(type as DecisionBlockType);
}

/**
 * Normalize AI outputs to consistent renderer-friendly shapes.
 * Maps alternative key names to standard keys and ensures defaults.
 */
export function normalizeBlockContent(type: BlockType, raw: Record<string, unknown>): Record<string, unknown> {
  // Visual blocks pass through - they have well-defined schemas from the AI
  if (!isBasicBlockType(type)) {
    return raw;
  }
  
  const text = stripMarkdown(String(raw.text ?? raw.content ?? raw.value ?? raw.message ?? ""));

  switch (type) {
    case "heading":
      return {
        level: Number(raw.level ?? raw.heading_level ?? raw.size ?? 2),
        text: text || stripMarkdown(String(raw.heading ?? raw.title ?? "")) || "New Heading",
      };

    case "text":
      return {
        text: text || stripMarkdown(String(raw.paragraph ?? raw.body ?? "")) || "Enter your text here...",
      };

    case "callout":
      return {
        text: text || "Important point here",
        icon: String(raw.icon ?? raw.type ?? raw.variant ?? "info"),
      };

    case "two_col":
      return {
        left: stripMarkdown(String(raw.left ?? raw.left_column ?? raw.col1 ?? raw.column1 ?? raw.a ?? "")) || "Left content",
        right: stripMarkdown(String(raw.right ?? raw.right_column ?? raw.col2 ?? raw.column2 ?? raw.b ?? "")) || "Right content",
      };

    case "list": {
      const itemsRaw = raw.items ?? raw.bullets ?? raw.points ?? raw.list ?? [];
      const items = Array.isArray(itemsRaw)
        ? itemsRaw
            .map((x) => stripMarkdown(String(x)))
            .map((x) => x.replace(/^[-•◦▪▸►\d.]+\s*/, "").trim())
            .filter(Boolean)
        : stripMarkdown(String(itemsRaw))
            .split("\n")
            .map((x) => x.replace(/^[-•◦▪▸►\d.]+\s*/, "").trim())
            .filter(Boolean);

      return {
        items: items.length >= 1 ? items : ["Item 1", "Item 2"],
        ordered: Boolean(raw.ordered ?? raw.is_ordered ?? raw.numbered ?? false),
      };
    }

    case "table": {
      const headersRaw = raw.headers ?? raw.header ?? raw.columns ?? [];
      const rowsRaw = raw.rows ?? raw.data ?? raw.cells ?? [];

      const headers = Array.isArray(headersRaw)
        ? headersRaw.map((h) => stripMarkdown(String(h))).filter(Boolean)
        : ["Column 1", "Column 2"];

      const rows =
        Array.isArray(rowsRaw) && rowsRaw.every((r) => Array.isArray(r))
          ? (rowsRaw as unknown[][]).map((r) => r.map((c) => stripMarkdown(String(c))))
          : [["Data", "Data"]];

      return {
        headers: headers.length >= 2 ? headers : ["Column 1", "Column 2"],
        rows: rows.length >= 1 ? rows : [["Data", "Data"]],
      };
    }

    case "image":
      return {
        src: String(raw.src ?? raw.url ?? raw.source ?? raw.image_url ?? ""),
        alt: stripMarkdown(String(raw.alt ?? raw.alt_text ?? raw.description ?? "")),
        caption: stripMarkdown(String(raw.caption ?? "")),
      };

    default:
      return raw;
  }
}

// ============================================
// VALIDATE BLOCK
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate visual block content with strict schema enforcement
 */
function validateVisualBlock(type: VisualBlockType, content: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  switch (type) {
    case "stat_block": {
      const stats = content.stats;
      if (!Array.isArray(stats) || stats.length < 2) {
        errors.push("stats must have 2-6 items");
      } else if (stats.length > 6) {
        errors.push("stats must have 2-6 items");
      } else {
        for (let i = 0; i < stats.length; i++) {
          const stat = stats[i] as { value?: unknown; label?: unknown };
          if (typeof stat?.value !== "string" || stat.value.trim().length < 1) {
            errors.push(`stats[${i}].value required`);
          }
          if (typeof stat?.label !== "string" || stat.label.trim().length < 1) {
            errors.push(`stats[${i}].label required`);
          }
        }
      }
      break;
    }
    case "quote_block": {
      const quote = content.quote;
      if (typeof quote !== "string" || quote.trim().length < 5) {
        errors.push("quote must be at least 5 characters");
      }
      break;
    }
    case "timeline_block": {
      const events = content.events;
      if (!Array.isArray(events) || events.length < 2) {
        errors.push("events must have at least 2 items");
      } else {
        for (let i = 0; i < events.length; i++) {
          const event = events[i] as { date?: unknown; title?: unknown };
          if (typeof event?.date !== "string") {
            errors.push(`events[${i}].date required`);
          }
          if (typeof event?.title !== "string") {
            errors.push(`events[${i}].title required`);
          }
        }
      }
      break;
    }
    case "comparison_table": {
      const headers = content.headers;
      const rows = content.rows;
      if (!Array.isArray(headers) || headers.length < 2) {
        errors.push("headers must have at least 2 items");
      }
      if (!Array.isArray(rows) || rows.length < 1) {
        errors.push("rows must have at least 1 item");
      } else {
        // Validate row structure: {label: string, values: (string|boolean)[]}
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i] as { label?: unknown; values?: unknown };
          if (typeof row?.label !== "string") {
            errors.push(`rows[${i}].label required`);
          }
          if (!Array.isArray(row?.values)) {
            errors.push(`rows[${i}].values must be array`);
          }
        }
      }
      break;
    }
    case "card_grid": {
      const cards = content.cards;
      if (!Array.isArray(cards) || cards.length < 2) {
        errors.push("cards must have 2-6 items");
      } else if (cards.length > 6) {
        errors.push("cards must have 2-6 items");
      } else {
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as { title?: unknown };
          if (typeof card?.title !== "string") {
            errors.push(`cards[${i}].title required`);
          }
        }
      }
      break;
    }
    case "hero_header": {
      const heading = content.heading;
      if (typeof heading !== "string" || heading.trim().length < 2) {
        errors.push("heading must be at least 2 characters");
      }
      // Validate cta structure if present
      const cta = content.cta as { text?: unknown; href?: unknown } | undefined;
      if (cta && typeof cta === "object") {
        if (cta.text !== undefined && typeof cta.text !== "string") {
          errors.push("cta.text must be string");
        }
        if (cta.href !== undefined && typeof cta.href !== "string") {
          errors.push("cta.href must be string");
        }
      }
      break;
    }
    case "exec_summary": {
      const summary = content.summary;
      const keyPoints = content.keyPoints;
      if (typeof summary !== "string" || summary.trim().length < 10) {
        errors.push("summary must be at least 10 characters");
      }
      if (!Array.isArray(keyPoints) || keyPoints.length < 2) {
        errors.push("keyPoints must have at least 2 items");
      }
      break;
    }
    case "cta_section": {
      const heading = content.heading;
      if (typeof heading !== "string" || heading.trim().length < 2) {
        errors.push("heading must be at least 2 characters");
      }
      // Validate primaryCta structure if present
      const primaryCta = content.primaryCta as { text?: unknown; href?: unknown } | undefined;
      if (primaryCta && typeof primaryCta === "object") {
        if (primaryCta.text !== undefined && typeof primaryCta.text !== "string") {
          errors.push("primaryCta.text must be string");
        }
        if (primaryCta.href !== undefined && typeof primaryCta.href !== "string") {
          errors.push("primaryCta.href must be string");
        }
      }
      // Validate secondaryCta structure if present
      const secondaryCta = content.secondaryCta as { text?: unknown; href?: unknown } | undefined;
      if (secondaryCta && typeof secondaryCta === "object") {
        if (secondaryCta.text !== undefined && typeof secondaryCta.text !== "string") {
          errors.push("secondaryCta.text must be string");
        }
        if (secondaryCta.href !== undefined && typeof secondaryCta.href !== "string") {
          errors.push("secondaryCta.href must be string");
        }
      }
      break;
    }
    case "section_divider":
      // Section dividers have no required content - always valid
      break;
    case "icon_text_block": {
      const items = content.items;
      if (!Array.isArray(items) || items.length < 2) {
        errors.push("items must have at least 2 items");
      }
      break;
    }
    case "framed_insight": {
      const insight = content.insight;
      if (typeof insight !== "string" || insight.trim().length < 5) {
        errors.push("insight must be at least 5 characters");
      }
      break;
    }
    case "chart_block": {
      const data = content.data;
      const chartType = content.chartType;
      if (!["bar", "line"].includes(String(chartType))) {
        errors.push("chartType must be bar or line");
      }
      if (!Array.isArray(data) || data.length < 2) {
        errors.push("data must have at least 2 items");
      }
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate decision block content with strict schema enforcement (Contract v2)
 */
function validateDecisionBlock(type: DecisionBlockType, content: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  switch (type) {
    case "decision_summary": {
      // Required: summary (string), key_points (string[])
      const summary = content.summary;
      const key_points = content.key_points;
      if (typeof summary !== "string" || summary.trim().length < 5) {
        errors.push("summary must be at least 5 characters");
      }
      if (!Array.isArray(key_points) || key_points.length < 1) {
        errors.push("key_points must have at least 1 item");
      }
      // risks is optional
      break;
    }
    case "evidence_map": {
      // Required: claims[{claim, evidence[], confidence}]
      const claims = content.claims;
      if (!Array.isArray(claims) || claims.length < 1) {
        errors.push("claims must have at least 1 item");
      } else {
        for (let i = 0; i < claims.length; i++) {
          const item = claims[i] as { claim?: unknown; evidence?: unknown; confidence?: unknown };
          if (typeof item?.claim !== "string" || item.claim.trim().length < 1) {
            errors.push(`claims[${i}].claim required`);
          }
          if (!Array.isArray(item?.evidence)) {
            errors.push(`claims[${i}].evidence must be array`);
          }
          if (!["high", "medium", "low"].includes(String(item?.confidence))) {
            errors.push(`claims[${i}].confidence must be high|medium|low`);
          }
        }
      }
      break;
    }
    case "scenario_set": {
      // Required: scenarios[{name, assumptions[], outcomes[], risks[]}]
      const scenarios = content.scenarios;
      if (!Array.isArray(scenarios) || scenarios.length < 1) {
        errors.push("scenarios must have at least 1 item");
      } else {
        for (let i = 0; i < scenarios.length; i++) {
          const scenario = scenarios[i] as { name?: unknown; assumptions?: unknown; outcomes?: unknown; risks?: unknown };
          if (typeof scenario?.name !== "string" || scenario.name.trim().length < 2) {
            errors.push(`scenarios[${i}].name required`);
          }
          if (!Array.isArray(scenario?.assumptions)) {
            errors.push(`scenarios[${i}].assumptions must be array`);
          }
          if (!Array.isArray(scenario?.outcomes)) {
            errors.push(`scenarios[${i}].outcomes must be array`);
          }
          if (!Array.isArray(scenario?.risks)) {
            errors.push(`scenarios[${i}].risks must be array`);
          }
        }
      }
      break;
    }
    case "recommendation_panel": {
      // Required: recommendation (string), rationale[], alternatives[], next_steps[]
      const recommendation = content.recommendation;
      const rationale = content.rationale;
      const alternatives = content.alternatives;
      const next_steps = content.next_steps;
      if (typeof recommendation !== "string" || recommendation.trim().length < 5) {
        errors.push("recommendation must be at least 5 characters");
      }
      if (!Array.isArray(rationale)) {
        errors.push("rationale must be array");
      }
      if (!Array.isArray(alternatives)) {
        errors.push("alternatives must be array");
      }
      if (!Array.isArray(next_steps)) {
        errors.push("next_steps must be array");
      }
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single block's content after normalization.
 * Returns validation status and any error messages.
 */
export function validateBlock(type: BlockType, content: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Visual blocks have their own validation logic
  if (isVisualBlockType(type)) {
    return validateVisualBlock(type, content);
  }

  // Decision blocks have their own validation logic
  if (isDecisionBlockType(type)) {
    return validateDecisionBlock(type, content);
  }

  switch (type) {
    case "heading": {
      const level = content.level;
      const text = content.text;
      if (level === undefined || (typeof level !== "number" && typeof level !== "string")) {
        errors.push("missing level");
      }
      if (typeof text !== "string" || text.trim().length < 2) {
        errors.push("text too short (min 2 chars)");
      }
      break;
    }

    case "text": {
      const text = content.text;
      if (typeof text !== "string" || text.trim().length < 5) {
        errors.push("text too short (min 5 chars)");
      }
      break;
    }

    case "list": {
      const items = content.items;
      if (!Array.isArray(items) || items.length < 1) {
        errors.push("needs at least 1 item");
      } else {
        const emptyItems = items.filter((i) => typeof i !== "string" || (i as string).trim().length < 2);
        if (emptyItems.length > 0) {
          errors.push("some items are too short");
        }
      }
      break;
    }

    case "callout": {
      const text = content.text;
      if (typeof text !== "string" || text.trim().length < 5) {
        errors.push("text too short (min 5 chars)");
      }
      break;
    }

    case "two_col": {
      const left = content.left;
      const right = content.right;
      if (typeof left !== "string" || left.trim().length < 3) {
        errors.push("left column too short");
      }
      if (typeof right !== "string" || right.trim().length < 3) {
        errors.push("right column too short");
      }
      break;
    }

    case "table": {
      const headers = content.headers;
      const rows = content.rows;
      if (!Array.isArray(headers) || headers.length < 2) {
        errors.push("needs at least 2 headers");
      }
      if (!Array.isArray(rows) || rows.length < 1) {
        errors.push("needs at least 1 row");
      }
      break;
    }

    case "image": {
      // Images can have placeholder query instead of src
      const src = content.src;
      const alt = content.alt;
      const query = content.query;
      if ((!src || (typeof src === "string" && src.trim().length < 3)) && !query) {
        errors.push("missing src or query");
      }
      if (typeof alt !== "string" || alt.trim().length < 2) {
        errors.push("alt text too short");
      }
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// PREVIEW LABEL
// ============================================

/**
 * Generate a short preview label for a block (for lists/thumbnails)
 */
export function getPreviewLabel(block: AIBlock | Block): string {
  const { type, content } = block;

  switch (type) {
    case "heading":
      return String(content.text || "Heading").substring(0, 50);
    case "text":
      return String(content.text || "Text block").substring(0, 50);
    case "list": {
      const items = content.items as string[] | undefined;
      return items?.length ? `List (${items.length} items)` : "List";
    }
    case "callout":
      return String(content.text || "Callout").substring(0, 40);
    case "two_col":
      return "Two Column Layout";
    case "table": {
      const headers = content.headers as string[] | undefined;
      return headers?.length ? `Table (${headers.length} cols)` : "Table";
    }
    case "image":
      return String(content.alt || content.caption || "Image").substring(0, 40);
    // Visual block types
    case "stat_block":
      return "Statistics Block";
    case "quote_block":
      return String(content.quote || "Quote").substring(0, 40);
    case "timeline_block":
      return "Timeline";
    case "comparison_table":
      return "Comparison Table";
    case "card_grid":
      return "Card Grid";
    case "hero_header":
      return String(content.heading || "Hero Header").substring(0, 40);
    case "exec_summary":
      return "Executive Summary";
    case "cta_section":
      return "Call to Action";
    case "section_divider":
      return "Section Divider";
    case "icon_text_block":
      return "Icon Text Block";
    case "framed_insight":
      return String(content.insight || "Insight").substring(0, 40);
    // Decision block types
    case "decision_summary":
      return String(content.question || "Decision").substring(0, 40);
    case "evidence_map":
      return "Evidence Map";
    case "scenario_set":
      return "Scenario Set";
    case "recommendation_panel":
      return String(content.recommendation || "Recommendation").substring(0, 40);
    default:
      return type;
  }
}

// ============================================
// TO EDITOR BLOCKS
// ============================================

/**
 * Convert AI-generated blocks to editor-ready Block format.
 * Raw AI blocks are passed through with only id and order_index added.
 * No second normalization step - preserves exact AI payloads.
 */
export function toEditorBlocks(aiBlocks: AIBlock[]): Block[] {
  return aiBlocks.map((b, i) => {
    // For visual blocks and decision blocks, pass through raw content without normalization
    // The edge function already validated and sanitized the content
    if (isVisualBlockType(b.type) || isDecisionBlockType(b.type)) {
      return {
        id: crypto.randomUUID(),
        type: b.type,
        content: b.content,
        order_index: i,
      };
    }

    // For basic blocks, apply minimal sanitization only
    let content = sanitizeContent(b.content);
    content = normalizeBlockContent(b.type, content);

    // Extra cleanup for list items
    if (b.type === "list" && Array.isArray(content.items)) {
      content.items = (content.items as string[]).map((item) =>
        String(item)
          .replace(/^[-•◦▪▸►\d.]+\s*/, "")
          .trim()
      );
    }

    return {
      id: crypto.randomUUID(),
      type: b.type,
      content,
      order_index: i,
    };
  });
}

// ============================================
// DEFAULT CONTENT
// ============================================

/**
 * Get default content for a new block of given type
 */
export function getDefaultContent(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "heading":
      return { level: 2, text: "New Heading" };
    case "text":
      return { text: "Enter your text here..." };
    case "list":
      return { items: ["Item 1", "Item 2"], ordered: false };
    case "callout":
      return { text: "Important point here", icon: "info" };
    case "two_col":
      return { left: "Left content", right: "Right content" };
    case "table":
      return { headers: ["Column 1", "Column 2"], rows: [["Data", "Data"]] };
    case "image":
      return { src: "", alt: "", caption: "" };
    // Visual block defaults
    case "stat_block":
      return { stats: [{ value: "0", label: "Metric", trend: "neutral" }] };
    case "quote_block":
      return { quote: "Enter quote here", author: "", role: "" };
    case "timeline_block":
      return { events: [{ date: "2024", title: "Event", status: "current" }] };
    case "comparison_table":
      return { headers: ["Feature", "Option A", "Option B"], rows: [{ label: "Feature 1", values: ["Yes", "No"] }] };
    case "card_grid":
      return { cards: [{ title: "Card 1", description: "" }], columns: 3 };
    case "hero_header":
      return { heading: "Main Title", subheading: "" };
    case "exec_summary":
      return { summary: "Summary text", keyPoints: ["Point 1", "Point 2"] };
    case "cta_section":
      return { heading: "Ready to get started?", primaryCta: { text: "Get Started" } };
    case "section_divider":
      return { style: "gradient", label: "" };
    case "icon_text_block":
      return { items: [{ icon: "Star", title: "Feature", description: "" }] };
    case "framed_insight":
      return { insight: "Key insight here", type: "tip" };
    case "three_pillars":
      return { pillars: [{ title: "Pillar 1", icon: "Target" }, { title: "Pillar 2", icon: "Zap" }, { title: "Pillar 3", icon: "Shield" }] };
    case "two_by_two_matrix":
      return { quadrants: [
        { label: "High Impact / Low Effort", items: ["Item 1"], position: "top-left" },
        { label: "High Impact / High Effort", items: ["Item 1"], position: "top-right" },
        { label: "Low Impact / Low Effort", items: ["Item 1"], position: "bottom-left" },
        { label: "Low Impact / High Effort", items: ["Item 1"], position: "bottom-right" },
      ], xAxis: "Effort", yAxis: "Impact" };
    case "decision_next_steps":
      return { decision: "Decision to make", next_steps: [{ action: "First step", priority: "high" }] };
    case "chart_block":
      return { chartType: "bar", data: [{ label: "A", value: 10 }, { label: "B", value: 20 }] };
    // Decision block defaults
    case "decision_summary":
      return { question: "What should we decide?", recommendation: "Not provided", confidence: "medium" };
    case "evidence_map":
      return { evidenceItems: [{ label: "Evidence", value: "Not provided", confidence: "not_provided" }], missingData: [] };
    case "scenario_set":
      return { scenarios: [{ name: "Scenario A", outcome: "Not provided" }, { name: "Scenario B", outcome: "Not provided" }] };
    case "recommendation_panel":
      return { recommendation: "Not provided", nextSteps: [], risks: [] };
    default:
      return {};
  }
}

// ============================================
// BLOCK LABELS/ICONS (UI constants)
// ============================================

// ============================================
// EXTRACT RAW TEXT (Before/After Demo Mode)
// ============================================

/**
 * Flatten any block's content into plain bullet-point text.
 * Used for the "Before AI" view to show raw unstructured content.
 */
export function extractRawText(block: Block | AIBlock): string[] {
  const c = block.content;
  const lines: string[] = [];

  switch (block.type) {
    case "heading":
      lines.push(String(c.text || ""));
      break;
    case "text":
      lines.push(String(c.text || ""));
      break;
    case "list":
      if (Array.isArray(c.items)) {
        (c.items as string[]).forEach((item) => lines.push(item));
      }
      break;
    case "callout":
      lines.push(String(c.text || ""));
      break;
    case "two_col":
      lines.push(String(c.left || ""));
      lines.push(String(c.right || ""));
      break;
    case "table":
      if (Array.isArray(c.headers)) lines.push((c.headers as string[]).join(" | "));
      if (Array.isArray(c.rows)) {
        (c.rows as string[][]).forEach((row) => lines.push(row.join(" | ")));
      }
      break;
    case "image":
      if (c.alt) lines.push(String(c.alt));
      if (c.caption) lines.push(String(c.caption));
      break;
    case "exec_summary":
      if (c.summary) lines.push(String(c.summary));
      if (Array.isArray(c.keyPoints)) (c.keyPoints as string[]).forEach((p) => lines.push(p));
      break;
    case "stat_block":
      if (Array.isArray(c.stats)) {
        (c.stats as { value: string; label: string }[]).forEach((s) => lines.push(`${s.label}: ${s.value}`));
      }
      break;
    case "quote_block":
      if (c.quote) lines.push(String(c.quote));
      break;
    case "hero_header":
      if (c.heading) lines.push(String(c.heading));
      if (c.subheading) lines.push(String(c.subheading));
      break;
    case "framed_insight":
      if (c.insight) lines.push(String(c.insight));
      break;
    default:
      // Generic: extract all string values
      Object.values(c).forEach((v) => {
        if (typeof v === "string" && v.trim()) lines.push(v);
        if (Array.isArray(v)) v.forEach((item) => {
          if (typeof item === "string") lines.push(item);
        });
      });
  }

  return lines.filter((l) => l.trim().length > 0);
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  // Basic blocks
  text: "Text",
  heading: "Heading",
  list: "List",
  callout: "Callout",
  two_col: "Two Column",
  table: "Table",
  image: "Image",
  // Visual blocks
  stat_block: "Statistics",
  quote_block: "Quote",
  timeline_block: "Timeline",
  comparison_table: "Comparison",
  card_grid: "Card Grid",
  hero_header: "Hero Header",
  exec_summary: "Summary",
  cta_section: "CTA",
  section_divider: "Divider",
  icon_text_block: "Icon Text",
  framed_insight: "Insight",
  three_pillars: "Three Pillars",
  two_by_two_matrix: "2×2 Matrix",
  decision_next_steps: "Decision + Next Steps",
  chart_block: "Chart",
  tabs_block: "Tabs",
  toggle_block: "Toggle",
  kpi_dashboard: "KPI Dashboard",
  relationship_matrix: "Relationship Matrix",
  // Decision blocks
  decision_summary: "Decision Summary",
  evidence_map: "Evidence Map",
  scenario_set: "Scenario Set",
  recommendation_panel: "Recommendation",
};
