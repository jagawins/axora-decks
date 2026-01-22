import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

interface Block {
  type: "text" | "heading" | "list" | "callout" | "two_col" | "table" | "image";
  content: BlockContent;
  order_index: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  outline?: Outline;
  density?: string;
}

interface BlockValidationResult {
  valid: boolean;
  invalidCount: number;
  errors: string[];
  blocks: Block[];
}

const VALID_BLOCK_TYPES = ["heading", "text", "list", "callout", "two_col", "table", "image"];

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

function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const { outline, density } = body as { outline?: unknown; density?: string };

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

  return {
    valid: true,
    outline: {
      title: o.title,
      sections: o.sections,
      bullets: Array.isArray(o.bullets) ? o.bullets : [],
      summary: typeof o.summary === "string" ? o.summary : "",
    },
    density: sanitizedDensity,
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
      const alt = sanitizedContent.alt;
      if (typeof src !== "string" || src.trim().length < 5) {
        missingKeys.push("src (minLength: 5)");
      }
      if (typeof alt !== "string" || alt.trim().length < 2) {
        missingKeys.push("alt (minLength: 2)");
      }
      break;
    }
    default:
      missingKeys.push(`unknown type: ${type}`);
  }

  return { valid: missingKeys.length === 0, missingKeys };
}

// Pipeline: normalize → sanitize → validate
function validateBlocks(rawBlocks: Array<{ type: string; content: BlockContent }>): BlockValidationResult {
  const validBlocks: Block[] = [];
  const errors: string[] = [];
  let invalidCount = 0;

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];

    // Check type
    if (!block.type || !VALID_BLOCK_TYPES.includes(block.type)) {
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

    // Step 3: Validate on sanitized content
    const contentValidation = validateBlockContent(block.type, sanitizedContent);
    if (!contentValidation.valid) {
      errors.push(`block[${i}] (${block.type}): missing [${contentValidation.missingKeys.join(", ")}]`);
      invalidCount++;
      continue;
    }

    // Block is valid
    validBlocks.push({
      type: block.type as Block["type"],
      content: sanitizedContent,
      order_index: i,
    });
  }

  // NO partial success: ALL blocks must be valid
  return {
    valid: invalidCount === 0 && validBlocks.length > 0,
    invalidCount,
    errors,
    blocks: validBlocks,
  };
}

// Parse AI response and extract blocks
function parseAIResponse(data: Record<string, unknown>, requestId: string): { blocks: Array<{ type: string; content: BlockContent }> | null; parseError?: string } {
  // Try tool call first
  const toolCall = (data.choices as Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>)?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    try {
      const result = JSON.parse(toolCall.function.arguments);
      console.log(`[${requestId}] First block shape:`, JSON.stringify(result.blocks?.[0] ?? {}).slice(0, 300));
      if (Array.isArray(result.blocks)) {
        return { blocks: result.blocks };
      }
      return { blocks: null, parseError: "tool call result missing blocks array" };
    } catch (e) {
      return { blocks: null, parseError: `tool call parse error: ${e}` };
    }
  }

  // Fallback: try content
  const content = (data.choices as Array<{ message?: { content?: string } }>)?.[0]?.message?.content;
  if (content) {
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const result = JSON.parse(cleanContent);
      console.log(`[${requestId}] First block shape (content):`, JSON.stringify(result.blocks?.[0] ?? {}).slice(0, 300));
      if (Array.isArray(result.blocks)) {
        return { blocks: result.blocks };
      }
      return { blocks: null, parseError: "content result missing blocks array" };
    } catch (e) {
      return { blocks: null, parseError: `content parse error: ${e}` };
    }
  }

  return { blocks: null, parseError: "no tool call or content in response" };
}

