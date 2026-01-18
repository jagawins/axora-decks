/**
 * Utility functions to strip Markdown formatting from AI-generated content.
 * Ensures all content is plain text for proper display in the editor.
 */

/**
 * Strip Markdown formatting from a string
 */
export function stripMarkdown(s: unknown): unknown {
  if (typeof s !== "string") return s;

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

/**
 * Clean list items specifically - ensures no bullet characters remain
 */
export function sanitizeListItems(items: unknown[]): string[] {
  return items.map((item) => {
    if (typeof item !== "string") return String(item);
    return String(stripMarkdown(item))
      .replace(/^\s*[•◦▪▸►]\s*/g, "") // additional bullet chars
      .trim();
  });
}
