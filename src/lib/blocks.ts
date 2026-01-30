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
  | "framed_insight";

// All block types
export type BlockType = BasicBlockType | VisualBlockType;

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
 * Validate a single block's content after normalization.
 * Returns validation status and any error messages.
 */
export function validateBlock(type: BlockType, content: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // Visual blocks are validated at generation time - pass through here
  if (!isBasicBlockType(type)) {
    return { valid: true, errors: [] };
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
    default:
      return type;
  }
}

// ============================================
// TO EDITOR BLOCKS
// ============================================

/**
 * Convert AI-generated blocks to editor-ready Block format.
 * Applies sanitization, normalization, and generates IDs.
 */
export function toEditorBlocks(aiBlocks: AIBlock[]): Block[] {
  return aiBlocks.map((b, i) => {
    // Sanitize first
    let content = sanitizeContent(b.content);
    // Then normalize to renderer-friendly shape
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
    default:
      return {};
  }
}

// ============================================
// BLOCK LABELS/ICONS (UI constants)
// ============================================

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
};