function getDensityBlockConstraints(density: string): string {
  switch (density) {
    case "vibes":
      return `
DENSITY CONSTRAINTS (STRICT - JUST VIBES):
- Prefer heading blocks and image placeholders
- Lists: maximum 2-3 very short items
- Text blocks: maximum 1 short sentence
- NO tables
- Focus on visual impact`;
    
    case "minimal":
      return `
DENSITY CONSTRAINTS (STRICT - MINIMAL TEXT):
- Lists: maximum 3 bullet points
- Text blocks: maximum 2 sentences
- Tables: avoid unless essential
- Keep everything concise`;
    
    case "context":
      return `
DENSITY CONSTRAINTS (A LITTLE CONTEXT):
- Lists: 3-5 bullet points allowed
- Text blocks: 2-3 sentences
- One table allowed if relevant`;
    
    case "plenty":
      return `
DENSITY CONSTRAINTS (PLENTY OF TEXT):
- Lists: 5+ items allowed
- Text blocks: paragraphs permitted
- Multiple tables allowed
- Detailed explanations welcome`;
    
    default:
      return "";
  }
}

// Build system prompt
function buildSystemPrompt(isRetry: boolean, validationErrors?: string[], density?: string): string {
  const densityConstraints = getDensityBlockConstraints(density || "context");
  
  let prompt = `You are an expert presentation designer. Convert outlines into presentation blocks.

CRITICAL: You MUST populate the content object with actual data. Empty content {} will fail.
${densityConstraints}

BLOCK FORMATS (copy exactly):
- heading: {"level": 1, "text": "Your Heading Text Here"}
- text: {"text": "Your paragraph text here, at least 10 characters"}
- list: {"items": ["First item", "Second item", "Third item"], "ordered": false}
- callout: {"text": "Important message here", "icon": "info"}
- two_col: {"left": "Left column content", "right": "Right column content"}
- table: {"headers": ["Column 1", "Column 2"], "rows": [["Row 1 Data", "More Data"]]}

STRUCTURE:
1. Start with H1 heading (level: 1) for the title
2. Use H2 (level: 2) for section headings
3. Convert bullet points to list blocks
4. Use callouts for key takeaways (icon: "info", "warning", or "success")
5. Create 8-15 blocks total

EXAMPLE BLOCK:
{"type": "heading", "content": {"level": 1, "text": "AI in Healthcare: A Strategic Overview"}}

NEVER return {"type": "heading", "content": {}} - this will fail validation.`;

  if (isRetry && validationErrors?.length) {
    prompt += `

CORRECTION REQUIRED - Your previous response had empty content objects.
Errors: ${validationErrors.slice(0, 3).join("; ")}

You MUST fill in actual text for every content field.`;
  }

  return prompt;
}

// Strict oneOf schema per block type
function getToolSchema() {
  return {
    type: "function",
    function: {
      name: "create_blocks",
      description: "Create presentation blocks with type-specific validated content",
      strict: true,
      parameters: {
        type: "object",
        required: ["blocks"],
        additionalProperties: false,
        properties: {
          blocks: {
            type: "array",
            minItems: 5,
            items: {
              type: "object",
              required: ["type", "content"],
              additionalProperties: false,
              properties: {
                type: {
                  type: "string",
                  enum: ["heading", "text", "list", "callout", "two_col", "table"]
                },
                content: {
                  type: "object",
                  additionalProperties: false,
                  oneOf: [
                    {
                      title: "heading",
                      required: ["level", "text"],
                      properties: {
                        level: { type: "integer", minimum: 1, maximum: 3 },
                        text: { type: "string", minLength: 2 }
                      }
                    },
                    {
                      title: "text",
                      required: ["text"],
                      properties: {
                        text: { type: "string", minLength: 10 }
                      }
                    },
                    {
                      title: "list",
                      required: ["items", "ordered"],
                      properties: {
                        items: { type: "array", minItems: 2, items: { type: "string", minLength: 2 } },
                        ordered: { type: "boolean" }
                      }
                    },
                    {
                      title: "callout",
                      required: ["text", "icon"],
                      properties: {
                        text: { type: "string", minLength: 10 },
                        icon: { type: "string", enum: ["info", "warning", "success"] }
                      }
                    },
                    {
                      title: "two_col",
                      required: ["left", "right"],
                      properties: {
                        left: { type: "string", minLength: 5 },
                        right: { type: "string", minLength: 5 }
                      }
                    },
                    {
                      title: "table",
                      required: ["headers", "rows"],
                      properties: {
                        headers: { type: "array", minItems: 2, items: { type: "string", minLength: 1 } },
                        rows: { type: "array", minItems: 1, items: { type: "array", minItems: 2, items: { type: "string" } } }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  };
}

// Call the AI gateway
async function callAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ response?: Response; error?: string }> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [getToolSchema()],
        tool_choice: { type: "function", function: { name: "create_blocks" } }
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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error(`[${requestId}] LOVABLE_API_KEY not configured`);
      return new Response(
        JSON.stringify({ error: "AI service not configured", requestId }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[${requestId}] Generating blocks for: "${outline.title}" with density: ${density || "default"}`);

    const userPrompt = `Convert this outline into presentation blocks:

Title: ${outline.title}
Summary: ${outline.summary}

Sections:
${outline.sections.map((s, i) => `${i + 1}. ${s.heading}\n${s.points.map(p => `   - ${p}`).join("\n")}`).join("\n\n")}

Key Takeaways:
${outline.bullets.map(b => `- ${b}`).join("\n")}`;

    // First attempt
    const systemPrompt1 = buildSystemPrompt(false, undefined, density);
    const result1 = await callAI(LOVABLE_API_KEY, systemPrompt1, userPrompt);

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
      const blockValidation1 = validateBlocks(parsed1.blocks);

      if (blockValidation1.valid) {
        console.log(`[${requestId}] Generated ${blockValidation1.blocks.length} valid blocks`);
        return new Response(
          JSON.stringify({ blocks: blockValidation1.blocks, requestId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log and retry - NO partial success
      console.warn(`[${requestId}] Validation failed (attempt 1): invalidBlocksCount=${blockValidation1.invalidCount}, missingKeys=${blockValidation1.errors.slice(0, 3).join("; ")}`);
      console.log(`[${requestId}] Retrying with correction prompt...`);

      const systemPrompt2 = buildSystemPrompt(true, blockValidation1.errors, density);
      const result2 = await callAI(LOVABLE_API_KEY, systemPrompt2, userPrompt);

      if (result2.error || !result2.response?.ok) {
        console.error(`[${requestId}] Retry failed: ${result2.error || result2.response?.status}`);
        return new Response(
          JSON.stringify({ 
            error: "Failed to generate valid blocks after retry", 
            requestId,
            validationErrors: blockValidation1.errors.slice(0, 5)
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data2 = await result2.response.json();
      const parsed2 = parseAIResponse(data2, requestId);

      if (parsed2.blocks) {
        const blockValidation2 = validateBlocks(parsed2.blocks);

        if (blockValidation2.valid) {
          console.log(`[${requestId}] Generated ${blockValidation2.blocks.length} valid blocks after retry`);
          return new Response(
            JSON.stringify({ blocks: blockValidation2.blocks, requestId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.error(`[${requestId}] Validation still failed: invalidBlocksCount=${blockValidation2.invalidCount}, missingKeys=${blockValidation2.errors.slice(0, 3).join("; ")}`);
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

      const systemPrompt2 = buildSystemPrompt(true, ["Previous response was not valid JSON"]);
      const result2 = await callAI(LOVABLE_API_KEY, systemPrompt2, userPrompt);

      if (result2.response?.ok) {
        const data2 = await result2.response.json();
        const parsed2 = parseAIResponse(data2, requestId);

        if (parsed2.blocks) {
          const blockValidation2 = validateBlocks(parsed2.blocks);

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
